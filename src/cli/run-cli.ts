import { ValidationError } from "@/lib/assert";
import { parseArgs } from "node:util";
import { nextCircularIndex, pickRandomElement } from "@/lib/arrays";
import { FACTS, QUACKS, getFactAt } from "@/lib/content";

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
  const trimmed = raw.trim();
  if (trimmed.length === 0 || !/^-?\d+$/.test(trimmed)) {
    io.stderr(
      `error: index must be an integer from 0 to ${FACTS.length - 1}, received ${JSON.stringify(raw)}`,
    );
    return null;
  }
  return Number.parseInt(trimmed, 10);
}

function validateFactIndex(index: number, io: CliIO): number | null {
  try {
    getFactAt(index);
    return index;
  } catch (err) {
    const message =
      err instanceof ValidationError
        ? err.message.replace(/^getFactAt: /, "")
        : err instanceof Error
          ? err.message
          : String(err);
    io.stderr(`error: ${message}`);
    return null;
  }
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
    const parsed = parseFactIndex(values.next, io);
    if (parsed === null) {
      return EXIT_USAGE;
    }
    const current = validateFactIndex(parsed, io);
    if (current === null) {
      return EXIT_USAGE;
    }
    const next = nextCircularIndex(current, FACTS.length);
    io.stdout(getFactAt(next));
    return EXIT_OK;
  }

  if (values.index === undefined) {
    io.stdout(getFactAt(0));
    return EXIT_OK;
  }
  const parsed = parseFactIndex(values.index, io);
  if (parsed === null) {
    return EXIT_USAGE;
  }
  const index = validateFactIndex(parsed, io);
  if (index === null) {
    return EXIT_USAGE;
  }
  io.stdout(getFactAt(index));
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

function validateCliIo(io: CliIO): void {
  if (io === null || typeof io !== "object") {
    throw new ValidationError("runCli", "io must be an object with stdout and stderr");
  }
  if (typeof io.stdout !== "function" || typeof io.stderr !== "function") {
    throw new ValidationError(
      "runCli",
      "io.stdout and io.stderr must be functions",
    );
  }
}

function validateArgv(argv: unknown): string[] {
  if (!Array.isArray(argv)) {
    throw new ValidationError("runCli", "argv must be an array of strings");
  }
  for (let i = 0; i < argv.length; i++) {
    if (typeof argv[i] !== "string") {
      throw new ValidationError("runCli", `argv[${i}] must be a string`);
    }
  }
  return argv;
}

function validateCliOptions(options: CliOptions): CliOptions {
  if (options === null || typeof options !== "object") {
    throw new ValidationError("runCli", "options must be an object");
  }
  if (options.random !== undefined && typeof options.random !== "function") {
    throw new ValidationError("runCli", "options.random must be a function when provided");
  }
  return options;
}

/** Run the CLI; returns a process exit code. */
export function runCli(
  argv: string[],
  io: CliIO,
  options: CliOptions = {},
): number {
  try {
    validateCliIo(io);
    const safeArgv = validateArgv(argv);
    const safeOptions = validateCliOptions(options);

    if (
      safeArgv.length === 0 ||
      safeArgv[0] === "help" ||
      safeArgv[0] === "--help" ||
      safeArgv[0] === "-h"
    ) {
      return printHelp(io);
    }

    const [command, ...rest] = safeArgv;
    switch (command) {
      case "quack":
        if (rest.length > 0) {
          io.stderr("error: quack does not accept arguments");
          return EXIT_USAGE;
        }
        return runQuack(io, safeOptions);
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
      err instanceof ValidationError
        ? EXIT_ERROR
        : err instanceof Error && "code" in err && err.code === "ERR_PARSE_ARGS_INVALID_OPTION_VALUE"
          ? EXIT_USAGE
          : err instanceof Error &&
              "code" in err &&
              typeof err.code === "string" &&
              err.code.startsWith("ERR_PARSE_ARGS")
            ? EXIT_USAGE
            : EXIT_ERROR;
    const message = err instanceof Error ? err.message : String(err);
    if (typeof io?.stderr === "function") {
      io.stderr(`error: ${message}`);
    }
    return code;
  }
}
