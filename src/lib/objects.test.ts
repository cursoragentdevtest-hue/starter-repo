import { describe, expect, it } from "vitest";
import {
  assignDefined,
  compactObject,
  deepClone,
  deepMerge,
  defaults,
  entries,
  fromEntries,
  getPath,
  hasPath,
  invert,
  isEmpty,
  isObject,
  keys,
  mapKeys,
  mapValues,
  merge,
  omit,
  omitBy,
  pick,
  pickBy,
  setPath,
  shallowClone,
  rename,
  size,
  values,
} from "./objects";

describe("isObject", () => {
  it("accepts plain objects only", () => {
    expect(isObject({ a: 1 })).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
  });
});

describe("shallowClone", () => {
  it("copies one level", () => {
    const source = { a: 1 };
    const copy = shallowClone(source);
    expect(copy).toEqual({ a: 1 });
    expect(copy).not.toBe(source);
  });
});

describe("deepClone", () => {
  it("copies nested objects", () => {
    const source = { a: { b: 1 } };
    const copy = deepClone(source);
    expect(copy).toEqual(source);
    expect(copy.a).not.toBe(source.a);
  });
});

describe("keys", () => {
  it("lists keys", () => {
    expect(keys({ a: 1, b: 2 })).toEqual(["a", "b"]);
  });
});

describe("values", () => {
  it("lists values", () => {
    expect(values({ a: 1, b: 2 })).toEqual([1, 2]);
  });
});

describe("entries", () => {
  it("lists pairs", () => {
    expect(entries({ a: 1 })).toEqual([["a", 1]]);
  });
});

describe("fromEntries", () => {
  it("builds an object", () => {
    expect(fromEntries([["a", 1]])).toEqual({ a: 1 });
  });
});

describe("pick", () => {
  it("copies own keys only", () => {
    expect(pick({ a: 1, b: 2 }, ["a"])).toEqual({ a: 1 });
    expect(pick({ a: 1 }, ["toString" as "a"])).toEqual({});
  });
});

describe("omit", () => {
  it("drops named keys", () => {
    expect(omit({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 });
  });
});

describe("merge", () => {
  it("merges left to right", () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("assignDefined", () => {
  it("skips undefined", () => {
    expect(assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe("deepMerge", () => {
  it("merges nested objects and copies arrays", () => {
    const source = { items: [1] };
    const merged = deepMerge({ a: { b: 1 } }, { a: { c: 2 } }, source);
    expect(merged).toEqual({ a: { b: 1, c: 2 }, items: [1] });
    expect(merged.items).not.toBe(source.items);
  });
});

describe("getPath", () => {
  it("reads nested values and array indexes", () => {
    expect(getPath({ a: { b: 1 } }, "a.b")).toBe(1);
    expect(getPath({ a: [10] }, "a.0")).toBe(10);
  });
});

describe("hasPath", () => {
  it("checks own path segments", () => {
    expect(hasPath({ a: { b: 0 } }, "a.b")).toBe(true);
    expect(hasPath({ a: 1 }, "a.toString")).toBe(false);
  });
});

describe("setPath", () => {
  it("sets a nested value without dropping empty segments", () => {
    expect(setPath({ a: { b: 1 } }, "a.c", 2)).toEqual({ a: { b: 1, c: 2 } });
    expect(setPath({}, "a..b", 1)).toEqual({ a: { "": { b: 1 } } });
  });
});

describe("mapValues", () => {
  it("maps values", () => {
    expect(mapValues({ a: 1, b: 2 }, (n) => n * 2)).toEqual({ a: 2, b: 4 });
  });
});

describe("mapKeys", () => {
  it("maps keys", () => {
    expect(mapKeys({ a: 1 }, (key) => key.toUpperCase())).toEqual({ A: 1 });
  });
});

describe("invert", () => {
  it("swaps keys and values", () => {
    expect(invert({ a: "x" })).toEqual({ x: "a" });
  });
});

describe("pickBy", () => {
  it("keeps matching properties", () => {
    expect(pickBy({ a: 1, b: 0 }, (n) => (n as number) > 0)).toEqual({ a: 1 });
  });
});

describe("omitBy", () => {
  it("drops matching properties", () => {
    expect(omitBy({ a: 1, b: 0 }, (n) => n === 0)).toEqual({ a: 1 });
  });
});

describe("defaults", () => {
  it("fills missing keys", () => {
    expect(defaults({ a: 1 }, { a: 9, b: 2 })).toEqual({ a: 1, b: 2 });
  });
});

describe("compactObject", () => {
  it("drops nullish properties", () => {
    expect(compactObject({ a: 1, b: null, c: undefined })).toEqual({ a: 1 });
  });
});

describe("rename", () => {
  it("renames an own key", () => {
    expect(rename({ a: 1 }, "a", "b")).toEqual({ b: 1 });
  });
});

describe("size", () => {
  it("counts keys", () => {
    expect(size({ a: 1, b: 2 })).toBe(2);
  });
});

describe("isEmpty", () => {
  it("detects an empty object", () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});
