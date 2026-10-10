# Architecture

Silly Starter is a one-page Next.js App Router application. The page is a server-rendered landing screen with two client islands (a duck button and a rotating fact). Alongside that screen, `src/lib` holds six pure utility modules. Those modules are not imported by the page. They exist so the numeric, string, collection, date, and async helpers can be read and tested on their own.

## Repository map

| Path | Role |
| --- | --- |
| `src/app` | The only route, its layout, global CSS, and favicon. |
| `src/components` | Page sections and the two client islands. |
| `src/lib` | Pure helpers and colocated Vitest files. |
| `docs` | This document. |
| `public` | Five SVGs (`file`, `globe`, `next`, `vercel`, `window`). The page does not reference them. |
| `glass-scroll-repro` | Large fixture sources plus `08-target.ts` (`target01`–`target12`). Not part of the app. |
| `ide-repo-e2e` | `stack-head-n1.txt`, a stack-head marker. Not part of the app. |
| Repo root | `package.json`, TypeScript, ESLint, PostCSS, Next config, and a handful of one-line repro markers. |

There is no `pages/` directory, no `app/api` route, and no shared client store.

## Build and toolchain

`package.json` names the package `starter-repo` at `0.1.0` and marks it private. Runtime dependencies are Next.js 16.2.9, React 19.2.4, and React DOM 19.2.4. Dev dependencies are Tailwind CSS 4 (`@tailwindcss/postcss`), TypeScript 5, ESLint 9, `eslint-config-next` 16.2.9, and the React and Node type packages.

Scripts:

| Script | Command | Effect |
| --- | --- | --- |
| `dev` | `next dev` | Dev server with Fast Refresh. |
| `build` | `next build` | Production build. |
| `start` | `next start` | Serve the production build. |
| `lint` | `eslint` | Flat-config lint. |

There is no `test` script. Vitest is imported by the colocated tests and is not listed in `package.json`.

`tsconfig.json` is strict, `noEmit`, `jsx: react-jsx`, `module: esnext`, and `moduleResolution: bundler`. The path alias `@/*` maps to `./src/*`. Included files are `next-env.d.ts`, `**/*.ts`, `**/*.tsx`, `**/*.mts`, and the generated `.next` type folders. `node_modules` is excluded.

`next.config.ts` exports an empty `NextConfig`. `postcss.config.mjs` registers only `@tailwindcss/postcss`. `eslint.config.mjs` spreads `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`, and ignores `.next`, `out`, `build`, and `next-env.d.ts`.

`src/app/globals.css` imports Tailwind with `@import "tailwindcss"`, defines light and dark CSS variables from `prefers-color-scheme`, and adds the `float` and `wobble` keyframes used by the page.

`next dev` may rewrite the routes import inside `next-env.d.ts`. That file is generated. Leave it pointing at the committed routes path.

## The route

`src/app/layout.tsx` loads Geist Sans and Geist Mono, sets the document title to `Silly Starter™ — A Very Serious Next.js App`, and renders `{children}` in a full-height body. It is a server component.

`src/app/page.tsx` is the only page. It keeps the amber gradient, the four floating emoji, and the footer (`npm run dev`). Between those, it renders `Hero`, `DuckButton`, `SillyFacts`, and `FeatureGrid`. The page itself holds no state and performs no fetch.

Dark mode is `prefers-color-scheme` plus Tailwind `dark:` utilities. There is no theme toggle.

## What a request does

1. Next serves `layout.tsx`, which attaches the font variables and the metadata title.
2. The layout renders `page.tsx` as its child. The page is an async-capable server component, but this one does not await anything.
3. `Hero` and `FeatureGrid` are rendered on the server into the same HTML payload. Their markup is static.
4. `DuckButton` and `SillyFacts` are client references. The server emits their initial HTML (`"Press for wisdom"` and the first fact) and the browser hydrates them.
5. After hydration, a duck click updates only the button's quack string and wobble class. The fact rotator updates only its own paragraph. Neither island writes to the other, to the URL, or to storage.

The floating emoji are decorative (`pointer-events-none`) and animated by the `animate-float` classes in `globals.css`. They are not components.

## Directory contents

