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
| `npm test`     | Run the Vitest test suite |
| `npm run silly -- <command>` | Run the `silly` CLI |

## Command line

The duck's wisdom is also available from the terminal, for when a browser is too much commitment. The CLI uses the same quacks and facts as the web page (`src/content/`).

```bash
npm run silly -- quack             # one random quack
npm run silly -- quack --count 3   # three quacks, never the same twice in a row
npm run silly -- fact              # a random silly fact
npm run silly -- fact 2            # silly fact number 2
npm run silly -- list facts        # every fact, numbered (also: list quacks)
npm run silly -- --help            # full usage
npm run silly -- --version
```

The `--` stops npm from parsing the CLI's own flags. You can also run it directly with `npx tsx src/cli/main.ts <command>`.

| Exit code | Meaning |
| --------- | ------- |
| `0` | Success |
| `1` | Unexpected error |
| `2` | Invalid usage: unknown command, bad option, or out-of-range argument. The message goes to stderr. |

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
