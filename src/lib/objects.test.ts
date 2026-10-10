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

describe("pick", () => {
  it("copies listed own keys", () => {
    expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
    expect(pick({ a: 1 }, ["toString" as "a"])).toEqual({});
  });
});

describe("omit", () => {
  it("drops listed keys", () => {
    expect(omit({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 });
  });
});

describe("mapValues", () => {
  it("maps values", () => {
    expect(mapValues({ a: 1 }, (n) => n + 1)).toEqual({ a: 2 });
  });
});

describe("mapKeys", () => {
  it("maps keys", () => {
    expect(mapKeys({ a: 1 }, (key) => String(key).toUpperCase())).toEqual({ A: 1 });
  });
});

describe("invert", () => {
  it("swaps keys and values", () => {
    expect(invert({ a: "x" })).toEqual({ x: "a" });
  });
});

describe("merge", () => {
  it("shallow merges", () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("deepMerge", () => {
  it("merges nested objects and clones arrays", () => {
    const array = [1];
    const merged = deepMerge({ a: { n: 1 }, list: array }, { a: { m: 2 } });
    expect(merged).toEqual({ a: { n: 1, m: 2 }, list: [1] });
    array.push(2);
    expect(merged.list).toEqual([1]);
  });
});

describe("isEmpty", () => {
  it("checks own keys", () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});

describe("isPlainObject", () => {
  it("accepts plain objects only", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
  });
});

describe("getPath", () => {
  it("reads a nested path", () => {
    expect(getPath({ a: { b: 1 } }, ["a", "b"])).toBe(1);
    expect(getPath({ a: 1 }, ["missing"])).toBeUndefined();
  });
});

describe("setPath", () => {
  it("writes a nested path without mutating the input", () => {
    const input = { a: { b: 1 } };
    expect(setPath(input, ["a", "b"], 2)).toEqual({ a: { b: 2 } });
    expect(input.a.b).toBe(1);
  });
});

describe("hasPath", () => {
  it("reports whether a path exists", () => {
    expect(hasPath({ a: { b: 1 } }, ["a", "b"])).toBe(true);
    expect(hasPath({ a: 1 }, ["a", "b"])).toBe(false);
  });
});

describe("defaults", () => {
  it("fills missing keys", () => {
    expect(defaults({ a: 1 }, { a: 9, b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("compactObject", () => {
  it("drops null and undefined", () => {
    expect(compactObject({ a: 1, b: undefined, c: null })).toEqual({ a: 1 });
  });
});

describe("renameKeys", () => {
  it("renames keys", () => {
    expect(renameKeys({ a: 1 }, { a: "b" })).toEqual({ b: 1 });
  });
});

describe("pickBy", () => {
  it("keeps matching entries", () => {
    expect(pickBy({ a: 1, b: 0 }, (n) => n > 0)).toEqual({ a: 1 });
  });
});

describe("omitBy", () => {
  it("drops matching entries", () => {
    expect(omitBy({ a: 1, b: 0 }, (n) => n === 0)).toEqual({ a: 1 });
  });
});

describe("flattenObject", () => {
  it("uses dotted keys", () => {
    expect(flattenObject({ a: { b: 1 } })).toEqual({ "a.b": 1 });
  });
});

describe("objectSize", () => {
  it("counts keys", () => {
    expect(objectSize({ a: 1, b: 2 })).toBe(2);
  });
});

describe("shallowClone", () => {
  it("copies own keys", () => {
    expect(shallowClone({ a: 1 })).toEqual({ a: 1 });
  });
});

describe("deepEquals", () => {
  it("compares nested values", () => {
    expect(deepEquals({ a: [1] }, { a: [1] })).toBe(true);
    expect(deepEquals({ a: 1 }, { a: 2 })).toBe(false);
  });
});

describe("assignDefined", () => {
  it("skips undefined source values", () => {
    expect(assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });
});

describe("entriesOf", () => {
  it("lists entries", () => {
    expect(entriesOf({ a: 1 })).toEqual([["a", 1]]);
  });
});

describe("fromPairs", () => {
  it("builds an object", () => {
    expect(fromPairs([["a", 1]])).toEqual({ a: 1 });
  });
});

describe("diffKeys", () => {
  it("lists changed keys", () => {
    expect(diffKeys({ a: 1, b: 2 }, { a: 1, b: 3 })).toEqual(["b"]);
  });
});