`src/app` contains `layout.tsx`, `page.tsx`, `globals.css`, and `favicon.ico`. Adding a second route would mean a new folder under `src/app`. Nothing in the current tree does that.

`src/components` contains `Hero.tsx`, `FeatureGrid.tsx`, `DuckButton.tsx`, and `SillyFacts.tsx`. The first two have no `"use client"` directive. The last two do. Imports on the page use the `@/components/...` alias.

`src/lib` contains `math.ts`, `strings.ts`, `arrays.ts`, `objects.ts`, `dates.ts`, and `async.ts`, each with a matching `*.test.ts` beside it. A helper that needs another helper calls it in the same file. There is no `src/lib/index.ts` barrel.

`public` is the static file root. The five SVGs are the stock Next.js starter assets. They are not imported and not linked from `page.tsx`.

`glass-scroll-repro` and `ide-repo-e2e` are fixtures checked in for editor and pull-request repros. The Next compiler does not treat them as routes. TypeScript still includes them, because `tsconfig.json` includes `**/*.ts`.

Root text files such as `repro-migration.txt`, `glint862-repro.txt`, and the `glass-*-repro` notes are markers from earlier repository exercises. They are not read at runtime.

## Components

Server components, rendered with the page:

- `Hero` is the eyebrow (`Officially Unofficial`), the `Silly Starter™` heading, and the tagline. It is only that heading block.
- `FeatureGrid` is the dashed card grid (`grid w-full gap-4 sm:grid-cols-3`). It has six cards: Fast-ish, Styled, Typed, Routed, Quackable, and Packaged. The first three are the original copy. The card classes are unchanged.

Client components (`"use client"`):

- `DuckButton` keeps a quack string and a wobble flag. A click picks a line from a fixed list and clears the wobble class after 500ms. Nothing else reads that state.
- `SillyFacts` rotates a fixed list every 4 seconds, fading out for 300ms between lines. The interval is cleared on unmount.

The server graph is layout, page, Hero, and FeatureGrid. The client graph is DuckButton and SillyFacts. No component imports `src/lib`.

## `src/lib/math.ts`

Thirty numeric functions: `clamp`, `lerp`, `roundTo`, `gcd`, `lcm`, `isPrime`, `factorial`, `fibonacci`, `sum`, `mean`, `median`, `clamp01`, `inverseLerp`, `remap`, `mod`, `degToRad`, `radToDeg`, `isEven`, `isOdd`, `hypot`, `distance`, `approximatelyEqual`, `percentOf`, `product`, `smoothstep`, `snap`, `sumOfDigits`, `isPerfectSquare`, `nextPrime`, and `variance`.

`clamp` swaps reversed bounds. `roundTo` uses `Math.round`, so halves move toward +infinity. `gcd` and `lcm` ignore sign, truncate toward zero, and throw when an argument is not finite. `mod` throws when the value is not finite or the modulus is `0` or not finite, and a positive modulus yields a non-negative remainder. `factorial` and `fibonacci` throw `RangeError` for negatives and non-integers. `mean`, `median`, and `variance` throw on an empty list. `variance` is the population variance (divisor `n`).

Predicates return false instead of throwing. `isPrime(4.0)` is false because `4.0` is the integer 4. `isPrime(4.5)` is false because it is not an integer. `isPerfectSquare` is false unless the value is a safe integer greater than or equal to zero; the root check uses `Math.round(Math.sqrt(n))`. `nextPrime` throws when `n` is not finite, searches only through `Number.MAX_SAFE_INTEGER`, and then throws `"no safe integer prime follows n"`. `approximatelyEqual` defaults to an epsilon of `1e-9`.

## `src/lib/strings.ts`

Twenty-five string functions: `capitalize`, `uncapitalize`, `camelCase`, `kebabCase`, `snakeCase`, `titleCase`, `truncate`, `slugify`, `reverseString`, `countOccurrences`, `isBlank`, `isPalindrome`, `wordCount`, `initials`, `collapseWhitespace`, `removePrefix`, `removeSuffix`, `wrap`, `lines`, `interpolate`, `mask`, `pluralize`, `swapCase`, `isNumericString`, and `between`.

