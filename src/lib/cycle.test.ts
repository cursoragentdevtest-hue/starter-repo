import { describe, expect, it } from "vitest";
import { nextCyclicIndex, pickDifferentIndex } from "./cycle";

describe("nextCyclicIndex", () => {
  it("advances and wraps to zero", () => {
    expect(nextCyclicIndex(0, 8)).toBe(1);
    expect(nextCyclicIndex(7, 8)).toBe(0);
  });

  it("rejects empty, non-integer, and non-number inputs with a named error", () => {
    expect(() => nextCyclicIndex(0, 0)).toThrow(
      'nextCyclicIndex: "length" must be a positive integer, received 0',
    );
    expect(() => nextCyclicIndex(0, -1)).toThrow(
      'nextCyclicIndex: "length" must be a positive integer, received -1',
    );
    expect(() => nextCyclicIndex(0.5, 3)).toThrow(
      'nextCyclicIndex: "index" must be an integer, received 0.5',
    );
    expect(() => nextCyclicIndex(Number.NaN, 3)).toThrow(
      'nextCyclicIndex: "index" must be an integer, received NaN',
    );
    expect(() => nextCyclicIndex(0, Number.POSITIVE_INFINITY)).toThrow(
      'nextCyclicIndex: "length" must be a positive integer, received Infinity',
    );
    expect(() => nextCyclicIndex(0, "8" as unknown as number)).toThrow(
      'nextCyclicIndex: "length" must be a positive integer, received "8"',
    );
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

  it("rejects invalid length, currentIndex, random callback, and roll", () => {
    expect(() => pickDifferentIndex(0, 0)).toThrow(
      'pickDifferentIndex: "length" must be a positive integer, received 0',
    );
    expect(() => pickDifferentIndex(8, 1.2)).toThrow(
      'pickDifferentIndex: "currentIndex" must be an integer, received 1.2',
    );
    expect(() => pickDifferentIndex(8, 0, null as unknown as () => number)).toThrow(
      'pickDifferentIndex: "random" must be a function, received null',
    );
    expect(() => pickDifferentIndex(8, 0, () => 1)).toThrow(
      'pickDifferentIndex: "random" must return a number in [0, 1), received 1',
    );
    expect(() => pickDifferentIndex(8, 0, () => Number.NaN)).toThrow(
      'pickDifferentIndex: "random" must return a number in [0, 1), received NaN',
    );
    expect(() =>
      pickDifferentIndex(8, 0, () => {
        throw new Error("boom");
      }),
    ).toThrow('pickDifferentIndex: "random" threw: boom');
  });
});
