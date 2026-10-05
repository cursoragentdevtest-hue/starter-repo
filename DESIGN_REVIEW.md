# Design review

Line references point at the code as reviewed, commit `1537e46`. Items marked **Fixed** are addressed on this branch with tests.

## Error handling and resource cleanup

1. **Fixed: `SillyFacts` leaks its fade timeout.** In `src/components/SillyFacts.tsx:23-26` the 300 ms `setTimeout` inside the interval is never stored. The cleanup at line 29 only clears the interval, so unmounting during a fade lets the timeout run and update state on an unmounted component. Under StrictMode's mount, unmount and remount cycle, the orphaned timeout from the first mount also advances the shared fact index.
2. **Fixed: the `DuckButton` wobble uses a timer that is never cancelled and can conflict with later clicks.** In `src/components/DuckButton.tsx:23`, `setTimeout(() => setWobble(false), 500)` is never cancelled on unmount. When two clicks land less than 500 ms apart, the first click's timeout ends the second click's wobble early. The 500 ms value also duplicates the CSS duration at `src/app/globals.css:59` (`0.5s`), so the two can drift apart. The fix ends the wobble from the element's `animationend` event, which leaves the CSS as the only source of the duration.
3. **Fixed: `DuckButton` can show the same quack twice in a row.** `src/components/DuckButton.tsx:21` picks uniformly from all 8 quacks, including the one already shown, so about 1 click in 8 looks like it did nothing. The fix adds `src/lib/pickDifferent.ts`, which excludes the current value and throws on an empty list instead of quietly returning `undefined`.
4. `SillyFacts` (`src/components/SillyFacts.tsx:20-30`) and the animations in `src/app/globals.css:50-60` ignore `prefers-reduced-motion`. The rotating text and the floating emoji keep animating for users who ask for reduced motion.

## Missing tests and tooling

5. **Fixed: the repo had no tests at all.** `package.json:5-10` had no `test` script and no test runner was installed. This branch adds Vitest with React Testing Library, following `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`.
6. **Fixed: the repo had no `.gitignore`.** A plain `npm install` or `next build` left `node_modules/`, `.next/` and `tsconfig.tsbuildinfo` untracked and easy to commit by mistake.
7. `package.json:18` pinned `@types/node` to `^20`. That conflicts with Vitest 5's peer range and doesn't match the Node 22 runtime. This branch bumps it to `^22`.
8. `src/app/page.tsx` and `src/app/layout.tsx` still have no render or smoke tests.

## Duplicated logic and magic numbers

9. `DuckButton` and `SillyFacts` each implement "show one string from a constant list, with a timed visual transition", with their own state and timers (`DuckButton.tsx:17-24` and `SillyFacts.tsx:17-30`). If a third component like this appears, extract a shared hook.
10. Timing values are repeated between JavaScript and CSS. `SillyFacts.tsx:26` uses `300` and line 34 uses `duration-300` for the same fade, and both must change together. The `4000` interval at line 27 is an unnamed constant. The 500 ms in `DuckButton` (item 2) had the same problem and is gone now.
11. The feature cards in `src/app/page.tsx:32-36` are an inline array literal inside JSX. Move them to a named module-level constant (as `QUACKS` and `FACTS` already are), so the markup stays readable and the data can be tested.
12. The same light and dark colour pairs are repeated as utility classes across `page.tsx:6-50`, `DuckButton.tsx:36` and `SillyFacts.tsx:34`, for example `text-amber-800/70 dark:text-amber-200/70`. Meanwhile the `--background` and `--foreground` tokens defined in `globals.css:3-20` go mostly unused. Add semantic theme tokens such as `text-muted` to the `@theme` block.

## Naming

13. In `DuckButton.tsx:17` the state name `quack` holds the displayed message, and its placeholder value `"Press for wisdom"` isn't a quack. Rename it to `message`. `wobble` (line 18) reads as a verb; `isWobbling` is clearer.
14. The `aria-label="Quack button"` at `DuckButton.tsx:32` describes what the element is, not what it does. A label like "Get duck wisdom" is more useful to screen-reader users, and "button" is already announced from the role.
15. `Home` in `src/app/page.tsx:4` is generic. `HomePage` matches how it is used.

## Accessibility

16. The text that changes on click (`DuckButton.tsx:36-38`) and on a timer (`SillyFacts.tsx:33-37`) has no `aria-live` region, so screen readers never announce updates.
17. The decorative emoji layer (`page.tsx:7-12`) is hidden with `pointer-events-none` but not with `aria-hidden`, so screen readers read out "bread, sparkles, water wave, duck".

## Repository hygiene

18. The root holds unrelated fixture files: `draft-status-repro.txt`, `external-merge-repro-3.txt`, `glass-create-pr-repro-*.txt`, `glass-pill-repro-20260628.txt`, `glass-pr-metadata-repro-*.md`, `glint862-repro.txt`, `repro-migration.txt` and `ide-repo-e2e/`. There is also `glass-scroll-repro/`, which holds about 2,200 lines of generated `.ts` comments. `tsconfig.json:27` includes `**/*.ts`, so TypeScript typechecks those generated files too. Move them out of the app repo, or at least add them to `tsconfig.json`'s `exclude`.
19. `README.md:35-36` ends with stray text (`Repro test line`, `glint1485 merge verify A`).
20. `next.config.ts:4` and `eslint.config.mjs:8-10` still contain create-next-app placeholder comments.
