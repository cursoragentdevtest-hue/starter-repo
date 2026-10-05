import { afterEach, describe, expect, it, vi } from "vitest";
import { nextCircularIndex, pickRandomElement } from "./arrays";

describe("nextCircularIndex", () => {
  it("wraps to zero after the last index", () => {
    expect(nextCircularIndex(7, 8)).toBe(0);
  });

  it("advances within range", () => {
    expect(nextCircularIndex(2, 5)).toBe(3);
  });

  it("rejects invalid length", () => {
    expect(() => nextCircularIndex(0, 0)).toThrow(RangeError);
  });

  it("rejects out-of-range current index", () => {
    expect(() => nextCircularIndex(3, 3)).toThrow(RangeError);
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
    expect(() => pickRandomElement([])).toThrow(RangeError);
  });
});
