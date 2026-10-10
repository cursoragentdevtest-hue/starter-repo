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

describe("unique", () => {
  it("drops duplicates", () => {
    expect(unique([1, 1, 2])).toEqual([1, 2]);
  });
});

describe("chunk", () => {
  it("splits into sized groups", () => {
    expect(chunk([1, 2, 3, 4], 3)).toEqual([[1, 2, 3], [4]]);
  });
});

describe("compact", () => {
  it("drops falsy values", () => {
    expect(compact([0, 1, "", null])).toEqual([1]);
  });
});

describe("flatten", () => {
  it("flattens one level", () => {
    expect(flatten([[1], [2, 3]])).toEqual([1, 2, 3]);
  });
});

describe("intersection", () => {
  it("keeps shared values", () => {
    expect(intersection([1, 2, 2], [2, 3])).toEqual([2]);
  });
});

describe("difference", () => {
  it("keeps values missing from the right", () => {
    expect(difference([1, 2], [2, 3])).toEqual([1]);
  });
});

describe("union", () => {
  it("merges unique values", () => {
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });
});

describe("groupBy", () => {
  it("buckets by key", () => {
    expect(groupBy(["a", "bb", "c"], (value) => String(value.length))).toEqual({
      "1": ["a", "c"],
      "2": ["bb"],
    });
  });
});

describe("partition", () => {
  it("splits by a predicate", () => {
    expect(partition([1, 2, 3], (value) => value % 2 === 0)).toEqual([[2], [1, 3]]);
  });
});

describe("zip", () => {
  it("pairs by index", () => {
    expect(zip([1, 2], ["a", "b"])).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });
});

describe("take", () => {
  it("keeps a prefix", () => {
    expect(take([1, 2, 3], 2)).toEqual([1, 2]);
  });
});

describe("drop", () => {
  it("skips a prefix", () => {
    expect(drop([1, 2, 3], 1)).toEqual([2, 3]);
  });
});

describe("takeWhile", () => {
  it("stops at the first failure", () => {
    expect(takeWhile([1, 2, 5], (value) => value < 3)).toEqual([1, 2]);
  });
});

describe("dropWhile", () => {
  it("skips a passing prefix", () => {
    expect(dropWhile([1, 2, 5], (value) => value < 3)).toEqual([5]);
  });
});

describe("first", () => {
  it("returns the first item", () => {
    expect(first([1, 2])).toBe(1);
    expect(first([])).toBeUndefined();
  });
});

describe("last", () => {
  it("returns the last item", () => {
    expect(last([1, 2])).toBe(2);
  });
});

describe("sortBy", () => {
  it("sorts by a key", () => {
    expect(sortBy([{ n: 2 }, { n: 1 }], (item) => item.n)).toEqual([
      { n: 1 },
      { n: 2 },
    ]);
  });
});

describe("keyBy", () => {
  it("indexes by a key", () => {
    expect(keyBy([{ id: "a" }], (item) => item.id)).toEqual({ a: { id: "a" } });
  });
});

describe("frequencies", () => {
  it("counts values", () => {
    expect(frequencies(["a", "a", "b"])).toEqual({ a: 2, b: 1 });
  });
});

describe("rotate", () => {
  it("rotates left", () => {
    expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1]);
    expect(rotate([1, 2, 3], -1)).toEqual([3, 1, 2]);
  });
});

describe("windows", () => {
  it("builds sliding windows", () => {
    expect(windows([1, 2, 3], 2)).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });
});

describe("uniqBy", () => {
  it("keeps the first item per key", () => {
    expect(uniqBy([{ id: 1, n: "a" }, { id: 1, n: "b" }], (item) => item.id)).toEqual([
      { id: 1, n: "a" },
    ]);
  });
});

describe("removeAt", () => {
  it("drops one index", () => {
    expect(removeAt([1, 2, 3], 1)).toEqual([1, 3]);
  });
});

describe("isSorted", () => {
  it("checks non-decreasing order", () => {
    expect(isSorted([1, 2, 2])).toBe(true);
    expect(isSorted([2, 1])).toBe(false);
  });
});

describe("minBy", () => {
  it("returns the item with the smallest key", () => {
    expect(minBy([{ n: 3 }, { n: 1 }], (item) => item.n)).toEqual({ n: 1 });
  });
});
