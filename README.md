# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck

## Get started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press the duck. That's basically the whole product roadmap.

## Scripts

| Command        | What it does              |
| -------------- | ------------------------- |
| `npm run dev`  | Start dev server          |
| `npm run build`| Build for production      |
| `npm run start`| Run production build      |
| `npm run lint` | Lint (the duck is exempt) |
| `npm test`     | Run unit tests            |

## String utilities

`src/lib/strings.ts` has three small, dependency-free helpers:

```ts
import { slugify, truncate, titleCase } from "@/lib/strings";

slugify("Crème Brûlée, Please!");       // "creme-brulee-please"
slugify("Top_10 Tips for 2026");        // "top-10-tips-for-2026"

truncate("Hello wonderful world", 10);  // "Hello won…"  (the limit includes the ellipsis)
truncate("Hello world", 7);             // "Hello…"      (trailing spaces are trimmed)
truncate("abcdefghij", 6, "...");       // "abc..."
truncate("short", 10);                  // "short"       (unchanged when it fits)

titleCase("hELLO wORLD");               // "Hello World"
titleCase("well-known snake_case");     // "Well-Known Snake_Case"
```

- **`slugify(input)`** lowercases, strips accents and joins words with `-`. Characters with no plain-letter equivalent (e.g. emoji) are dropped.
- **`truncate(input, maxLength, ellipsis = "…")`** counts by code point, so emoji are never split. If `maxLength` is too small for the ellipsis, the ellipsis itself is cut.
- **`titleCase(input)`** capitalizes the first letter of each word; spaces, hyphens and underscores separate words.

Bad input throws with a message naming the function and argument:

```ts
slugify(null);          // TypeError: slugify: expected input to be a string, got null
truncate("abc", -1);    // RangeError: truncate: expected maxLength to be a non-negative integer, got -1
```

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
