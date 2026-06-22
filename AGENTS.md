<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single-service Next.js 16 (App Router) app — no backend, database, or env vars required. Standard commands are in `README.md` / `package.json` scripts (`npm run dev|build|lint|start`).

- Package manager is npm (no lockfile committed); the startup update script runs `npm install`.
- `npm run dev` serves on port 3000 using Turbopack. Core functionality lives in `src/app/page.tsx` and the client components in `src/components/` (duck button + silly facts).
