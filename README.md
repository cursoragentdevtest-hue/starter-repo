# Silly Starter™

A whimsical Next.js starter app that absolutely does not take itself seriously.

## What's inside

- **Next.js 16** with App Router
- **React 19** (fast-ish)
- **TypeScript** (for your mistakes)
- **Tailwind CSS** (duck approved)
- One very clickable duck
- A small **CLI** for duck wisdom and silly facts

## Get started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and press the duck. That's basically the whole product roadmap.

## Command-line interface

The same quips and facts as the web UI are available from the terminal:

```bash
npm run cli -- quack
npm run cli -- fact
npm run cli -- fact --next 3
npm run cli -- list --facts
npm run cli -- help
```

After `npm install`, you can also run the linked binary:

```bash
npx silly-starter quack
```

### Commands

| Command | Description |
| ------- | ----------- |
| `quack` | Print a random duck wisdom line |
| `fact` | Print a silly fact (`--index <n>` or `--next <n>`) |
| `list` | Print all lines (`--quacks` or `--facts`) |
| `help` | Show usage |

### Exit codes

| Code | Meaning |
| ---- | ------- |
| `0` | Success |
| `1` | Runtime error |
| `2` | Invalid usage |

## Scripts

| Command        | What it does              |
| -------------- | ------------------------- |
| `npm run dev`  | Start dev server          |
| `npm run build`| Build for production      |
| `npm run start`| Run production build      |
| `npm run lint` | Lint (the duck is exempt) |
| `npm test`     | Run unit and CLI tests    |
| `npm run cli`  | Run the silly-starter CLI |

## License

Do whatever you want. The duck doesn't care.
