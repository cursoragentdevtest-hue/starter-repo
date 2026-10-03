# Repository Structure Notes

## Project Overview

**Silly Starter™** is a minimal, whimsical Next.js starter application. It serves a single landing page with playful copy, a clickable duck button, and rotating "silly facts." The stack is Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.

This is a starter/template repo, not a production application. There is no backend logic, database, authentication, or test suite.

---

## Top-Level Directories

| Directory / Path | Purpose |
|------------------|---------|
| `src/` | All application source code (App Router pages, layout, components, styles) |
| `src/app/` | Next.js App Router entry: root layout, home page, global CSS |
| `src/components/` | Reusable React components used by pages |
| `public/` | Static assets served at the site root (default Next.js SVG icons) |
| `.git/` | Git metadata (standard version control) |

There are no other top-level source directories (no `lib/`, `hooks/`, `api/`, `tests/`, or `docs/` beyond markdown at the root).

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, npm scripts (`dev`, `build`, `start`, `lint`), and dependencies |
| `next.config.ts` | Next.js configuration (currently minimal/default) |
| `tsconfig.json` | TypeScript compiler options; defines `@/*` → `./src/*` path alias |
| `eslint.config.mjs` | ESLint flat config using `eslint-config-next` (core-web-vitals + TypeScript) |
| `postcss.config.mjs` | PostCSS setup with `@tailwindcss/postcss` for Tailwind v4 |
| `next-env.d.ts` | Auto-generated Next.js TypeScript references (do not edit) |
| `README.md` | User-facing project description and getting-started instructions |
| `AGENTS.md` | Agent/AI guidance: notes that this Next.js version has breaking changes |
| `CLAUDE.md` | Symlink/reference to `AGENTS.md` |

**Notable:** No `.gitignore`, lockfile (`package-lock.json` / `pnpm-lock.yaml`), or CI config was found in the workspace at exploration time. `node_modules/` is not present (dependencies not installed).

---

## Main Source Code Locations

### App Router (`src/app/`)

- `layout.tsx` — Root layout: Geist fonts, metadata, global HTML/body wrapper
- `page.tsx` — Home page: hero, feature cards, composes `DuckButton` and `SillyFacts`
- `globals.css` — Tailwind import, CSS variables, custom keyframe animations (`float`, `wobble`)

### Components (`src/components/`)

- `DuckButton.tsx` — Client component; random "quack" messages on click with wobble animation
- `SillyFacts.tsx` — Client component; rotating facts with fade transition on an interval

### Static Assets (`public/`)

Default Next.js starter SVGs: `next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`. The home page uses emoji rather than these SVGs.

---

## Notable Layout Patterns

1. **`src/` directory convention** — Source lives under `src/` rather than project root, which is a common Next.js layout choice.

2. **App Router only** — Uses the App Router (`src/app/`) with a single route (`/`). No `pages/` directory, no dynamic routes, no API routes.

3. **Path alias `@/*`** — Imports use `@/components/...` instead of relative paths (configured in `tsconfig.json`).

4. **Client vs Server components** — Pages/layout are Server Components by default; interactivity is isolated in `"use client"` components (`DuckButton`, `SillyFacts`).

5. **Flat component structure** — Components sit directly in `src/components/` with no feature-based subfolders.

6. **Tailwind CSS v4** — Uses `@import "tailwindcss"` and `@theme inline` in CSS rather than a separate `tailwind.config.js`.

7. **Minimal config surface** — `next.config.ts` and ESLint/PostCSS configs are largely defaults; little custom tooling.

---

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.9 |
| UI | React 19.2.4 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Fonts | Geist Sans & Geist Mono (via `next/font/google`) |
| Linting | ESLint 9 + `eslint-config-next` |

---

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
