# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck

## Prerequisites

- Node.js 20.9+ (required by Next.js 16)
- npm (this repo ships a `package-lock.json`)

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This app uses no environment variables and needs no `.env` file.

## Usage

- Click the duck for a random quack ([`src/components/DuckButton.tsx`](src/components/DuckButton.tsx))
- Watch the rotating silly facts ([`src/components/SillyFacts.tsx`](src/components/SillyFacts.tsx))
- Home page entry: [`src/app/page.tsx`](src/app/page.tsx)
- Import alias: `@/*` maps to `./src/*`

To run a production build locally:

```bash
npm run build
npm run start
```

## Scripts

| Command         | What it does              |
| --------------- | ------------------------- |
| `npm run dev`   | Start dev server          |
| `npm run build` | Build for production      |
| `npm run start` | Run production build      |
| `npm run lint`  | Lint (the duck is exempt) |

## Testing

There is no automated test suite and no `npm test` script yet. No Jest, Vitest, or Playwright is configured.

Manual smoke check:

1. Run `npm run dev`
2. Open `/`
3. Click the duck
4. Confirm the silly facts rotate

For a static check after edits, run `npm run lint`.

## Troubleshooting

| Symptom | Fix |
| ------- | --- |
| Unsupported engine / `next` fails | Upgrade Node.js to 20.9+ |
| Port 3000 in use | Free the port, or run `npx next dev -p 3001` |
| `npm run start` errors | Run `npm run build` first |
| Lint failures after edits | Run `npm run lint` |
| Surprising Next.js APIs | Read [AGENTS.md](AGENTS.md) and `node_modules/next/dist/docs/` (this is Next 16, not older docs) |

## License

Do whatever you want. The duck doesn't care.
