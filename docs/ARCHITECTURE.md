# Architecture

Silly Starter is a small Next.js App Router application. The product surface
is a single home page. Next to that, `src/lib/` holds
pure TypeScript utilities with colocated Vitest files. Nothing in the UI
imports the library yet; the modules are a local toolbox with their own
tests.

## Repository map

```
starter-repo/
├── public/                 static files served as-is
├── docs/                   architecture notes (this file)
├── src/
│   ├── app/                routes, layout, global styles
│   ├── components/         React components used by routes
│   └── lib/                framework-free utilities and tests
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

`public/` contains `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and
`window.svg`. Next.js serves these from the site root. They are not imported
by the current pages.

`docs/` is for humans. The Next.js compiler does not treat it as application
code.

## `src/app`

App Router files:

| File | Role |
| --- | --- |
| `layout.tsx` | Root layout: html, body, Geist fonts, metadata |
| `page.tsx` | Home route. Composes Hero, DuckButton, SillyFacts, FeatureGrid |
| `globals.css` | Tailwind v4 import and a couple of float animations |

`page.tsx` is a Server Component. It renders the gradient shell and the
floating emoji, then delegates the readable sections to components. The
home page does not fetch data and does not use client state of its own.
`DuckButton` and `SillyFacts` are client components because they handle
clicks and local React state.

`layout.tsx` loads Geist Sans and Geist Mono through `next/font/google` and
exposes them as CSS variables. Metadata title and description live here
and apply to the home page.

`globals.css` starts with `@import "tailwindcss"` and `@theme inline` for
the font variables. The float keyframes used by the home page background
live in the same file.

## `src/components`

| Component | Kind | Responsibility |
| --- | --- | --- |
| `Hero` | server | Eyebrow, title, and intro paragraph |
| `FeatureGrid` | server | Six feature cards in a responsive grid |
| `DuckButton` | client | Button that swaps the caption for a random quack |
| `SillyFacts` | client | Rotates a short list of facts on a timer |

`Hero` and `FeatureGrid` were extracted from the home page so the route
file stays a layout of sections. `FeatureGrid` owns the feature copy: six
cards (Fast-ish, Styled, Typed, Routed, Quackable, Packaged) in one, two,
or three columns depending on the viewport.

`DuckButton` keeps the current quack and a short wobble flag in `useState`.
`SillyFacts` advances its fact index on a four-second interval. Both files
begin with `"use client"`.

## `src/lib`

Each module is pure TypeScript with no React, no Next.js, and no imports
from the other library files. Tests sit beside the implementation
(`math.test.ts` next to `math.ts`) and import from `./math` and friends.

### `math.ts`

Thirty numeric helpers: `clamp`, `lerp`, `roundTo`, `gcd`, `lcm`,
`isPrime`, `factorial`, `fibonacci`, `sum`, `mean`, `median`, `clamp01`,
`inverseLerp`, `remap`, `mod`, `degToRad`, `radToDeg`, `isEven`, `isOdd`,
`hypot`, `distance`, `approximatelyEqual`, `percentOf`, `product`,
`smoothstep`, `snap`, `sumOfDigits`, `isPerfectSquare`, `nextPrime`, and
`variance`.

Non-finite numbers throw `RangeError` instead of propagating `NaN` or
spinning forever. `isPrime` and `isPerfectSquare` refuse values outside
`Number.isSafeInteger`. `factorial` stops at 170 and `fibonacci` stops at
78 so the results stay inside the range JavaScript can represent exactly
or, for factorial, as a finite float. `mod` always returns a non-negative
remainder.

### `strings.ts`

Twenty-five string helpers: case conversion (`capitalize`, `uncapitalize`,
`camelCase`, `kebabCase`, `snakeCase`, `titleCase`, `swapCase`), trimming
and slicing (`truncate`, `slugify`, `collapseWhitespace`, `removePrefix`,
`removeSuffix`, `between`, `lines`), and queries (`countOccurrences`,
`isBlank`, `isPalindrome`, `wordCount`, `isNumericString`), plus
`reverseString`, `initials`, `wrap`, `interpolate`, `mask`, and
`pluralize`.

`slugify` strips combining marks after NFKD normalization. `interpolate`
replaces `{key}` tokens and leaves unknown tokens in place. `countOccurrences`
counts non-overlapping matches and treats an empty needle as zero.

### `arrays.ts`

Twenty-five array helpers: `unique`, `chunk`, `compact`, `flatten`,
`intersection`, `difference`, `union`, `groupBy`, `partition`, `zip`,
`take`, `drop`, `takeWhile`, `dropWhile`, `first`, `last`, `sortBy`,
`keyBy`, `frequencies`, `rotate`, `windows`, `uniqBy`, `removeAt`,
`isSorted`, and `minBy`.

