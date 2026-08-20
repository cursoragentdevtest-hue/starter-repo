<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This is a **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4** single-page web app ("Silly Starter™"). It is a client-rendered UI with no backend, database, or auth — the core interaction is the duck button on `/` that shows a random message on click.

### Runtime / environment
- Uses **npm** (`package-lock.json`). Node 22 is available. The startup update script runs `npm install` here, so dependencies are already present for future agents.
- This VM is a **multi-repo workspace**: this repo lives at `/agent/repos/starter-repo` and a separate Bun CLI lives at `/agent/repos/1brc`. `/workspace` is empty; use the absolute repo paths.

### Commands (see `package.json` scripts and `README.md`)
- Dev server: `npm run dev` (Turbopack, serves on `http://localhost:3000`).
- Lint: `npm run lint` (ESLint flat config, `eslint.config.mjs`).
- Build: `npm run build` (also runs the TypeScript check; there is no separate typecheck script).
- There is **no automated test framework** configured — verify UI changes by running the dev server and interacting with the page.

### Gotchas
- Per the Next.js rule above, this Next.js version has breaking changes vs. training data; consult `node_modules/next/dist/docs/` before editing app code.
- `next build` uses Turbopack and does the TypeScript check as part of the build, so a green `npm run build` covers typechecking.
