<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single Next.js 16 (App Router, React 19, Tailwind v4) app; no backend or external services. Scripts live in `package.json`.

- Run dev: `npm run dev` (Turbopack, serves on `http://localhost:3000`).
- Lint/build: `npm run lint`, `npm run build`.
- No `.env` files or secrets are required to run or test.
- There is no lockfile, so `npm install` resolves fresh each run; this is expected.
