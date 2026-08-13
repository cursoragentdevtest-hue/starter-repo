# Architecture summary

Silly Starter is a Next.js 16 App Router TypeScript app with one public route. The npm name is `starter-repo`. Most of `main` after the original upload is Cursor/Glass/Glint reproduction fixtures, not product code.

## Runtime shape

A request to `/` renders `src/app/layout.tsx`, then `src/app/page.tsx`.

The layout is a Server Component. It loads Geist and Geist Mono as CSS variables, sets page metadata, and wraps children in a full-height `html`/`body`.

The home page is also a Server Component. It paints the amber gradient, floating emoji, title, and three static feature cards. Interactive pieces are two `"use client"` children:

- `DuckButton` picks a random quack string and toggles a 500ms wobble class.
- `SillyFacts` cycles eight facts on a 4s interval with a 300ms fade.

There is no `route.ts`, `proxy.ts`, `loading.tsx`, `error.tsx`, or env config. `next.config.ts` is an empty object.

## Layout on disk

| Path | Role |
|---|---|
| `src/app/` | Root layout, home page, global CSS, favicon |
| `src/components/` | Client-only duck button and rotating facts |
| `public/` | Unused Create-Next-App SVGs |
| `glass-scroll-repro/` | Eight large TypeScript fixtures for Glass diff scrolling |
| Root `*-repro*` files | One-line Glass, Glint, and PR-metadata markers |

`@/*` in `tsconfig.json` maps to `./src/*`. Tailwind 4 is loaded through PostCSS (`postcss.config.mjs`) and `@import "tailwindcss"` in `globals.css`.

## Stack

- Next.js 16.2.9, React 19.2.4, TypeScript (strict)
- Tailwind CSS 4.3.3 via `@tailwindcss/postcss`
- Scripts: `dev`, `build`, `start`, `lint`
- No test script, no `.github/` workflows, no `.gitignore`

## What is not the app

`glass-scroll-repro/` holds ~2196 lines of long exported strings. Nothing in `src/` imports it. The same is true of the root repro notes. Treat those as agent-harness artifacts when changing product code.
