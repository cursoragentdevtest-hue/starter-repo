import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLI_NAME,
  CLI_VERSION,
  EXIT_ERROR,
  EXIT_SUCCESS,
  EXIT_USAGE,
  UsageError,
  helpText,
  runCli,
} from "./cli";
import { FACTS, QUACKS } from "./lib/catalog";

function capture(argv: string[]) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const code = runCli(argv, {
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
  });
  return { code, stdout, stderr };
}

describe("runCli", () => {
  it("prints help and exits 0 for --help", () => {
    const result = capture(["--help"]);
    expect(result.code).toBe(EXIT_SUCCESS);
    expect(result.stdout).toEqual([helpText()]);
  });

  it("prints version and exits 0 for --version", () => {
    const result = capture(["--version"]);
    expect(result.code).toBe(EXIT_SUCCESS);
    expect(result.stdout).toEqual([`${CLI_NAME} ${CLI_VERSION}`]);
  });

  it("returns usage exit code when no command is given", () => {
    const result = capture([]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stdout.join("\n")).toContain("Usage:");
  });

  it("prints a specific quack by index", () => {
    const result = capture(["quack", "--index", "0"]);
    expect(result.code).toBe(EXIT_SUCCESS);
    expect(result.stdout).toEqual([QUACKS[0]]);
  });

  it("prints a specific fact by short index flag", () => {
    const result = capture(["fact", "-i", "2"]);
    expect(result.code).toBe(EXIT_SUCCESS);
    expect(result.stdout).toEqual([FACTS[2]]);
  });

  it("lists the quack catalog", () => {
    const result = capture(["list", "quacks"]);
    expect(result.code).toBe(EXIT_SUCCESS);
    expect(result.stdout).toEqual([...QUACKS]);
  });

  it("lists the fact catalog", () => {
    const result = capture(["list", "facts"]);
    expect(result.code).toBe(EXIT_SUCCESS);
    expect(result.stdout).toEqual([...FACTS]);
  });

  it("returns usage for unknown commands", () => {
    const result = capture(["dance"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toContain("Unknown command 'dance'");
    expect(result.stderr[0]).toContain("Expected quack, fact, list, help, or version");
  });

  it("returns error for out-of-range index", () => {
    const result = capture(["quack", "--index", "99"]);
    expect(result.code).toBe(EXIT_ERROR);
    expect(result.stderr[0]).toContain("Quack index out of range");
  });

  it("returns usage for invalid --index values", () => {
    const result = capture(["fact", "--index", "nope"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toContain("--index must be an integer");
  });
});

describe("runCli error paths", () => {
  it("throws TypeError when argv is not a string array", () => {
    expect(() => runCli("quack" as unknown as string[])).toThrow(TypeError);
    expect(() => runCli("quack" as unknown as string[])).toThrow(
      /argv must be an array of strings/,
    );
  });

  it("throws TypeError when argv contains a non-string entry", () => {
    expect(() => runCli(["quack", 1 as unknown as string])).toThrow(
      /argv\[1\] must be a string/,
    );
  });

  it("throws TypeError when io is missing writers", () => {
    expect(() =>
      runCli(["quack"], { stdout: () => undefined } as unknown as {
        stdout: (line: string) => void;
        stderr: (line: string) => void;
      }),
    ).toThrow(/io\.stderr must be a function/);
  });

  it("returns usage for an empty --index value", () => {
    const result = capture(["quack", "--index", ""]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toBe("--index requires an integer value");
  });

  it("returns usage for unexpected list extras", () => {
    const result = capture(["list", "facts", "extra"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toContain("Unexpected argument 'extra'");
  });

  it("returns usage when list is missing its catalog name", () => {
    const result = capture(["list"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toContain(
      "list requires exactly one catalog name: 'quacks' or 'facts'",
    );
  });

  it("returns usage when list is given --index", () => {
    const result = capture(["list", "quacks", "--index", "0"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toBe("list does not accept --index");
  });

  it("returns usage for unknown flags from parseArgs", () => {
    const result = capture(["quack", "--loud"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr.join("\n")).toMatch(/unknown|Unexpected/i);
    expect(result.stderr.join("\n")).toContain(`Try '${CLI_NAME} --help'`);
  });

  it("rejects empty UsageError messages", () => {
    expect(() => new UsageError("")).toThrow(TypeError);
    expect(() => new UsageError("   ")).toThrow(/non-empty string/);
  });
});

describe("cli process entry", () => {
  it("invokes the CLI script and exits 0 for a quack", () => {
    const cliPath = path.resolve(__dirname, "cli.ts");
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", cliPath, "quack", "--index", "1"],
      {
        encoding: "utf8",
        env: { ...process.env },
      },
    );

    expect(result.status).toBe(EXIT_SUCCESS);
    expect(result.stdout.trim()).toBe(QUACKS[1]);
    expect(result.stderr).toBe("");
  });

  it("invokes the CLI script and exits with usage for bad args", () => {
    const cliPath = path.resolve(__dirname, "cli.ts");
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", cliPath, "list"],
      {
        encoding: "utf8",
        env: { ...process.env },
      },
    );

    expect(result.status).toBe(EXIT_USAGE);
    expect(result.stderr).toContain(
      "list requires exactly one catalog name: 'quacks' or 'facts'",
    );
  });
});
