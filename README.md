# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck

## Setup

You need Node.js 20 LTS or newer (this repo types against `@types/node` ^20) and the npm that ships with it.

```bash
npm install
```

The package is named `starter-repo` and marked private. No registry login is required.

## Usage

### Dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press the duck. The app uses the App Router; that clickable duck is the whole interactive surface. That's basically the product roadmap.

### Production build locally

To check the production bundle on your machine (not a deploy guide):

```bash
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000) again.

## Quality

```bash
npm run lint
```

This runs ESLint with `eslint-config-next`. There is no `test` script yet, so lint is the automated check until tests land. Do not invent a fake `npm test`.

## Scripts

Details live in [Setup](#setup), [Usage](#usage), [Quality](#quality), and [Troubleshooting](#troubleshooting).

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js dev server         |
| `npm run build` | Build the production bundle          |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint (`eslint-config-next`)    |

## Troubleshooting

**`npm install` fails or Node looks wrong.** Confirm `node -v` is 20+. Reinstall Node LTS, then run `npm install` again from the repo root.

**Port 3000 already in use on `npm run dev`.** Stop the other process on 3000, or start with `npx next dev -p 3001` and open that port instead.

**`npm run build` fails after dependency changes.** Delete `node_modules`, run `npm install`, then `npm run build` again.

**`npm run lint` fails after edits.** Read the ESLint output, fix the reported files, and re-run `npm run lint`.

## License

Do whatever you want. The duck doesn't care.
