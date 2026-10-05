import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EXIT_INVALID, EXIT_OK, EXIT_USAGE, HELP_TEXT, parseArgs, run } from "./lib/cli";
import { FACTS, QUACKS } from "./lib/quotes";

const cliPath = path.join(process.cwd(), "src", "cli.ts");
const tsxBin = path.join(process.cwd(), "node_modules", ".bin", "tsx");

function invoke(args: string[]) {
  return spawnSync(tsxBin, [cliPath, ...args], {
    encoding: "utf8",
    env: process.env,
  });
}

function capture(argv: string[], random?: () => number) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const status = run(argv, {
    log: (message) => stdout.push(message),
    error: (message) => stderr.push(message),
    random,
  });
  return { status, stdout: stdout.join("\n"), stderr: stderr.join("\n") };
}

describe("silly-starter CLI (spawned entry point)", () => {
  it("prints help and exits 0", () => {
    const result = invoke(["--help"]);
    expect(result.status).toBe(EXIT_OK);
    expect(result.stdout).toContain("Usage: silly-starter");
    expect(result.stdout).toContain("Exit codes:");
    expect(result.stderr).toBe("");
  });

  it("prints a fact at --index and wraps with --next", () => {
    const fact = invoke(["fact", "--index", "0", "--json"]);
    expect(fact.status).toBe(EXIT_OK);
    expect(JSON.parse(fact.stdout)).toEqual({ index: 0, text: FACTS[0] });

    const next = invoke(["fact", "--index=7", "--next", "--json"]);
    expect(next.status).toBe(EXIT_OK);
    expect(JSON.parse(next.stdout)).toEqual({ index: 0, text: FACTS[0] });
  });

  it("prints a quack from the shared list", () => {
    const result = invoke(["quack"]);
    expect(result.status).toBe(EXIT_OK);
    expect(QUACKS).toContain(result.stdout.trim());
  });

  it("exits 1 for an unknown command and 2 for a bad --index", () => {
    const usage = invoke(["waddle"]);
    expect(usage.status).toBe(EXIT_USAGE);
    expect(usage.stderr).toContain("Unknown command: waddle");
    expect(usage.stderr).toContain("Try --help for usage.");

    const invalid = invoke(["fact", "--index", "nope"]);
    expect(invalid.status).toBe(EXIT_INVALID);
    expect(invalid.stderr).toContain("--index expects an integer");

    const missingFrom = invoke(["quack", "--from"]);
    expect(missingFrom.status).toBe(EXIT_INVALID);
    expect(missingFrom.stderr).toContain("--from requires a value");

    const mismatched = invoke(["fact", "--from", "1"]);
    expect(mismatched.status).toBe(EXIT_USAGE);
    expect(mismatched.stderr).toContain("--from is only valid with quack");
  });
});

describe("run()", () => {
  it("returns the help text for -h", () => {
    const result = capture(["-h"]);
    expect(result.status).toBe(EXIT_OK);
    expect(result.stdout).toBe(HELP_TEXT.trimEnd());
  });

  it("avoids repeating the current quack index", () => {
    const result = capture(["quack", "--from", "3", "--json"], () => 3 / 8);
    expect(result.status).toBe(EXIT_OK);
    expect(JSON.parse(result.stdout)).toEqual({ index: 4, text: QUACKS[4] });
  });

  it("rejects an out-of-range fact index", () => {
    const result = capture(["fact", "--index", "99"]);
    expect(result.status).toBe(EXIT_INVALID);
    expect(result.stderr).toContain("--index must be between 0 and 7");
  });

  it("rejects mismatched flags, missing values, and a bad --from", () => {
    expect(capture(["quack", "--next"]).status).toBe(EXIT_USAGE);
    expect(capture(["quack", "--next"]).stderr).toContain("--next is only valid with fact");
    expect(capture(["fact", "--from", "0"]).stderr).toContain("--from is only valid with quack");
    expect(capture(["quack", "--index", "1"]).stderr).toContain("--index is only valid with fact");
    expect(capture(["quack", "--from"]).stderr).toContain("--from requires a value");
    expect(capture(["quack", "--from="]).stderr).toContain("--from requires a value");
    expect(capture(["quack", "--from", "99"]).stderr).toContain(
      "--from must be -1 (any quack) or between 0 and 7, received 99",
    );
    expect(capture(["quack", "fact"]).stderr).toContain("Unexpected extra command: fact");
    expect(capture(["--bogus"]).stderr).toContain("Unknown option: --bogus");
    expect(capture([]).stderr).toContain("Missing command. Expected quack or fact.");
  });

  it("rejects a non-array argv and an incomplete io object", () => {
    const viaRun = capture("quack" as unknown as string[]);
    expect(viaRun.status).toBe(EXIT_INVALID);
    expect(viaRun.stderr).toContain('parseArgs: "argv" must be an array of strings, received "quack"');

    expect(() => run(["help"], { log: "nope" } as unknown as { log: (m: string) => void; error: (m: string) => void })).toThrow(
      'run: "io.log" must be a function, received "nope"',
    );
    expect(() => run(["help"], null as unknown as { log: (m: string) => void; error: (m: string) => void })).toThrow(
      'run: "io" must be an object, received null',
    );
  });
});

describe("parseArgs()", () => {
  it("throws when argv is not an array of strings", () => {
    expect(() => parseArgs(undefined as unknown as string[])).toThrow(
      'parseArgs: "argv" must be an array of strings, received undefined',
    );
    expect(() => parseArgs([1 as unknown as string])).toThrow(
      'parseArgs: "argv[0]" must be a string, received 1',
    );
  });
});
