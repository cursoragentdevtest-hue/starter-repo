import { describe, expect, it } from "vitest";
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

describe("objects", () => {
  it("pick", () => {
    expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
  });

  it("omit", () => {
    expect(omit({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 });
  });

  it("mapValues", () => {
    expect(mapValues({ a: 1 }, (value) => value * 2)).toEqual({ a: 2 });
  });

  it("mapKeys", () => {
    expect(mapKeys({ a: 1 }, (key) => key.toUpperCase())).toEqual({ A: 1 });
  });

  it("invert", () => {
    expect(invert({ a: "x" })).toEqual({ x: "a" });
  });

  it("merge", () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("deepMerge", () => {
    const source = { a: { list: [1] } };
    const merged = deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
    expect(merged).toEqual({ a: { b: 1, c: 2 } });
    const empty: { a?: { list: number[] } } = {};
    const cloned = deepMerge(empty, source);
    expect(cloned.a?.list).toEqual([1]);
    cloned.a?.list.push(2);
    expect(source.a.list).toEqual([1]);
  });

  it("isEmpty", () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it("isPlainObject", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject([])).toBe(false);
  });

  it("getPath", () => {
    expect(getPath({ a: { b: 1 } }, "a.b")).toBe(1);
    expect(getPath({ items: ["x"] }, "items.0")).toBe("x");
  });

  it("setPath", () => {
    expect(setPath({ a: {} }, "a.b", 1)).toEqual({ a: { b: 1 } });
  });

  it("hasPath", () => {
    expect(hasPath({ a: { b: 0 } }, "a.b")).toBe(true);
    expect(hasPath({ a: 1 }, "a.b")).toBe(false);
  });

  it("defaults", () => {
    expect(defaults({ a: 1 }, { a: 9, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("compactObject", () => {
    expect(compactObject({ a: 1, b: null })).toEqual({ a: 1 });
  });

  it("renameKeys", () => {
    expect(renameKeys({ a: 1 }, { a: "b" })).toEqual({ b: 1 });
  });

  it("pickBy", () => {
    expect(pickBy({ a: 1, b: 2 }, (value) => value > 1)).toEqual({ b: 2 });
  });

  it("omitBy", () => {
    expect(omitBy({ a: 1, b: 2 }, (value) => value > 1)).toEqual({ a: 1 });
  });

  it("flattenObject", () => {
    expect(flattenObject({ a: { b: 1 } })).toEqual({ "a.b": 1 });
  });

  it("objectSize", () => {
    expect(objectSize({ a: 1, b: 2 })).toBe(2);
  });

  it("shallowClone", () => {
    const source = { a: 1 };
    expect(shallowClone(source)).toEqual({ a: 1 });
    expect(shallowClone(source)).not.toBe(source);
  });

  it("deepEquals", () => {
    expect(deepEquals({ a: [1] }, { a: [1] })).toBe(true);
    expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("assignDefined", () => {
    expect(assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("entriesOf", () => {
    expect(entriesOf({ a: 1 })).toEqual([["a", 1]]);
  });

  it("fromPairs", () => {
    expect(fromPairs([["a", 1]])).toEqual({ a: 1 });
  });

  it("diffKeys", () => {
    expect(diffKeys({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual(["b"]);
  });
});
