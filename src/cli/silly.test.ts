// @vitest-environment node
import { describe, expect, test } from "vitest";
import { version } from "../../package.json";
import { FACTS } from "../lib/facts";
import { QUACKS } from "../lib/quacks";
import {
  EXIT_ERROR,
  EXIT_OK,
  EXIT_USAGE,
  FACT_HELP,
  HELP,
  MAX_QUACKS,
  QUACK_HELP,
  run,
  type CliIO,
} from "./silly";

function runCli(argv: string[], overrides: Partial<CliIO> = {}) {
  let stdout = "";
  let stderr = "";
  const code = run(argv, {
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
    ...overrides,
  });
  return { code, stdout, stderr };
}

function lines(text: string) {
  return text.trimEnd().split("\n");
}

describe("help and version", () => {
  test.each([["--help"], ["-h"], ["help"]])("%s prints usage to stdout", (flag) => {
    expect(runCli([flag])).toEqual({ code: EXIT_OK, stdout: HELP, stderr: "" });
  });

  test("no arguments prints usage to stderr and fails", () => {
    expect(runCli([])).toEqual({ code: EXIT_USAGE, stdout: "", stderr: HELP });
  });

  test.each([["--version"], ["-v"]])("%s prints the package version", (flag) => {
    expect(runCli([flag])).toEqual({ code: EXIT_OK, stdout: `${version}\n`, stderr: "" });
  });

  test.each([
    [["help", "quack"], QUACK_HELP],
    [["quack", "--help"], QUACK_HELP],
    [["help", "fact"], FACT_HELP],
    [["fact", "-h"], FACT_HELP],
  ])("%j prints command help", (argv, expected) => {
    expect(runCli(argv)).toEqual({ code: EXIT_OK, stdout: expected, stderr: "" });
  });

  test.each([["toString"], ["nope"]])("help for unknown command %s fails", (topic) => {
    const result = runCli(["help", topic]);
    expect(result.code).toBe(EXIT_USAGE);
    expect(result.stderr).toContain(`unknown command "${topic}"`);
  });
});

describe("quack", () => {
  test("prints one quack by default", () => {
    const result = runCli(["quack"]);
    expect(result.code).toBe(EXIT_OK);
    expect(lines(result.stdout)).toHaveLength(1);
    expect(QUACKS).toContain(lines(result.stdout)[0]);
  });

  test("--count prints that many quacks without consecutive repeats", () => {
    const result = runCli(["quack", "--count", "5"], { random: () => 0 });
    const quacks = lines(result.stdout);

    expect(result.code).toBe(EXIT_OK);
    expect(quacks).toHaveLength(5);
    for (let i = 0; i < quacks.length; i++) {
      expect(QUACKS).toContain(quacks[i]);
      if (i > 0) expect(quacks[i]).not.toBe(quacks[i - 1]);
    }
  });

  test("accepts the maximum count via the short flag", () => {
    expect(lines(runCli(["quack", "-n", String(MAX_QUACKS)]).stdout)).toHaveLength(MAX_QUACKS);
  });

  test.each([["0"], [String(MAX_QUACKS + 1)], ["abc"], ["1.5"], [""]])("rejects --count %j", (count) => {
    const result = runCli(["quack", `--count=${count}`]);
    expect(result).toMatchObject({ code: EXIT_USAGE, stdout: "" });
    expect(result.stderr).toContain(`--count must be a whole number from 1 to ${MAX_QUACKS}`);
  });

  test("rejects --count without a value", () => {
    expect(runCli(["quack", "--count"])).toMatchObject({ code: EXIT_USAGE, stdout: "" });
  });
});

describe("fact", () => {
  test("prints a random fact", () => {
    expect(runCli(["fact"], { random: () => 0.999 })).toEqual({
      code: EXIT_OK,
      stdout: `${FACTS[FACTS.length - 1]}\n`,
      stderr: "",
    });
  });

  test("--index prints the numbered fact, counting from 1", () => {
    expect(runCli(["fact", "--index", "3"]).stdout).toBe(`${FACTS[2]}\n`);
    expect(runCli(["fact", "-i", "1"]).stdout).toBe(`${FACTS[0]}\n`);
  });

  test("--all prints every fact, numbered", () => {
    const result = runCli(["fact", "--all"]);
    expect(result.code).toBe(EXIT_OK);
    expect(lines(result.stdout)).toEqual(FACTS.map((fact, i) => `${i + 1}. ${fact}`));
  });

  test.each([["0"], [String(FACTS.length + 1)], ["two"]])("rejects --index %j", (index) => {
    const result = runCli(["fact", "--index", index]);
    expect(result).toMatchObject({ code: EXIT_USAGE, stdout: "" });
    expect(result.stderr).toContain(`--index must be a whole number from 1 to ${FACTS.length}`);
  });

  test("rejects --index together with --all", () => {
    const result = runCli(["fact", "--all", "--index", "1"]);
    expect(result).toMatchObject({ code: EXIT_USAGE, stdout: "" });
    expect(result.stderr).toContain("--index and --all cannot be used together");
  });
});

describe("errors", () => {
  test("unknown command fails with a hint", () => {
    expect(runCli(["moo"])).toEqual({
      code: EXIT_USAGE,
      stdout: "",
      stderr: 'silly: unknown command "moo"\nRun "silly --help" for usage.\n',
    });
  });

  test.each([[["quack", "--loud"]], [["fact", "extra"]], [["--help", "quack"]], [["help", "quack", "extra"]]])(
    "%j is a usage error",
    (argv) => {
      const result = runCli(argv);
      expect(result).toMatchObject({ code: EXIT_USAGE, stdout: "" });
      expect(result.stderr).toContain('Run "silly --help" for usage.');
    },
  );

  test("unexpected failures exit with code 1", () => {
    const result = runCli(["quack"], {
      stdout: () => {
        throw new Error("disk full");
      },
    });
    expect(result).toEqual({ code: EXIT_ERROR, stdout: "", stderr: "silly: unexpected error: disk full\n" });
  });
});
