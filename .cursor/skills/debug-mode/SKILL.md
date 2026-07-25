---
name: debug-mode
description: Runtime-evidence debugging methodology ported from Cursor's built-in Debug mode. Use when investigating a reproducible bug whose root cause is not obvious from reading the code - race conditions, async ordering bugs, memory leaks, performance regressions, flaky tests, or "this used to work" regressions. Runs a strict loop - form 3-5 competing hypotheses, add tagged NDJSON log instrumentation, clear the log, reproduce, then grade every hypothesis against cited log lines before making a minimal fix and removing the instrumentation. Invoke explicitly with /debug-mode, or engage it when a bug survives one or two ordinary fix attempts. Not for trivial bugs with an obvious cause, and not for building features.
---

# Debug Mode

A persistent operating mode for finding root causes of bugs that resist ordinary
inspection. Once this skill is active, stay in it for the rest of the
investigation. Do not drop back into ordinary agent behaviour partway through —
the value comes from completing the loop, not from any single step.

## Core principle

**A fix must be justified by observed runtime values, never by reading code alone.**

Reading source code generates hypotheses. Only runtime data confirms one. There
is no exception for bugs that look obvious; "obvious" causes that turn out to be
wrong are the reason this mode exists.

## When to use

- A bug reproduces but the cause is not apparent from the source
- Race conditions, timing bugs, and async ordering problems
- Performance problems and memory leaks that need profiling
- Regressions where something used to work
- Flaky tests
- Anything that survived one or two ordinary fix attempts

## When not to use

- The cause is already visible and unambiguous (a typo, an off-by-one you can point at)
- Building new features or refactoring
- Purely static questions about how code works — read the code instead

## The loop

0. **Confirm the symptom.** Run the reproduction once, uninstrumented, to check the bug behaves as reported. This is the one run that happens before instrumenting.
1. **Explore and hypothesise.** Build context, then write down 3-5 competing hypotheses.
2. **Instrument.** Add 3-8 tagged log writes chosen so one run discriminates between all of them.
3. **Clear and reproduce.** Delete the log file, then run the reproduction.
4. **Analyse.** Grade every hypothesis against cited log lines.
5. **Fix.** Only once the mechanism is certain. Leave instrumentation in place.
6. **Verify, then clean up.** Compare before/after logs, then remove all instrumentation.

Rounds 1-4 repeat as many times as needed. Iteration is the method, not a sign
it is going badly.

## Hypotheses

Generate **3-5 per round**, and bias toward more rather than fewer. Each must
name a specific causal mechanism, not an area of suspicion. The floor applies to
rounds that open a fresh line of inquiry; a narrow follow-up that only drives an
unexecuted branch or resolves one open question continues the current round
rather than padding itself out to three.

- Good: "the refresh guard compares seconds against a millisecond expiry, so it never fires"
- Bad: "something wrong with auth"

Spread them across different subsystems so a single round of logs can separate
them, rather than producing a cluster of near-duplicates that all fail together.

Track them in a table carrying: id, mechanism, status, confidence, and the log
evidence that moved it. Keep the table in your replies rather than in a scratch
file — a file in the repo is one more thing to clean up, and it drifts from what
the reader has actually seen.

**Ids** are single uppercase letters assigned in sequence — `A`, `B`, `C`, and
onward through the alphabet. Once assigned, an id is never reused or renumbered;
later rounds continue the sequence rather than restarting, so `hypothesisId`
values in the log stay unambiguous for the whole session. A third round may well
be working on `K` through `N`.

**Status** is exactly one of three values:

| Status | Meaning |
| --- | --- |
| `CONFIRMED` | A cited log line is inconsistent with the hypothesis being false |
| `REJECTED` | A cited log line is inconsistent with it being true |
| `INCONCLUSIVE` | The logs did not discriminate, or the path never executed |

`INCONCLUSIVE` is a common and legitimate outcome. Report it honestly; never
round it to `REJECTED`.

An expected line that is *absent* is valid `REJECTED` evidence, but only when
other logs prove the surrounding path ran. If you cannot tell whether the code
executed at all, the verdict is `INCONCLUSIVE`.

