# Architecture

Silly Starter is a Next.js App Router project. The home page is a single server-rendered screen. Shared presentation lives in `src/components`, and pure helpers live in `src/lib`. Nothing in `src/lib` touches the DOM, the network, or React.

## Repository layout

```
src/app/            routes, root layout, global CSS
src/components/     presentational React components
src/lib/            pure TypeScript helpers and colocated tests
public/             static assets served as-is
docs/               this note
```

`src/app/layout.tsx` wraps every route with the document shell and imports `globals.css`. `src/app/page.tsx` is the only route. It composes the home screen and does not fetch data. `src/app/favicon.ico` is the tab icon. `public/` holds files that Next serves from the site root.

Path alias `@/*` maps to `./src/*` (see `tsconfig.json`). Components import each other with that alias. Library modules import their siblings with relative paths so the tests can load them without the Next bundler.

## Home screen

`src/app/page.tsx` owns the page frame: the amber gradient, the floating decorations, and the footer. The frame is a server component. It renders four children:

| Component | File | Role |
| --- | --- | --- |
| `Hero` | `src/components/Hero.tsx` | Eyebrow, title, and tagline |
| `DuckButton` | `src/components/DuckButton.tsx` | Client button that quacks |
| `SillyFacts` | `src/components/SillyFacts.tsx` | Client list of rotating facts |
| `FeatureGrid` | `src/components/FeatureGrid.tsx` | Six static feature cards |

`DuckButton` and `SillyFacts` are client components because they hold click and index state. `Hero` and `FeatureGrid` are server components. `FeatureGrid` renders six cards (Fast-ish, Styled, Typed, Routed, Quackable, Packaged) with the same dashed-card markup the original page used for three cards. Extracting them did not change copy, color, or layout classes.

## Build and runtime

The app targets Next.js 16.2.9, React 19.2.4, and TypeScript 5. Tailwind CSS 4 is wired through PostCSS (`@tailwindcss/postcss`); `globals.css` imports Tailwind with `@import "tailwindcss"`. There is no `tailwind.config` file. Theme values are utility classes on the components.

Scripts in `package.json`:

| Script | What it runs |
| --- | --- |
| `dev` | `next dev` (Turbopack) |
| `build` | `next build` |
| `start` | `next start` |
| `lint` | `eslint` |

`next.config.ts` keeps the default Next behavior. Typecheck is `tsc --noEmit` with `strict` and bundler module resolution. Production output is `.next/`. That directory is gitignored.

Client components are marked with `"use client"` at the top of the file. The page itself stays a server component and ships the client islands as children. No route handlers, middleware, or server actions are defined.

## Library modules

Each file under `src/lib` exports plain functions. Inputs are not mutated. Invalid arguments throw `RangeError` rather than returning `NaN` or looping. The modules do not import React or Next.

### `math.ts`

Thirty numeric helpers: range mapping (`clamp`, `lerp`, `inverseLerp`, `mapRange`), rounding (`roundTo`), integer arithmetic (`gcd`, `lcm`, `factorial`, `combinations`, `mod`, `floorDiv`, `isPrime`, `nextPrime`, `isPerfectSquare`, `sumOfDigits`, `fibonacci`), summaries (`sum`, `product`, `mean`, `median`, `variance`, `stddev`, `min`, `max`), and angles (`sign`, `approximatelyEqual`, `degToRad`, `radToDeg`, `normalizeDegrees`, `percentChange`).

`gcd`, `lcm`, `mod`, `sumOfDigits`, and `nextPrime` reject non-finite input so they cannot spin. `isPerfectSquare` returns false for values outside the safe-integer range instead of trusting `Math.sqrt`.

### `strings.ts`

