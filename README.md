# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck
- A `silly` command line for people who prefer their wisdom in a terminal

## Get started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press the duck. That's basically the whole product roadmap.

## Scripts

| Command              | What it does                         |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start dev server                     |
| `npm run build`      | Build for production                 |
| `npm run start`      | Run production build                 |
| `npm run lint`       | Lint (the duck is exempt)            |
| `npm run typecheck`  | Type-check with `tsc`                |
| `npm test`           | Run the test suite once (Vitest)     |
| `npm run test:watch` | Run tests in watch mode              |
| `npm run silly`      | Run the `silly` CLI (see below)      |

## Command line

The duck's quacks and the rotating facts are also available from a terminal. Pass arguments after `--`; add `--silent` to hide npm's own banner:

```bash
npm run --silent silly -- quack             # one random quack
npm run --silent silly -- quack --count 3   # three quacks, never the same one twice in a row
npm run --silent silly -- fact              # a random fact
npm run --silent silly -- fact --index 2    # fact number 2
npm run --silent silly -- fact --all        # every fact, numbered
npm run --silent silly -- --help            # usage; also `help <command>` or `<command> --help`
npm run --silent silly -- --version
```

You can also run it directly with `npx tsx src/cli/main.ts <command>`.

| Option                | Command | Meaning                                    |
| --------------------- | ------- | ------------------------------------------ |
| `-n`, `--count <n>`   | `quack` | Number of quacks, 1–100 (default 1)        |
| `-i`, `--index <n>`   | `fact`  | Print fact `n`, 1–8, instead of a random one |
| `-a`, `--all`         | `fact`  | Print every fact (not with `--index`)      |
| `-h`, `--help`        | any     | Show help                                  |
| `-v`, `--version`     | none    | Show the version                           |

Exit codes:

| Code | Meaning                                                          |
| ---- | ---------------------------------------------------------------- |
| `0`  | Success                                                          |
| `1`  | Unexpected error                                                 |
| `2`  | Invalid command or options (message and a hint go to stderr)     |

Running `silly` with no command prints the usage to stderr and exits `2`.

## License

Do whatever you want. The duck doesn't care.

Repro test line
glint1485 merge verify A
