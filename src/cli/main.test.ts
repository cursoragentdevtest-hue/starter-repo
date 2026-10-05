// @vitest-environment node
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { version } from "../../package.json";
import { FACTS } from "../lib/facts";
import { QUACKS } from "../lib/quacks";

const root = path.resolve(__dirname, "../..");
const tsx = path.join(root, "node_modules", ".bin", "tsx");
const entry = path.join(root, "src", "cli", "main.ts");

function silly(...args: string[]) {
  const result = spawnSync(tsx, [entry, ...args], { encoding: "utf8" });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe("silly CLI process", { timeout: 20_000 }, () => {
  test("--help exits 0 with usage on stdout", () => {
    const result = silly("--help");
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^Usage: silly <command>/);
    expect(result.stderr).toBe("");
  });

  test("--version prints the package version", () => {
    expect(silly("--version")).toEqual({ status: 0, stdout: `${version}\n`, stderr: "" });
  });

  test("quack --count 3 prints three quacks", () => {
    const result = silly("quack", "--count", "3");
    const quacks = result.stdout.trimEnd().split("\n");

    expect(result.status).toBe(0);
    expect(quacks).toHaveLength(3);
    for (const quack of quacks) expect(QUACKS).toContain(quack);
  });

  test("fact --index 2 prints the second fact", () => {
    expect(silly("fact", "--index", "2")).toEqual({ status: 0, stdout: `${FACTS[1]}\n`, stderr: "" });
  });

  test("usage errors exit 2 with a message on stderr", () => {
    const result = silly("quack", "--count", "zero");
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("--count must be a whole number");
  });

  test("no arguments exits 2 with usage on stderr", () => {
    const result = silly();
    expect(result.status).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/^Usage: silly <command>/);
  });
});
