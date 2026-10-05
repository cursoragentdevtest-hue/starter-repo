import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const bin = path.join(repoRoot, "bin/silly-starter.mjs");

function runBin(args: string[]) {
  return spawnSync(process.execPath, [bin, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

describe("silly-starter bin", () => {
  it("exits 0 and prints help", () => {
    const result = runBin(["help"]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Commands:");
  });

  it("exits 2 for unknown command", () => {
    const result = runBin(["nope"]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("unknown command");
  });

  it("prints a quack line", () => {
    const result = runBin(["quack"]);
    expect(result.status).toBe(0);
    expect(result.stdout.trim().length).toBeGreaterThan(0);
  });
});
