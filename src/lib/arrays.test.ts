import { expect, it } from "vitest";
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

it("drops duplicates", () => {
  expect(unique([1, 1, 2])).toEqual([1, 2]);
});

it("chunks and rejects a non-positive size", () => {
  expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([
    [1, 2],
    [3, 4],
    [5],
  ]);
  expect(() => chunk([1], 0)).toThrow(RangeError);
});

it("drops only null and undefined", () => {
  expect(compact([0, null, undefined, false, ""])).toEqual([0, false, ""]);
});

it("flattens one level", () => {
  expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
  expect(flatten([[1, [2]]])).toEqual([1, [2]]);
});

it("intersects in left order", () => {
  expect(intersection([1, 2, 2, 3], [2, 2, 4])).toEqual([2]);
});

it("subtracts while keeping left duplicates", () => {
  expect(difference([1, 2, 2, 3], [2])).toEqual([1, 3]);
});

it("unions by first occurrence", () => {
  expect(union([1, 2], [2, 3], [3, 4])).toEqual([1, 2, 3, 4]);
});

it("groups by key", () => {
  expect(groupBy(["aa", "b", "cc"], (item) => item.length)).toEqual({ 2: ["aa", "cc"], 1: ["b"] });
});

it("partitions by a predicate", () => {
  expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
    [2, 4],
    [1, 3],
  ]);
});

it("zips to the shorter length", () => {
  expect(zip([1, 2], ["a"])).toEqual([[1, "a"]]);
});

it("takes a prefix and returns empty for a non-positive count", () => {
  expect(take([1, 2, 3], 2)).toEqual([1, 2]);
  expect(take([1, 2, 3], 0)).toEqual([]);
  expect(take([1, 2, 3], -1)).toEqual([]);
});

it("drops a prefix and copies when the count is non-positive", () => {
  const values = [1, 2, 3];
  expect(drop(values, 1)).toEqual([2, 3]);
  const copy = drop(values, 0);
  expect(copy).toEqual(values);
  expect(copy).not.toBe(values);
});

it("takes while the predicate holds", () => {
  expect(takeWhile([2, 4, 5, 6], (n) => n % 2 === 0)).toEqual([2, 4]);
});

it("drops while the predicate holds", () => {
  expect(dropWhile([2, 4, 5, 6], (n) => n % 2 === 0)).toEqual([5, 6]);
});

it("returns the first item", () => {
  expect(first([10, 20])).toBe(10);
  expect(first([])).toBeUndefined();
});

it("returns the last item", () => {
  expect(last([10, 20])).toBe(20);
  expect(last([])).toBeUndefined();
});

it("sorts a copy stably by key", () => {
  const values = [
    { n: 1, i: 0 },
    { n: 2, i: 1 },
    { n: 1, i: 2 },
  ];
  expect(sortBy(values, (item) => item.n)).toEqual([
    { n: 1, i: 0 },
    { n: 1, i: 2 },
    { n: 2, i: 1 },
  ]);
  expect(values[0]).toEqual({ n: 1, i: 0 });
});

it("indexes by key and lets the last item win", () => {
  expect(
    keyBy(
      [
        { id: "a", n: 1 },
        { id: "a", n: 2 },
      ],
      (item) => item.id,
    ),
  ).toEqual({ a: { id: "a", n: 2 } });
});

it("counts frequencies", () => {
  expect(frequencies([1, 1, 2])).toEqual({ 1: 2, 2: 1 });
});

it("rotates left, right, and wraps", () => {
  expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1]);
  expect(rotate([1, 2, 3, 4], -1)).toEqual([4, 1, 2, 3]);
  expect(rotate([1, 2, 3], 3.9)).toEqual([1, 2, 3]);
  expect(rotate([], 3)).toEqual([]);
});

it("builds sliding windows", () => {
  expect(windows([1, 2, 3, 4], 2)).toEqual([
    [1, 2],
    [2, 3],
    [3, 4],
  ]);
  expect(windows([1], 2)).toEqual([]);
  expect(() => windows([1], 0)).toThrow(RangeError);
});

it("uniques by key and keeps the first item", () => {
  expect(
    uniqBy(
      [
        { id: 1, n: "a" },
        { id: 1, n: "b" },
      ],
      (item) => item.id,
    ),
  ).toEqual([{ id: 1, n: "a" }]);
});

it("removes an index and copies when the index is unusable", () => {
  const values = [1, 2, 3];
  expect(removeAt(values, 1)).toEqual([1, 3]);
  const copy = removeAt(values, -1);
  expect(copy).toEqual(values);
  expect(copy).not.toBe(values);
  expect(removeAt(values, 1.5)).toEqual(values);
});

it("checks sorted order", () => {
  expect(isSorted([1, 2, 2])).toBe(true);
  expect(isSorted([1, 3, 2])).toBe(false);
  expect(isSorted(["a", "b"])).toBe(true);
});

it("returns the earliest minimum", () => {
  const firstMin = { n: 1, label: "first" };
  const secondMin = { n: 1, label: "second" };
  expect(minBy([{ n: 2, label: "high" }, firstMin, secondMin], (item) => item.n)).toBe(firstMin);
  expect(minBy([], (item: { n: number }) => item.n)).toBeUndefined();
});
