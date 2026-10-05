# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck
- A tiny CLI for quacks and facts without opening a browser

## Get started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press the duck. That's basically the whole product roadmap.

## CLI

The same catalogs powering the UI are available from the terminal:

```bash
npm run cli -- --help
npm run cli -- quack
npm run cli -- quack --index 0
npm run cli -- fact -i 2
npm run cli -- list facts
```

After `npm link` (or installing the package), the `silly` binary wraps the same entry point:

```bash
silly quack --index 1
silly list quacks
```

| Exit code | Meaning                                      |
| --------- | -------------------------------------------- |
| `0`       | Success                                      |
| `1`       | Runtime / lookup error (e.g. bad `--index`)  |
| `2`       | Usage error (unknown command or bad flags)   |

## Scripts

| Command        | What it does              |
| -------------- | ------------------------- |
| `npm run dev`  | Start dev server          |
| `npm run build`| Build for production      |
| `npm run start`| Run production build      |
| `npm run lint` | Lint (the duck is exempt) |
| `npm test`     | Run unit tests            |
| `npm run cli`  | Run the Silly Starter CLI |

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
