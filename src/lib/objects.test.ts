import { expect, it } from "vitest";
import {
  assignDefined,
  compactObject,
  deepEquals,
  deepMerge,
  defaults,
  diffKeys,
  entriesOf,
  flattenObject,
  fromPairs,
  getPath,
  hasPath,
  invert,
  isEmpty,
  isPlainObject,
  mapKeys,
  mapValues,
  merge,
  objectSize,
  omit,
  omitBy,
  pick,
  pickBy,
  renameKeys,
  setPath,
  shallowClone,
} from "./objects";

it("picks own properties and skips inherited names", () => {
  expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
  expect(pick({ a: 1 } as Record<string, unknown>, ["toString"])).toEqual({});
});

it("omits named keys", () => {
  expect(omit({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 });
});

it("maps values", () => {
  expect(mapValues({ a: 1, b: 2 }, (value) => value * 10)).toEqual({ a: 10, b: 20 });
});

it("maps keys", () => {
  expect(mapKeys({ a: 1 }, (key) => key.toUpperCase())).toEqual({ A: 1 });
});

it("inverts keys and values", () => {
  expect(invert({ a: "x", b: "y" })).toEqual({ x: "a", y: "b" });
});

it("shallow-merges and lets a later undefined overwrite", () => {
  expect(merge({ a: 1 }, undefined, { b: 2 })).toEqual({ a: 1, b: 2 });
  expect(merge({ a: 1 }, { a: undefined })).toEqual({ a: undefined });
});

it("deep-merges objects and copies arrays one level", () => {
  expect(deepMerge({ a: { b: 1 } }, { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } });
  const source = { a: [1, 2] };
  const result = deepMerge(source);
  (result.a as number[]).push(3);
  expect(source.a).toEqual([1, 2]);
  expect(result.a).toEqual([1, 2, 3]);
});

it("treats null, undefined, and empty collections as empty", () => {
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty({})).toBe(true);
  expect(isEmpty([])).toBe(true);
  expect(isEmpty({ a: 1 })).toBe(false);
});

it("recognizes plain objects", () => {
  expect(isPlainObject({})).toBe(true);
  expect(isPlainObject(Object.create(null))).toBe(true);
  expect(isPlainObject([])).toBe(false);
  expect(isPlainObject(null)).toBe(false);
});

it("reads dotted paths through objects and arrays", () => {
  expect(getPath({ a: [10] }, "a.0")).toBe(10);
  expect(getPath({ a: [10] }, "a.1", "missing")).toBe("missing");
  expect(getPath({ a: undefined }, "a", "fallback")).toBe("fallback");
  expect(getPath({ a: 1 }, "")).toEqual({ a: 1 });
});

it("sets a path without collapsing empty segments", () => {
  expect(setPath({ a: 1 }, "b.c", 2)).toEqual({ a: 1, b: { c: 2 } });
  expect(setPath({}, "a..b", 1)).toEqual({ a: { "": { b: 1 } } });
  expect(setPath({ a: 1 }, "", 2)).toBe(2);
});

it("detects paths, including a stored undefined and array indexes", () => {
  expect(hasPath({ a: undefined }, "a")).toBe(true);
  expect(hasPath({ a: [10] }, "a.0")).toBe(true);
  expect(hasPath({}, "")).toBe(false);
  expect(hasPath({ a: 1 }, "b")).toBe(false);
});

it("fills only undefined keys from the fallback", () => {
  expect(defaults({ a: undefined, b: 1 }, { a: 2, b: 3, c: 4 })).toEqual({ a: 2, b: 1, c: 4 });
});

it("drops null and undefined values", () => {
  expect(compactObject({ a: 1, b: null, c: undefined, d: 0 })).toEqual({ a: 1, d: 0 });
});

it("renames keys", () => {
  expect(renameKeys({ a: 1, b: 2 }, { a: "alpha" })).toEqual({ alpha: 1, b: 2 });
});

it("picks by predicate", () => {
  expect(pickBy({ a: 1, b: 2 }, (value) => value > 1)).toEqual({ b: 2 });
});

it("omits by predicate", () => {
  expect(omitBy({ a: 1, b: 2 }, (value) => value > 1)).toEqual({ a: 1 });
});

it("flattens nested objects and leaves arrays intact", () => {
  expect(flattenObject({ a: { b: 1, c: {} }, d: [2] })).toEqual({ "a.b": 1, d: [2] });
});

it("counts own keys", () => {
  expect(objectSize({ a: 1, b: 2 })).toBe(2);
});

it("shallow-clones without sharing the container", () => {
  const nested = { b: 1 };
  const source = { a: nested };
  const copy = shallowClone(source);
  expect(copy).not.toBe(source);
  expect(copy.a).toBe(nested);
});

it("compares arrays and plain objects with Object.is", () => {
  expect(deepEquals({ a: [1, Number.NaN] }, { a: [1, Number.NaN] })).toBe(true);
  expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
  expect(deepEquals([1], { 0: 1 })).toBe(false);
});

it("assigns defined values and can add keys", () => {
  expect(assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
});

it("lists own entries", () => {
  expect(entriesOf({ a: 1 })).toEqual([["a", 1]]);
});

it("builds an object from pairs", () => {
  expect(fromPairs([["a", 1], ["b", 2]])).toEqual({ a: 1, b: 2 });
});

it("diffs added, removed, and changed keys", () => {
  expect(diffKeys({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({
    added: ["c"],
    removed: ["a"],
    changed: ["b"],
  });
  expect(diffKeys({ a: Number.NaN }, { a: Number.NaN }).changed).toEqual([]);
});
