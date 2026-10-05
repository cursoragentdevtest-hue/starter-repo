import { nextCyclicIndex, pickDifferentIndex } from "./cycle";
import { FACTS, QUACKS } from "./quotes";

export const EXIT_OK = 0;
export const EXIT_USAGE = 1;
export const EXIT_INVALID = 2;

export const HELP_TEXT = `Usage: silly-starter <command> [options]

Expose Silly Starter's duck quacks and rotating facts from the command line.

Commands:
  quack              Print a duck quack (avoids repeating --from)
  fact               Print a silly fact at --index (default 0)
  help               Show this help

Options:
  -h, --help         Show this help
  -v, --version      Show version
  --from <index>     Current quack index to avoid (default -1, any quack)
  --index <index>    Fact index to print (default 0)
  --next             With fact: print the next fact after --index
  --json             Print { "index", "text" } instead of plain text

Exit codes:
  0  success
  1  usage error (missing/unknown command or flag)
  2  invalid option value
`;

export const CLI_VERSION = "0.1.0";

export type CliIo = {
  log: (message: string) => void;
  error: (message: string) => void;
  random?: () => number;
};

type ParseOk =
  | { ok: true; command: "help" }
  | { ok: true; command: "version" }
  | { ok: true; command: "quack"; from: number; json: boolean }
  | { ok: true; command: "fact"; index: number; next: boolean; json: boolean };

type ParseErr = { ok: false; exitCode: typeof EXIT_USAGE | typeof EXIT_INVALID; message: string };

export type ParseResult = ParseOk | ParseErr;

function readInt(value: string, flag: string): { ok: true; value: number } | ParseErr {
  if (!/^-?\d+$/.test(value)) {
    return {
      ok: false,
      exitCode: EXIT_INVALID,
      message: `${flag} expects an integer, received ${JSON.stringify(value)}`,
    };
  }
  return { ok: true, value: Number.parseInt(value, 10) };
}

function takeValue(argv: string[], i: number, flag: string): { ok: true; value: string; next: number } | ParseErr {
  const current = argv[i];
  const eq = current.indexOf("=");
  if (eq >= 0 && current.slice(0, eq) === flag) {
    const value = current.slice(eq + 1);
    if (value === "") {
      return { ok: false, exitCode: EXIT_INVALID, message: `${flag} requires a value` };
    }
    return { ok: true, value, next: i + 1 };
  }
  const value = argv[i + 1];
  if (value === undefined || value.startsWith("-")) {
    return { ok: false, exitCode: EXIT_INVALID, message: `${flag} requires a value` };
  }
  return { ok: true, value, next: i + 2 };
}

export function parseArgs(argv: string[]): ParseResult {
  let command: "quack" | "fact" | "help" | "version" | null = null;
  let from = -1;
  let index = 0;
  let next = false;
  let json = false;

  for (let i = 0; i < argv.length; ) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help" || arg === "help") {
      return { ok: true, command: "help" };
    }
    if (arg === "-v" || arg === "--version" || arg === "version") {
      return { ok: true, command: "version" };
    }
    if (arg === "--json") {
      json = true;
      i += 1;
      continue;
    }
    if (arg === "--next") {
      next = true;
      i += 1;
      continue;
    }
    if (arg === "--from" || arg.startsWith("--from=")) {
      const taken = takeValue(argv, i, "--from");
      if (!taken.ok) return taken;
      const parsed = readInt(taken.value, "--from");
      if (!parsed.ok) return parsed;
      from = parsed.value;
      i = taken.next;
      continue;
    }
    if (arg === "--index" || arg.startsWith("--index=")) {
      const taken = takeValue(argv, i, "--index");
      if (!taken.ok) return taken;
      const parsed = readInt(taken.value, "--index");
      if (!parsed.ok) return parsed;
      index = parsed.value;
      i = taken.next;
      continue;
    }
    if (arg.startsWith("-")) {
      return { ok: false, exitCode: EXIT_USAGE, message: `Unknown option: ${arg}` };
    }
    if (arg === "quack" || arg === "fact") {
      if (command !== null) {
        return { ok: false, exitCode: EXIT_USAGE, message: `Unexpected extra command: ${arg}` };
      }
      command = arg;
      i += 1;
      continue;
    }
    return { ok: false, exitCode: EXIT_USAGE, message: `Unknown command: ${arg}` };
  }

  if (command === null) {
    return { ok: false, exitCode: EXIT_USAGE, message: "Missing command. Expected quack or fact." };
  }
  if (command === "quack") {
    return { ok: true, command: "quack", from, json };
  }
  return { ok: true, command: "fact", index, next, json };
}

export function run(argv: string[], io: CliIo = { log: console.log, error: console.error }): number {
  const parsed = parseArgs(argv);
  if (!parsed.ok) {
    io.error(parsed.message);
    io.error("Try --help for usage.");
    return parsed.exitCode;
  }

  if (parsed.command === "help") {
    io.log(HELP_TEXT.trimEnd());
    return EXIT_OK;
  }
  if (parsed.command === "version") {
    io.log(CLI_VERSION);
    return EXIT_OK;
  }

  try {
    if (parsed.command === "quack") {
      const chosen = pickDifferentIndex(QUACKS.length, parsed.from, io.random ?? Math.random);
      const text = QUACKS[chosen];
      io.log(parsed.json ? JSON.stringify({ index: chosen, text }) : text);
      return EXIT_OK;
    }

    if (parsed.index < 0 || parsed.index >= FACTS.length) {
      io.error(`--index must be between 0 and ${FACTS.length - 1}, received ${parsed.index}`);
      return EXIT_INVALID;
    }
    const chosen = parsed.next ? nextCyclicIndex(parsed.index, FACTS.length) : parsed.index;
    const text = FACTS[chosen];
    io.log(parsed.json ? JSON.stringify({ index: chosen, text }) : text);
    return EXIT_OK;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.error(message);
    return EXIT_INVALID;
  }
}
