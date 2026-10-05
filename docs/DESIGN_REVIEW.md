# Design Review — Silly Starter™

Review of application source under `src/`, plus project config that affects runtime and quality. Fixture / repro marker files are noted separately.

## Critical / High

### 1. `DuckButton` leaves a `setTimeout` uncleared on unmount
**File:** `src/components/DuckButton.tsx` lines 20–24

```ts
function handleClick() {
  setQuack(QUACKS[Math.floor(Math.random() * QUACKS.length)]);
  setWobble(true);
  setTimeout(() => setWobble(false), 500);
}
```

Clicking the duck schedules a 500ms timeout with no cleanup. If the component unmounts before it fires, React can still apply `setWobble(false)` after unmount. Rapid clicks also stack multiple timers with no cancellation of the previous one.

### 2. `SillyFacts` cleans up the interval but not the nested fade timeout
**File:** `src/components/SillyFacts.tsx` lines 20–30

```ts
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
```

`clearInterval` alone is insufficient: the inner `setTimeout` is never tracked or cleared. Unmount during the 300ms fade (or effect re-run under Strict Mode) can still call `setIndex` / `setVisible` after teardown. Overlapping cycles can also schedule multiple fade timeouts.

### 3. Dynamic copy is not announced to assistive tech
**Files:** `src/components/SillyFacts.tsx` lines 32–38; `src/components/DuckButton.tsx` lines 36–38

Rotating facts and duck captions update in place with no `aria-live` region. Screen-reader users never hear content changes that sighted users see.

## Medium

### 4. No automated tests or test runner
**Files:** `package.json` lines 5–10 (scripts); repository root (no `*.test.*` / `*.spec.*`)

There is no `test` script, no Vitest/Jest config, and no component tests. Timer and a11y regressions above would ship unnoticed.

### 5. Misleading state naming in `DuckButton`
**File:** `src/components/DuckButton.tsx` lines 17, 21, 37

`quack` holds both the idle prompt (`"Press for wisdom"`) and selected quacks. The name implies a quack string, which makes the idle state harder to reason about (prefer `caption` / `message`).

### 6. Feature cards are an inline anonymous list in the page
**File:** `src/app/page.tsx` lines 31–45

Marketing content is embedded as an array inside JSX. It is harder to unit-test and reuses the same “emoji + label + desc” shape without a named constant or type.

### 7. Unused default Next.js public assets
**Files:** `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

None are referenced from `src/`. Dead assets inflate the static surface area and confuse ownership of brand imagery.

### 8. Dark-mode styling split across two mechanisms
**Files:** `src/app/globals.css` lines 15–20 (`prefers-color-scheme` CSS variables); `src/app/page.tsx` / components (`dark:` Tailwind classes)

CSS variables flip via media query while components also use Tailwind `dark:` variants. Without an explicit shared dark-mode strategy, future theming changes can desync body tokens from component colors.

## Low / Hygiene

### 9. Duplicated “string catalog + client UI” pattern
**Files:** `src/components/DuckButton.tsx` lines 5–14; `src/components/SillyFacts.tsx` lines 5–14

Both components own a private string array and local UI state with no shared module for catalogs or selection helpers. Acceptable at this size, but the pattern will duplicate further if more whimsical widgets are added.

### 10. `next.config.ts` is an empty placeholder
**File:** `next.config.ts` lines 3–5

No intentional config (images, headers, react strict settings, etc.). Fine for a starter, but easy to leave undocumented forever.

### 11. README scripts omit testing
**File:** `README.md` lines 22–29

Documents `dev` / `build` / `start` / `lint` only. Once a test suite exists, the table should include `npm test`.

### 12. Non-application fixture trees mixed with product source
**Files:** `glass-scroll-repro/*.ts`, assorted root `*-repro*.txt`, `ide-repo-e2e/`

Large duplicated TypeScript fixtures and marker files sit beside the Next app with no explanation in README. They increase noise for anyone reading “every source file” as product code.

## Fix plan (this PR)

Address the three highest-impact bugs:

1. Clear / replace the wobble timeout in `DuckButton` (and cancel on unmount).
2. Track and clear the fade timeout in `SillyFacts` alongside the interval.
3. Announce dynamic copy with `aria-live="polite"` on both components.

Also rename `quack` → `caption` while touching `DuckButton`, add Vitest + Testing Library, and add a regression test for each fix.
