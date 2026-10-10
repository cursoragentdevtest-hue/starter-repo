import { describe, expect, it } from "vitest";
import {
  chunk,
  compact,
  copy,
  countBy,
  difference,
  drop,
  evens,
  findLast,
  flatten,
  groupBy,
  intersection,
  move,
  odds,
  partition,
  range,
  rotate,
  sortBy,
  sortByKey,
  symmetricDifference,
  take,
  unique,
  uniqueBy,
  unzip,
  windows,
  zip,
} from "./arrays";

describe("copy", () => {
  it("returns a shallow copy", () => {
    const source = [1, 2];
    const result = copy(source);
    expect(result).toEqual([1, 2]);
    expect(result).not.toBe(source);
  });
});

describe("unique", () => {
  it("drops later duplicates", () => {
    expect(unique([1, 2, 1, 3])).toEqual([1, 2, 3]);
  });
});

describe("uniqueBy", () => {
  it("keeps the first item for each key", () => {
    expect(uniqueBy([{ id: 1 }, { id: 1, extra: true }], (item) => item.id)).toEqual([{ id: 1 }]);
  });
});

describe("chunk", () => {
  it("splits into chunks", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe("flatten", () => {
  it("flattens one level", () => {
    expect(flatten([[1, 2], [3]])).toEqual([1, 2, 3]);
  });
});

describe("compact", () => {
  it("drops nullish values", () => {
    expect(compact([1, null, 2, undefined])).toEqual([1, 2]);
  });
});

describe("groupBy", () => {
  it("groups by a key", () => {
    expect(groupBy(["ant", "bear", "ape"], (word) => word[0])).toEqual(
      new Map([
        ["a", ["ant", "ape"]],
        ["b", ["bear"]],
      ]),
    );
  });
});

describe("countBy", () => {
  it("counts by identity", () => {
    expect(countBy(["a", "b", "a"])).toEqual(
      new Map([
        ["a", 2],
        ["b", 1],
      ]),
    );
  });
});

describe("intersection", () => {
  it("keeps shared values", () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });
});

describe("difference", () => {
  it("drops values present in the other array", () => {
    expect(difference([1, 2, 3], [2])).toEqual([1, 3]);
  });
});

describe("symmetricDifference", () => {
  it("keeps values in exactly one array", () => {
    expect(symmetricDifference([1, 2], [2, 3])).toEqual([1, 3]);
  });
});

describe("sortBy", () => {
  it("sorts a copy", () => {
    const source = [3, 1, 2];
    expect(sortBy(source)).toEqual([1, 2, 3]);
    expect(source).toEqual([3, 1, 2]);
  });
});

describe("sortByKey", () => {
  it("sorts by a key", () => {
    expect(sortByKey([{ n: 2 }, { n: 1 }], (item) => item.n)).toEqual([{ n: 1 }, { n: 2 }]);
  });
});

describe("move", () => {
  it("moves an element", () => {
    expect(move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
  });
});

describe("rotate", () => {
  it("rotates left", () => {
    expect(rotate([1, 2, 3, 4], 1)).toEqual([2, 3, 4, 1]);
  });
});

describe("zip", () => {
  it("pairs up to the shorter array", () => {
    expect(zip([1, 2], ["a", "b", "c"])).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });
});

describe("unzip", () => {
  it("splits pairs", () => {
    expect(
      unzip([
        [1, "a"],
        [2, "b"],
      ]),
    ).toEqual([
      [1, 2],
      ["a", "b"],
    ]);
  });
});

describe("evens", () => {
  it("keeps even indexes", () => {
    expect(evens([0, 1, 2, 3])).toEqual([0, 2]);
  });
});

describe("odds", () => {
  it("keeps odd indexes", () => {
    expect(odds([0, 1, 2, 3])).toEqual([1, 3]);
  });
});

describe("windows", () => {
  it("slides a window", () => {
    expect(windows([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
  });
});

describe("partition", () => {
  it("splits by a predicate", () => {
    expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
      [2, 4],
      [1, 3],
    ]);
  });
});

describe("findLast", () => {
  it("finds from the end", () => {
    expect(findLast([1, 2, 3], (n) => n > 1)).toBe(3);
  });
});

describe("range", () => {
  it("builds an exclusive range", () => {
    expect(range(1, 4)).toEqual([1, 2, 3]);
  });
});

describe("take", () => {
  it("takes a prefix", () => {
    expect(take([1, 2, 3], 2)).toEqual([1, 2]);
  });
});

describe("drop", () => {
  it("drops a prefix", () => {
    expect(drop([1, 2, 3], 2)).toEqual([3]);
  });
});
