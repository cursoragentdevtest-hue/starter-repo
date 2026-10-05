import { describe, expect, it } from "vitest";
import { nextCyclicIndex, pickDifferentIndex } from "./cycle";

describe("nextCyclicIndex", () => {
  it("advances and wraps to zero", () => {
    expect(nextCyclicIndex(0, 8)).toBe(1);
    expect(nextCyclicIndex(7, 8)).toBe(0);
  });

  it("rejects empty or invalid lengths", () => {
    expect(() => nextCyclicIndex(0, 0)).toThrow(/positive integer/);
    expect(() => nextCyclicIndex(0, -1)).toThrow(/positive integer/);
    expect(() => nextCyclicIndex(0.5, 3)).toThrow(/index must be an integer/);
  });
});

describe("pickDifferentIndex", () => {
  it("returns the rolled index when it differs from current", () => {
    expect(pickDifferentIndex(8, 0, () => 0.5)).toBe(4);
  });

  it("skips a roll that would repeat the current index", () => {
    expect(pickDifferentIndex(8, 3, () => 3 / 8)).toBe(4);
    expect(pickDifferentIndex(8, 7, () => 7 / 8)).toBe(0);
  });

  it("returns 0 for a single-item list", () => {
    expect(pickDifferentIndex(1, 0, () => 0)).toBe(0);
  });

  it("rejects an empty list and an out-of-range random() result", () => {
    expect(() => pickDifferentIndex(0, 0)).toThrow(/positive integer/);
    expect(() => pickDifferentIndex(8, 0, () => 1)).toThrow(/\[0, 1\)/);
    expect(() => pickDifferentIndex(8, 0, () => Number.NaN)).toThrow(/\[0, 1\)/);
  });
});