Twenty-five string helpers: whitespace and case (`collapseWhitespace`, `capitalize`, `toWords`, `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `titleCase`), shaping (`truncate`, `padStart`, `padEnd`, `reverse`, `quote`, `initials`, `groupDigits`), search (`countOccurrences`, `escapeRegExp`, `replaceAll`, `hashString`, `isBlank`), and affixes (`stripPrefix`, `stripSuffix`, `ensurePrefix`, `ensureSuffix`, `lines`).

`countOccurrences` counts overlapping matches. `replaceAll` accepts a string or a regular expression and always replaces globally. `hashString` is a stable 32-bit mix, not a cryptographic hash.

### `arrays.ts`

Twenty-five array helpers. Copies, uniqueness, chunking, flattening, and compaction (`copy`, `unique`, `uniqueBy`, `chunk`, `flatten`, `compact`). Grouping and set operations (`groupBy`, `countBy`, `intersection`, `difference`, `symmetricDifference`). Ordering and windows (`sortBy`, `sortByKey`, `move`, `rotate`, `windows`, `range`). Pairing and slicing (`zip`, `unzip`, `evens`, `odds`, `partition`, `findLast`, `take`, `drop`).

`sortBy` and `sortByKey` sort a copy. `range` refuses a zero step.

### `objects.ts`

Twenty-five object helpers. Classification and cloning (`isObject`, `shallowClone`, `deepClone`). Enumeration (`keys`, `values`, `entries`, `fromEntries`, `size`, `isEmpty`). Selection (`pick`, `omit`, `pickBy`, `omitBy`, `compactObject`). Merging (`merge`, `assignDefined`, `deepMerge`, `defaults`). Paths (`getPath`, `setPath`, `hasPath`). Reshaping (`mapValues`, `mapKeys`, `invert`, `rename`).

`pick` uses own-property checks, so `"toString"` is not copied off the prototype. `getPath` and `hasPath` walk arrays by index. `setPath` keeps empty segments (`"a..b"`). `deepMerge` shallow-copies arrays instead of sharing them with the source.

### `dates.ts`

Twenty UTC calendar helpers. Day bounds (`startOfDay`, `endOfDay`, `startOfMonth`, `startOfWeek`). Shifts (`addDays`, `addMonths`, `addYears`, `diffDays`). Predicates (`isWeekend`, `isSameDay`, `isBefore`, `isAfter`, `isBetween`, `isLeapYear`). Formatting (`formatIsoDate`, `parseIsoDate`, `formatRelative`). Bounds (`daysInMonth`, `clampDate`, `minDate`).

Years 0–99 go through `setUTCFullYear`. `new Date(Date.UTC(year, ...))` would otherwise map those years onto 1900–1999. `addMonths` clamps the day (31 January plus one month is 29 February in a leap year). `parseIsoDate` rejects impossible dates such as `2020-02-31`.

### `async.ts`

Twenty promise and timer helpers: `sleep`, `after`, `backoffDelay`, `retry`, `debounce`, `throttle`, `withTimeout`, `mapLimit`, `sequence`, `settle`, `defer`, `createMutex`, `once`, `poll`, `tryAsync`, `firstFulfilled`, `createQueue`, `isPromise`, `singleflight`, `memoizeAsync`.

`withTimeout` wraps plain values in `Promise.resolve`. `createQueue` decrements its active count before resolving or rejecting, so a `then` callback that enqueues more work observes a free slot. `memoizeAsync` caches successes and drops failures. `singleflight` coalesces concurrent calls and clears the slot when the shared promise settles.

## Testing

Tests sit next to the modules (`math.test.ts`, `strings.test.ts`, `arrays.test.ts`, `objects.test.ts`, `dates.test.ts`, `async.test.ts`). They import `vitest` and cover each exported function with one `describe` block. Happy paths come from the examples in the JSDoc. Extra cases cover empty input, thrown `RangeError`s, prototype pollution, year 0–99, and queue accounting.

Vitest is not installed in this repo yet. The tests are written so `vitest` can run them once it is added as a dev dependency. Until then, the modules are plain TypeScript and can be imported with `node --experimental-strip-types`.

What the tests do not cover: React rendering, Tailwind class names, and the duck click handler. Those stay in the component files and are checked by running `next dev` and using the page.

## Dependency direction

```
src/app/page.tsx
  -> src/components/*
       -> (no lib imports today)

src/lib/*.test.ts
  -> src/lib/*.ts
       -> (no app or component imports)
```

Library code stays free of React so it can be tested without a DOM. Components stay free of the library so the home page does not grow a second responsibility. New UI should land in `src/components`. New pure helpers should land in `src/lib` with a colocated test.

## Function index

`math.ts`: `clamp`, `lerp`, `inverseLerp`, `mapRange`, `roundTo`, `gcd`, `lcm`, `isPrime`, `factorial`, `combinations`, `sum`, `mean`, `median`, `variance`, `stddev`, `min`, `max`, `mod`, `floorDiv`, `sign`, `approximatelyEqual`, `isPerfectSquare`, `sumOfDigits`, `fibonacci`, `degToRad`, `radToDeg`, `normalizeDegrees`, `nextPrime`, `product`, `percentChange`.

`strings.ts`: `collapseWhitespace`, `capitalize`, `toWords`, `camelCase`, `pascalCase`, `snakeCase`, `kebabCase`, `titleCase`, `truncate`, `padStart`, `padEnd`, `countOccurrences`, `escapeRegExp`, `stripPrefix`, `stripSuffix`, `ensurePrefix`, `ensureSuffix`, `lines`, `quote`, `initials`, `isBlank`, `reverse`, `hashString`, `groupDigits`, `replaceAll`.

`arrays.ts`: `copy`, `unique`, `uniqueBy`, `chunk`, `flatten`, `compact`, `groupBy`, `countBy`, `intersection`, `difference`, `symmetricDifference`, `sortBy`, `sortByKey`, `move`, `rotate`, `zip`, `unzip`, `evens`, `odds`, `windows`, `partition`, `findLast`, `range`, `take`, `drop`.

`objects.ts`: `isObject`, `shallowClone`, `deepClone`, `keys`, `values`, `entries`, `fromEntries`, `pick`, `omit`, `merge`, `assignDefined`, `deepMerge`, `getPath`, `hasPath`, `setPath`, `mapValues`, `mapKeys`, `invert`, `pickBy`, `omitBy`, `defaults`, `compactObject`, `rename`, `size`, `isEmpty`.

`dates.ts`: `startOfDay`, `endOfDay`, `addDays`, `addMonths`, `addYears`, `diffDays`, `isWeekend`, `isSameDay`, `isBefore`, `isAfter`, `isBetween`, `formatIsoDate`, `parseIsoDate`, `startOfMonth`, `startOfWeek`, `formatRelative`, `isLeapYear`, `daysInMonth`, `clampDate`, `minDate`.

`async.ts`: `sleep`, `after`, `backoffDelay`, `retry`, `debounce`, `throttle`, `withTimeout`, `mapLimit`, `sequence`, `settle`, `defer`, `createMutex`, `once`, `poll`, `tryAsync`, `firstFulfilled`, `createQueue`, `isPromise`, `singleflight`, `memoizeAsync`.

## Invariants worth keeping

Numeric code rejects non-finite input at the boundary that would otherwise loop (`gcd`, `lcm`, `mod`, `sumOfDigits`, `nextPrime`). Date code constructs civil dates with `setUTCFullYear` so year 4 stays year 4. Object code reads and writes own properties only, and array merges copy the array. Queue code updates `size` before the task promise settles.

JSDoc on `math.ts` and `strings.ts` includes at least one `@example` per export. Those examples are the assertions in the matching test files. When a signature changes, update the example and the test together.

## What is intentionally absent

There is no data fetching, no database, and no authentication. The duck button's quacks and the silly-fact list are hardcoded in their components. Library modules are not re-exported from a barrel file; callers import the module they need. That keeps the dependency graph obvious in review and avoids pulling every helper into a client component by accident.
