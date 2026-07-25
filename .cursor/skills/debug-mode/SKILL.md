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
name a specific causal mechanism, not an area of suspicion.

- Good: "the refresh guard compares seconds against a millisecond expiry, so it never fires"
- Bad: "something wrong with auth"

Spread them across different subsystems so a single round of logs can separate
them, rather than producing a cluster of near-duplicates that all fail together.

Track them in a table carrying: id, mechanism, status, confidence, and the log
evidence that moved it. Keep the table in your replies rather than in a scratch
file — a file in the repo is one more thing to clean up, and it drifts from what
the reader has actually seen.

**Ids** are single uppercase letters, `A` through `E`. Once assigned, an id is
never reused or renumbered; later rounds continue the sequence so that
`hypothesisId` values in the log file stay unambiguous for the whole session.

**Status** is exactly one of three values:

| Status | Meaning |
| --- | --- |
| `CONFIRMED` | A cited log line is inconsistent with the hypothesis being false |
| `REJECTED` | A cited log line is inconsistent with it being true |
| `INCONCLUSIVE` | The logs did not discriminate, or the path never executed |

`INCONCLUSIVE` is a common and legitimate outcome. Report it honestly; never
round it to `REJECTED`.

**Confidence** is qualitative — `high`, `medium`, or `low` — and attaches to the
leading root-cause candidate. Avoid invented percentages, which imply a
calibration that does not exist. Confidence is not the fix gate; see below.

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
| `data` | object | Always an object, never a scalar or array. Holds the runtime values |
| `hypothesisId` | string | `"A"`, `"B"`, ... A site covering several uses a comma string: `"A,C"` |
| `id` | string | Optional. `log_<epoch_seconds>_<short_random>`. Useful when many entries share a location |
| `runId` | string | Optional. `"post-fix"` on verification rounds; absent means baseline |

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
Ruby, PHP, Java, Rust, and shell live in `references/instrumentation-snippets.md`.
Read it when instrumenting anything other than Node.

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

Prefer boundaries: function edges, module seams, network and serialisation
points. Bugs concentrate where assumptions change hands, and boundary logs stay
useful even when your guess about the interior is wrong. Placement beats volume;
eight well-placed entries beat fifty inside a loop. If you must instrument a hot
loop, guard it with a counter so the file stays readable.

Instrumentation must be a strict no-op on behaviour: it must never throw, never
alter control flow, never mutate state, and never evaluate an expression with
side effects (no logging a generator or a lazily-computed property).

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

## Verification and cleanup

Conclude only when all of these hold:

1. A hypothesis is `CONFIRMED` by cited log lines
2. A fix has been applied
3. A post-fix run produced a log that differs from the baseline in the specific way the fix predicts
4. You have quoted the before and after lines side by side
5. The issue is confirmed resolved

A passing test or an absent error message is **not** sufficient — symptoms
disappear for unrelated reasons.

Cleanup is its own final step: search the `agent log` tag, remove every wrapped
region, re-run the search to confirm it returns nothing, then give a one- or
two-line plain-language statement of what the bug was and what the fix does.
Skipping the confirming search is the main way stray instrumentation escapes.

## Report format

Each analysis round returns this structure. Keep the headings stable, and make
each report self-contained — restate the full hypothesis table every time, since
the reader may not have followed the intermediate work.

```
Opening line: the outcome — root cause found, or which hypotheses survived.

## Hypotheses
A. <mechanism> — <status> — <confidence> — <cited log line that decided it>
B. ...

## What the logs showed
<runtime findings, quoting specific entries: values, ordering, which branch
ran, what never ran at all>

## What changed in the code
<instrumentation added or fix applied, by file; state explicitly whether this
round contains a fix or is instrumentation-only>

## Reproduction steps
1. <numbered, literal commands or UI actions>
2. ...
<plus which services must be restarted or rebuilt for the new code to load>
```

Three things must always be present: a per-hypothesis verdict with cited
evidence, whether a fix was attempted this round, and numbered next steps.

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
6. **Never create the log file manually.** It appears on first append.
7. **Never use `sleep`, `setTimeout`, artificial delays, retry loops, or polling as a fix.** A timing hack conceals a missing dependency, lifecycle hook, event, or await. Fix the ordering, not the clock — even when the delay demonstrably makes the symptom go away.
8. **Never log secrets or personal data** — tokens, passwords, API keys, session cookies, connection strings, PII. Log presence, length, or shape instead: `{"hasToken":true,"len":128}`. The log is read back into the conversation, so anything written to it is disclosed.
9. **Never claim verification without citing specific log lines** in a before/after comparison.
10. **Never leave a hypothesis without a verdict**, and never quietly convert inconclusive into rejected.
11. **Never emit instrumentation that can affect behaviour.**
12. **Never let instrumentation reach a commit.** Anything tagged `agent log` is temporary by construction.
13. **Never fold unrelated changes into the fix.**
