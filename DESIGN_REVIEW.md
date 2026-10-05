# Design review: Silly Starter

Reviewed every application source file under `src/`, plus config (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`). Fixture dumps under `glass-scroll-repro/` are not application code.

## Problems (concrete)

### 1. Timer leak and wobble race in `DuckButton` — **fixed**

`src/components/DuckButton.tsx` lines 20–24 scheduled `setTimeout(() => setWobble(false), 500)` without storing the id, without clearing it on unmount, and without cancelling a previous timeout on re-click.

- Unmount within 500ms still fires `setWobble` on an unmounted component.
- Rapid clicks stack timeouts: an earlier timeout can clear `wobble` while a later animation is still running.

### 2. Nested timeout leak in `SillyFacts` — **fixed**

`src/components/SillyFacts.tsx` lines 20–30 clear the interval on unmount but not the inner `setTimeout` (300ms fade). Unmounting during the fade still calls `setIndex` / `setVisible` after teardown.

### 3. Duplicated list-cycling with no error handling — **fixed**

`DuckButton` (`QUACKS`, lines 5–14 + random pick at line 21) and `SillyFacts` (`FACTS`, lines 5–14 + `(i + 1) % FACTS.length` at line 24) both own a string list and an index update, with no shared helper and no guard for empty lists or a bad `Math.random()` result. Random selection can also repeat the same quack, so the control looks broken.

### 4. No test runner, no tests

`package.json` scripts are only `dev` / `build` / `start` / `lint`. There is no `test` script, no Vitest/Jest config, and no `*.test.*` files. The two stateful client components were untested.

### 5. Live regions missing (a11y)

- `DuckButton` lines 36–38: the quack text updates on click but is not an `aria-live` region, so screen readers may never announce it. The button `aria-label` (line 32) is static (`"Quack button"`).
- `SillyFacts` lines 32–38: rotating copy has the same gap.

### 6. `React.ReactNode` without an import

`src/app/layout.tsx` line 23 uses `React.ReactNode` while the file only imports `Metadata` from `next`. This relies on the global `React` namespace from `@types/react` instead of an explicit type import.

### 7. Motion with no reduced-motion path

`src/app/globals.css` lines 27–60 (`float`, `wobble`, `.animate-float`, `.wobble`) and `src/app/page.tsx` lines 8–11 always animate. There is no `@media (prefers-reduced-motion: reduce)` override.

### 8. Feature cards inlined in the page

`src/app/page.tsx` lines 32–36 hard-code the three marketing tiles. Same data-in-JSX pattern as `QUACKS` / `FACTS`; harder to test or reuse.

### 9. Empty Next config comment noise

`next.config.ts` lines 3–4 are a placeholder comment with no options. Harmless, but it is dead config.

### 10. Repro fixtures mixed into the TypeScript project

`tsconfig.json` lines 25–31 include `**/*.ts`. `glass-scroll-repro/*.ts` is thousands of lines of scroll-fixture comments compiled into the same project as the app.

## Three fixes in this change

1. Clear and reset the wobble timeout in `DuckButton` (unmount + re-click).
2. Clear the fade timeout in `SillyFacts` on unmount.
3. Extract `nextCyclicIndex` / `pickDifferentIndex` with validation; both components use it (no empty-list modulo, no repeated quack). Live regions added on the updating text.

Tests cover each fix (`src/lib/cycle.test.ts`, `src/components/DuckButton.test.tsx`, `src/components/SillyFacts.test.tsx`).