**Confidence** is qualitative — `high`, `medium`, or `low` — and is required on
every hypothesis still in play, meaning anything `CONFIRMED` or `INCONCLUSIVE`.
A `REJECTED` hypothesis needs no confidence; write `—`. Avoid invented
percentages, which imply a calibration that does not exist. Confidence is not the
fix gate; see below.

## Instrumentation

### Log file

One fixed absolute path for the whole session, appended to as NDJSON — exactly
one JSON object per line.

Resolve the path once, in this order, and use that literal string everywhere:

1. `/opt/cursor/logs/debug.log` when `/opt/cursor/logs` exists or can be created
2. Otherwise `${TMPDIR:-/tmp}/cursor-debug/debug.log`

The load-bearing property is that **the log lives outside the repository working
tree**, so it can never be staged, committed, or clutter `git status`. If a
sandbox only mounts the project directory, put it in an already-ignored
directory rather than adding a new ignore rule.

Create the parent directory once if it is missing, but **never create the log
file itself** — the first append creates it. A missing file is meaningful
evidence that the instrumented code never ran.

A log that already exists at the start of a session is left over from an
interrupted one — a completed session deletes its own log during cleanup. Delete
it before your first run and note that you did.

Because there is one path, only one run's data exists on disk at a time. To
compare two scenarios, use `runId` to label them; it distinguishes any pair of
runs, not just baseline from post-fix. If a second debug session could be running
on the same machine, add a session suffix to the filename so the two do not
interleave.

**Clear the log before every reproduction run** by deleting it with the file
deletion tool, not with `rm`, `truncate`, `touch`, or shell redirection.
Deleting guarantees the next read contains only the current run, so you never
have to reason about which entries are stale. If deletion is unavailable, ask
for a manual delete and wait rather than reading a mixed file.

### Record shape

| Key | Type | Format |
| --- | --- | --- |
| `timestamp` | number | Epoch **milliseconds**, integer. Not ISO-8601 — integers sort and diff trivially |
| `location` | string | `"<filename>:<line>"`, e.g. `"session.ts:88"`. Bare filename, written literally at insertion time, not computed at runtime |
| `message` | string | Short present-tense phrase describing the moment |
| `data` | object | The top-level value is always an object, never a scalar or array; nested arrays inside it are fine. Holds the runtime values |
| `hypothesisId` | string | `"A"`, `"B"`, ... A site covering several uses a comma string: `"A,C"` |
| `id` | string | Optional. `log_<epoch_seconds>_<short_random>`. Useful when many entries share a location |
| `runId` | string | Optional label for the run — `"post-fix"` on verification rounds, or any scenario name. Absent means baseline |

`location` records where the log was *inserted*. Once a fix shifts lines around,
do not go back and renumber it — that would be an edit to frozen instrumentation
(prohibition 3), and cited evidence is understood to refer to insertion-time
positions. Adding or updating `runId` is the one sanctioned exception to that
freeze; if you would rather not touch the snippets at all, a cleared log already
separates the runs on its own.

```json
{"timestamp":1733456789012,"location":"session.ts:88","message":"token refresh branch taken","data":{"userId":5,"expiresIn":-3,"hasRefreshToken":true,"branch":"refresh"},"hypothesisId":"B"}
```

Two conventions inside `data` repay their cost:

- Include a `branch` key naming the path actually taken whenever the log sits in a conditional.
- Log the *type* alongside a suspicious value — `{"value":null,"type":"object"}` — because JSON erases the difference between missing, `null`, and empty string.

### Snippet convention

Wrap every instrumentation site in a foldable region tagged with the literal
string `agent log`:

```ts
// #region agent log
require('fs').appendFileSync('/opt/cursor/logs/debug.log',JSON.stringify({location:'session.ts:88',message:'token refresh branch taken',data:{userId,expiresIn},timestamp:Date.now(),hypothesisId:'B'})+'\n');
// #endregion
```

The tag is what makes cleanup reliable: `rg "agent log"` enumerates every site in
the repo with no false positives. Keep the string identical everywhere — never
let it drift to `debug log` or `agent-log`.

Keep each snippet on one physical line, however ugly. Multi-line instrumentation
invites accidental edits to the surrounding logic and makes diffs harder to read.

Per-language snippets and transport notes for browser JavaScript, Python, Go,
Ruby, PHP, Java, Rust, and shell are bundled alongside this file in
`references/instrumentation-snippets.md`. Read it when instrumenting anything
other than Node.

