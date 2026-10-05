// @vitest-environment node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FACTS } from "../content/facts";
import { QUACKS } from "../content/quacks";
import { version } from "../../package.json";
import { EXIT_FAILURE, EXIT_OK, EXIT_USAGE, HELP, run } from "./silly";

function invoke(argv: string[], random: () => number = () => 0) {
  let stdout = "";
  let stderr = "";
  const code = run(argv, {
    stdout: (text) => (stdout += text),
    stderr: (text) => (stderr += text),
    random,
  });
  return { code, stdout, stderr };
}

describe("run", () => {
  it.each([["--help"], ["-h"], ["help"], ["quack", "--help"]])("prints help for %s", (...argv) => {
    expect(invoke(argv)).toEqual({ code: EXIT_OK, stdout: HELP, stderr: "" });
  });

  it.each([["--version"], ["-v"]])("prints the package version for %s", (flag) => {
    expect(invoke([flag])).toEqual({ code: EXIT_OK, stdout: `${version}\n`, stderr: "" });
  });

  it("prints one quack by default", () => {
    expect(invoke(["quack"]).stdout).toBe(`${QUACKS[0]}\n`);
  });

  it("prints --count quacks without consecutive repeats", () => {
    const { code, stdout } = invoke(["quack", "--count", "5"]);
    const lines = stdout.trimEnd().split("\n");
    expect(code).toBe(EXIT_OK);
    expect(lines).toHaveLength(5);
    lines.slice(1).forEach((line, i) => expect(line).not.toBe(lines[i]));
  });

  it("accepts -n as a short form of --count", () => {
    expect(invoke(["quack", "-n", "2"]).stdout.trimEnd().split("\n")).toHaveLength(2);
  });

  it("prints a numbered fact using 1-based numbering", () => {
    expect(invoke(["fact", "1"]).stdout).toBe(`${FACTS[0]}\n`);
    expect(invoke(["fact", String(FACTS.length)]).stdout).toBe(`${FACTS[FACTS.length - 1]}\n`);
  });

  it("prints a random fact when no number is given", () => {
    expect(invoke(["fact"], () => 0.999).stdout).toBe(`${FACTS[FACTS.length - 1]}\n`);
  });

  it.each([
    ["quacks", QUACKS],
    ["facts", FACTS],
  ])("lists every %s, numbered", (name, items) => {
    const lines = invoke(["list", name]).stdout.trimEnd().split("\n");
    expect(lines).toEqual(items.map((item, i) => `${i + 1}. ${item}`));
  });

  it.each([
    [[], "missing command"],
    [["bogus"], 'unknown command "bogus"'],
    [["--nope"], "Unknown option '--nope'"],
    [["quack", "--count", "0"], '--count must be a positive integer, got "0"'],
    [["quack", "--count", "2.5"], '--count must be a positive integer, got "2.5"'],
    [["quack", "--count"], "--count"],
    [["quack", "extra"], 'unexpected argument for "quack": extra'],
    [["fact", "0"], 'fact number must be a positive integer, got "0"'],
    [["fact", String(FACTS.length + 1)], `between 1 and ${FACTS.length}`],
    [["fact", "1", "2"], 'unexpected argument for "fact": 2'],
    [["fact", "--count", "2"], '--count is only valid with "quack"'],
    [["list"], 'list expects "quacks" or "facts"'],
    [["list", "ducks"], 'list expects "quacks" or "facts"'],
  ])("rejects %j with a usage error", (argv, message) => {
    const { code, stdout, stderr } = invoke(argv);
    expect(code).toBe(EXIT_USAGE);
    expect(stdout).toBe("");
    expect(stderr).toContain(message);
    expect(stderr).toContain('Run "silly --help" for usage.');
  });

  it("reports unexpected errors on stderr and exits 1", () => {
    const { code, stdout, stderr } = invoke(["quack"], () => {
      throw new Error("entropy depleted");
    });
    expect(code).toBe(EXIT_FAILURE);
    expect(stdout).toBe("");
    expect(stderr).toBe("silly: unexpected error: entropy depleted\n");
  });
});

describe("silly executable", () => {
  const repoRoot = path.resolve(__dirname, "../..");
  const tsx = path.join(repoRoot, "node_modules/.bin/tsx");
  const exec = (...args: string[]) =>
    spawnSync(tsx, ["src/cli/main.ts", ...args], { cwd: repoRoot, encoding: "utf8" });

  it("writes output to stdout and exits 0 on success", () => {
    const result = exec("fact", "2");
    expect(result.status).toBe(EXIT_OK);
    expect(result.stdout).toBe(`${FACTS[1]}\n`);
    expect(result.stderr).toBe("");
  });

  it("writes errors to stderr and exits 2 on bad usage", () => {
    const result = exec("bogus");
    expect(result.status).toBe(EXIT_USAGE);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain('unknown command "bogus"');
  });
});
