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

## String helpers

`src/lib/strings.ts` exports `slugify`, `truncate`, and `titleCase`. From app code, import them with the `@/` alias:

```ts
import { slugify, truncate, titleCase } from "@/lib/strings";

slugify("Café au lait"); // "cafe-au-lait"
truncate("hello world", 8); // "hello..."
titleCase("(hello) world"); // "(Hello) World"
```

`slugify` lowercases text, strips diacritics, and joins the remaining words with hyphens. `truncate` shortens a string so the result is at most `maxLength` characters, and the `"..."` counts toward that limit. `titleCase` capitalizes the first letter of each word, leaves leading punctuation in place, and keeps the original spacing. A non-string input throws a `TypeError`. A negative `maxLength` throws a `RangeError`.

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