### Placement

Aim for 3-8 logs that together discriminate between *all* current hypotheses in
a single run, rather than testing them serially. Candidate positions:

- Function entry, with actual parameter values
- Function exit, with the return value
- Immediately before and immediately after the suspect operation
- Inside each branch of the relevant conditional, recording which one ran
- The suspected bad value at the point it is produced
- State mutations and intermediate values along the path

Every log carries a `hypothesisId`. If you cannot say which hypothesis a
proposed log tests, it is noise — drop it.

If a branch you instrumented never executed, do not settle for inferring its
behaviour from surrounding values. Construct a scenario that drives it — an
oversell, an empty input, an expired token — and run again. A branch verdict
based on a log line from that branch is worth far more than one reasoned around it.

Prefer boundaries: function edges, module seams, network and serialisation
points. Bugs concentrate where assumptions change hands, and boundary logs stay
useful even when your guess about the interior is wrong. Placement beats volume;
eight well-placed entries beat fifty inside a loop. If you must instrument a hot
loop, guard it with a counter so the file stays readable.

Instrumentation must be a strict no-op on behaviour: it must never throw, never
alter control flow, never mutate state, and never evaluate an expression with
side effects (no logging a generator or a lazily-computed property).

Synchronous file writes are behaviour-neutral in the sense that matters for most
bugs, but they are not free in *time* — and timing is exactly what race
conditions and async ordering bugs turn on. **After instrumenting, re-run and
confirm the symptom still reproduces**, then say so in your report. If the bug
disappears once the logs are in, you have learned something real: the window is
narrow. Do not conclude it is fixed. Cut the log count, move writes out of the
critical section, or buffer in memory and flush at exit.

Insert all of a round's logs in a single pass rather than one edit at a time,
then grep the file to confirm each recorded `location` matches where the line
actually sits. Sequential insertions shift every site below them, so
incrementally added labels drift.

## Fixing

The gate is binary, not probabilistic: **write a fix only when the logs make the
mechanism certain**, and state which lines establish it. "Probably this" is
grounds for another instrumentation round, not a fix.

Keep the fix minimal and targeted:

- Address the confirmed mechanism and nothing else
- Reuse the existing architecture, patterns, naming, and utilities in the file
- No refactoring, renaming, restructuring, or abstraction added "since we're here"
- No new dependencies unless the mechanism requires one
- Fix where the evidence points, not at the symptom's proximate site
- Do not add a comment narrating the fix; that is a note to the reviewer and becomes noise once merged

Leave the instrumentation in the tree alongside the fix. The fix round and the
cleanup round are separate.

Do not let the frozen-instrumentation rule dictate the shape of the fix. If the
right fix wraps the critical section in a lock, a `try`/`finally`, or a callback,
write it that way and let the enclosed log lines re-indent. Prohibition 3 targets
semantic changes to instrumentation — moving it, rewording it, deleting it — not
whitespace reflow forced by the surrounding edit. Choosing a worse fix to avoid
disturbing a log line is the tail wagging the dog.

## Verification and cleanup

Conclude only when all of these hold:

1. A hypothesis is `CONFIRMED` by cited log lines
2. A fix has been applied
3. A post-fix run produced a log that differs from the baseline in the specific way the fix predicts
4. You have quoted the before and after lines side by side
5. The issue is confirmed resolved

A passing test or an absent error message is **not** sufficient — symptoms
disappear for unrelated reasons.

Cleanup is its own final step:

1. Search the `agent log` tag and remove every wrapped region.
2. Delete anything else the investigation created — scenario drivers written to exercise a branch, scratch fixtures, temporary config, and build byproducts such as `__pycache__` or compiled output. The tag search cannot find these, so track them as you create them and list them in the report.
3. Re-run the search to confirm it returns nothing.
4. Delete the log file. Your report is the durable artifact; the log is scratch, and every line you rely on should already be quoted in it.
5. Give a one- or two-line plain-language statement of what the bug was and what the fix does.

Skipping the confirming search is the main way stray instrumentation escapes.

## Report format

Each analysis round returns this structure. Keep the headings stable, and make
each report self-contained — restate the full hypothesis table every time, since
the reader may not have followed the intermediate work.

