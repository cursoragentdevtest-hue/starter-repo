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
| `npm test`     | Run the string-helper tests |

## String helpers

`src/lib/strings.ts` exports three helpers. Import them with the `@/` alias:

```ts
import { slugify, truncate, titleCase } from "@/lib/strings";

slugify("Café au lait!");
// "cafe-au-lait"

slugify("Straße");
// "strasse"

truncate("hello world", 8);
// "hello..."

titleCase("don't stop");
// "Don't Stop"

titleCase("the 3rd place");
// "The 3rd Place"
```

`slugify` lowercases text, strips diacritics, folds `ß` to `ss`, and collapses other non-alphanumeric runs into a single hyphen. `truncate` never returns more than `maxLength` characters, and the `...` counts toward that limit. `titleCase` capitalizes each word and lowercases the rest. Contractions stay one word, and letters that continue a number stay as they are.

A non-string throws `TypeError`, for example `value must be a string (received 42)`. A `truncate` limit that is not a non-negative integer throws `RangeError`, for example `maxLength must be a non-negative integer (received -1)`.

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
