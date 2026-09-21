# SCRUM-5 Investigation Report

**Work item:** [SCRUM-5](https://anysphere-team-cwatn9rx.atlassian.net/browse/SCRUM-5) — Investigate something  
**Status at intake:** Idea · Feature · Medium  
**Reporter:** Ross Krasner · Project: My Test Space 1 (SCRUM)  
**Date:** 2026-07-31

## Intake summary

The work item title is "Investigate something" and the description was empty. No labels, comments, acceptance criteria, or linked Confluence/spec context were available to this agent. Scope was therefore inferred as a baseline health investigation of the connected repository (`cursoragentdevtest-hue/starter-repo` — Silly Starter™).

## Repository snapshot

| Area | Finding |
| --- | --- |
| Stack | Next.js 16.2.9 (App Router), React 19.2.4, TypeScript, Tailwind CSS 4 |
| App surface | Single static route `/` plus `_not-found` |
| Source | ~233 LOC across `page.tsx`, `layout.tsx`, `DuckButton.tsx`, `SillyFacts.tsx`, `globals.css` |
| Product behavior | Whimsical landing page with clickable duck quacks and rotating silly facts |

## Verification results

| Check | Result |
| --- | --- |
| `npm install` | Succeeded |
| `npm run lint` | Pass (exit 0) |
| `npm run build` | Pass — static prerender of `/` |
| Automated tests | None configured (`package.json` has no `test` script) |

## Findings

### 1. Ticket under-specified (blocking for feature work)

Without a description, repro steps, or desired outcome, SCRUM-5 cannot be implemented as a product feature. This report is the deliverable for the investigation request.

### 2. Dependency vulnerabilities (high)

`npm audit` reports **12 high** severity issues (0 critical / moderate / low). Notable items:

- **next@16.2.9** — multiple advisories (middleware/proxy bypass, Server Action DoS/SSRF, cache confusion, image optimization DoS, etc.). Audit suggests `next@16.2.12`.
- **postcss / sharp** (transitive via Next) — high severity; addressed by the same Next bump path.
- **brace-expansion / minimatch** (via eslint toolchain) — DoS in lint tooling; fix path wants `eslint@10` (breaking).

These are primarily supply-chain / framework issues; the app itself has no Server Actions, middleware, rewrites, or image optimizer usage today, which lowers immediate exploitability for the demo surface.

### 3. Client timer hygiene (low)

- `DuckButton` starts a `setTimeout` on click without clearing on unmount.
- `SillyFacts` nests a `setTimeout` inside an interval and only clears the interval.

Unlikely to matter for this static demo, but worth cleaning if the components grow.

### 4. No automated test or CI signal in-repo

There is no test suite or visible workflow definition in the app package. Confidence in future changes relies on manual lint/build.

### 5. Repo contains many unrelated repro fixtures

Root-level `*-repro*` files and `glass-scroll-repro/` dominate recent history. They are unrelated to the Silly Starter product surface and add noise when scoping product work.

## Recommendations

1. **Clarify SCRUM-5** — Add a description: what to investigate, success criteria, and whether a code change is expected.
2. **Patch Next.js** — Bump `next` (and `eslint-config-next`) to ≥16.2.12 to clear the framework advisories, then re-run lint/build.
3. **Optional follow-ups** — Clear timers in client components; add a minimal smoke test; keep repro fixtures out of product branches.
4. **If this was only an integration smoke test** — This PR + report satisfy “agent picked up Jira work and returned a linked change.”

## Conclusion

SCRUM-5 had no actionable product brief. The Silly Starter app **lint/builds cleanly** as a static Next.js 16 demo. The highest-value concrete follow-up from this investigation is a **Next.js patch upgrade** for the reported high-severity advisories, pending explicit go-ahead or a follow-up ticket.
