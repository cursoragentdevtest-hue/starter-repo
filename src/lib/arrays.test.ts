import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "./assert";
import { nextCircularIndex, pickRandomElement } from "./arrays";

describe("nextCircularIndex", () => {
  it("wraps to zero after the last index", () => {
    expect(nextCircularIndex(7, 8)).toBe(0);
  });

  it("advances within range", () => {
    expect(nextCircularIndex(2, 5)).toBe(3);
  });

  it("rejects non-positive length", () => {
    expect(() => nextCircularIndex(0, 0)).toThrow(ValidationError);
    expect(() => nextCircularIndex(0, 0)).toThrow(/length must be a positive integer/);
  });

  it("rejects fractional length", () => {
    expect(() => nextCircularIndex(0, 2.5)).toThrow(/length must be a positive integer/);
  });

  it("rejects out-of-range current index", () => {
    expect(() => nextCircularIndex(3, 3)).toThrow(/current must be an integer from 0 to 2/);
  });

  it("rejects negative current index", () => {
    expect(() => nextCircularIndex(-1, 3)).toThrow(/current must be an integer/);
  });
});

describe("pickRandomElement", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the only element for a singleton array", () => {
    expect(pickRandomElement(["solo"])).toBe("solo");
  });

  it("uses Math.random to select an index", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const items = ["a", "b", "c", "d"];
    expect(pickRandomElement(items)).toBe("c");
  });

  it("rejects an empty array", () => {
    expect(() => pickRandomElement([])).toThrow(/items must not be empty/);
  });

  it("rejects non-array items", () => {
    expect(() => pickRandomElement(null as unknown as string[])).toThrow(/must be an array/);
  });

  it("rejects a non-function random provider", () => {
    expect(() =>
      pickRandomElement(["a"], "nope" as unknown as () => number),
    ).toThrow(/random must be a function/);
  });

  it("rejects random values outside [0, 1)", () => {
    expect(() => pickRandomElement(["a"], () => 1)).toThrow(/must return a finite number in \[0, 1\)/);
  });
});
