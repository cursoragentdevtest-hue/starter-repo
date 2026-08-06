# QA Wolf first browser test failure — investigation

## Verdict

The first failing browser assertion against the live deploy at [https://starter-repo.vercel.app](https://starter-repo.vercel.app) is a homepage copy bug: the unauthenticated state renders **`Your are not logged in`** instead of **`You are not logged in`**.

A second, deeper failure also blocks any login flow: every NextAuth route under `/api/auth/*` returns **HTTP 500**.

## Target under test

| Item | Value |
| --- | --- |
| Deploy URL | https://starter-repo.vercel.app |
| App surface | Next.js + NextAuth “Acme Inc” login demo |
| Homepage copy (unauthenticated) | `Your are not logged in` + `Login` |
| Login page | `/login` (Email / Password / Terms / Google) |

Note: this cloud workspace’s `main` branch is the Silly Starter duck app and does **not** contain the Acme login source. The Vercel project named `starter-repo` is serving a different build than the current GitHub `main` tree.

## Failure 1 (first browser test)

**What breaks:** any QA Wolf / Playwright assertion that waits for exact homepage copy such as `You are not logged in` fails immediately on page load.

**Evidence:**

- Live HTML/text on `/` shows `Your are not logged in`.
- Client bundle confirms the typo is compiled into the page component:

```text
..."Your are not logged in"}),"unauthenticated"===o?...
```

- Screenshot: `qawolf-investigation-artifacts/01-homepage-typo.png`

**Likely fix (in the auth demo source, not this repo’s Silly Starter tree):** change the ternary else branch from `"Your are not logged in"` to `"You are not logged in"`.

## Failure 2 (login / session)

**What breaks:** clicking Login and completing the form cannot succeed. Session bootstrap itself is dead.

| Endpoint | Status |
| --- | --- |
| `/api/auth/session` | 500 |
| `/api/auth/providers` | 500 |
| `/api/auth/signin` | 500 |
| `/api/auth/csrf` | 500 |
| `/api/auth/error` | 500 |

Browser repro: open `/login`, submit credentials → lands on a Next.js **500: Internal Server Error** page; DevTools shows `CLIENT_FETCH_ERROR` / unexpected HTML instead of JSON from NextAuth.

**Likely cause:** NextAuth misconfiguration or missing env (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, OAuth / credentials provider secrets) on the Vercel deployment.

Screenshots:

- `qawolf-investigation-artifacts/02-login-form.png`
- `qawolf-investigation-artifacts/03-auth-session-500.png`
- `qawolf-investigation-artifacts/04-network-auth-500.png`

## Why this is the “first” failure

Sibling investigation agents in this environment are named for a **second login** failure. Ordering matches the user journey:

1. **First test:** load `/` → assert logged-out copy → fails on the typo.
2. **Second test:** exercise login → fails on NextAuth 500s.

## Access gaps

Slack / Linear / Datadog / Hex MCP servers require interactive desktop auth in this environment, so the original QA Wolf Slack tag/run link was not recoverable here. The live deploy was enough to reproduce both failures without that notification.

## Recommended next steps

1. Point Vercel `starter-repo` at the correct auth-demo source (or restore that source into this repo).
2. Fix the homepage typo.
3. Repair NextAuth env/config on Vercel until `/api/auth/session` returns JSON `null` / session object (not HTML 500).
4. Re-run the QA Wolf suite against https://starter-repo.vercel.app.
