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

## Command line

The same quacks and facts the UI uses are available from a small CLI (`src/cli.ts`).

```bash
npm run silly -- --help
npm run silly -- quack
npm run silly -- fact --index 0
npm run silly -- fact --index 7 --next --json
```

| Flag / command | Meaning |
| -------------- | ------- |
| `quack` | Print a duck quack (use `--from <index>` to avoid a repeat) |
| `fact` | Print a silly fact (`--index`, optional `--next`) |
| `-h`, `--help` | Help text (exit `0`) |
| `-v`, `--version` | Print `0.1.0` |
| `--json` | `{ "index", "text" }` instead of plain text |

Exit codes: `0` success, `1` usage error (missing/unknown command or flag), `2` invalid option value.

## Scripts

| Command        | What it does              |
| -------------- | ------------------------- |
| `npm run dev`  | Start dev server          |
| `npm run build`| Build for production      |
| `npm run start`| Run production build      |
| `npm run lint` | Lint (the duck is exempt) |
| `npm test`     | Run the Vitest suite      |
| `npm run silly`| CLI for quacks and facts  |

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