Functions that return collections allocate new arrays. `rotate` accepts a
negative distance and rotates the other way. `chunk` and `windows` require
a positive integer size.

### `objects.ts`

Twenty-five object helpers: `pick`, `omit`, `mapValues`, `mapKeys`,
`invert`, `merge`, `deepMerge`, `isEmpty`, `isPlainObject`, `getPath`,
`setPath`, `hasPath`, `defaults`, `compactObject`, `renameKeys`, `pickBy`,
`omitBy`, `flattenObject`, `objectSize`, `shallowClone`, `deepEquals`,
`assignDefined`, `entriesOf`, `fromPairs`, and `diffKeys`.

`pick` copies only own properties, so a key that exists only on
`Object.prototype` is skipped. `deepMerge` clones arrays and nested plain
objects, so later edits to an input array do not show up in the merge
result. `setPath` copies each object along the path and leaves the input
untouched. `isPlainObject` rejects arrays, dates, and class instances.

### `dates.ts`

Twenty UTC date helpers: `addDays`, `addHours`, `addMinutes`, `addMonths`,
`startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth`, `isSameDay`,
`isLeapYear`, `daysInMonth`, `formatISODate`, `formatRelative`, `diffDays`,
`isWeekend`, `clampDate`, `parseISODate`, `minDate`, `maxDate`, and
`isValidDate`.

Calendar math uses `setUTCFullYear` so years 0–99 stay in that century.
`Date.UTC` would map those years onto 1900–1999. `addMonths` clamps the
day when the target month is shorter (31 January plus one month is
29 February in a leap year). `parseISODate` accepts only `YYYY-MM-DD` and
rejects dates that overflow, such as 31 February. `formatRelative` compares
against an injected `now` so the label is testable.

### `async.ts`

Twenty async helpers: `sleep`, `after`, `backoffDelay`, `retry`,
`debounce`, `throttle`, `withTimeout`, `mapLimit`, `sequence`, `settle`,
`defer`, `createMutex`, `once`, `poll`, `tryAsync`, `firstFulfilled`,
`createQueue`, `isPromise`, `singleflight`, and `memoizeAsync`.

`retry` waits with exponential backoff between attempts. `mapLimit` and
`createQueue` cap how many tasks run at once. `createQueue().size()` counts
work that has not finished, including the task that is currently running,
and drops that count in a `finally` block before the caller observes
resolution. `memoizeAsync` deletes a cache entry when the promise rejects
so a later call can try again. `singleflight` shares one in-flight promise
per key and then forgets it.

## Request path

1. `next dev` or `next start` receives the HTTP request.
2. The App Router matches `src/app/page.tsx`.
3. The root layout wraps the page with fonts and the amber body styles.
4. Server Components render to HTML. Client components hydrate on the
   browser and attach their click handlers.
5. Static files in `public/` are served directly when the URL matches a
   file name.

There is no database, no middleware, and no Route Handler. `next.config.ts`
is an empty `NextConfig` object.

## Build and tooling

- `npm run dev` starts Next.js 16 with Turbopack.
- `npm run build` produces the production server output.
- `npm start` serves that output.
- `npm run lint` runs ESLint with `eslint-config-next`.
- `npm test` runs Vitest once across `src/**/*.test.ts`.

TypeScript is `strict` with `noEmit`. The path alias `@/*` points at
`src/*`. Styling is Tailwind CSS v4 through `@tailwindcss/postcss`; there
is no `tailwind.config.js`. React 19 is the UI runtime.

## Testing strategy

Library tests are colocated and import the module under test by relative
path. They do not need jsdom: the helpers do not touch the DOM. Timer-based
async tests use Vitest fake timers where the delay is the subject
(`sleep`, `debounce`, `retry`) and real short delays where ordering is the
subject (`mapLimit`, `createMutex`).

UI behavior is still checked by running the dev server and exercising the
home page. The component split is presentational, so the assertions that
matter are: the hero copy is visible, six feature cards render, a fact is
on screen, and the duck button replaces its caption.

A test that needs a calendar date goes through `parseISODate` so the
expected instant is UTC midnight. A test that needs "now" passes an
explicit second argument to `formatRelative`.

## Boundaries

- Route files compose components. They do not implement date math or
  concurrency.
- Components do not import `src/lib`.
- Library modules do not import each other and do not import React.
- New UI state belongs in a client component. New pure logic belongs in
  `src/lib` with a test next to it.
