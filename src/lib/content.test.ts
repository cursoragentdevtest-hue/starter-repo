import { describe, expect, it } from "vitest";
import { ValidationError } from "./assert";
import { getFactAt, getQuackAt } from "./content";

describe("getFactAt", () => {
  it("returns the fact at a valid index", () => {
    expect(getFactAt(0)).toContain("zero business logic");
  });

  it("rejects out-of-range indices", () => {
    expect(() => getFactAt(99)).toThrow(ValidationError);
    expect(() => getFactAt(99)).toThrow(/between 0 and/);
  });

  it("rejects non-integer indices", () => {
    expect(() => getFactAt(1.5)).toThrow(/non-negative integer/);
  });
});

describe("getQuackAt", () => {
  it("returns the quack at a valid index", () => {
    expect(getQuackAt(0)).toBe("Quack!");
  });

  it("rejects negative indices", () => {
    expect(() => getQuackAt(-1)).toThrow(/non-negative integer/);
  });
});
