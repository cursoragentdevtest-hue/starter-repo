import { describe, expect, it } from "vitest";
import {
  chunk,
  compact,
  difference,
  drop,
  dropWhile,
  first,
  flatten,
  frequencies,
  groupBy,
  intersection,
  isSorted,
  keyBy,
  last,
  minBy,
  partition,
  removeAt,
  rotate,
  sortBy,
  take,
  takeWhile,
  union,
  uniqBy,
  unique,
  windows,
  zip,
} from "./arrays";

describe("arrays", () => {
  it("unique", () => {
    expect(unique([1, 1, 2])).toEqual([1, 2]);
  });

  it("chunk", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("compact", () => {
    expect(compact([0, null, 1, undefined, false])).toEqual([0, 1, false]);
  });

  it("flatten", () => {
    expect(flatten([[1, 2], [3]])).toEqual([1, 2, 3]);
  });

  it("intersection", () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  it("difference", () => {
    expect(difference([1, 2, 3], [2])).toEqual([1, 3]);
  });

  it("union", () => {
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });

  it("groupBy", () => {
    const groups = groupBy(["a", "bb", "c"], (item) => item.length);
    expect(groups.get(1)).toEqual(["a", "c"]);
    expect(groups.get(2)).toEqual(["bb"]);
  });

  it("partition", () => {
    expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
      [2, 4],
      [1, 3],
    ]);
  });

  it("zip", () => {
    expect(zip(["a", "b"], [1, 2, 3])).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("take", () => {
    expect(take([1, 2, 3], 2)).toEqual([1, 2]);
  });

  it("drop", () => {
    expect(drop([1, 2, 3], 1)).toEqual([2, 3]);
  });

  it("takeWhile", () => {
    expect(takeWhile([1, 2, 3, 0], (n) => n < 3)).toEqual([1, 2]);
  });

  it("dropWhile", () => {
    expect(dropWhile([1, 2, 3], (n) => n < 3)).toEqual([3]);
  });

  it("first", () => {
    expect(first([1, 2])).toBe(1);
    expect(first([])).toBeUndefined();
  });

  it("last", () => {
    expect(last([1, 2])).toBe(2);
  });

  it("sortBy", () => {
    expect(sortBy(["bb", "a"], (item) => item.length)).toEqual(["a", "bb"]);
  });

  it("keyBy", () => {
    expect(keyBy([{ id: "a" }], (item) => item.id).get("a")).toEqual({ id: "a" });
  });

  it("frequencies", () => {
    expect(frequencies(["a", "b", "a"]).get("a")).toBe(2);
  });

  it("rotate", () => {
    expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1]);
    expect(rotate([1, 2, 3, 4], -1)).toEqual([4, 1, 2, 3]);
  });

  it("windows", () => {
    expect(windows([1, 2, 3], 2)).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });

  it("uniqBy", () => {
    expect(uniqBy([{ id: 1 }, { id: 1, extra: true }], (item) => item.id)).toEqual([{ id: 1 }]);
  });

  it("removeAt", () => {
    expect(removeAt(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });

  it("isSorted", () => {
    expect(isSorted([1, 2, 2])).toBe(true);
    expect(isSorted([2, 1])).toBe(false);
  });

  it("minBy", () => {
    expect(minBy(["bb", "a"], (item) => item.length)).toBe("a");
  });
});