```
Opening line: the outcome — root cause found, or which hypotheses survived.

## Hypotheses
<id, mechanism, status, confidence, deciding log line — as a table or a flat
list, whichever reads better at this width>
A. <mechanism> — <status> — <confidence> — <cited log line that decided it>
B. ...

## What the logs showed
<runtime findings, quoting specific entries: values, ordering, which branch
ran, what never ran at all>

## What changed in the code
<instrumentation added or fix applied, by file; state explicitly whether this
round contains a fix or is instrumentation-only>

## Next steps
1. <numbered, literal commands or UI actions to run next>
2. ...
<plus which services must be restarted or rebuilt for the new code to load>
```

Three things must always be present: a per-hypothesis verdict with cited
evidence, whether a fix was attempted this round, and numbered next steps. On
investigation rounds "next steps" are the reproduction steps; on the final round
they are the commands that re-confirm the fix.

The final round appends two more sections:

```
## Verification
<before/after log lines quoted side by side, showing the specific change the
fix predicted>

## Cleanup
<the confirming tag search returning nothing, plus a one- or two-line
plain-language statement of what the bug was and what the fix does>
```

**Always state the restart or rebuild requirement.** Omitting it is the single
most common cause of an empty log file.

## When a round fails

Every hypothesis rejected, or all inconclusive, is an expected outcome rather
than a failure. It tells you the bug is not where the code reads like it should
be — exactly when runtime data earns its cost. Generate a fresh set of
hypotheses from *different* subsystems and instrument more broadly or earlier in
the flow.

There is no maximum round count and no escalation path. Taking longer is
preferred over fixing on speculation. Signals to change tactics rather than
repeat:

| Signal | Response |
| --- | --- |
| Log file empty or missing | The reproduction did not run the instrumented code, or the process was not restarted. Say so and ask for another run; do not theorise from an empty file |
| Instrumented code never executed | The real flow is elsewhere. Move outward to the caller, router, or entry point |
| Two inconclusive rounds in the same area | Widen scope: another layer, another process, or the build/config/environment rather than application logic |
| One hypothesis repeatedly inconclusive | Wrong granularity. Log at a boundary instead of inside the suspect function |

If you genuinely cannot isolate the cause, report that, with the full ruled-out
list and the narrowed remaining space. A precise negative result with evidence
is a legitimate deliverable; a confident-sounding fix without evidence is not.

## Who runs the reproduction

Keep the phase boundary — instrument, run, *then* read — even when you are able
to run the application yourself. Clear the log before the run and do not analyse
until a clean run exists.

When a separate person or agent performs the reproduction, hand back numbered
steps and stop. Ask them to reply `Issue reproduced, please proceed.` plus any
notes on what they actually did or observed. Deviations from the given steps
frequently explain otherwise-baffling logs, so factor them into the analysis.

## Prohibitions

1. **Never diagnose or fix from code alone.** Reading source only generates hypotheses.
2. **Never apply a fix before evidence exists.** No fix in a round with no log analysis behind it.
3. **Never remove or alter instrumentation** before post-fix logs are analysed and the issue is confirmed resolved. This includes tidying, rewording, or relocating it — previously added logs are frozen until cleanup.
4. **Never treat clearing the log as removing instrumentation.** They are unrelated; deleting the file between runs is routine and required.
5. **Never clear the log with shell commands.** Use the file deletion tool only.
6. **Never pre-create the log file yourself** — no `touch`, no scaffolding write, no header line. It appears when instrumentation first appends to it, which is why append-mode `open` in the snippets is fine.
7. **Never use `sleep`, `setTimeout`, artificial delays, retry loops, or polling as a fix.** A timing hack conceals a missing dependency, lifecycle hook, event, or await. Fix the ordering, not the clock — even when the delay demonstrably makes the symptom go away.
8. **Never log secrets or personal data** — tokens, passwords, API keys, session cookies, connection strings, PII. Log presence, length, or shape instead: `{"hasToken":true,"len":128}`. The log is read back into the conversation, so anything written to it is disclosed.
9. **Never claim verification without citing specific log lines** in a before/after comparison.
10. **Never leave a hypothesis without a verdict**, and never quietly convert inconclusive into rejected.
11. **Never emit instrumentation that can affect behaviour.**
12. **Never let instrumentation reach a commit.** Anything tagged `agent log` is temporary by construction.
13. **Never fold unrelated changes into the fix.**
