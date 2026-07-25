---
name: debug-mode
description: Systematic troubleshooting workflow for investigating bugs, failures, and unexpected behavior with runtime evidence. Use when the user reports a bug, error, or unexpected behavior, when tests fail for unclear reasons, when you need to form and test hypotheses about a root cause, or when an issue requires systematic elimination of possibilities. Only use it to debug with real runtime evidence — instrument the code, have the issue reproduced, and read the captured logs before fixing anything.
---

# Debug Mode

This skill reproduces Cursor's built-in **Debug mode** as a portable skill. The verbatim
prompt it was extracted from is in [references/builtin-debug-mode-prompt.md](references/builtin-debug-mode-prompt.md);
this file is the runnable adaptation, because a skill has no engine-provisioned log
server, log path, or session id. `scripts/debug-log-server.mjs` provisions those instead.

You are debugging in **DEBUG MODE**. You must debug with **runtime evidence**.

**Why this approach:** Traditional AI agents jump to fixes claiming 100% confidence, but
fail due to lacking runtime information. They guess based on code alone. You **cannot**
and **must NOT** fix bugs this way — you need actual runtime data.

## Your systematic workflow

1. **Generate 3-5 precise hypotheses** about WHY the bug occurs (be detailed, aim for MORE not fewer).
2. **Instrument code** with logs (see [Logging](#logging)) to test all hypotheses in parallel.
3. **Reproduce the bug.** Do the reproduction yourself whenever your tools can (shell, tests, browser/computer use). Only hand it back to the user when you genuinely need user-specific interaction, and then end your response with a `<reproduction_steps>...</reproduction_steps>` block containing only a numbered list, no header. Remind them if any apps or services need restarting. Use one short, interface-agnostic instruction: "Press Proceed/Mark as fixed when done." Never say "click", never branch by interface, and do not ask them to reply "done".
4. **Analyze logs**: evaluate each hypothesis (CONFIRMED / REJECTED / INCONCLUSIVE) with cited log line evidence.
5. **Fix only with 100% confidence** and log proof; do NOT remove instrumentation yet.
6. **Verify with logs**: run the reproduction again and compare before/after logs with cited entries.
7. **If logs prove success**: remove logs and explain. **If failed**: FIRST remove any code changes from rejected hypotheses (keep only instrumentation and proven fixes), THEN generate NEW hypotheses from different subsystems and add more instrumentation.
8. **After confirmed success**: explain the problem and provide a concise summary of the fix (1-2 lines).

## Critical constraints

- NEVER fix without runtime evidence first.
- ALWAYS rely on runtime information + code (never code alone).
- Do NOT remove instrumentation before post-fix verification logs prove success and the user confirms that there are no more issues.
- Use unit/integration tests sparingly. In debug mode the user is actively debugging with you, so prefer reproduction, runtime logs, and end-to-end verification; run tests when they directly exercise a hypothesis or confirm the final fix.
- FORBIDDEN: using `setTimeout`, `sleep`, or artificial delays as a "fix"; use proper reactivity/events/lifecycles.
- Fixes often fail; iteration is expected and preferred. Taking longer with more data yields better, more precise fixes.
- Prefer reusing existing architecture, patterns, and utilities; avoid overengineering. Make fixes precise, targeted, and as small as possible while maximizing impact.

## Logging

### Step 1: Start the log sink (MANDATORY before any instrumentation)

```bash
node .cursor/skills/debug-mode/scripts/debug-log-server.mjs
```

It prints a JSON line with the values you must capture and reuse verbatim for the rest of
the session, then keeps running in the foreground (start it in a background terminal):

- **Server endpoint** — the HTTP URL that instrumentation POSTs to.
- **Log path** — where NDJSON logs are written, `.cursor/debug-logs/debug-<sessionId>.log` by default.
- **Session ID** — unique identifier for this debug session.

Override with `--port`, `--log-path`, or `--session-id` when needed. If the server fails to
start, STOP IMMEDIATELY and tell the user; do NOT proceed with instrumentation without a
working log sink. You do not need to pre-create the log file — it is created on first write.

### Step 2: Understand the log format

Logs are NDJSON: one JSON object per line, appended to the log path.

```json
{"sessionId":"abc123","id":"log_1733456789_abc","timestamp":1733456789000,"location":"test.js:42","message":"User score","data":{"userId":5,"score":85},"runId":"run1","hypothesisId":"A"}
```

For JavaScript/TypeScript, POST to the server endpoint and the sink writes the NDJSON line.
For other languages (Python, Go, Rust, Java, C/C++, Ruby, ...), prefer appending NDJSON lines
to the log path directly with the language's standard library file I/O.

### Step 3: Insert instrumentation logs

In **JavaScript/TypeScript files**, use this one-line template even when filesystem access is
available — substitute the endpoint and session id printed in step 1:

```js
fetch('SERVER_ENDPOINT',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'SESSION_ID'},body:JSON.stringify({sessionId:'SESSION_ID',location:'file.js:LINE',message:'desc',data:{k:v},timestamp:Date.now()})}).catch(()=>{});
```

In **non-JavaScript languages**, open the log path in append mode, write a single NDJSON line,
and close the file. Keep these snippets as tiny as possible (ideally one line).

Decide how many logs to insert based on the complexity of the code and the hypotheses under
test. Aim for the minimum that can confirm or reject ALL your hypotheses:

- At least 1 log is required; never skip instrumentation entirely.
- Do not exceed 10 logs — if you think you need more, narrow your hypotheses first.
- Typical range is 2-6 logs, but use your judgment.

Choose placements from these categories as relevant to your hypotheses: function entry with
parameters, function exit with return values, values BEFORE critical operations, values AFTER
critical operations, branch execution paths (which if/else executed), suspected error/edge case
values, and state mutations or intermediate values.

- Each log must map to at least one hypothesis (include `hypothesisId` in the payload).
- Use this payload structure: `{sessionId, runId, hypothesisId, location, message, data, timestamp}`.
- **REQUIRED:** wrap EACH debug log in a collapsible code region using language-appropriate syntax (e.g. `// #region agent log` / `// #endregion` for JS/TS) so the editor auto-folds instrumentation.
- **FORBIDDEN:** logging secrets (tokens, passwords, API keys, PII).

### Step 4: Clear the previous log file before each run (MANDATORY)

Delete the file at the log path with the file-deletion tool before each reproduction. Do NOT use
shell commands (`rm`, `touch`, ...). If the tool is unavailable or fails, ask the user to delete it
manually. Clearing the log file is NOT the same as removing instrumentation — leave the debug logs
in the code.

**CRITICAL:** only delete YOUR log file, the one at the log path above containing your session id.
Other sessions may keep log files in the same directory under different session ids; leave them
untouched.

### Step 5: Read logs after the run

Read the log path with the file-read tool and analyze the NDJSON entries to evaluate each
hypothesis. If the log file is empty or missing, the reproduction likely failed — say so and run it
again.

### Step 6: Keep logs during fixes

- When implementing a fix, DO NOT remove debug logs yet; they must stay active for verification runs.
- Tag verification logs with `runId="post-fix"` to distinguish them from the initial run.
- FORBIDDEN: removing or modifying previously added logs in any file before post-fix verification logs are analyzed or the user explicitly confirms success.
- Verification requires a before/after log comparison with cited log lines; never claim success without log proof.

## Between iterations

- If all hypotheses are rejected, you MUST generate more and add more instrumentation accordingly.
- **Remove code changes from rejected hypotheses:** when logs prove a hypothesis wrong, revert the code changes made for it. Do not let defensive guards, speculative fixes, or unproven changes accumulate. Start each new debug iteration with a clean slate.
- Keep iterating until you can reproduce the issue, fix it, and verify the fix.

## Cleanup

Once the fix is confirmed by post-fix logs and the user agrees the issue is gone: remove every debug
log you added, stop the log server, delete the session log file, and explain the problem and the fix
in 1-2 lines.
