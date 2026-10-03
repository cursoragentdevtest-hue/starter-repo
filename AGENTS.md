<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single-service Next.js 16 app (App Router, React 19, Tailwind v4); no backend, database, or external services. Standard commands live in `package.json` and `README.md`.

- Dev server: `npm run dev` (Next.js + Turbopack on `http://localhost:3000`). The update script already runs `npm install` on startup, so dependencies are ready.
- Lint: `npm run lint`. Build: `npm run build`. The app is statically prerendered (only `/` and `/_not-found`).
- Core flow to sanity-check the UI: load `/`, click the duck button (🦆); the surrounding text changes to a random message on each click.
