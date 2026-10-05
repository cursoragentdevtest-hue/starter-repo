import { describe, expect, it } from "vitest";
import { EXIT_OK, EXIT_USAGE, runCli } from "./run-cli";
import { QUACKS } from "@/lib/content";

function captureIo() {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    io: {
      stdout: (line: string) => stdout.push(line),
      stderr: (line: string) => stderr.push(line),
    },
    stdout: () => stdout.join("\n"),
    stderr: () => stderr.join("\n"),
  };
}

describe("runCli", () => {
  it("prints help with exit 0 when no args", () => {
    const { io, stdout } = captureIo();
    expect(runCli([], io)).toBe(EXIT_OK);
    expect(stdout()).toContain("silly-starter");
    expect(stdout()).toContain("quack");
  });

  it("prints a deterministic quack", () => {
    const { io, stdout } = captureIo();
    expect(runCli(["quack"], io, { random: () => 0 })).toBe(EXIT_OK);
    expect(stdout()).toBe(QUACKS[0]);
  });

  it("rejects extra quack arguments", () => {
    const { io, stderr } = captureIo();
    expect(runCli(["quack", "--nope"], io)).toBe(EXIT_USAGE);
    expect(stderr()).toContain("does not accept arguments");
  });

  it("prints default fact at index 0", () => {
    const { io, stdout } = captureIo();
    expect(runCli(["fact"], io)).toBe(EXIT_OK);
    expect(stdout()).toContain("zero business logic");
  });

  it("advances facts with --next", () => {
    const { io, stdout } = captureIo();
    expect(runCli(["fact", "--next", "0"], io)).toBe(EXIT_OK);
    expect(stdout()).toContain("Next.js can render");
  });

  it("lists quacks", () => {
    const { io, stdout } = captureIo();
    expect(runCli(["list", "--quacks"], io)).toBe(EXIT_OK);
    expect(stdout().split("\n")).toHaveLength(QUACKS.length);
  });

  it("returns usage for unknown command", () => {
    const { io, stderr } = captureIo();
    expect(runCli(["honk"], io)).toBe(EXIT_USAGE);
    expect(stderr()).toContain('unknown command "honk"');
  });

  it("returns usage for invalid fact index", () => {
    const { io, stderr } = captureIo();
    expect(runCli(["fact", "--index", "99"], io)).toBe(EXIT_USAGE);
    expect(stderr()).toContain("index must be");
  });
});
