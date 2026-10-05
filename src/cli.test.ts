import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLI_NAME,
  CLI_VERSION,
  EXIT_ERROR,
  EXIT_SUCCESS,
  EXIT_USAGE,
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
  });

  it("returns error for out-of-range index", () => {
    const result = capture(["quack", "--index", "99"]);
    expect(result.code).toBe(EXIT_ERROR);
    expect(result.stderr[0]).toMatch(/Quack index must be an integer/);
  });

  it("returns usage for invalid --index values", () => {
    const result = capture(["fact", "--index", "nope"]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr[0]).toContain("--index must be an integer");
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
    expect(result.stderr).toContain("list requires 'quacks' or 'facts'");
  });
});
