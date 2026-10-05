import { parseArgs } from "node:util";
import { nextCircularIndex, pickRandomElement } from "@/lib/arrays";
import { FACTS, QUACKS } from "@/lib/content";

export const EXIT_OK = 0;
export const EXIT_ERROR = 1;
export const EXIT_USAGE = 2;

export type CliIO = {
  stdout: (line: string) => void;
  stderr: (line: string) => void;
};

export type CliOptions = {
  random?: () => number;
};

const HELP_TEXT = `silly-starter — duck wisdom and silly facts from the terminal

Usage:
  silly-starter <command> [options]

Commands:
  quack                 Print a random duck wisdom line
  fact                  Print a silly fact
  list                  Print all quacks or facts (one per line)
  help                  Show this help message

Options for fact:
  --index <n>           Fact index (0-${FACTS.length - 1}). Default: 0
  --next <n>            Print the fact after index <n> (carousel step)

Options for list:
  --quacks              List all quack lines
  --facts               List all silly facts

Exit codes:
  0  Success
  1  Runtime error
  2  Invalid usage
`;

function printHelp(io: CliIO): number {
  io.stdout(HELP_TEXT.trimEnd());
  return EXIT_OK;
}

function parseFactIndex(raw: string, io: CliIO): number | null {
  const index = Number.parseInt(raw, 10);
  if (!Number.isInteger(index) || index < 0 || index >= FACTS.length) {
    io.stderr(`error: index must be an integer from 0 to ${FACTS.length - 1}`);
    return null;
  }
  return index;
}

function runQuack(io: CliIO, options: CliOptions): number {
  const line = pickRandomElement(QUACKS, options.random);
  io.stdout(line);
  return EXIT_OK;
}

function runFact(
  args: string[],
  io: CliIO,
): number {
  const { values } = parseArgs({
    args,
    options: {
      index: { type: "string" },
      next: { type: "string" },
    },
    allowPositionals: false,
    strict: true,
  });

  if (values.next !== undefined) {
    if (values.index !== undefined) {
      io.stderr("error: use either --index or --next, not both");
      return EXIT_USAGE;
    }
    const current = parseFactIndex(values.next, io);
    if (current === null) {
      return EXIT_USAGE;
    }
    const next = nextCircularIndex(current, FACTS.length);
    io.stdout(FACTS[next]);
    return EXIT_OK;
  }

  const index =
    values.index === undefined ? 0 : parseFactIndex(values.index, io);
  if (index === null) {
    return EXIT_USAGE;
  }
  io.stdout(FACTS[index]);
  return EXIT_OK;
}

function runList(args: string[], io: CliIO): number {
  const { values } = parseArgs({
    args,
    options: {
      quacks: { type: "boolean" },
      facts: { type: "boolean" },
    },
    allowPositionals: false,
    strict: true,
  });

  const showQuacks = values.quacks === true;
  const showFacts = values.facts === true;

  if (showQuacks === showFacts) {
    io.stderr("error: list requires exactly one of --quacks or --facts");
    return EXIT_USAGE;
  }

  const lines = showQuacks ? QUACKS : FACTS;
  for (const line of lines) {
    io.stdout(line);
  }
  return EXIT_OK;
}

/** Run the CLI; returns a process exit code. */
export function runCli(
  argv: string[],
  io: CliIO,
  options: CliOptions = {},
): number {
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "--help" || argv[0] === "-h") {
    return printHelp(io);
  }

  const [command, ...rest] = argv;

  try {
    switch (command) {
      case "quack":
        if (rest.length > 0) {
          io.stderr("error: quack does not accept arguments");
          return EXIT_USAGE;
        }
        return runQuack(io, options);
      case "fact":
        return runFact(rest, io);
      case "list":
        return runList(rest, io);
      default:
        io.stderr(`error: unknown command "${command}"`);
        io.stderr('Run "silly-starter help" for usage.');
        return EXIT_USAGE;
    }
  } catch (err) {
    const code =
      err instanceof Error && "code" in err && err.code === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE"
        ? EXIT_USAGE
        : err instanceof Error &&
            "code" in err &&
            typeof err.code === "string" &&
            err.code.startsWith("ERR_PARSE_ARGS")
          ? EXIT_USAGE
          : EXIT_ERROR;
    const message = err instanceof Error ? err.message : String(err);
    io.stderr(`error: ${message}`);
    return code;
  }
}
