import { describe, expect, it } from "vitest";
import { pickDifferent, pickRandom } from "./random";

const items = ["a", "b", "c"] as const;

describe("pickRandom", () => {
  it("maps the random range onto every item", () => {
    expect(pickRandom(items, () => 0)).toBe("a");
    expect(pickRandom(items, () => 0.5)).toBe("b");
    expect(pickRandom(items, () => 0.999)).toBe("c");
  });

  it("defaults to Math.random", () => {
    expect(items).toContain(pickRandom(items));
  });
});

describe("pickDifferent", () => {
  it("never returns the current item", () => {
    for (const value of [0, 0.34, 0.5, 0.67, 0.999]) {
      expect(pickDifferent(items, "a", () => value)).not.toBe("a");
    }
  });

  it("covers every other item across the random range", () => {
    expect(pickDifferent(items, "b", () => 0)).toBe("a");
    expect(pickDifferent(items, "b", () => 0.999)).toBe("c");
  });

  it("can return any item when current is not in the list", () => {
    expect(pickDifferent(items, "z" as string, () => 0)).toBe("a");
    expect(pickDifferent(items, "z" as string, () => 0.999)).toBe("c");
  });

  it("returns the only item without consulting random when nothing else is available", () => {
    const random = () => {
      throw new Error("should not be called");
    };
    expect(pickDifferent(["solo"], "solo", random)).toBe("solo");
  });
});

describe.each([
  ["pickRandom", (list: unknown, random?: unknown) => pickRandom(list as string[], random as () => number)],
  [
    "pickDifferent",
    (list: unknown, random?: unknown) => pickDifferent(list as string[], "a", random as () => number),
  ],
])("%s input validation", (name, call) => {
  it.each([
    [undefined, "undefined"],
    [null, "null"],
    ["abc", "string"],
    [{ length: 2 }, "object"],
  ])("rejects non-array items (%j)", (list, described) => {
    expect(() => call(list)).toThrow(TypeError);
    expect(() => call(list)).toThrow(`${name}: items must be an array, got ${described}`);
  });

  it("rejects an empty list", () => {
    expect(() => call([])).toThrow(RangeError);
    expect(() => call([])).toThrow(`${name}: items must contain at least one item`);
  });

  it.each([
    [null, "null"],
    [0.5, "0.5"],
    ["Math.random", "string"],
  ])("rejects a non-function random source (%j)", (random, described) => {
    expect(() => call(["x", "y"], random)).toThrow(TypeError);
    expect(() => call(["x", "y"], random)).toThrow(
      `${name}: random must be a function, got ${described}`,
    );
  });

  it.each([
    [1, "1"],
    [-0.1, "-0.1"],
    [NaN, "NaN"],
    [Infinity, "Infinity"],
    ["0.5", "string"],
    [undefined, "undefined"],
  ])("rejects random() returning %j instead of indexing out of bounds", (value, described) => {
    expect(() => call(["x", "y"], () => value)).toThrow(RangeError);
    expect(() => call(["x", "y"], () => value)).toThrow(
      `${name}: random() must return a number in [0, 1), got ${described}`,
    );
  });
});