A private `splitWords` inserts a boundary at `([a-z0-9])([A-Z])`, splits on non-alphanumeric runs, and lowercases. `camelCase`, `kebabCase`, and `snakeCase` use it. `titleCase` does not: it uppercases the first character of each whitespace-delimited word and leaves the rest, so `"déjà vu"` stays `"Déjà Vu"`. `wordCount` also splits on whitespace only.

`slugify` normalizes to NFKD and strips combining marks, so `"Café"` becomes `"cafe"`. `truncate` counts the ellipsis toward `maxLength`; when `maxLength` is at most the ellipsis length, the result is a plain slice. `countOccurrences` is non-overlapping, and an empty needle counts as 0. `isPalindrome` ignores characters outside `[a-z0-9]`. `removePrefix` and `removeSuffix` ignore an empty affix. `lines("")` is `[]`; a trailing break yields a trailing empty line; breaks may be `\n`, `\r\n`, or `\r`. `interpolate` trims the key, stringifies a present value, and leaves an unknown `{key}` intact. `mask` defaults `keepStart` and `keepEnd` to 0 and `maskChar` to `"*"`; a negative keep is 0; covering both ends returns the original. `pluralize` uses the singular only when `count === 1`. `isNumericString` allows an optional sign and either digits with an optional decimal or a leading dot plus digits. It rejects scientific notation.

## `src/lib/arrays.ts`

Twenty-five array functions: `unique`, `chunk`, `compact`, `flatten`, `intersection`, `difference`, `union`, `groupBy`, `partition`, `zip`, `take`, `drop`, `takeWhile`, `dropWhile`, `first`, `last`, `sortBy`, `keyBy`, `frequencies`, `rotate`, `windows`, `uniqBy`, `removeAt`, `isSorted`, and `minBy`.

Inputs are not mutated. `compact` drops only `null` and `undefined`. `flatten` is one level. `intersection` is unique and follows `left`. `difference` keeps duplicates from `left`. `zip` stops at the shorter length. `take` of a non-positive count is `[]`. `drop` of a non-positive count is a shallow copy. `sortBy` returns a stable copy keyed by number or string. `keyBy` lets the last item win. `uniqBy` lets the first item win. `rotate` moves left, treats a negative offset as right, truncates, wraps, and returns `[]` for an empty list. `chunk` and `windows` throw unless `size` is a positive integer. `removeAt` returns a copy for a non-integer, negative, or out-of-range index. `isSorted` defaults to a comparator that orders values as number or string. `minBy` returns `undefined` for an empty list and keeps the earlier item on a tie.

## `src/lib/objects.ts`

Twenty-five object functions: `pick`, `omit`, `mapValues`, `mapKeys`, `invert`, `merge`, `deepMerge`, `isEmpty`, `isPlainObject`, `getPath`, `setPath`, `hasPath`, `defaults`, `compactObject`, `renameKeys`, `pickBy`, `omitBy`, `flattenObject`, `objectSize`, `shallowClone`, `deepEquals`, `assignDefined`, `entriesOf`, `fromPairs`, and `diffKeys`.

`isPlainObject` is true when the prototype is `Object.prototype` or `null`. Arrays are not plain. A private `isIndexable` accepts a plain object or an array and is what `getPath` and `hasPath` walk.

`pick` uses `hasOwnProperty`, so an inherited name such as `toString` is not copied. `omit` builds a fresh record and casts it through `unknown` to `Omit`. `merge` shallow-assigns each object source, skips `undefined` sources, and lets a later own property overwrite, including an explicit `undefined`. `assignDefined` copies `target`, skips `undefined` values, and may add keys: `assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 })` is `{ a: 1, b: 2, c: 3 }`.

`deepMerge` recurses into plain objects, replaces an array with `[...item]`, and shares other values by reference. `getPath` returns the value for an empty path and returns the fallback when a segment is missing or the stored value is `undefined`. `setPath` returns `next` for an empty path and does not drop empty segments, so `"a..b"` is a real path. `hasPath` is false for an empty path, walks arrays as well as objects, and treats a stored `undefined` as present. `defaults` fills only missing or `undefined` keys. `flattenObject` leaves arrays as leaves, and an empty nested object contributes no keys. `deepEquals` uses `Object.is` (so `NaN` equals `NaN`) for arrays and plain objects only, and it does not handle cycles. `diffKeys` uses `Object.is` and returns `{ added, removed, changed }`. `isEmpty` treats `null` and `undefined` as empty.

