# Silly Starter™ — Comprehensive Testing Plan

**Repository:** `starter-repo`  
**Document version:** 1.0  
**Last updated:** 2026-06-12  
**Scope:** Full test strategy for the Silly Starter Next.js application  
**Status:** Planning — no automated tests exist today

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State & Coverage Baseline](#2-current-state--coverage-baseline)
3. [Test Pyramid Strategy](#3-test-pyramid-strategy)
4. [Repository Architecture Overview](#4-repository-architecture-overview)
5. [Per-Component Test Specifications](#5-per-component-test-specifications)
6. [Next.js App Router Considerations](#6-nextjs-app-router-considerations)
7. [Tooling: Vitest + React Testing Library + Playwright](#7-tooling-vitest--react-testing-library--playwright)
8. [CI/CD Integration](#8-cicd-integration)
9. [Mocking Strategy](#9-mocking-strategy)
10. [Accessibility (a11y) Testing](#10-accessibility-a11y-testing)
11. [Performance Testing](#11-performance-testing)
12. [Fixtures & Test Data Management](#12-fixtures--test-data-management)
13. [Priority Matrix (P0 / P1 / P2)](#13-priority-matrix-p0--p1--p2)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Example Test Code Snippets](#15-example-test-code-snippets)
16. [Risk Areas & Mitigations](#16-risk-areas--mitigations)
17. [Definition of Done](#17-definition-of-done)
18. [Appendix A: File & Directory Layout](#appendix-a-file--directory-layout)
19. [Appendix B: npm Scripts Reference](#appendix-b-npm-scripts-reference)
20. [Appendix C: Glossary](#appendix-c-glossary)

---

## 1. Executive Summary

**Silly Starter™** is a small, whimsical Next.js 16 application built with React 19, TypeScript, and Tailwind CSS v4. Its functional surface area is intentionally minimal: a home page with a clickable duck button (`DuckButton`), a rotating facts ticker (`SillyFacts`), decorative background elements, and a root layout with Google Fonts and metadata. Despite its simplicity, the app contains several behaviors that are easy to regress silently: client-side randomness, timer-driven UI transitions, CSS animation class toggling, server/client component boundaries, and font/metadata wiring in the App Router.

**Today, this repository has zero automated test coverage.** There are no unit tests, no component tests, no end-to-end tests, no CI pipeline, and no test-related dependencies in `package.json`. The only quality gate is `npm run lint` (ESLint with `eslint-config-next` core-web-vitals and TypeScript rules).

This document defines a **complete, repo-specific testing strategy** to bring Silly Starter from 0% coverage to a maintainable, CI-enforced quality baseline. The recommended stack is:

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit / Component | **Vitest** + **React Testing Library (RTL)** + **jsdom** | Fast feedback on components, hooks, and page composition |
| End-to-End | **Playwright** | Real browser verification of user flows, a11y, and production build |
| Accessibility | **@axe-core/playwright** (E2E) + **jest-axe** or **vitest-axe** (component) | Automated WCAG-oriented checks |
| Coverage | **@vitest/coverage-v8** | Track line/branch coverage with thresholds |

### Goals

1. **Prevent regressions** in duck click behavior, fact rotation, and page rendering.
2. **Lock in accessibility contracts** (button labels, heading hierarchy, lang attribute).
3. **Validate App Router integration** — metadata, layout shell, client component hydration.
4. **Establish CI gates** so every PR runs lint, unit/component tests, build, and E2E smoke tests.
5. **Keep tests fast and maintainable** — favor behavior assertions over implementation details.

### Non-Goals (for initial phases)

- Visual regression testing (Chromatic/Percy) — defer until design stabilizes.
- Load/stress testing — app has no backend or API.
- Cross-browser matrix beyond Chromium + one secondary browser in CI.
- Testing third-party npm packages (Next.js, React internals).

### Recommended Coverage Targets (post Phase 3)

| Metric | Target |
|--------|--------|
| Statements | ≥ 85% |
| Branches | ≥ 80% |
| Functions | ≥ 85% |
| Lines | ≥ 85% |
| E2E critical paths | 100% (all P0 flows) |

---

## 2. Current State & Coverage Baseline

### 2.1 Inventory of Testable Artifacts

| File | Type | Testable Units |
|------|------|----------------|
| `src/components/DuckButton.tsx` | Client Component | Initial render, click handler, random quack selection, wobble class toggle, aria-label |
| `src/components/SillyFacts.tsx` | Client Component | Initial fact display, interval cycling, opacity transition, cleanup on unmount |
| `src/app/page.tsx` | Server Component (default) | Static content, feature grid, component composition, semantic HTML |
| `src/app/layout.tsx` | Server Component | Metadata export, html/body structure, font variable classes, lang attribute |
| `src/app/globals.css` | Stylesheet | CSS custom properties, keyframe animations (indirect via class assertions) |

### 2.2 Current Coverage: 0%

```
┌─────────────────────────────────────────────────────────┐
│  Coverage Summary (as of 2026-06-12)                    │
├─────────────────────────────────────────────────────────┤
│  Unit tests:           0 files / 0 assertions           │
│  Component tests:      0 files / 0 assertions           │
│  Integration tests:    0 files / 0 assertions           │
│  E2E tests:            0 files / 0 assertions           │
│  CI pipeline:          None                             │
│  Coverage reporting:   None                             │
│  Test dependencies:    None in package.json             │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Existing Quality Gates

| Gate | Command | Status |
|------|---------|--------|
| ESLint | `npm run lint` | ✅ Configured (`eslint.config.mjs`) |
| TypeScript | `tsc --noEmit` (implicit via Next build) | ✅ `strict: true` in tsconfig |
| Production build | `npm run build` | ✅ Available, not CI-enforced |
| Tests | — | ❌ Not configured |

### 2.4 Manual Test Checklist (Current Implicit QA)

Today, developers manually:

1. Run `npm run dev` and open `http://localhost:3000`.
2. Click the duck and observe random quack messages.
3. Wait ~4 seconds and observe fact rotation with fade.
4. Resize viewport to check responsive grid (`sm:grid-cols-3`).
5. Toggle OS dark mode to verify color scheme.

This manual process is **not documented, not repeatable, and not enforced**. The testing plan replaces ad-hoc manual checks with automated equivalents where possible, retaining manual exploratory testing only for subjective "vibes" validation.

---

## 3. Test Pyramid Strategy

The test pyramid for Silly Starter is adapted to a **UI-heavy, logic-light** application. Most complexity lives in client component interactions and timer-driven UI, not in business rules or data layers.

```
                    ┌───────────────┐
                    │   E2E (5–8)   │  Playwright — critical user journeys
                    │    ~10%       │
                ┌───┴───────────────┴───┐
                │  Integration (8–12)   │  Page + Layout composition, SSR output
                │        ~25%           │
            ┌───┴───────────────────────┴───┐
            │     Component / Unit (25–35)    │  DuckButton, SillyFacts isolated
            │            ~65%                 │
            └───────────────────────────────┘
```

### 3.1 Layer Definitions for This Repo

#### Base Layer — Component & Unit Tests (~65% of test count)

**Scope:** `DuckButton`, `SillyFacts`, pure helpers (if extracted), and small utilities.

**Characteristics:**
- Run in jsdom via Vitest.
- Use React Testing Library for DOM queries and user events.
- Mock timers (`vi.useFakeTimers()`) for `setInterval` / `setTimeout`.
- Mock `Math.random` for deterministic quack selection.
- Fast: target **< 5 seconds** for entire unit/component suite.

**Example scenarios:**
- DuckButton renders "Press for wisdom" initially.
- Clicking duck changes text to one of the 8 quacks.
- Wobble class applied for 500ms then removed.

#### Middle Layer — Integration Tests (~25%)

**Scope:** `page.tsx` rendered with child components, `layout.tsx` metadata and shell structure.

**Characteristics:**
- Render full page composition in jsdom (client components hydrated).
- Assert heading hierarchy, footer content, feature cards.
- Optionally use `@testing-library/react` with async utilities for SillyFacts timer behavior in page context.
- Validate that server component page imports and renders client children without error.

**Example scenarios:**
- Home page displays "Silly Starter™" h1.
- Three feature cards: "Fast-ish", "Styled", "Typed".
- DuckButton and SillyFacts are present in DOM.

#### Top Layer — E2E Tests (~10%)

**Scope:** Full application in real browser against `next dev` or `next start` (production build preferred for CI).

**Characteristics:**
- Playwright driving Chromium (minimum).
- Test real click interactions, navigation, hydration.
- Run axe accessibility scans on loaded page.
- Capture performance metrics optionally (LCP, CLS) via Playwright or Lighthouse CI.

**Example scenarios:**
- Page loads with 200 status.
- Click duck → quack text changes.
- Wait 4+ seconds → fact text changes.

### 3.2 What We Deliberately Do NOT Unit Test

| Item | Reason |
|------|--------|
| Next.js framework routing | Framework responsibility; covered by E2E smoke |
| Google Fonts network fetch | External CDN; mock in unit, real in E2E optional |
| Tailwind class name strings in isolation | Assert presence via RTL, not snapshot every utility class |
| `node_modules` internals | Out of scope |
| Exact pixel layout | No visual regression in Phase 1–3 |

---

## 4. Repository Architecture Overview

Understanding component boundaries is essential for choosing the right test layer and mocking strategy.

```
src/app/layout.tsx          [Server Component]
  └── html (lang="en")
        └── body
              └── {children}
                    └── src/app/page.tsx    [Server Component]
                          ├── DuckButton    [Client — "use client"]
                          ├── SillyFacts    [Client — "use client"]
                          └── static JSX (hero, grid, footer)

src/app/globals.css         [Global styles, animations]
```

### 4.1 Client vs Server Boundaries

| Component | Directive | Hooks | Browser APIs |
|-----------|-----------|-------|--------------|
| `layout.tsx` | None (server) | ❌ | ❌ |
| `page.tsx` | None (server) | ❌ | ❌ |
| `DuckButton.tsx` | `"use client"` | `useState` | `setTimeout` |
| `SillyFacts.tsx` | `"use client"` | `useState`, `useEffect` | `setInterval`, `setTimeout` |

**Testing implication:** `DuckButton` and `SillyFacts` must be tested in an environment that supports React client rendering (jsdom + RTL). `page.tsx` and `layout.tsx` can be tested via React Server Components testing patterns or E2E; for this small app, rendering `page.tsx` directly in Vitest with mocked fonts is sufficient for integration tests.

### 4.2 External Dependencies

| Dependency | Version | Testing Impact |
|------------|---------|----------------|
| `next` | 16.2.9 | App Router, metadata API, font loader |
| `react` / `react-dom` | 19.2.4 | React 19 features; RTL 16+ recommended |
| `tailwindcss` | ^4 | `@import "tailwindcss"` in globals.css |
| `eslint-config-next` | 16.2.9 | Lint rules only |

### 4.3 Path Aliases

`tsconfig.json` maps `@/*` → `./src/*`. Vitest must mirror this:

```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

---

## 5. Per-Component Test Specifications

This section provides **concrete, numbered test cases** for each testable unit. Each case includes ID, priority, description, preconditions, steps, and expected results.

---

### 5.1 `DuckButton` (`src/components/DuckButton.tsx`)

**Component summary:** Renders a duck emoji button and a caption. On click, randomly selects a quack from `QUACKS` array (8 items), applies `wobble` CSS class for 500ms.

**Dependencies to mock:** `Math.random`, timers (`setTimeout`).

#### Test Cases

| ID | Priority | Test Case | Steps | Expected Result |
|----|----------|-----------|-------|-----------------|
| DB-001 | P0 | Initial render | Render `<DuckButton />` | Button visible with `aria-label="Quack button"`, emoji 🦆, caption "Press for wisdom" |
| DB-002 | P0 | Button is clickable | Render, click button | `onClick` handler fires; caption text changes from initial |
| DB-003 | P0 | Quack from valid set | Mock `Math.random` to return 0, click | Caption equals `QUACKS[0]` ("Quack!") |
| DB-004 | P0 | Quack index boundary | Mock `Math.random` to return 0.999..., click | Caption equals last quack in array |
| DB-005 | P1 | Multiple clicks change text | Click 3 times with different random values | Caption updates each time (not stuck on initial) |
| DB-006 | P1 | Wobble class applied on click | Click button | Button has class `wobble` immediately after click |
| DB-007 | P1 | Wobble class removed after 500ms | Click, advance timers 500ms | Button no longer has class `wobble` |
| DB-008 | P1 | Wobble re-triggers on rapid clicks | Click twice within 500ms | Wobble behavior resets/re-applies without error |
| DB-009 | P2 | Button type is button | Inspect DOM | `type="button"` (prevents form submission if ever wrapped) |
| DB-010 | P2 | Layout structure | Render | Outer div uses flex column; caption is `<p>` with mono font classes |
| DB-011 | P1 | Accessibility: name | Query by role | `getByRole('button', { name: 'Quack button' })` resolves |
| DB-012 | P2 | No console errors on unmount | Render, unmount after click | No React warnings or timer leaks after unmount + timer flush |

#### Edge Cases & Notes

- **Randomness:** Never assert exact random output without mocking. Use seeded `Math.random` or spy returning fixed values.
- **Timer leak:** After DB-007, call `vi.runOnlyPendingTimers()` and verify no errors on unmount.
- **QUACKS array:** If a quack string changes, update fixture constants in one place (`tests/fixtures/quacks.ts`).

#### Suggested Test File

`src/components/DuckButton.test.tsx`

---

### 5.2 `SillyFacts` (`src/components/SillyFacts.tsx`)

**Component summary:** Displays one fact from `FACTS` array (8 items), rotating every 4000ms with a 300ms fade-out/in transition via opacity classes.

**Dependencies to mock:** Timers (`setInterval`, nested `setTimeout`).

#### Test Cases

| ID | Priority | Test Case | Steps | Expected Result |
|----|----------|-----------|-------|-----------------|
| SF-001 | P0 | Initial render | Render `<SillyFacts />` | First fact displayed: "This app has zero business logic and infinite vibes." |
| SF-002 | P0 | Fact wrapped in quotes | Render | Text includes `&ldquo;` / `&rdquo;` rendered as curly quotes around fact |
| SF-003 | P0 | Cycles to next fact after interval | Render, advance 4000ms + 300ms | Second fact in array displayed |
| SF-004 | P0 | Wraps around after last fact | Start at index 7, advance interval | Returns to index 0 fact |
| SF-005 | P1 | Opacity fade during transition | Advance to transition point | Element has `opacity-0` during 300ms gap, then `opacity-100` |
| SF-006 | P1 | Interval cleanup on unmount | Render, unmount, advance timers | No state updates after unmount; no console warnings |
| SF-007 | P1 | Multiple cycles | Advance 4 full intervals | All 8 facts appear in order, then wrap |
| SF-008 | P2 | Semantic element | Render | Renders as `<p>` with italic styling classes |
| SF-009 | P2 | Stable DOM identity | Multiple cycles | Same `<p>` element updates text (no duplicate paragraphs) |
| SF-010 | P1 | Timing: 4000ms between cycles | Spy on setInterval | Interval registered with 4000ms delay |

#### Edge Cases & Notes

- **Nested timers:** The component uses `setInterval` containing `setTimeout(300ms)`. Tests must use `vi.useFakeTimers()` and carefully `advanceTimersByTime` in sequence: 4000ms → 300ms for one full cycle.
- **Strict Mode double-mount:** In React 19 Strict Mode (dev), effects run twice. Tests should either disable Strict Mode wrapper or account for double interval registration. Recommend a custom `renderWithProviders` without Strict Mode for timer tests, or assert behavior not call counts.
- **Total facts count:** 8 facts × 4.3s per cycle ≈ 34.4s for full rotation in real time — always use fake timers.

#### Suggested Test File

`src/components/SillyFacts.test.tsx`

---

### 5.3 `page.tsx` (`src/app/page.tsx`)

**Component summary:** Server component home page with hero section, `DuckButton`, `SillyFacts`, 3-column feature grid, decorative emoji background, and footer.

**Dependencies:** Imports `@/components/DuckButton` and `@/components/SillyFacts`.

#### Test Cases

| ID | Priority | Test Case | Steps | Expected Result |
|----|----------|-----------|-------|-----------------|
| PG-001 | P0 | Page renders without error | Render `<Home />` | No throw; main landmark present |
| PG-002 | P0 | Hero heading | Query h1 | Text "Silly Starter™" |
| PG-003 | P0 | Subtitle present | Query text | "A Next.js app that absolutely does not take itself seriously." |
| PG-004 | P0 | Eyebrow label | Query text | "Officially Unofficial" |
| PG-005 | P0 | DuckButton mounted | Query button | Quack button present |
| PG-006 | P0 | SillyFacts mounted | Query first fact text | Initial silly fact visible |
| PG-007 | P1 | Feature grid items | Query by text | "Fast-ish", "Styled", "Typed" all present |
| PG-008 | P1 | Feature descriptions | Query text | "React 19. Probably fine.", "Tailwind included. Duck approved.", "TypeScript for your mistakes." |
| PG-009 | P1 | Footer content | Query text | Contains "Built with npm, hope, and questionable life choices" |
| PG-010 | P1 | Footer code snippet | Query `code` | Contains "npm run dev" |
| PG-011 | P2 | Decorative emojis | Query text | 🍞, ✨, 🌊, 🦆 present in document |
| PG-012 | P2 | Semantic main element | Query role | `<main>` element exists |
| PG-013 | P1 | Feature cards count | Query grid children | Exactly 3 feature card divs |
| PG-014 | P2 | Responsive grid classes | Inspect grid container | Has `sm:grid-cols-3` class |
| PG-015 | P1 | Heading hierarchy | a11y check | Single h1; no skipped heading levels |

#### Edge Cases & Notes

- Client children will hydrate in E2E; in Vitest integration tests they render as client components in jsdom.
- Decorative emoji div has `pointer-events-none` — verify in E2E that clicks pass through to elements below (not blocking duck button). This is a P2 E2E case.

#### Suggested Test File

`src/app/page.test.tsx`

---

### 5.4 `layout.tsx` (`src/app/layout.tsx`)

**Component summary:** Root layout applying Geist fonts, global CSS, metadata, and html/body shell.

**Dependencies:** `next/font/google` (Geist, Geist_Mono), `./globals.css`.

#### Test Cases

| ID | Priority | Test Case | Steps | Expected Result |
|----|----------|-----------|-------|-----------------|
| LY-001 | P0 | Metadata title | Import metadata export | `title`: "Silly Starter™ — A Very Serious Next.js App" |
| LY-002 | P0 | Metadata description | Import metadata export | `description`: "A whimsical Next.js starter that quacks under pressure." |
| LY-003 | P0 | Renders children | Render layout with test child | Child text visible in output |
| LY-004 | P0 | HTML lang attribute | Render layout | `<html lang="en">` |
| LY-005 | P1 | Body structure | Render layout | `<body>` with `min-h-full flex flex-col font-sans` classes |
| LY-006 | P1 | Font variable classes on html | Render layout | html className includes `--font-geist-sans` and `--font-geist-mono` variable references |
| LY-007 | P2 | html antialiased | Render layout | html has `antialiased` class |
| LY-008 | P2 | html h-full | Render layout | html has `h-full` class |
| LY-009 | P1 | Globals CSS imported | Module graph / smoke | Layout module loads without CSS import errors (Vitest may stub CSS) |

#### Edge Cases & Notes

- **`next/font/google`:** Must be mocked in Vitest because font loading requires Next.js build pipeline. Mock should return `{ variable: '--font-geist-sans' }` style objects.
- **Metadata testing:** Can be tested by importing `{ metadata }` from layout and asserting object shape — no DOM required.
- **E2E verification:** Playwright can assert `<title>` tag and meta description in document head after navigation.

#### Suggested Test Files

- `src/app/layout.test.tsx` (render + children)
- `src/app/layout.metadata.test.ts` (metadata export)

---

### 5.5 `globals.css` (Indirect Testing)

CSS is not unit-tested directly. Coverage is achieved through:

| ID | Priority | Test Case | Method |
|----|----------|-----------|--------|
| CSS-001 | P1 | Wobble animation class | DuckButton test DB-006/007 | Assert `.wobble` toggles |
| CSS-002 | P2 | Float animations exist | E2E or build smoke | Page loads without CSS errors |
| CSS-003 | P2 | Dark mode variables | E2E with `prefers-color-scheme: dark` emulation | Background color changes |
| CSS-004 | P2 | Body uses CSS variables | Computed style in Playwright | `background` matches `--background` |

---

## 6. Next.js App Router Considerations

This project uses **Next.js 16 App Router** (`src/app/` directory). Testing must account for patterns that differ from Pages Router or older Next.js versions.

### 6.1 Server Components vs Client Components

| File | RSC? | Test Approach |
|------|------|---------------|
| `layout.tsx` | Yes | Import and render in Vitest with font mocks; metadata tested separately |
| `page.tsx` | Yes (no `"use client"`) | Render in Vitest; child client components work in jsdom |
| `DuckButton.tsx` | No | Standard RTL component test |
| `SillyFacts.tsx` | No | Standard RTL component test with fake timers |

**Important:** Do not import server-only modules (e.g., `next/headers`, `server-only` package) into client tests. This app does not use them today.

### 6.2 Metadata API

`layout.tsx` exports static `metadata: Metadata`. Test by direct import:

```typescript
import { metadata } from './layout';
expect(metadata.title).toBe('Silly Starter™ — A Very Serious Next.js App');
```

For E2E, verify rendered `<head>` tags match. Next.js 16 may stream metadata; Playwright should wait for `domcontentloaded` or `networkidle` before asserting title.

### 6.3 Font Loading (`next/font/google`)

Geist fonts are loaded at build time. In Vitest:

```typescript
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans-mock' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono-mock' }),
}));
```

E2E tests can optionally assert font-family computed style contains expected stack, but this is P2.

### 6.4 CSS Imports in Layout

Vitest does not process Tailwind by default. Options:

1. **Stub CSS** (recommended for unit tests): `css: { modules: { classNameStrategy: 'non-scoped' } }` or Vite plugin stub returning empty object.
2. **Import globals.css in test setup** if using `@tailwindcss/vite` plugin in Vitest config.

For this repo, stubbing CSS keeps tests fast; class name assertions still work because RTL checks `className` strings on DOM elements.

### 6.5 No API Routes, No Middleware

This app has no `route.ts`, `middleware.ts`, or dynamic segments. Test plan does not require MSW or API mocking. If future routes are added, extend with:

- `tests/e2e/api/` for route handlers
- MSW for fetch mocking in component tests

### 6.6 Production Build Testing

CI should run E2E against **`next build && next start`**, not dev server, to catch:

- RSC bundling issues
- Missing `"use client"` directives
- Production-only optimizations breaking hydration

Playwright `webServer` config:

```typescript
webServer: {
  command: 'npm run build && npm run start',
  port: 3000,
  reuseExistingServer: !process.env.CI,
},
```

### 6.7 React 19 Specifics

- Use `@testing-library/react` v16+ for React 19 compatibility.
- `act()` warnings: RTL wraps most updates; timer tests may need explicit `act(() => { vi.advanceTimersByTime(4000); })`.
- No legacy `ReactDOM.render` — use `createRoot` via RTL's `render()`.

### 6.8 AGENTS.md Compliance

This repo uses Next.js 16 with breaking changes. Before implementing test utilities that touch Next.js APIs, consult `node_modules/next/dist/docs/` for current testing guidance and deprecations. Do not assume Pages Router or Next.js 14 patterns.

---

## 7. Tooling: Vitest + React Testing Library + Playwright

### 7.1 Recommended Dependencies

```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@vitest/coverage-v8": "^3.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^26.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vite-tsconfig-paths": "^5.0.0",
    "@playwright/test": "^1.50.0",
    "@axe-core/playwright": "^4.10.0",
    "vitest-axe": "^0.1.0"
  }
}
```

Pin versions at implementation time to latest compatible with Next 16 / React 19.

### 7.2 Vitest Configuration

**File:** `vitest.config.ts` (project root)

Key settings:

| Setting | Value | Rationale |
|---------|-------|-----------|
| `environment` | `jsdom` | DOM APIs for RTL |
| `globals` | `true` | Optional; enables `describe/it/expect` without imports |
| `setupFiles` | `./tests/setup.ts` | jest-dom matchers, cleanup, mocks |
| `include` | `src/**/*.test.{ts,tsx}`, `tests/unit/**/*.test.{ts,tsx}` | Co-located + centralized tests |
| `coverage.provider` | `v8` | Fast native coverage |
| `coverage.thresholds` | statements: 85, branches: 80 | Enforced in CI Phase 3 |

### 7.3 Test Setup File

**File:** `tests/setup.ts`

Responsibilities:

- `import '@testing-library/jest-dom/vitest'`
- `afterEach(() => cleanup())`
- `afterEach(() => vi.useRealTimers())` — reset fake timers between tests
- Global mock for `next/font/google`
- Optional: suppress known harmless console warnings

### 7.4 React Testing Library Conventions

**Query priority (aligned with Testing Library philosophy):**

1. `getByRole('button', { name: 'Quack button' })`
2. `getByText(/Silly Starter/)`
3. `getByRole('heading', { level: 1, name: /Silly Starter/ })`
4. Avoid `container.querySelector('.duck-btn')` unless testing CSS hook specifically

**User interactions:**

- Prefer `@testing-library/user-event` over `fireEvent` for click (more realistic).
- `await user.click(button)` for async-friendly behavior.

### 7.5 Playwright Configuration

**File:** `playwright.config.ts`

| Setting | Value |
|---------|-------|
| `testDir` | `./tests/e2e` |
| `baseURL` | `http://localhost:3000` |
| `projects` | `chromium` (required), `firefox` (optional P2) |
| `retries` | 2 in CI, 0 locally |
| `webServer` | build + start (see §6.6) |
| `use.trace` | `on-first-retry` in CI |

### 7.6 npm Scripts to Add

See [Appendix B](#appendix-b-npm-scripts-reference).

### 7.7 TypeScript Configuration

Extend `tsconfig.json` for Vitest types:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

Or use triple-slash reference in `tests/setup.ts`.

---

## 8. CI/CD Integration

No CI exists today. Recommended pipeline using **GitHub Actions** (`.github/workflows/ci.yml`).

### 8.1 Pipeline Stages

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Lint     │───▶│  Typecheck  │───▶│  Vitest     │───▶│   Build     │
│ eslint      │    │ tsc --noEmit│    │ + coverage  │    │ next build  │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
                    ┌─────────────┐    ┌─────────────┐         │
                    │  Coverage   │◀───│  Playwright │◀────────┘
                    │  upload     │    │  E2E smoke  │
                    └─────────────┘    └─────────────┘
```

### 8.2 Workflow Definition (Draft)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 8.3 Branch Protection Rules

When CI is live, enforce on `main`:

- Require status checks: `quality`
- Require PR reviews (optional for solo maintainer)
- No direct pushes without CI pass

### 8.4 Coverage Reporting

- Upload `coverage/lcov.info` to Codecov or Coveralls (optional).
- Fail CI if coverage drops below thresholds (Phase 3).
- PR comments with coverage diff (Codecov feature).

### 8.5 Caching Strategy

- Cache `~/.npm` via `actions/setup-node` cache.
- Cache Playwright browsers: `actions/cache` on `~/.cache/ms-playwright`.

### 8.6 Parallelization

For this small repo, a single job is sufficient. If E2E suite grows beyond 5 minutes, split:

- `unit` job: lint + vitest
- `e2e` job: build + playwright (depends on `unit`)

---

## 9. Mocking Strategy

### 9.1 Mock Inventory

| Target | Layer | Method | Reason |
|--------|-------|--------|--------|
| `Math.random` | Unit | `vi.spyOn(Math, 'random').mockReturnValue(0)` | Deterministic quack |
| `setTimeout` / `setInterval` | Unit | `vi.useFakeTimers()` | SillyFacts / DuckButton timing |
| `next/font/google` | Unit | `vi.mock('next/font/google', ...)` | Font loader requires Next build |
| `*.css` imports | Unit | Vite `css: true` stub or empty module | Tailwind not needed for logic tests |
| Network / CDN | E2E | None (real fonts load) or block in perf tests | Optional |
| `next/navigation` | Future | `vi.mock('next/navigation')` | Not used today |

### 9.2 Math.random Mock Pattern (DuckButton)

```typescript
const QUACKS = [/* mirror from component or import if exported */];

it('selects quack by random index', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(3 / QUACKS.length);
  const user = userEvent.setup();
  render(<DuckButton />);
  await user.click(screen.getByRole('button', { name: 'Quack button' }));
  expect(screen.getByText(QUACKS[3])).toBeInTheDocument();
});
```

**Recommendation:** Export `QUACKS` from a shared `src/data/quacks.ts` (optional refactor) to avoid duplication between component and tests.

### 9.3 Fake Timers Pattern (SillyFacts)

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('advances fact after 4.3 seconds', () => {
  render(<SillyFacts />);
  expect(screen.getByText(/zero business logic/)).toBeInTheDocument();
  act(() => {
    vi.advanceTimersByTime(4000); // interval fires, starts fade
    vi.advanceTimersByTime(300);  // timeout completes, index updates
  });
  expect(screen.getByText(/Next.js can render/)).toBeInTheDocument();
});
```

### 9.4 Font Mock Pattern (Layout)

```typescript
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'font-geist-sans' }),
  Geist_Mono: () => ({ variable: 'font-geist-mono' }),
}));
```

Place in `tests/setup.ts` for global application.

### 9.5 What NOT to Mock

- React itself
- `@testing-library/*` internals
- Child components when testing parent integration (page should render real DuckButton/SillyFacts)
- User event simulation (use real user-event library)

---

## 10. Accessibility (a11y) Testing

### 10.1 Current a11y State (Manual Audit)

| Element | Status | Notes |
|---------|--------|-------|
| `<html lang="en">` | ✅ Good | Set in layout |
| Duck button | ✅ Good | `aria-label="Quack button"` |
| Page h1 | ✅ Good | Single h1 "Silly Starter™" |
| Decorative emojis | ⚠️ Acceptable | Emoji in divs without aria — decorative, should have `aria-hidden="true"` (improvement) |
| SillyFacts | ⚠️ Minor | Plain `<p>` — consider `aria-live="polite"` for rotating content |
| Color contrast | ⚠️ Verify | Amber palette — run axe in E2E |
| Keyboard navigation | ✅ Expected | Native button is focusable |
| Focus indicators | ⚠️ Verify | Tailwind defaults — check visible focus ring |

### 10.2 Automated a11y Tests

#### Component Level (vitest-axe)

| ID | Priority | Test |
|----|----------|------|
| A11Y-001 | P0 | DuckButton alone has no axe violations |
| A11Y-002 | P0 | SillyFacts alone has no axe violations |
| A11Y-003 | P1 | Full page composition has no critical axe violations |

#### E2E Level (@axe-core/playwright)

| ID | Priority | Test |
|----|----------|------|
| A11Y-E01 | P0 | Home page passes axe scan (wcag2a, wcag2aa) |
| A11Y-E02 | P1 | Home page passes axe with dark color scheme |
| A11Y-E03 | P1 | Keyboard: Tab reaches duck button, Enter activates |
| A11Y-E04 | P2 | Screen reader name: button accessible name is "Quack button" |

### 10.3 Recommended a11y Improvements (Product, Not Test Blockers)

1. Add `aria-hidden="true"` to decorative emoji containers in `page.tsx`.
2. Add `aria-live="polite"` and `aria-atomic="true"` to SillyFacts `<p>`.
3. Ensure `:focus-visible` ring on `.duck-btn` for keyboard users.

Tests should be written against **current** behavior; improvement tickets can update tests when a11y enhancements land.

### 10.4 Manual a11y Checklist (Release Gate)

- VoiceOver (macOS) or NVDA (Windows) announces button and heading.
- 200% zoom: no horizontal scroll, text readable.
- Reduced motion: consider `prefers-reduced-motion` for wobble/float (future enhancement + test).

---

## 11. Performance Testing

This app is static UI with no data fetching. Performance testing is lightweight but valuable for CI regression detection.

### 11.1 Metrics to Track

| Metric | Target | Tool |
|--------|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s | Playwright / Lighthouse CI |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| TTI / hydration | < 3s on 3G | Lighthouse (P2) |
| JS bundle size (First Load) | Baseline + warn on +10% | `@next/bundle-analyzer` (P2) |
| Vitest suite duration | < 10s total | CI timing |
| E2E suite duration | < 2 min | CI timing |

### 11.2 Performance Test Cases

| ID | Priority | Test | Method |
|----|----------|------|--------|
| PERF-001 | P1 | Home page LCP under threshold | Playwright performance API or Lighthouse CI |
| PERF-002 | P2 | No layout shift on fact rotation | CLS observation during 8s wait |
| PERF-003 | P2 | Production build completes | `next build` in CI < 60s |
| PERF-004 | P2 | First load JS size budget | Bundle analyzer on PR (optional) |

### 11.3 Lighthouse CI (Optional Phase 4)

```yaml
- uses: treosh/lighthouse-ci-action@v11
  with:
    urls: http://localhost:3000
    budgetPath: ./tests/performance/budget.json
```

**File:** `tests/performance/budget.json` — define max JS/CSS bytes.

### 11.4 Animation Performance

Wobble (500ms) and float (4s infinite) use CSS transforms — GPU-friendly. No performance test required unless jank is reported. E2E can assert animations don't block click handling.

---

## 12. Fixtures & Test Data Management

### 12.1 Directory Structure

```
tests/
├── setup.ts                 # Global test setup
├── fixtures/
│   ├── quacks.ts              # QUACKS array mirror
│   ├── facts.ts               # FACTS array mirror
│   └── pages.ts               # Expected page copy strings
├── helpers/
│   ├── render.tsx             # Custom render wrapper
│   └── timers.ts              # advanceFactCycle(), etc.
├── e2e/
│   ├── home.spec.ts
│   ├── duck-button.spec.ts
│   └── accessibility.spec.ts
└── performance/
    └── budget.json            # Optional
```

### 12.2 Fixture: Quacks

**File:** `tests/fixtures/quacks.ts`

```typescript
export const QUACKS = [
  'Quack!',
  'Honk??',
  'Bread acquired.',
  'Professional waddler.',
  '404: dignity not found.',
  'This button does nothing. Like my degree.',
  "You're doing great, probably.",
  'Have you tried turning the duck off and on again?',
] as const;

export const INITIAL_QUACK_CAPTION = 'Press for wisdom';
```

### 12.3 Fixture: Facts

**File:** `tests/fixtures/facts.ts`

```typescript
export const FACTS = [
  'This app has zero business logic and infinite vibes.',
  'Next.js can render on the server. This duck cannot.',
  // ... all 8 facts
] as const;

export const FACT_CYCLE_MS = 4000;
export const FACT_FADE_MS = 300;
```

### 12.4 Fixture: Page Copy

**File:** `tests/fixtures/pages.ts`

```typescript
export const HOME_COPY = {
  eyebrow: 'Officially Unofficial',
  title: 'Silly Starter™',
  subtitle: 'A Next.js app that absolutely does not take itself seriously.',
  features: [
    { label: 'Fast-ish', desc: 'React 19. Probably fine.' },
    { label: 'Styled', desc: 'Tailwind included. Duck approved.' },
    { label: 'Typed', desc: 'TypeScript for your mistakes.' },
  ],
  footerSnippet: 'npm run dev',
} as const;
```

### 12.5 Helper: Timer Utilities

**File:** `tests/helpers/timers.ts`

```typescript
import { act } from '@testing-library/react';

export function advanceFactCycle(cycles = 1) {
  act(() => {
    for (let i = 0; i < cycles; i++) {
      vi.advanceTimersByTime(4000);
      vi.advanceTimersByTime(300);
    }
  });
}

export function advanceWobbleComplete() {
  act(() => {
    vi.advanceTimersByTime(500);
  });
}
```

### 12.6 DRY Principle vs Component Encapsulation

**Option A (current):** Constants live inside components — tests duplicate fixtures.  
**Option B (recommended at Phase 2):** Extract to `src/data/quacks.ts` and `src/data/facts.ts` — single source of truth.

Tests import from `src/data/*` instead of maintaining parallel fixtures.

---

## 13. Priority Matrix (P0 / P1 / P2)

### 13.1 Priority Definitions

| Priority | Meaning | CI Blocking? | Timeline |
|----------|---------|--------------|----------|
| **P0** | Must pass for merge; core user value | Yes | Phase 1 |
| **P1** | Important quality; should pass before v1.0 test suite | Yes (Phase 2+) | Phase 2 |
| **P2** | Nice-to-have; polish and edge cases | No (warn only) | Phase 3–4 |

### 13.2 P0 Test Cases (Must Have)

| ID | Component | Description |
|----|-----------|-------------|
| DB-001 | DuckButton | Initial render |
| DB-002 | DuckButton | Click changes caption |
| DB-003 | DuckButton | Deterministic quack via mocked random |
| SF-001 | SillyFacts | Initial fact |
| SF-003 | SillyFacts | Fact cycles after interval |
| PG-001 | page | Renders without error |
| PG-002 | page | h1 title |
| PG-005 | page | DuckButton present |
| PG-006 | page | SillyFacts present |
| LY-001 | layout | Metadata title |
| LY-003 | layout | Renders children |
| LY-004 | layout | lang="en" |
| E2E-001 | E2E | Page loads 200 |
| E2E-002 | E2E | Click duck changes text |
| A11Y-E01 | a11y | Axe scan passes |

**P0 Count:** ~15 tests

### 13.3 P1 Test Cases (Should Have)

All DB-004 through DB-008, DB-011, SF-004 through SF-007, SF-010, PG-003 through PG-010, PG-013, PG-015, LY-002, LY-005, LY-006, LY-009, CSS-001, A11Y-001 through A11Y-003, A11Y-E02, A11Y-E03, PERF-001, E2E-003 (fact rotation).

**P1 Count:** ~25 tests

### 13.4 P2 Test Cases (Nice to Have)

DB-009, DB-010, DB-012, SF-008, SF-009, PG-011, PG-012, PG-014, LY-007, LY-008, CSS-002 through CSS-004, A11Y-E04, PERF-002 through PERF-004, dark mode E2E, decorative emoji tests.

**P2 Count:** ~15 tests

### 13.5 Priority × Layer Matrix

|  | Unit/Component | Integration | E2E |
|--|----------------|-------------|-----|
| **P0** | DB-001–003, SF-001, SF-003, LY-001, LY-003–004 | PG-001–002, PG-005–006 | E2E-001–002, A11Y-E01 |
| **P1** | Timers, wobble, metadata desc, axe component | Feature grid, footer, heading a11y | Fact rotation, keyboard |
| **P2** | CSS classes, edge unmount | Decorative elements | Dark mode, perf budgets |

---

## 14. Implementation Roadmap

### Phase 0: Foundation (Day 1 — ~2 hours)

**Objective:** Install tooling, configure Vitest, single smoke test passes.

| Task | Deliverable |
|------|-------------|
| Install dev dependencies | Updated `package.json` |
| Create `vitest.config.ts` | jsdom, path aliases, setup file |
| Create `tests/setup.ts` | jest-dom, font mock, timer cleanup |
| Add npm scripts | `test`, `test:watch`, `test:coverage` |
| Write smoke test | `src/components/DuckButton.test.tsx` with DB-001 |
| Verify | `npm run test` exits 0 |

**Exit criteria:** One passing test, CI-ready script exists.

---

### Phase 1: P0 Component & Integration Tests (Day 2–3 — ~4 hours)

**Objective:** All P0 unit/integration tests green.

| Task | Deliverable |
|------|-------------|
| DuckButton P0 tests | DB-001 through DB-003 |
| SillyFacts P0 tests | SF-001, SF-003 |
| Page integration P0 | PG-001, PG-002, PG-005, PG-006 |
| Layout P0 | LY-001, LY-003, LY-004 |
| Create fixtures | `tests/fixtures/*` |
| Create timer helpers | `tests/helpers/timers.ts` |

**Exit criteria:** ≥ 12 P0 tests passing, coverage report generated.

---

### Phase 2: Playwright E2E + CI (Day 4–5 — ~4 hours)

**Objective:** E2E smoke tests run in CI against production build.

| Task | Deliverable |
|------|-------------|
| Install Playwright | `@playwright/test`, `@axe-core/playwright` |
| Create `playwright.config.ts` | webServer with build+start |
| Write E2E specs | `tests/e2e/home.spec.ts`, `duck-button.spec.ts` |
| Write axe spec | `tests/e2e/accessibility.spec.ts` |
| Create `.github/workflows/ci.yml` | Full pipeline |
| Add `typecheck` script | `"typecheck": "tsc --noEmit"` |

**Exit criteria:** CI green on PR, E2E-001/002/A11Y-E01 passing.

---

### Phase 3: P1 Coverage + Thresholds (Week 2 — ~6 hours)

**Objective:** Reach 85% coverage, all P1 tests implemented.

| Task | Deliverable |
|------|-------------|
| DuckButton P1 | Wobble timers, aria, multiple clicks |
| SillyFacts P1 | Full cycle, opacity, cleanup |
| Page P1 | Feature grid, footer, heading hierarchy |
| Layout P1 | Metadata description, body classes |
| Enable coverage thresholds | Fail CI below 85/80 |
| Optional: extract shared data | `src/data/quacks.ts`, `src/data/facts.ts` |

**Exit criteria:** Coverage ≥ 85% statements, all P1 tests green.

---

### Phase 4: P2 + Performance + Polish (Week 3 — optional)

**Objective:** Complete test suite, performance baselines.

| Task | Deliverable |
|------|-------------|
| P2 edge case tests | Unmount, dark mode, decorative |
| Lighthouse CI | Performance budget |
| Firefox project in Playwright | Cross-browser confidence |
| Documentation | Update README testing section |
| a11y product fixes | aria-live, aria-hidden + test updates |

**Exit criteria:** Full test plan implemented, README documents how to run tests.

---

### Roadmap Gantt (ASCII)

```
Week 1   │ Phase 0 │ Phase 1      │ Phase 2      │
         │ ▓▓      │ ▓▓▓▓▓▓▓▓     │ ▓▓▓▓▓▓       │
Week 2   │         │              │ Phase 3      │
         │         │              │ ▓▓▓▓▓▓▓▓▓▓   │
Week 3   │         │              │ Phase 4 (opt)│
         │         │              │ ▓▓▓▓▓        │
```

---

## 15. Example Test Code Snippets

### 15.1 DuckButton — Full P0 Suite

```typescript
// src/components/DuckButton.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DuckButton } from './DuckButton';
import { INITIAL_QUACK_CAPTION } from '../../tests/fixtures/quacks';

describe('DuckButton', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('DB-001: renders initial state', () => {
    render(<DuckButton />);
    expect(
      screen.getByRole('button', { name: 'Quack button' })
    ).toHaveTextContent('🦆');
    expect(screen.getByText(INITIAL_QUACK_CAPTION)).toBeInTheDocument();
  });

  it('DB-002: updates caption on click', async () => {
    const user = userEvent.setup();
    render(<DuckButton />);
    const button = screen.getByRole('button', { name: 'Quack button' });
    await user.click(button);
    expect(screen.queryByText(INITIAL_QUACK_CAPTION)).not.toBeInTheDocument();
  });

  it('DB-003: selects quack by mocked random index', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const user = userEvent.setup();
    render(<DuckButton />);
    await user.click(screen.getByRole('button', { name: 'Quack button' }));
    expect(screen.getByText('Quack!')).toBeInTheDocument();
  });

  it('DB-006/007: toggles wobble class for 500ms', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<DuckButton />);
    const button = screen.getByRole('button', { name: 'Quack button' });
    await user.click(button);
    expect(button.className).toMatch(/wobble/);
    vi.advanceTimersByTime(500);
    expect(button.className).not.toMatch(/wobble/);
  });
});
```

### 15.2 SillyFacts — Cycle Test

```typescript
// src/components/SillyFacts.test.tsx
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SillyFacts } from './SillyFacts';
import { FACTS } from '../../tests/fixtures/facts';
import { advanceFactCycle } from '../../tests/helpers/timers';

describe('SillyFacts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('SF-001: shows first fact on mount', () => {
    render(<SillyFacts />);
    expect(screen.getByText(new RegExp(FACTS[0]))).toBeInTheDocument();
  });

  it('SF-003: advances to second fact after one cycle', () => {
    render(<SillyFacts />);
    advanceFactCycle(1);
    expect(screen.getByText(new RegExp(FACTS[1]))).toBeInTheDocument();
  });

  it('SF-004: wraps from last fact to first', () => {
    render(<SillyFacts />);
    advanceFactCycle(FACTS.length);
    expect(screen.getByText(new RegExp(FACTS[0]))).toBeInTheDocument();
  });

  it('SF-006: cleans up interval on unmount', () => {
    const clearSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = render(<SillyFacts />);
    unmount();
    expect(clearSpy).toHaveBeenCalled();
  });
});
```

### 15.3 Page Integration Test

```typescript
// src/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';
import { HOME_COPY } from '../../tests/fixtures/pages';

describe('Home page', () => {
  it('PG-001/002: renders hero', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { level: 1, name: HOME_COPY.title })
    ).toBeInTheDocument();
  });

  it('PG-005/006: mounts interactive components', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: 'Quack button' })).toBeInTheDocument();
    expect(screen.getByText(/zero business logic/)).toBeInTheDocument();
  });

  it('PG-007: renders feature cards', () => {
    render(<Home />);
    for (const feature of HOME_COPY.features) {
      expect(screen.getByText(feature.label)).toBeInTheDocument();
      expect(screen.getByText(feature.desc)).toBeInTheDocument();
    }
  });
});
```

### 15.4 Layout Metadata Test

```typescript
// src/app/layout.metadata.test.ts
import { describe, it, expect } from 'vitest';
import { metadata } from './layout';

describe('RootLayout metadata', () => {
  it('LY-001: exports correct title', () => {
    expect(metadata.title).toBe('Silly Starter™ — A Very Serious Next.js App');
  });

  it('LY-002: exports correct description', () => {
    expect(metadata.description).toBe(
      'A whimsical Next.js starter that quacks under pressure.'
    );
  });
});
```

### 15.5 Playwright E2E — Home Smoke

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('E2E-001: loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Silly Starter™');
  });

  test('E2E-002: duck button changes quack text', async ({ page }) => {
    await page.goto('/');
    const caption = page.locator('button[aria-label="Quack button"] + p');
    await expect(caption).toHaveText('Press for wisdom');
    await page.getByRole('button', { name: 'Quack button' }).click();
    await expect(caption).not.toHaveText('Press for wisdom');
  });

  test('E2E-003: silly fact rotates', async ({ page }) => {
    await page.goto('/');
    const fact = page.locator('main p.italic');
    const initial = await fact.textContent();
    await page.waitForTimeout(4500);
    await expect(fact).not.toHaveText(initial ?? '');
  });
});
```

### 15.6 Playwright — Accessibility Scan

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('A11Y-E01: home page has no critical a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### 15.7 vitest.config.ts Skeleton

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/unit/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
});
```

---

## 16. Risk Areas & Mitigations

### 16.1 Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| R1 | **Flaky E2E from SillyFacts timing** — 4s wait is brittle | High | Medium | Use Playwright `expect.poll()` or wait for text change, not fixed timeout; increase timeout to 5s |
| R2 | **Timer test flakiness** — nested setInterval/setTimeout | Medium | High | Always use fake timers; shared `advanceFactCycle` helper |
| R3 | **Math.random non-determinism** | High | Low | Mock in all quack assertion tests |
| R4 | **Next.js 16 API changes** | Medium | Medium | Read `node_modules/next/dist/docs/` before custom test utils; pin Next version |
| R5 | **React Strict Mode double effects** | Medium | Medium | Test behavior not effect call counts; optional wrapper without StrictMode |
| R6 | **Font mock drift** | Low | Low | Centralize mock in `tests/setup.ts` |
| R7 | **Tailwind v4 class changes** | Low | Low | Assert key classes only, not full class strings |
| R8 | **Coverage gaps in layout.tsx** | Medium | Low | Dedicated metadata test + render test |
| R9 | **CI duration creep** | Low | Medium | Keep E2E minimal; parallel jobs if > 5 min |
| R10 | **Hydration mismatch** | Low | High | E2E against production build catches real issues |
| R11 | **Emoji rendering differences** | Low | Low | Assert text content, not glyph images |
| R12 | **vitest + Next.js RSC integration** | Medium | Medium | For this app, treat page as standard React render; defer `@testing-library/react` RSC experimental APIs unless needed |

### 16.2 Highest-Risk Component: SillyFacts

**Why:** Combines `useEffect`, `setInterval`, nested `setTimeout`, and opacity state — classic source of flaky tests and memory leaks.

**Mitigation checklist:**
- [ ] Fake timers in every SillyFacts test file
- [ ] Unmount test (SF-006) required before Phase 3 sign-off
- [ ] E2E uses text polling, not `waitForTimeout(4000)` alone
- [ ] Document exact timing constants in fixtures

### 16.3 Second-Highest-Risk: DuckButton Wobble

**Why:** 500ms `setTimeout` must be cleaned up; rapid clicks can queue timers.

**Mitigation:**
- [ ] Test unmount after click (DB-012)
- [ ] Use `vi.advanceTimersByTime(500)` not real wait
- [ ] `afterEach` restores real timers

---

## 17. Definition of Done

The testing initiative is **complete** when all criteria below are met:

### 17.1 Infrastructure Done

- [ ] Vitest configured with jsdom, path aliases, and setup file
- [ ] Playwright configured with production build webServer
- [ ] GitHub Actions CI workflow runs on every PR to `main`
- [ ] npm scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`, `typecheck`
- [ ] README updated with "Testing" section

### 17.2 Coverage Done

- [ ] All **P0** test cases implemented and passing
- [ ] All **P1** test cases implemented and passing
- [ ] Statement coverage ≥ **85%**, branch coverage ≥ **80%**
- [ ] Coverage thresholds enforced in CI (fail on regression)

### 17.3 Quality Done

- [ ] Zero flaky tests over 10 consecutive CI runs
- [ ] E2E axe scan (A11Y-E01) passes with zero violations
- [ ] `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`, `npm run test:e2e` all pass in CI
- [ ] No timer leaks (SillyFacts unmount test passes)
- [ ] No console errors in E2E smoke tests

### 17.4 Documentation Done

- [ ] This testing plan reviewed and accurate
- [ ] Test case IDs traceable to test files (comment or naming convention)
- [ ] Fixtures documented in `tests/fixtures/`
- [ ] Contributing guide mentions test expectations for new components

### 17.5 Sign-Off Checklist

| Stakeholder | Verification |
|-------------|--------------|
| Developer | All tests pass locally |
| CI | Green pipeline on main |
| a11y | Axe E2E clean |
| Performance | LCP baseline recorded (optional Phase 4) |

---

## Appendix A: File & Directory Layout

### Current Repository Structure

```
/workspace/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── DuckButton.tsx
│       └── SillyFacts.tsx
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── docs/
│   └── reports/
│       └── testing-plan.md          ← this document
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── AGENTS.md
└── README.md
```

### Target Structure (Post-Implementation)

```
/workspace/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── layout.metadata.test.ts
│   │   ├── layout.test.tsx
│   │   ├── page.tsx
│   │   └── page.test.tsx
│   ├── components/
│   │   ├── DuckButton.tsx
│   │   ├── DuckButton.test.tsx
│   │   ├── SillyFacts.tsx
│   │   └── SillyFacts.test.tsx
│   └── data/                        # optional Phase 3 refactor
│       ├── quacks.ts
│       └── facts.ts
├── tests/
│   ├── setup.ts
│   ├── fixtures/
│   │   ├── quacks.ts
│   │   ├── facts.ts
│   │   └── pages.ts
│   ├── helpers/
│   │   ├── render.tsx
│   │   └── timers.ts
│   ├── e2e/
│   │   ├── home.spec.ts
│   │   ├── duck-button.spec.ts
│   │   └── accessibility.spec.ts
│   └── performance/
│       └── budget.json
├── vitest.config.ts
├── playwright.config.ts
└── ... (existing files)
```

---

## Appendix B: npm Scripts Reference

Scripts to add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run test:e2e"
  }
}
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **RSC** | React Server Component — renders on server, no client hooks |
| **RTL** | React Testing Library — DOM-centric component testing utilities |
| **E2E** | End-to-end test — full app in real browser |
| **axe** | Accessibility engine by Deque — WCAG rule automation |
| **jsdom** | JavaScript DOM implementation for Node.js test environments |
| **Fake timers** | Vitest/Jest feature to mock `setTimeout`/`setInterval` |
| **Hydration** | React attaching event listeners to server-rendered HTML |
| **P0/P1/P2** | Priority tiers — blocking, important, nice-to-have |
| **Fixture** | Static test data reused across multiple test files |
| **Smoke test** | Minimal test verifying basic functionality ("does it quack?") |

---

## Summary

Silly Starter™ is a small application with a large testing opportunity: **zero coverage today**, but a well-bounded surface area that maps cleanly to a Vitest + RTL + Playwright pyramid. The highest-value first steps are:

1. Configure Vitest with fake timers and font mocks.
2. Implement P0 tests for `DuckButton`, `SillyFacts`, `page`, and `layout` metadata.
3. Add Playwright E2E smoke tests against the production build.
4. Wire GitHub Actions CI with lint, typecheck, coverage, build, and E2E.

Following this plan through Phase 3 yields **~55 automated tests**, **≥85% code coverage**, and a CI pipeline that ensures the duck always quacks, the facts always rotate, and the page always loads — with zero dignity found, as intended.

---

*Document maintained in `/workspace/docs/reports/testing-plan.md`. Update when components, routes, or tooling change.*
