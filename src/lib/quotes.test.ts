import { describe, expect, it } from "vitest";
import { FACTS, getQuote, QUACKS } from "./quotes";

describe("getQuote", () => {
  it("returns a known quack and fact", () => {
    expect(getQuote("QUACKS", QUACKS, 0)).toBe("Quack!");
    expect(getQuote("FACTS", FACTS, 1)).toBe("Next.js can render on the server. This duck cannot.");
  });

  it("rejects a blank list name, empty list, non-strings, and out-of-range index", () => {
    expect(() => getQuote("", QUACKS, 0)).toThrow(
      'getQuote: "listName" must be a non-empty string, received ""',
    );
    expect(() => getQuote("QUACKS", [], 0)).toThrow(
      'getQuote: "QUACKS" must be a non-empty array of strings, received array(length 0)',
    );
    expect(() => getQuote("QUACKS", [1 as unknown as string], 0)).toThrow(
      'getQuote: "QUACKS[0]" must be a string, received 1',
    );
    expect(() => getQuote("QUACKS", "nope" as unknown as string[], 0)).toThrow(
      'getQuote: "QUACKS" must be an array of strings, received "nope"',
    );
    expect(() => getQuote("QUACKS", QUACKS, -1)).toThrow(
      'getQuote: "index" must be between 0 and 7 for "QUACKS", received -1',
    );
    expect(() => getQuote("FACTS", FACTS, 99)).toThrow(
      'getQuote: "index" must be between 0 and 7 for "FACTS", received 99',
    );
    expect(() => getQuote("FACTS", FACTS, 0.5)).toThrow(
      'getQuote: "index" must be an integer, received 0.5',
    );
  });
});