## `src/lib/dates.ts`

Twenty date functions: `addDays`, `addHours`, `addMinutes`, `addMonths`, `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `isSameDay`, `isLeapYear`, `daysInMonth`, `formatISODate`, `formatRelative`, `diffDays`, `isWeekend`, `clampDate`, `parseISODate`, `minDate`, `maxDate`, and `isValidDate`.

Every calendar field is UTC. Years 0–99 cannot be trusted to `Date.UTC` alone, because that API maps them onto 1900–1999. `utcDate` calls `setUTCFullYear` for those years. That is why `daysInMonth(4, 2)` is 29 and `parseISODate("0004-02-29")` is `0004-02-29T00:00:00.000Z`.

`addDays` requires an integer. `addHours` and `addMinutes` accept a finite number, including fractions, and add elapsed milliseconds. `addMonths` requires an integer, clamps the day to the target month, and keeps the UTC time: 31 January 2024 15:30 plus one month is 29 February 2024 15:30, and 31 March 2024 minus one month is 29 February 2024. `endOfDay` and `endOfMonth` use `23:59:59.999`. `startOfDay` and `startOfMonth` use UTC midnight. `diffDays` subtracts UTC midnights (`later` minus `earlier`) and rounds. `isWeekend` is Saturday or Sunday in UTC. `clampDate` swaps reversed bounds and returns a new `Date`. `parseISODate` accepts only `YYYY-MM-DD` and rejects a day that is not on the calendar. `formatISODate` pads the year to at least four digits. Invalid `Date` values throw `RangeError`. `isValidDate` is the only helper that accepts `unknown`.

`formatRelative(date, now = new Date())` uses elapsed milliseconds, not calendar months. Under 10 seconds is `"just now"`. After that the units are floored seconds (to 60s), minutes (to 1h), hours (to 1d), days (to 7d), weeks (to 30d), months of about 30 days (to 365d), and years of about 365 days. A count of 1 stays singular.

## `src/lib/async.ts`

Twenty functions, plus the exported `Deferred<T>` type (`promise`, `resolve`, `reject`): `sleep`, `after`, `backoffDelay`, `retry`, `debounce`, `throttle`, `withTimeout`, `mapLimit`, `sequence`, `settle`, `defer`, `createMutex`, `once`, `poll`, `tryAsync`, `firstFulfilled`, `createQueue`, `isPromise`, `singleflight`, and `memoizeAsync`.

`sleep` and `after` reject a negative or non-finite delay, and they honor `AbortSignal`. An aborted signal rejects with `signal.reason`, or with an `AbortError` `DOMException` when no reason was set. `backoffDelay` is 1-based: `min(maxMs, baseMs * factor ** (attempt - 1))`, defaulting to 100, 2, and 10000, with no jitter. `retry` uses that delay, defaults to 3 attempts, and stops early when `shouldRetry` returns false.

`debounce` is trailing and exposes `cancel` and `flush`. `throttle` invokes on the leading edge, keeps the latest call inside the window, and invokes that call when the window ends. The trailing invoke opens a new window. `cancel` drops the pending call. `withTimeout` wraps the input in `Promise.resolve` so a non-thenable cannot skip the timer, and it does not cancel the original promise.

`mapLimit` preserves order and rejects (it does not throw synchronously) when `limit` is below 1. `sequence` runs tasks one by one. `settle` is `Promise.allSettled`. `createMutex` runs functions one at a time; the tail swallows a rejection so a failure does not jam the mutex. `once` caches the promise, including a rejection. `memoizeAsync` caches a fulfillment and forgets a rejection so the next call retries. `singleflight` shares only the call that is still in flight.

`poll` calls `until` until it returns a value other than `undefined`. `intervalMs` defaults to 0. When `Date.now() - start >= timeoutMs` it throws `Error("poll timed out")`. `tryAsync` returns `[undefined, value]` or `[error, undefined]`. `firstFulfilled` throws `RangeError` synchronously for an empty list and rejects with `AggregateError` when every promise rejects. `isPromise` detects thenables.

`createQueue(concurrency = 1)` exposes `add` and a `size` getter (`active + waiting`). The slot is released before the caller's promise resolves, so after the returned promises settle and the queue is idle, `size` is 0.

The six lib modules do not import each other. Calls stay inside the file that defines them.

## Testing strategy

Each module has a colocated `*.test.ts` that imports from `vitest` and from the relative `./module` path. There is one `it` per exported function. A single test may assert several cases, including the error paths called out above.

| Suite | Tests |
| --- | --- |
| `math.test.ts` | 30 |
| `strings.test.ts` | 25 |
| `arrays.test.ts` | 25 |
| `objects.test.ts` | 25 |
| `dates.test.ts` | 20 |
| `async.test.ts` | 20 |

Timer-sensitive async tests (`debounce`, `throttle`, and the timeout path of `withTimeout`) use `vi.useFakeTimers` and restore real timers in `finally`. Other async tests use short real delays. Date tests build instants with `Date.UTC`.

Vitest is not installed, and `npm test` is not defined. `tsc --noEmit` therefore reports `TS2307` on the `vitest` import and is otherwise expected to be clean. There are no component tests, no Playwright suite, and no network tests: the page has no shared state and no fetch.

A typecheck that should stay clean, apart from those missing Vitest types, is:

```bash
npx tsc --noEmit --pretty false
```

The suites can be executed once Vitest is available. Until then, the modules are plain TypeScript and can be imported with `node --experimental-strip-types`. That loader warns about a typeless `package.json`. Do not add `"type": "module"` to silence it: the Next.js package is not marked as an ES module, and the warning is harmless.

## Contracts that are easy to break

These behaviors are covered by the colocated tests and are the ones most likely to regress:

- `pick` must not copy inherited properties. `in` would copy `toString`.
- `hasPath` and `getPath` both walk arrays, so `"a.0"` on `{ a: [10] }` is a hit. `getPath` still returns the fallback when the stored value is `undefined`.
- `setPath` keeps empty segments. `"a..b"` is not the same path as `"a.b"`.
- `deepMerge` copies arrays with `[...item]`. Pushing onto the result must not change the source array.
- `createQueue` calls its completion hook before it resolves the caller. If the hook runs in `finally` after that resolve, `size` is still non-zero when the awaited promise settles.
- `throttle` opens a new window when the trailing call runs. A call in that new window is pending, not immediate.
- `mapLimit` rejects a limit below 1. The check lives in an `async` function, so it is a rejection, not a synchronous throw.
- `Date.UTC` is wrong for years 0–99. `daysInMonth(4, 2)` and `parseISODate("0004-02-29")` are the regression checks.
- `roundTo` documents `Math.round`, including `roundTo(2.5, 0) === 3` and `roundTo(-1.5, 0) === -1`.

## What this tree does not do

The helpers do not mutate their inputs. `deepMerge` copies an array one level and no further. Predicates (`isPrime`, `isEven`, `isOdd`, `isPerfectSquare`, `isValidDate`, `isBlank`, and the rest) return false for values they do not accept; operations throw `RangeError`. The UI and the libraries stay separate, so a change to a helper cannot change the duck, and a change to the duck cannot change a helper.

## File inventory

| File | Responsibility |
| --- | --- |
| `src/app/page.tsx` | Composes the gradient, floating emoji, four sections, and footer. |
| `src/components/Hero.tsx` | Heading block only. |
| `src/components/FeatureGrid.tsx` | Six dashed cards. |
| `src/lib/math.ts` | 30 numeric helpers, with `math.test.ts`. |
| `src/lib/strings.ts` | 25 string helpers, with `strings.test.ts`. |
| `src/lib/arrays.ts` | 25 array helpers, with `arrays.test.ts`. |
| `src/lib/objects.ts` | 25 object helpers, with `objects.test.ts`. |
| `src/lib/dates.ts` | 20 UTC calendar helpers, with `dates.test.ts`. |
| `src/lib/async.ts` | 20 async helpers plus `Deferred`, with `async.test.ts`. |
| `docs/ARCHITECTURE.md` | This map. |

`DuckButton.tsx`, `SillyFacts.tsx`, `layout.tsx`, and `globals.css` stay as they were. The page imports the two new sections and leaves the duck and the facts between the heading and the grid.
