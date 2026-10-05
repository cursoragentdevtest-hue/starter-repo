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

function describeValue(value: unknown): string {
  if (typeof value === "string") return `string ${JSON.stringify(value)}`;
  if (Array.isArray(value)) return `array(length=${value.length})`;
  if (value === null) return "null";
  return `${typeof value}`;
}

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
  if (raw.trim() === "") {
    throw new UsageError("--index requires an integer value");
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    throw new UsageError(`--index must be an integer (got ${JSON.stringify(raw)})`);
  }
  return value;
}

export class UsageError extends Error {
  constructor(message: string) {
    if (typeof message !== "string" || message.trim() === "") {
      throw new TypeError(
        `UsageError message must be a non-empty string (got ${describeValue(message)})`,
      );
    }
    super(message);
    this.name = "UsageError";
  }
}

function assertArgv(argv: unknown): asserts argv is string[] {
  if (!Array.isArray(argv)) {
    throw new TypeError(
      `runCli(argv, io): argv must be an array of strings (got ${describeValue(argv)})`,
    );
  }
  for (let i = 0; i < argv.length; i += 1) {
    if (typeof argv[i] !== "string") {
      throw new TypeError(
        `runCli(argv, io): argv[${i}] must be a string (got ${describeValue(argv[i])})`,
      );
    }
  }
}

function assertIo(io: unknown): asserts io is CliIo {
  if (io === null || typeof io !== "object") {
    throw new TypeError(
      `runCli(argv, io): io must be an object with stdout/stderr functions (got ${describeValue(io)})`,
    );
  }
  const candidate = io as Partial<CliIo>;
  if (typeof candidate.stdout !== "function") {
    throw new TypeError(
      `runCli(argv, io): io.stdout must be a function (got ${describeValue(candidate.stdout)})`,
    );
  }
  if (typeof candidate.stderr !== "function") {
    throw new TypeError(
      `runCli(argv, io): io.stderr must be a function (got ${describeValue(candidate.stderr)})`,
    );
  }
}

export function runCli(
  argv: string[],
  io: CliIo = defaultIo,
): number {
  assertArgv(argv);
  assertIo(io);

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

  const [command, subject, extra] = positionals;

  if (!command || command === "help") {
    if (command === "help" && subject !== undefined) {
      io.stderr(`Unexpected argument '${subject}'`);
      io.stderr(`Try '${CLI_NAME} --help' for usage.`);
      return EXIT_USAGE;
    }
    io.stdout(helpText());
    return command ? EXIT_SUCCESS : EXIT_USAGE;
  }

  if (command === "version") {
    if (subject !== undefined) {
      io.stderr(`Unexpected argument '${subject}'`);
      io.stderr(`Try '${CLI_NAME} --help' for usage.`);
      return EXIT_USAGE;
    }
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
        if (extra !== undefined) {
          throw new UsageError(`Unexpected argument '${extra}'`);
        }
        if (subject === "quacks") {
          for (const quack of QUACKS) io.stdout(quack);
          return EXIT_SUCCESS;
        }
        if (subject === "facts") {
          for (const fact of FACTS) io.stdout(fact);
          return EXIT_SUCCESS;
        }
        throw new UsageError(
          "list requires exactly one catalog name: 'quacks' or 'facts'",
        );
      }
      default:
        throw new UsageError(
          `Unknown command '${command}'. Expected quack, fact, list, help, or version.`,
        );
    }
  } catch (error) {
    if (error instanceof UsageError) {
      io.stderr(error.message);
      io.stderr(`Try '${CLI_NAME} --help' for usage.`);
      return EXIT_USAGE;
    }
    if (error instanceof TypeError || error instanceof RangeError) {
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
