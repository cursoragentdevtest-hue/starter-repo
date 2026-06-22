<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Single product: a Next.js 16 (App Router, React 19, Turbopack) web app ("Silly Starter™"). Package manager is npm (no lockfile is committed; the update script runs `npm install`).
- Standard commands are in `README.md` / `package.json` scripts: `npm run dev` (dev server on http://localhost:3000), `npm run lint`, `npm run build`. There is no automated test suite.
- Dev server uses Turbopack and writes to `.next/dev`; `npm run build` writes to `.next`. Running a build while `npm run dev` is active is fine here, but neither `.next/` nor `node_modules/` is gitignored — do not stage them in commits.
