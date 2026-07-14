# Test Notes & Testing Strategy — Silly Starter™

> **Status:** No tests exist in this repository yet. This document is an exhaustive
> analysis of the codebase plus a concrete, copy‑pasteable plan for introducing a
> test suite. It is intended to be the single source of truth for "how we test this app".

---

## 0. Repository snapshot

| Item | Value |
| --- | --- |
| App name | `starter-repo` (a.k.a. **Silly Starter™**) |
| Framework | **Next.js `16.2.9`** (App Router) |
| React | **`19.2.4`** / `react-dom` `19.2.4` |
| Language | TypeScript `^5` (`strict: true`) |
| Styling | Tailwind CSS `^4` via `@tailwindcss/postcss` |
| Linting | ESLint `^9` flat config + `eslint-config-next` |
| Module alias | `@/*` → `./src/*` (see `tsconfig.json`) |
| Node (CI/dev observed) | `v22.14.0` |
| Package manager lockfile | `package-lock.json` (npm) |

### Source tree (everything under `src/`)

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css        # Tailwind import + CSS vars + keyframe animations
│   ├── layout.tsx         # Root layout: <html>/<body>, fonts, exported metadata
│   └── page.tsx           # Home route ("/") — server component
└── components/
    ├── DuckButton.tsx     # "use client" — random quack + wobble animation
    └── SillyFacts.tsx     # "use client" — auto-rotating fact carousel
