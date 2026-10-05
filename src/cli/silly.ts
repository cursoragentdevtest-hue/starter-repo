import { parseArgs } from "node:util";
import { FACTS } from "../content/facts";
import { QUACKS } from "../content/quacks";
import { pickDifferent, pickRandom } from "../lib/random";
import { version } from "../../package.json";

export const EXIT_OK = 0;
export const EXIT_FAILURE = 1;
export const EXIT_USAGE = 2;
export const MAX_COUNT = 100;

export const HELP = `Usage: silly <command> [options]

Commands:
  quack [-n, --count N]    Print N random quacks (default 1, max ${MAX_COUNT}), never the same twice in a row
  fact [N]                 Print silly fact number N (1-${FACTS.length}), or a random one
  list <quacks|facts>      Print every quack or fact, numbered
  help                     Show this help

Options:
  -h, --help               Show this help
  -v, --version            Show the version

Exit codes:
  0  success
  1  unexpected error
  2  invalid usage (unknown command, bad option or argument)
`;

export interface CliIO {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
  random?: () => number;
}

class UsageError extends Error {}

const COLLECTIONS: Record<string, readonly string[]> = {
  quacks: QUACKS,
  facts: FACTS,
};

function parsePositiveInt(value: string, what: string): number {
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new UsageError(`${what} must be a positive integer, got "${value}"`);
  }
  return Number(value);
}

function assertValidCall(argv: unknown, io: unknown): asserts io is CliIO {
  if (!Array.isArray(argv)) {
    throw new TypeError(`run: argv must be an array of strings, got ${typeof argv}`);
  }
  const badIndex = argv.findIndex((arg) => typeof arg !== "string");
  if (badIndex !== -1) {
    throw new TypeError(
      `run: argv[${badIndex}] must be a string, got ${typeof argv[badIndex]}`,
    );
  }
  if (typeof io !== "object" || io === null) {
    throw new TypeError(`run: io must be an object with stdout and stderr functions`);
  }
  const { stdout, stderr, random } = io as Record<string, unknown>;
  for (const [name, value] of [["stdout", stdout], ["stderr", stderr]] as const) {
    if (typeof value !== "function") {
      throw new TypeError(`run: io.${name} must be a function, got ${typeof value}`);
    }
  }
  if (random !== undefined && typeof random !== "function") {
    throw new TypeError(`run: io.random must be a function when provided, got ${typeof random}`);
  }
}

function expectArgs(command: string, args: string[], max: number) {
  if (args.length > max) {
    throw new UsageError(`unexpected argument for "${command}": ${args[max]}`);
  }
}

function execute(argv: string[], io: CliIO): number {
  const random = io.random ?? Math.random;
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      count: { type: "string", short: "n" },
    },
  });

  if (values.help) {
    io.stdout(HELP);
    return EXIT_OK;
  }
  if (values.version) {
    io.stdout(`${version}\n`);
    return EXIT_OK;
  }

  const [command, ...args] = positionals;
  if (command !== "quack" && values.count !== undefined) {
    throw new UsageError(`--count is only valid with "quack"`);
  }

  switch (command) {
    case undefined:
      throw new UsageError("missing command");
    case "help":
      expectArgs(command, args, 0);
      io.stdout(HELP);
      return EXIT_OK;
    case "quack": {
      expectArgs(command, args, 0);
      const count = values.count === undefined ? 1 : parsePositiveInt(values.count, "--count");
      if (count > MAX_COUNT) {
        throw new UsageError(`--count must be at most ${MAX_COUNT}, got ${values.count}`);
      }
      let quack = "";
      const lines: string[] = [];
      for (let i = 0; i < count; i++) {
        quack = pickDifferent(QUACKS, quack, random);
        lines.push(quack);
      }
      io.stdout(`${lines.join("\n")}\n`);
      return EXIT_OK;
    }
    case "fact": {
      expectArgs(command, args, 1);
      if (args.length === 0) {
        io.stdout(`${pickRandom(FACTS, random)}\n`);
        return EXIT_OK;
      }
      const n = parsePositiveInt(args[0], "fact number");
      if (n > FACTS.length) {
        throw new UsageError(`fact number must be between 1 and ${FACTS.length}, got ${n}`);
      }
      io.stdout(`${FACTS[n - 1]}\n`);
      return EXIT_OK;
    }
    case "list": {
      expectArgs(command, args, 1);
      const name = args[0];
      if (name === undefined || !Object.hasOwn(COLLECTIONS, name)) {
        throw new UsageError(
          `list expects "quacks" or "facts", got ${name === undefined ? "nothing" : `"${name}"`}`,
        );
      }
      const items = COLLECTIONS[name];
      io.stdout(items.map((item, i) => `${i + 1}. ${item}`).join("\n") + "\n");
      return EXIT_OK;
    }
    default:
      throw new UsageError(`unknown command "${command}"`);
  }
}

function isParseArgsError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    typeof (error as NodeJS.ErrnoException).code === "string" &&
    (error as NodeJS.ErrnoException).code!.startsWith("ERR_PARSE_ARGS_")
  );
}

export function run(argv: string[], io: CliIO): number {
  assertValidCall(argv, io);
  try {
    return execute(argv, io);
  } catch (error) {
    if (error instanceof UsageError || isParseArgsError(error)) {
      io.stderr(`silly: ${error.message}\nRun "silly --help" for usage.\n`);
      return EXIT_USAGE;
    }
    io.stderr(`silly: unexpected error: ${error instanceof Error ? error.message : String(error)}\n`);
    return EXIT_FAILURE;
  }
}
