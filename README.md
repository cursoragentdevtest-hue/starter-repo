# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck

## Setup

You need Node.js 20+ and npm. Next.js 16 is picky about that, so check `node -v` before you blame the duck.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press the duck. That's basically the whole product roadmap.

## Usage

Day-to-day commands (same ones listed under Scripts):

- `npm run dev`: local development with hot reload
- `npm run build`: production build
- `npm run start`: serve the production build (run `build` first)
- `npm run lint`: ESLint, duck exempt

## Testing

There is no automated test suite yet. Verify things the honest way:

1. Open `/` and confirm the page loads.
2. Click the duck. It should react.
3. Run `npm run lint` and make sure it exits clean.
4. Run `npm run build` and make sure the production build succeeds.

## Troubleshooting

**`npm install` fails.** Confirm Node.js 20+. Then wipe and retry:

```bash
rm -rf node_modules
npm install
```

**Port 3000 is already in use.** Stop the other process, or start with a different port: `npx next dev -p 3001`.

**Build or lint errors.** Run `npm run lint`, fix what it points at, then `npm run build` again. Most surprises are stale installs; a clean `npm install` often helps.

**Blank page or a duck that ignores you.** Restart `npm run dev`. If that fails, run `npm run build` and check the terminal for errors.

## Scripts

| Command        | What it does              |
| -------------- | ------------------------- |
| `npm run dev`  | Start dev server          |
| `npm run build`| Build for production      |
| `npm run start`| Run production build      |
| `npm run lint` | Lint (the duck is exempt) |

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
