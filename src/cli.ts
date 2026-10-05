#!/usr/bin/env node
import { parseArgs } from "node:util";
import {
  FACTS,
  QUACKS,
  getFact,
  getQuack,
  pickFact,
  pickQuack,
} from "./lib/catalog";

export const EXIT_SUCCESS = 0;
export const EXIT_ERROR = 1;
export const EXIT_USAGE = 2;

export const CLI_NAME = "silly";
export const CLI_VERSION = "0.1.0";

export type CliIo = {
  stdout: (line: string) => void;
  stderr: (line: string) => void;
};

const defaultIo: CliIo = {
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
};

export function helpText(): string {
  return `Silly Starter™ CLI — quacks and facts without a browser

Usage:
  ${CLI_NAME} <command> [options]

Commands:
  quack              Print a random duck quack
  fact               Print a random silly fact
  list <quacks|facts>
                     Print the full catalog, one entry per line
  help               Show this help
  version            Show CLI version

Options:
  -i, --index <n>    Select a specific catalog entry (quack/fact)
  -h, --help         Show this help
  -v, --version      Show CLI version

Exit codes:
  0  Success
  1  Runtime / lookup error
  2  Usage error (bad args or unknown command)

Examples:
  ${CLI_NAME} quack
  ${CLI_NAME} quack --index 0
  ${CLI_NAME} fact -i 2
  ${CLI_NAME} list facts
`;
}

function parseIndex(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    throw new UsageError(`--index must be an integer (got ${raw})`);
  }
  return value;
}

export class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

export function runCli(
  argv: string[],
  io: CliIo = defaultIo,
): number {
  let values: {
    help?: boolean;
    version?: boolean;
    index?: string;
  };
  let positionals: string[];

  try {
    const parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: {
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false },
        index: { type: "string", short: "i" },
      },
    });
    values = parsed.values;
    positionals = parsed.positionals;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(message);
    io.stderr(`Try '${CLI_NAME} --help' for usage.`);
    return EXIT_USAGE;
  }

  if (values.help) {
    io.stdout(helpText());
    return EXIT_SUCCESS;
  }

  if (values.version) {
    io.stdout(`${CLI_NAME} ${CLI_VERSION}`);
    return EXIT_SUCCESS;
  }

  const [command, subject] = positionals;

  if (!command || command === "help") {
    io.stdout(helpText());
    return command ? EXIT_SUCCESS : EXIT_USAGE;
  }

  if (command === "version") {
    io.stdout(`${CLI_NAME} ${CLI_VERSION}`);
    return EXIT_SUCCESS;
  }

  try {
    const index = parseIndex(values.index);

    switch (command) {
      case "quack": {
        if (subject !== undefined) {
          throw new UsageError(`Unexpected argument '${subject}'`);
        }
        io.stdout(index === undefined ? pickQuack() : getQuack(index));
        return EXIT_SUCCESS;
      }
      case "fact": {
        if (subject !== undefined) {
          throw new UsageError(`Unexpected argument '${subject}'`);
        }
        io.stdout(index === undefined ? pickFact() : getFact(index));
        return EXIT_SUCCESS;
      }
      case "list": {
        if (index !== undefined) {
          throw new UsageError("list does not accept --index");
        }
        if (subject === "quacks") {
          for (const quack of QUACKS) io.stdout(quack);
          return EXIT_SUCCESS;
        }
        if (subject === "facts") {
          for (const fact of FACTS) io.stdout(fact);
          return EXIT_SUCCESS;
        }
        throw new UsageError("list requires 'quacks' or 'facts'");
      }
      default:
        throw new UsageError(`Unknown command '${command}'`);
    }
  } catch (error) {
    if (error instanceof UsageError) {
      io.stderr(error.message);
      io.stderr(`Try '${CLI_NAME} --help' for usage.`);
      return EXIT_USAGE;
    }
    if (error instanceof RangeError) {
      io.stderr(error.message);
      return EXIT_ERROR;
    }
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(message);
    return EXIT_ERROR;
  }
}

function isDirectExecution(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  return (
    entry.endsWith("/cli.ts") ||
    entry.endsWith("\\cli.ts") ||
    entry.endsWith("/cli.js") ||
    entry.endsWith("\\cli.js") ||
    entry.includes("src/cli")
  );
}

if (isDirectExecution()) {
  process.exitCode = runCli(process.argv.slice(2));
}
