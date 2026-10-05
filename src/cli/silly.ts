import { parseArgs } from "node:util";
import { version } from "../../package.json";
import { FACTS } from "../lib/facts";
import { pickQuack } from "../lib/quacks";

export const EXIT_OK = 0;
export const EXIT_ERROR = 1;
export const EXIT_USAGE = 2;

export const MAX_QUACKS = 100;

export interface CliIO {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  random?: () => number;
}

export const HELP = `Usage: silly <command> [options]

Ask the duck for wisdom from your terminal.

Commands:
  quack          Print a random duck quack
  fact           Print a silly fact
  help [command] Show help for silly or a command

Options:
  -h, --help     Show help (also works after a command)
  -v, --version  Show version

Exit codes:
  0  Success
  1  Unexpected error
  2  Invalid command or options

Examples:
  silly quack --count 3
  silly fact --index 2
  silly fact --all
`;

export const QUACK_HELP = `Usage: silly quack [options]

Print random duck quacks. Consecutive quacks never repeat.

Options:
  -n, --count <n>  Number of quacks to print, 1-${MAX_QUACKS} (default: 1)
  -h, --help       Show this help
`;

export const FACT_HELP = `Usage: silly fact [options]

Print a random silly fact.

Options:
  -i, --index <n>  Print fact number n, 1-${FACTS.length}, instead of a random one
  -a, --all        Print every fact, numbered
  -h, --help       Show this help
`;

const COMMAND_HELP = new Map([
  ["quack", QUACK_HELP],
  ["fact", FACT_HELP],
]);

class UsageError extends Error {}

function isParseArgsError(error: unknown): error is Error {
  const code = (error as { code?: unknown } | null)?.code;
  return error instanceof TypeError && typeof code === "string" && code.startsWith("ERR_PARSE_ARGS");
}

function parseWholeNumber(option: string, raw: string, max: number): number {
  const value = Number(raw);
  if (!/^\d+$/.test(raw) || value < 1 || value > max) {
    throw new UsageError(`${option} must be a whole number from 1 to ${max} (got "${raw}")`);
  }
  return value;
}

function runQuack(args: string[], io: CliIO): number {
  const { values } = parseArgs({
    args,
    options: {
      count: { type: "string", short: "n" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    io.stdout(QUACK_HELP);
    return EXIT_OK;
  }

  const count = values.count === undefined ? 1 : parseWholeNumber("--count", values.count, MAX_QUACKS);
  let previous: string | undefined;
  for (let i = 0; i < count; i++) {
    previous = pickQuack(previous, io.random);
    io.stdout(`${previous}\n`);
  }
  return EXIT_OK;
}

function runFact(args: string[], io: CliIO): number {
  const { values } = parseArgs({
    args,
    options: {
      index: { type: "string", short: "i" },
      all: { type: "boolean", short: "a" },
      help: { type: "boolean", short: "h" },
    },
  });
  if (values.help) {
    io.stdout(FACT_HELP);
    return EXIT_OK;
  }
  if (values.all && values.index !== undefined) {
    throw new UsageError("--index and --all cannot be used together");
  }

  if (values.all) {
    io.stdout(FACTS.map((fact, i) => `${i + 1}. ${fact}\n`).join(""));
  } else if (values.index !== undefined) {
    io.stdout(`${FACTS[parseWholeNumber("--index", values.index, FACTS.length) - 1]}\n`);
  } else {
    const random = io.random ?? Math.random;
    io.stdout(`${FACTS[Math.floor(random() * FACTS.length)]}\n`);
  }
  return EXIT_OK;
}

function runGlobal(args: string[], io: CliIO): number {
  const { values } = parseArgs({
    args,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  if (values.version) {
    io.stdout(`${version}\n`);
  } else {
    io.stdout(HELP);
  }
  return EXIT_OK;
}

function runHelp(args: string[], io: CliIO): number {
  const [topic, ...extra] = args;
  if (extra.length > 0) {
    throw new UsageError(`unexpected argument "${extra[0]}"`);
  }
  const text = topic === undefined ? HELP : COMMAND_HELP.get(topic);
  if (text === undefined) {
    throw new UsageError(`unknown command "${topic}"`);
  }
  io.stdout(text);
  return EXIT_OK;
}

function dispatch(argv: string[], io: CliIO): number {
  const [command, ...rest] = argv;
  switch (command) {
    case "quack":
      return runQuack(rest, io);
    case "fact":
      return runFact(rest, io);
    case "help":
      return runHelp(rest, io);
    case undefined:
      io.stderr(HELP);
      return EXIT_USAGE;
    default:
      if (command.startsWith("-")) {
        return runGlobal(argv, io);
      }
      throw new UsageError(`unknown command "${command}"`);
  }
}

/** Runs the CLI with `argv` (without the node and script paths) and returns the process exit code. */
export function run(argv: string[], io: CliIO): number {
  try {
    return dispatch(argv, io);
  } catch (error) {
    if (error instanceof UsageError || isParseArgsError(error)) {
      io.stderr(`silly: ${error.message}\nRun "silly --help" for usage.\n`);
      return EXIT_USAGE;
    }
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(`silly: unexpected error: ${message}\n`);
    return EXIT_ERROR;
  }
}