```

> ⚠️ **Important context (from `AGENTS.md`):** This is Next.js 16, which has breaking
> changes vs. older releases. All tooling recommendations below were cross‑checked
> against the bundled docs in `node_modules/next/dist/docs/01-app/02-guides/testing/`
> (`vitest.md`, `jest.md`, `playwright.md`) rather than from memory.

---

## 1. Current test infrastructure (or lack thereof)

There is **no test infrastructure of any kind**. Concretely:

- **No test runner.** `package.json` `scripts` contains only `dev`, `build`, `start`,
  `lint`. There is no `test` / `test:watch` / `test:e2e` script.
- **No test framework installed.** No `jest`, `vitest`, `@testing-library/*`,
  `@playwright/test`, or `jsdom` in `dependencies` or `devDependencies`.
- **No test files.** No `__tests__/`, no `*.test.ts(x)`, no `*.spec.ts(x)`,
  no `e2e/` or `tests/` directory.
- **No test config.** No `vitest.config.*`, `jest.config.*`, `jest.setup.*`,
  `playwright.config.*`, or `__mocks__/`.
- **No coverage tooling / thresholds.**
- **No CI.** No `.github/workflows/`, no other CI provider config files present.
  Nothing runs `lint`, `build`, or any tests automatically on push/PR.

### What *does* exist that adjacent to testing

- `npm run lint` → `eslint` (flat config extends `core-web-vitals` + `typescript`).
  This is the only automated quality gate currently available and should be the
  first thing wired into CI alongside tests.
- `tsc` is available via the `typescript` devDependency. `next build` runs type
  checking, so type safety is enforced at build time but not as a standalone gate.

**Recommendation:** Treat `lint`, `tsc --noEmit`, unit tests, and a small E2E smoke
suite as four independent CI gates (see §11).

---

## 2. Application behaviour reference (what we are actually testing)

A precise behavioural model is essential for writing meaningful assertions, so here
is the exact behaviour of each unit.

### 2.1 `DuckButton.tsx` (`"use client"`)

```16:41:src/components/DuckButton.tsx
export function DuckButton() {
  const [quack, setQuack] = useState("Press for wisdom");
  const [wobble, setWobble] = useState(false);

  function handleClick() {
    setQuack(QUACKS[Math.floor(Math.random() * QUACKS.length)]);
    setWobble(true);
    setTimeout(() => setWobble(false), 500);
  }
  ...
```

Behavioural facts:

- Two pieces of state: `quack` (string, initial `"Press for wisdom"`) and `wobble`
  (boolean, initial `false`).
- `QUACKS` is a module‑level array of **8** strings.
- On click `handleClick`:
  1. Selects `QUACKS[Math.floor(Math.random() * 8)]` → index `0..7`.
  2. Sets `wobble = true`.
  3. Schedules `setWobble(false)` after **500 ms** via `setTimeout`.
- Render:
  - A `<button type="button">` containing the 🦆 emoji, with `aria-label="Quack button"`.
  - `className` always includes `duck-btn text-6xl transition-transform hover:scale-110 active:scale-95`
    and conditionally appends `wobble` when `wobble === true`.
  - A `<p>` showing the current `quack` text.

Notable testing implications / edge cases:
- `Math.random()` must be **mocked/stubbed** for deterministic quack assertions.
- The 500 ms wobble reset requires **fake timers**.
- Because the quack is random, two consecutive clicks **may produce the same text**
  — so "text changes on click" is a flaky assertion unless `Math.random` is controlled.
- Rapid repeated clicks create **multiple overlapping `setTimeout`s**; the last one to
  fire wins, and the `wobble` class will be removed 500 ms after the final click.
- There is **no `aria-live`** on the quack `<p>`, so screen readers won't announce
  updates (a11y finding — see §13).

### 2.2 `SillyFacts.tsx` (`"use client"`)

```16:39:src/components/SillyFacts.tsx
export function SillyFacts() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % FACTS.length);
        setVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  ...
```

Behavioural facts:

- `FACTS` is a module‑level array of **8** strings.
- State: `index` (number, initial `0`), `visible` (boolean, initial `true`).
- On mount, an interval fires **every 4000 ms**. Each tick:
  1. Sets `visible = false` (triggers fade‑out via Tailwind `opacity` transition).
  2. After **300 ms**, advances `index` to `(index + 1) % 8` and sets `visible = true`.
- Cleanup clears the **interval** on unmount.
- Render: a single `<p>` with `FACTS[index]` wrapped in typographic quotes
  (`&ldquo;`/`&rdquo;`), with `opacity-100` when visible and `opacity-0` when not.

Notable testing implications / edge cases:
- Requires **fake timers** for the 4000 ms / 300 ms cadence.
- **Latent bug to cover with a test:** the inner `setTimeout` is **not** captured or
  cleared in the cleanup function. If the component unmounts during the 300 ms window
  between fade‑out and index advance, that timeout still fires and calls
  `setIndex`/`setVisible` on an unmounted component. In React 19 this is largely
  benign (no warning), but a test asserting "no state updates after unmount" documents
  the intent and guards against regressions. Recommended fix: capture the inner
  timeout id and clear it in cleanup.
- **Modulo wraparound:** after the 8th fact, index returns to `0`. A test should drive
  the timer through a full cycle (8 ticks) to verify wraparound.
- The faded‑out text remains in the DOM at `opacity-0` (still readable by assistive
  tech). No `aria-live`/`aria-atomic` semantics (a11y finding — see §13).

### 2.3 `page.tsx` (Home route `/`, **synchronous server component**)

Renders:
- A decorative background layer of floating emojis (🍞 ✨ 🌊 🦆) — `pointer-events-none`,
  `opacity-30`, **not** marked `aria-hidden` (a11y finding).
- `<main>` containing:
  - Eyebrow text `Officially Unofficial`.
  - `<h1>` = `Silly Starter™`.
  - Tagline paragraph.
  - `<DuckButton />`.
  - `<SillyFacts />`.
  - A 3‑item feature grid: `{⚡ "Fast-ish"}`, `{🎨 "Styled"}`, `{🤷 "Typed"}`,
    each rendered from a mapped array keyed by `label`.
  - A `<footer>` with build credits and a `<code>` snippet `npm run dev`.

Because it is a **synchronous** server component (no `async`, no data fetching), it can
be unit‑tested by direct render with Testing Library (see §3.1 caveat about async server
components).

### 2.4 `layout.tsx` (Root layout, **synchronous server component**)

```15:33:src/app/layout.tsx
export const metadata: Metadata = {
  title: "Silly Starter™ — A Very Serious Next.js App",
  description: "A whimsical Next.js starter that quacks under pressure.",
};

export default function RootLayout({ children }: ...) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
```

Testing implications:
- Exports a `metadata` object — best tested as a **plain data assertion** (import the
  module and assert on `metadata.title` / `metadata.description`), which is robust and
  fast.
- Imports `next/font/google` (`Geist`, `Geist_Mono`). Under test these **must be mocked**
  (network/font fetching). `next/jest` and the Vitest+SWC setup handle/auto‑mock fonts;
  with raw Jest+Babel you supply a `nextFontMock.js` (see §6).
- Rendering a component that returns `<html><body>` into a jsdom container produces
  nested `<html>`/`<body>` which RTL handles but warns about; prefer asserting the
  metadata + that `children` are passed through, rather than DOM‑snapshotting the whole
  document.

### 2.5 `globals.css`

- Imports Tailwind v4 (`@import "tailwindcss";`), defines CSS variables, a
  `prefers-color-scheme: dark` block, and keyframes `float` / `wobble` plus the
  `.animate-float`, `.animate-float-delayed`, `.wobble`, `.duck-btn` classes referenced
  by the components.
- **Not directly unit‑testable.** CSS class *application* (does the element receive the
  `wobble` class?) is asserted in component tests; *visual* effects (the actual rotation)
  belong in E2E/visual‑regression, not jsdom.
- Note: animations do **not** respect `prefers-reduced-motion` — flag for E2E/a11y.

---

## 3. Test strategy

### 3.1 Testing pyramid for this app

This is a tiny, mostly‑presentational app with two interactive client components and no
backend, no data fetching, and no routing beyond `/`. The pyramid is therefore
**bottom‑heavy on component/unit tests** with a **thin E2E layer** for the animated,
timer‑driven, browser‑only behaviour.

```
            ╱╲
           ╱E2E╲          ~3–5 Playwright specs (real browser, real timers/animations)
          ╱──────╲
         ╱ integ.  ╲      a handful: page composition, layout+metadata, routing/404
        ╱────────────╲
       ╱  unit/comp.  ╲   the bulk: DuckButton, SillyFacts, page, layout, data arrays
      ╱────────────────╲
```

Rationale: there is no server logic to integration‑test heavily, but the components rely
on `setTimeout`/`setInterval` and CSS transitions whose *real* timing is best validated
in a browser. Unit tests (with fake timers) give fast, deterministic coverage of state
logic; E2E covers the "does it actually wobble/fade in a browser" gap.

### 3.2 Unit vs integration vs E2E boundaries

| Layer | Scope | Runner | Environment | Examples here |
| --- | --- | --- | --- | --- |
| **Unit / component** | One component or pure module in isolation; deterministic via mocked `Math.random` + fake timers | Vitest (or Jest) + RTL | jsdom | `DuckButton` click→quack/wobble; `SillyFacts` rotation logic; `metadata` shape; QUACKS/FACTS array invariants |
| **Integration** | Multiple units composed; render `page.tsx` so `DuckButton`+`SillyFacts` mount together; layout passes children; App Router conventions | Vitest/Jest + RTL | jsdom | Home page renders heading + both widgets + 3 cards + footer; layout renders children & exports metadata |
| **E2E** | Full app in a real browser, real timers/animations, real Next build | Playwright | Chromium/Firefox/WebKit | Load `/`, click duck and see text change, watch a fact auto‑rotate, verify title, 404 behaviour |

> **Critical Next.js 16 caveat (from bundled docs):** *"Since `async` Server Components
> are new to the React ecosystem, Vitest/Jest currently do not support them… we
> recommend using E2E tests for `async` components."* Our `page.tsx` and `layout.tsx`
> are **synchronous** server components, so they are unit‑testable. If any future
> component becomes an `async` server component, test it via **Playwright**, not
> Vitest/Jest.

---

## 4. Component‑level test cases

Legend for priority: **P0** = must‑have core behaviour, **P1** = important edge cases,
**P2** = nice‑to‑have / robustness. Full matrix in §12.

### 4.1 `DuckButton.tsx`

| # | Scenario | Type | Priority | Expectation |
| --- | --- | --- | --- | --- |
| DB‑1 | Initial render | render | P0 | Button with `aria-label="Quack button"` exists; visible text contains 🦆; paragraph shows `"Press for wisdom"`. |
| DB‑2 | Button is a real `<button type="button">` | render | P1 | `getByRole('button')` resolves; `type === "button"` (won't submit forms). |
| DB‑3 | Click updates quack (deterministic) | interaction | P0 | With `Math.random` stubbed to `0`, after click paragraph shows `QUACKS[0]` = `"Quack!"`. |
| DB‑4 | Click maps random → correct index | interaction | P0 | Stub `Math.random` → `0.99` ⇒ index `7` ⇒ `"Have you tried turning the duck off and on again?"`. |
| DB‑5 | Every QUACKS entry reachable | interaction | P1 | For `r` in a representative set, `Math.floor(r*8)` selects the expected entry (boundary at each 1/8 bucket). |
| DB‑6 | Wobble class added on click | interaction | P0 | Immediately after click, button `className` contains `wobble`. |
| DB‑7 | Wobble class removed after 500 ms | timers | P0 | With fake timers, advance 500 ms ⇒ `wobble` class gone. |
| DB‑8 | Wobble not removed early (<500 ms) | timers | P1 | Advance 499 ms ⇒ `wobble` still present. |
| DB‑9 | Rapid double‑click resets timer window | timers | P1 | Click, advance 300 ms, click again, advance 300 ms ⇒ still wobbling; advance 200 ms more ⇒ gone (last timeout governs). |
| DB‑10 | Quack text may repeat (no false guarantee) | interaction | P2 | Document that identical consecutive quacks are valid; don't assert "text differs". |
| DB‑11 | No unhandled timers leak between tests | hygiene | P1 | After test, pending timers cleared (`vi.clearAllTimers`) so suites stay isolated. |
| DB‑12 | Keyboard activation | a11y | P1 | Focus button, press `Enter`/`Space` ⇒ same as click (native button behaviour). |
| DB‑13 | Static classes always present | render | P2 | `text-6xl`, `transition-transform`, `hover:scale-110`, `active:scale-95`, `duck-btn` present regardless of state. |

### 4.2 `SillyFacts.tsx`

| # | Scenario | Type | Priority | Expectation |
| --- | --- | --- | --- | --- |
| SF‑1 | Initial render | render | P0 | Paragraph shows `FACTS[0]` (`"This app has zero business logic and infinite vibes."`) wrapped in “…”; `opacity-100` class present. |
| SF‑2 | Fade‑out begins at 4000 ms | timers | P0 | Advance 4000 ms ⇒ `opacity-0` present, `opacity-100` absent; text still `FACTS[0]`. |
| SF‑3 | Index advances after +300 ms | timers | P0 | Advance 4000 + 300 ms ⇒ text now `FACTS[1]`; `opacity-100` present again. |
| SF‑4 | Multiple cycles advance sequentially | timers | P1 | After N full cycles, text equals `FACTS[N % 8]`. |
| SF‑5 | Wraparound at end of array | timers | P1 | After 8 full cycles, text returns to `FACTS[0]`. |
| SF‑6 | Interval cleared on unmount | timers/hygiene | P0 | Spy on `clearInterval`; unmount ⇒ called once. After unmount, advancing timers does not change anything. |
| SF‑7 | Inner timeout after unmount (latent bug) | timers | P1 | Advance 4000 ms (fade started), unmount during the 300 ms window, advance 300 ms ⇒ assert no error / no act warning. Documents the un‑cleared inner `setTimeout`. |
| SF‑8 | Single `<p>` element only | render | P2 | Exactly one paragraph rendered. |
| SF‑9 | Transition classes present | render | P2 | `transition-opacity duration-300` always present. |
| SF‑10 | Text is always one of FACTS | invariant | P2 | At any tick, rendered text (sans quotes) ∈ `FACTS`. |

### 4.3 `page.tsx`

| # | Scenario | Type | Priority | Expectation |
| --- | --- | --- | --- | --- |
| PG‑1 | Renders H1 | render | P0 | `getByRole('heading', { level: 1 })` text = `Silly Starter™`. |
| PG‑2 | Renders DuckButton | integration | P0 | Quack button present (`getByRole('button', { name: 'Quack button' })`). |
| PG‑3 | Renders SillyFacts | integration | P0 | First fact text present on screen. |
| PG‑4 | Eyebrow + tagline | render | P1 | `Officially Unofficial` and the tagline paragraph are present. |
| PG‑5 | Three feature cards | render | P1 | Labels `Fast-ish`, `Styled`, `Typed` all present; exactly 3 cards. |
| PG‑6 | Card descriptions | render | P2 | Each card shows its `desc` text. |
| PG‑7 | Footer + code snippet | render | P2 | Footer text present; `npm run dev` rendered inside a `<code>`. |
| PG‑8 | Clicking duck on the page updates text | integration | P1 | With `Math.random` stubbed, clicking the duck (rendered via the page) updates the quack paragraph — proves composition wiring. |
| PG‑9 | Decorative emojis present | render | P2 | The 4 background emoji nodes exist (and ideally are `aria-hidden` once fixed). |

### 4.4 `layout.tsx`

| # | Scenario | Type | Priority | Expectation |
| --- | --- | --- | --- | --- |
| LO‑1 | Metadata title | data | P0 | `metadata.title === "Silly Starter™ — A Very Serious Next.js App"`. |
| LO‑2 | Metadata description | data | P0 | `metadata.description === "A whimsical Next.js starter that quacks under pressure."`. |
| LO‑3 | Renders children | render | P1 | Given a sentinel child, it appears in output. |
| LO‑4 | `lang="en"` on `<html>` | render | P2 | Document language attribute set (verify via container query or E2E). |
| LO‑5 | Font CSS variables applied | render | P2 | `<html>` className includes the mocked font variables + `antialiased`. |

> For LO‑3/LO‑4/LO‑5, rendering a component returning `<html>`/`<body>` into jsdom is
> awkward; prefer verifying these in the **Playwright** E2E layer (real document), and
> keep LO‑1/LO‑2 as fast unit assertions.

### 4.5 Data‑array invariant tests (cheap, high‑value)

| # | Scenario | Priority | Expectation |
| --- | --- | --- | --- |
| DAT‑1 | `QUACKS` non‑empty & all strings | P1 | `length === 8`, every entry is a non‑empty `string`. |
| DAT‑2 | `FACTS` non‑empty & all strings | P1 | `length === 8`, every entry is a non‑empty `string`. |
| DAT‑3 | No accidental duplicates | P2 | (Optional) entries unique — guards copy‑paste mistakes. |

> These require the arrays to be exported. They are currently module‑private. Either
> export them (preferred for testability) or assert their effects indirectly via the
> component tests above. Recommendation: export `QUACKS`/`FACTS` as named consts.

---

## 5. Integration tests

Integration here means composing real units (no/minimal mocking) and verifying they work
together, plus App Router conventions.

1. **Home composition (`page.tsx`)** — render the page and assert the heading,
   `DuckButton`, `SillyFacts`, all three feature cards, and footer co‑exist (PG‑1..PG‑8).
   This is the most valuable integration test because it exercises the alias import
   (`@/components/...`), client‑component mounting inside a server component, and the
   mapped feature grid in one shot.

2. **Layout + children + metadata** — assert `metadata` is exported correctly and that
   `children` render. (LO‑1..LO‑3.)

3. **App Router routing & conventions** (best at E2E layer, see §7):
   - `/` returns 200 and renders the home page.
   - An unknown route (e.g. `/nope`) returns Next's 404. There is **no custom
     `not-found.tsx`**, so this verifies the default 404 — and serves as a reminder to
     add one if desired.
   - There are no route handlers, dynamic segments, `loading.tsx`, `error.tsx`, or
     nested layouts to test (document this so future additions get coverage).

4. **Global CSS application** — verify the keyframe‑backed classes are actually applied:
   - jsdom can confirm the *class is on the element* (`wobble`, `animate-float`,
     `opacity-0/100`) but **cannot** evaluate the animation. Confirming the *visual*
     effect (rotation/translation/opacity tween) is an E2E/visual‑regression concern.

---

## 6. Tooling recommendations

### 6.1 The decision: **Vitest + React Testing Library** for unit/integration, **Playwright** for E2E

| Option | Verdict for this repo | Why |
| --- | --- | --- |
| **Vitest + RTL** | ✅ **Recommended** for unit/integration | Fast, ESM‑native, first‑class TS, trivial fake timers (`vi.useFakeTimers`) and `Math.random` stubbing (`vi.spyOn`), great DX/watch. Officially documented for Next.js 16 (`testing/vitest.md`). Pairs cleanly with `vite-tsconfig-paths` to honour the `@/*` alias. |
| **Jest + RTL** (`next/jest`) | ✅ Viable alternative | Next.js ships a `next/jest` transformer that auto‑mocks CSS, images, and `next/font`, and loads `next.config`. Choose this if the team already standardizes on Jest. Slightly heavier setup; ESM/`next/font` handling is the main friction Vitest avoids. |
| **Playwright** | ✅ **Recommended** for E2E | The documented Next.js E2E choice. Real browsers exercise the timer/animation behaviour jsdom cannot. Also the *only* supported way to test `async` server components if they appear later. |
| **Cypress** | ➖ Optional | Fine for E2E but Playwright is the Next.js‑documented default and supports more browser engines headlessly in CI. |
| RTL alone | n/a | RTL is a library, not a runner — it sits on top of Vitest **or** Jest. Always use RTL for component queries/interaction. |

**Why Vitest over Jest for this specific repo:** the app uses Tailwind v4, ESM configs
(`.mjs`/`.ts`), `next/font/google`, and React 19. Vitest's native ESM + SWC‑via‑plugin
path has the least friction here, and the timer‑heavy components benefit from Vitest's
ergonomic fake‑timer API. Either is correct; the sample code in §10 uses **Vitest**
(with Jest notes inline).

### 6.2 Setup — Vitest + RTL (recommended), exact for this repo

Install (matches `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`,
TypeScript variant, plus `jest-dom` for nicer matchers and `user-event` for realistic
interactions):

```bash
npm install -D vitest @vitejs/plugin-react jsdom \
  @testing-library/react @testing-library/dom @testing-library/jest-dom \
  @testing-library/user-event vite-tsconfig-paths
```

Create `vitest.config.mts` in the repo root:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  // tsconfigPaths makes the "@/*" alias from tsconfig.json work in tests
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,                 // use describe/it/expect without imports
    setupFiles: ['./vitest.setup.ts'],
    css: false,                    // don't try to process Tailwind in unit tests
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'next-env.d.ts'],
    },
  },
})
```

Create `vitest.setup.ts` (root):

```ts
import '@testing-library/jest-dom/vitest'

// next/font/google performs network/font work that jsdom can't do — stub it.
import { vi } from 'vitest'
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans', className: 'font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono', className: 'font-geist-mono' }),
}))
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

> If you set `globals: true`, also add `"types": ["vitest/globals", "@testing-library/jest-dom"]`
> to `tsconfig.json` `compilerOptions` (or a `tsconfig.test.json`) so TS recognizes the
> global `describe/it/expect` and the `jest-dom` matchers.

### 6.3 Setup — Jest + RTL (alternative), exact for this repo

```bash
npm install -D jest jest-environment-jsdom \
  @testing-library/react @testing-library/dom @testing-library/jest-dom \
  @testing-library/user-event ts-node @types/jest
```

`jest.config.ts` using the Next.js transformer (handles CSS/image/`next/font` auto‑mocking
and loads `next.config`):

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // mirror tsconfig "@/*" -> "./src/*"
  },
}

export default createJestConfig(config)
```

`jest.setup.ts`:

```ts
import '@testing-library/jest-dom'
```

> With `next/jest`, `next/font` is auto‑mocked, so the explicit font mock from the Vitest
> setup is unnecessary in the Jest path.

### 6.4 Setup — Playwright (E2E)

```bash
npm init playwright@latest
# then, in CI:
npx playwright install --with-deps
```

`playwright.config.ts` (key bits — let Playwright build+serve the app so E2E runs against
production output, as the docs recommend):

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
})
```

---

## 7. Test file structure proposal

Two acceptable conventions; pick one and be consistent. This repo's existing code is
clean and small, so **colocation** keeps tests next to the units they cover.

### Option A — Colocation (recommended)

```
src/
├── app/
│   ├── layout.tsx
│   ├── layout.test.tsx          # metadata + children
│   ├── page.tsx
│   └── page.test.tsx            # home composition / integration
└── components/
    ├── DuckButton.tsx
    ├── DuckButton.test.tsx
    ├── SillyFacts.tsx
    └── SillyFacts.test.tsx
e2e/
├── home.spec.ts                 # Playwright user flows
└── a11y.spec.ts                 # optional axe scan
vitest.config.mts
vitest.setup.ts
playwright.config.ts
```

> The bundled Vitest doc explicitly notes: *"test files can also be colocated inside the
> `app` router."* In the **App Router**, colocated `*.test.tsx` files are **not** treated
> as routes (unlike the Pages Router), so colocation is safe here. Be sure Playwright's
> `testDir` (`./e2e`) is separate so unit and E2E runners don't pick up each other's files.

### Option B — Centralized `__tests__/`

```
__tests__/
├── DuckButton.test.tsx
├── SillyFacts.test.tsx
├── page.test.tsx
└── layout.test.tsx
e2e/...
```

### Naming conventions

- **Unit/integration:** `<Unit>.test.tsx` (Vitest/Jest auto‑discover `*.test.*` /
  `*.spec.*`). Use `.test.` to visually distinguish from Playwright `.spec.`.
- **E2E:** `<flow>.spec.ts` under `e2e/`.
- **Mocks:** `__mocks__/` at root (only needed for the raw‑Jest path; Vitest uses inline
  `vi.mock`).
- One top‑level `describe('<ComponentName>')` per file; nested `describe` for sub‑areas
  (e.g. `describe('wobble animation')`); test names read as behaviour:
  `it('removes the wobble class 500ms after click')`.

---

## 8. Mocking & fixtures

| Thing | Mock? | How | Notes |
| --- | --- | --- | --- |
| `Math.random` (DuckButton) | ✅ Always for quack assertions | `vi.spyOn(Math, 'random').mockReturnValue(0)` (Jest: `jest.spyOn`) | `0` → index 0; `0.999` → index 7. Restore after each test. |
| Timers (`setTimeout`/`setInterval`) | ✅ For wobble & rotation | `vi.useFakeTimers()` + `vi.advanceTimersByTime(ms)`; wrap advances in `act(...)` | Always `vi.useRealTimers()` / `runOnlyPendingTimers` in teardown to avoid leaks. **Use `user-event`'s `advanceTimers` option** so clicks work with fake timers. |
| `next/font/google` (layout) | ✅ | Vitest: `vi.mock('next/font/google', ...)` in setup. Jest: auto‑mocked by `next/jest` | Prevents real font fetching; returns a stub with `variable`/`className`. |
| `next/navigation` (`useRouter`, `usePathname`, etc.) | ⚠️ Only if used | Not used anywhere currently. When added, mock `useRouter` to return `{ push: vi.fn(), ... }`. | Documented here so future router usage gets mocked rather than crashing tests. |
| `next/link` / `next/image` | ⚠️ Only if used | Not used currently. `next/jest`/Vitest+SWC render them fine; only stub if asserting on internals. | — |
| CSS (`globals.css`, Tailwind) | ✅ Ignore in unit | Vitest `css: false`; Jest `next/jest` auto‑mocks stylesheets | Class *names* still assertable; styles are not computed in jsdom. |
| `favicon.ico` / static assets | ✅ Ignore | `next/jest` auto‑mocks images; Vitest+SWC won't import it in component tests | Not referenced by tested components. |

### Suggested fixtures / helpers

- A `renderWithFakeTimers` helper that sets up `vi.useFakeTimers()`, configures
  `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`, and tears down timers.
- Re‑export `QUACKS`/`FACTS` (once exported) for data‑driven `it.each` tests instead of
  hardcoding strings in assertions — keeps tests in sync if copy changes.

---

## 9. Accessibility testing notes

Interactive/animated UI deserves explicit a11y coverage. Findings + checks:

1. **DuckButton — name & role (✅ present).** Has `aria-label="Quack button"` and is a
   native `<button>`. Assert `getByRole('button', { name: 'Quack button' })` and keyboard
   activation (Enter/Space). The 🦆 emoji inside is decorative relative to the label.
2. **DuckButton — live region (⚠️ missing).** The quack `<p>` updates on click but has no
   `aria-live`. Screen‑reader users won't hear the new "wisdom". **Recommend** adding
   `aria-live="polite"` (and `role="status"`) to that paragraph; add a test asserting the
   attribute once implemented.
3. **SillyFacts — live region (⚠️ missing / nuanced).** Auto‑rotating text with no
   `aria-live`. Auto‑updating content can be both unannounced (no live region) *and*
   distracting (if a too‑aggressive live region is added). **Recommend** `aria-live="off"`
   or a polite, debounced approach, and document the chosen behaviour with a test.
4. **Decorative emojis (⚠️).** The floating 🍞 ✨ 🌊 🦆 in `page.tsx` are purely decorative
   but not `aria-hidden`. Screen readers may announce them. **Recommend**
   `aria-hidden="true"` on the decorative container; add a test.
5. **`prefers-reduced-motion` (⚠️).** `float`/`wobble` animations ignore the user's
   reduced‑motion preference. **Recommend** wrapping animation rules in
   `@media (prefers-reduced-motion: no-preference)`. Verify in Playwright by emulating
   `reducedMotion: 'reduce'`.
6. **Color contrast (⚠️ to verify).** Several texts use opacity (`/70`, `/80`, `/60`,
   `/50`) over gradient backgrounds in both light and dark modes — these risk failing
   WCAG AA contrast. Verify with an automated scan + manual spot checks (the footer at
   `text-amber-700/50` is the highest‑risk).
7. **Document language (✅).** `<html lang="en">` is set (good for SR pronunciation);
   verify in E2E.
8. **Heading structure (✅).** Single `<h1>`; no skipped levels. Assert exactly one H1.

**Automated a11y in tests:**
- Unit: `vitest-axe` / `jest-axe` — `expect(await axe(container)).toHaveNoViolations()`
  on `DuckButton`, `SillyFacts`, and the rendered page.
- E2E: `@axe-core/playwright` — full‑page scan against the real DOM/CSS in `e2e/a11y.spec.ts`.
  This catches the contrast issues jsdom can't.

---

## 10. Sample test code

> All samples use **Vitest + RTL + user-event**. For Jest, swap `vi`→`jest`,
> `vi.useFakeTimers()`→`jest.useFakeTimers()`, `vi.spyOn`→`jest.spyOn`, and import
> `describe/it/expect` from `@jest/globals` (or rely on Jest globals). Assertions are
> otherwise identical.

### 10.1 `src/components/DuckButton.test.tsx`

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DuckButton } from '@/components/DuckButton'

describe('DuckButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // user-event needs to know how to advance fake timers
  const setupUser = () =>
    userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })

  it('renders the duck button with its accessible label and prompt text (DB-1)', () => {
    render(<DuckButton />)
    expect(
      screen.getByRole('button', { name: 'Quack button' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Press for wisdom')).toBeInTheDocument()
  })

  it('is a non-submitting button (DB-2)', () => {
    render(<DuckButton />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('shows QUACKS[0] when Math.random returns 0 (DB-3)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = setupUser()
    render(<DuckButton />)

    await user.click(screen.getByRole('button', { name: 'Quack button' }))

    expect(screen.getByText('Quack!')).toBeInTheDocument()
  })

  it('maps a high random value to the last quack (DB-4)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999) // floor(0.999 * 8) === 7
    const user = setupUser()
    render(<DuckButton />)

    await user.click(screen.getByRole('button', { name: 'Quack button' }))

    expect(
      screen.getByText('Have you tried turning the duck off and on again?'),
    ).toBeInTheDocument()
  })

  it('adds the wobble class on click and removes it after 500ms (DB-6, DB-7, DB-8)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = setupUser()
    render(<DuckButton />)
    const button = screen.getByRole('button', { name: 'Quack button' })

    await user.click(button)
    expect(button.className).toContain('wobble')

    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(button.className).toContain('wobble') // not removed early

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(button.className).not.toContain('wobble') // removed at 500ms
  })

  it('keeps wobbling until 500ms after the LAST of rapid clicks (DB-9)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = setupUser()
    render(<DuckButton />)
    const button = screen.getByRole('button', { name: 'Quack button' })

    await user.click(button)
    act(() => vi.advanceTimersByTime(300))
    await user.click(button) // resets the effective window
    act(() => vi.advanceTimersByTime(300))
    expect(button.className).toContain('wobble')

    act(() => vi.advanceTimersByTime(200)) // 500ms after the second click
    expect(button.className).not.toContain('wobble')
  })

  it('always keeps its static styling classes (DB-13)', () => {
    render(<DuckButton />)
    const button = screen.getByRole('button', { name: 'Quack button' })
    for (const cls of [
      'duck-btn',
      'text-6xl',
      'transition-transform',
      'hover:scale-110',
      'active:scale-95',
    ]) {
      expect(button.className).toContain(cls)
    }
  })
})
```

### 10.2 `src/components/SillyFacts.test.tsx`

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { SillyFacts } from '@/components/SillyFacts'

const FIRST = 'This app has zero business logic and infinite vibes.'
const SECOND = 'Next.js can render on the server. This duck cannot.'

describe('SillyFacts', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders the first fact, fully visible, on mount (SF-1)', () => {
    render(<SillyFacts />)
    // text is wrapped in “ ” so match a substring
    expect(screen.getByText(/zero business logic/)).toBeInTheDocument()
    const p = screen.getByText(/zero business logic/)
    expect(p.className).toContain('opacity-100')
  })

  it('fades out at 4000ms but keeps the same fact (SF-2)', () => {
    render(<SillyFacts />)
    act(() => vi.advanceTimersByTime(4000))
    const p = screen.getByText(/zero business logic/)
    expect(p.className).toContain('opacity-0')
    expect(p.className).not.toContain('opacity-100')
  })

  it('advances to the next fact 300ms after fade-out (SF-3)', () => {
    render(<SillyFacts />)
    act(() => vi.advanceTimersByTime(4000)) // fade out
    act(() => vi.advanceTimersByTime(300))  // swap + fade in
    expect(screen.getByText(new RegExp('render on the server'))).toBeInTheDocument()
    const p = screen.getByText(/render on the server/)
    expect(p.className).toContain('opacity-100')
  })

  it('wraps back to the first fact after a full cycle of 8 (SF-4, SF-5)', () => {
    render(<SillyFacts />)
    for (let i = 0; i < 8; i++) {
      act(() => vi.advanceTimersByTime(4000))
      act(() => vi.advanceTimersByTime(300))
    }
    expect(screen.getByText(/zero business logic/)).toBeInTheDocument()
  })

  it('clears the interval on unmount (SF-6)', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<SillyFacts />)
    unmount()
    expect(clearSpy).toHaveBeenCalledTimes(1)
  })

  it('does not throw if it unmounts during the 300ms swap window (SF-7, latent-bug guard)', () => {
    const { unmount } = render(<SillyFacts />)
    act(() => vi.advanceTimersByTime(4000)) // inner setTimeout now pending
    expect(() => {
      unmount()
      act(() => vi.advanceTimersByTime(300)) // inner timeout fires post-unmount
    }).not.toThrow()
  })
})
```

### 10.3 `src/app/page.test.tsx` (integration)

```tsx
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

describe('Home page', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders the main heading (PG-1)', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Silly Starter™' }),
    ).toBeInTheDocument()
  })

  it('mounts the DuckButton and SillyFacts widgets (PG-2, PG-3)', () => {
    render(<Home />)
    expect(
      screen.getByRole('button', { name: 'Quack button' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/zero business logic/)).toBeInTheDocument()
  })

  it('renders exactly the three feature cards (PG-5)', () => {
    render(<Home />)
    for (const label of ['Fast-ish', 'Styled', 'Typed']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('shows the footer with the dev command (PG-7)', () => {
    render(<Home />)
    expect(screen.getByText('npm run dev')).toBeInTheDocument()
  })

  it('updates the quack when the duck is clicked through the page (PG-8)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const user = userEvent.setup()
    render(<Home />)
    await user.click(screen.getByRole('button', { name: 'Quack button' }))
    expect(screen.getByText('Quack!')).toBeInTheDocument()
  })
})
```

### 10.4 `src/app/layout.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from '@/app/layout'

describe('RootLayout', () => {
  it('exports the expected page metadata (LO-1, LO-2)', () => {
    expect(metadata.title).toBe('Silly Starter™ — A Very Serious Next.js App')
    expect(metadata.description).toBe(
      'A whimsical Next.js starter that quacks under pressure.',
    )
  })

  it('renders its children (LO-3)', () => {
    // Rendering a component that returns <html>/<body> into jsdom is noisy;
    // suppress the expected nesting validation warning if needed.
    render(<RootLayout>{<div data-testid="child">hi</div>}</RootLayout>)
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
```

### 10.5 `e2e/home.spec.ts` (Playwright)

```ts
import { test, expect } from '@playwright/test'

test.describe('Silly Starter home', () => {
  test('loads with the correct title and heading', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Silly Starter™/)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Silly Starter™' }),
    ).toBeVisible()
  })

  test('pressing the duck reveals a quack from the known set', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', { name: 'Quack button' })
    await button.click()
    const quacks = [
      'Quack!', 'Honk??', 'Bread acquired.', 'Professional waddler.',
      '404: dignity not found.',
      'This button does nothing. Like my degree.',
      "You're doing great, probably.",
      'Have you tried turning the duck off and on again?',
    ]
    // The paragraph under the button should now be one of the quacks.
    await expect
      .poll(async () => {
        const text = await page.locator('button + p, p').last().textContent()
        return quacks.some((q) => text?.includes(q))
      })
      .toBe(true)
  })

  test('silly fact auto-rotates over time', async ({ page }) => {
    await page.goto('/')
    const fact = page.getByText(/zero business logic/)
    await expect(fact).toBeVisible()
    // first rotation happens ~4.3s in
    await expect(page.getByText(/render on the server/)).toBeVisible({
      timeout: 8000,
    })
  })

  test('unknown route returns the 404 page', async ({ page }) => {
    const res = await page.goto('/definitely-not-a-route')
    expect(res?.status()).toBe(404)
  })
})
```

### 10.6 `e2e/a11y.spec.ts` (optional, axe)

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('home page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()
  // Expect zero serious/critical violations (color-contrast may surface here).
  const serious = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(serious).toEqual([])
})
```

---

## 11. CI recommendation

There is currently **no CI**. Add a GitHub Actions workflow with four gates so quality is
enforced on every PR:

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

Gate order is intentional: **lint → typecheck → unit (fast) → E2E (slow)**, failing fast
on the cheapest checks. Consider splitting E2E into a separate job/matrix once the suite
grows.

---

## 12. Priority matrix (P0 / P1 / P2)

### P0 — must exist before this is considered "tested" (core behaviour, would embarrass us if broken)

| ID | Test | Rationale |
| --- | --- | --- |
| DB‑1 | DuckButton renders w/ label + prompt | The headline interactive element must render & be accessible. |
| DB‑3/DB‑4 | Click → correct quack (deterministic) | Core feature: pressing the duck shows wisdom. |
| DB‑6/DB‑7 | Wobble class added then removed @500ms | Core feedback animation + timer correctness. |
| SF‑1 | First fact renders visible | Primary content of the page. |
| SF‑2/SF‑3 | Fade @4000ms then advance @+300ms | Core auto‑rotation behaviour & timing. |
| SF‑6 | Interval cleared on unmount | Prevents leaks; classic React effect bug. |
| PG‑1/PG‑2/PG‑3 | Page renders heading + both widgets | Proves composition & alias imports actually wire up. |
| LO‑1/LO‑2 | Metadata title & description | SEO/tab title; cheap, high value. |
| E2E smoke | Load `/`, title, click duck | One real‑browser path validates the build end‑to‑end. |

### P1 — important edge cases & robustness

| ID | Test | Rationale |
| --- | --- | --- |
| DB‑2 | `type="button"` | Avoids accidental form submits if reused. |
| DB‑5 | All quacks reachable across random buckets | Guards index math. |
| DB‑8/DB‑9 | Early/rapid‑click timer behaviour | Documents overlapping‑timeout semantics. |
| DB‑12 | Keyboard activation | a11y baseline. |
| SF‑4/SF‑5 | Multi‑cycle + wraparound | Guards modulo logic. |
| SF‑7 | Unmount during swap window | Documents latent un‑cleared inner timeout. |
| PG‑4/PG‑5/PG‑8 | Eyebrow/tagline, 3 cards, click‑through | Composition completeness. |
| LO‑3 | Children render | Layout contract. |
| DAT‑1/DAT‑2 | Array invariants | Cheap guard against bad content edits. |
| E2E rotate / 404 | Fact rotates; unknown route 404s | Browser‑only behaviour + routing convention. |
| a11y scan | axe on home | Surfaces contrast/aria gaps. |

### P2 — nice to have / low risk

| ID | Test | Rationale |
| --- | --- | --- |
| DB‑10/DB‑13 | Repeat‑allowed note; static classes | Documentation‑grade. |
| SF‑8/SF‑9/SF‑10 | Single `<p>`, transition classes, value invariant | Low‑risk presentational. |
| PG‑6/PG‑7/PG‑9 | Card descs, footer code, decorative emojis | Cosmetic. |
| LO‑4/LO‑5 | `lang`, font vars | Better verified in E2E. |
| Snapshot | Page snapshot (see §13) | Catches unintended markup drift. |

---

## 13. Performance & snapshot testing considerations

### Snapshot testing
- **Where it helps:** a single snapshot of the rendered **Home page markup** (and each
  component's stable output) catches accidental structural/className drift. The Jest doc
  shows `expect(container).toMatchSnapshot()`; Vitest supports `toMatchSnapshot()` and
  `toMatchInlineSnapshot()` identically.
- **Pitfalls specific to this app:**
  - `DuckButton`'s text is **random** and `wobble` toggles — snapshot only the initial,
    pre‑interaction state, or stub `Math.random` and freeze timers first.
  - `SillyFacts` changes on a timer — snapshot at `t=0` with fake timers installed but
    not advanced.
  - `next/font` injects hashed class names; with the font mock in §6.2 these are stable.
- **Recommendation:** prefer **explicit assertions** over large DOM snapshots for
  behaviour; use **inline snapshots** sparingly for small, stable fragments. Avoid
  full‑document snapshots of `layout.tsx`.

### Visual regression
- Real animation/opacity/contrast can't be judged in jsdom. Use **Playwright screenshots**
  (`await expect(page).toHaveScreenshot()`) for the home page in light & dark color
  schemes (emulate via `colorScheme: 'dark'`) and with `reducedMotion: 'reduce'`. Mask or
  disable the floating/wobble animations (e.g. inject CSS to pause animations) to keep
  shots deterministic.

### Performance
- App is static and tiny; runtime perf risk is low. Still worth tracking:
  - **Bundle/Core Web Vitals:** the ESLint config already extends `core-web-vitals`; keep
    that gate. Consider a **Lighthouse CI** (`@lhci/cli`) check in CI against the built
    app for LCP/CLS regressions (gradient + floating emojis + web fonts are the main CLS
    risks; `next/font` mitigates font‑swap CLS).
  - **Timer hygiene:** `SillyFacts`'s interval runs forever while mounted — fine for one
    instance, but tests (§4.2 SF‑6/SF‑7) ensure cleanup so memory doesn't leak if the
    component is mounted/unmounted repeatedly.
  - **Test‑suite performance:** keep unit tests in jsdom with fake timers (milliseconds);
    reserve the slow, real‑timer waits for the few E2E rotation tests.

---

## 14. Summary of recommended first steps (in order)

1. Add **Vitest + RTL + user-event + jsdom** and the config/setup from §6.2.
2. Export `QUACKS` and `FACTS` (named exports) to enable data‑driven tests.
3. Write the **P0** unit/integration tests (DuckButton, SillyFacts, page, layout) from §10.
4. Add **Playwright** (§6.4) and one **E2E smoke** spec (§10.5).
5. Wire up **CI** (§11) running lint → typecheck → unit → E2E.
6. Address the a11y findings (§9: live regions, `aria-hidden` decoratives,
   `prefers-reduced-motion`, contrast) and add tests that lock the fixes in.
7. Layer in **P1** edge cases, then **P2** / snapshots / visual regression as the app grows.
