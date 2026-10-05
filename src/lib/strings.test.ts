import { describe, expect, it } from "vitest";
import { slugify, titleCase, truncate } from "./strings";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugify("  Rubber Ducks: 101!!  ")).toBe("rubber-ducks-101");
  });

  it("removes diacritics", () => {
    expect(slugify("Crème Brûlée")).toBe("creme-brulee");
  });

  it("returns an empty string when nothing is slug-safe", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("truncate", () => {
  it("returns the input unchanged when it fits", () => {
    expect(truncate("short", 10)).toBe("short");
    expect(truncate("exact", 5)).toBe("exact");
  });

  it("cuts and appends an ellipsis within maxLength", () => {
    const result = truncate("The quick brown fox", 10);
    expect(result).toBe("The quick…");
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("supports a custom ellipsis", () => {
    expect(truncate("abcdefghij", 6, "...")).toBe("abc...");
  });

  it("handles maxLength smaller than the ellipsis", () => {
    expect(truncate("abcdef", 2, "...")).toBe("..");
    expect(truncate("abcdef", 0)).toBe("");
  });

  it("rejects negative maxLength", () => {
    expect(() => truncate("abc", -1)).toThrow(RangeError);
  });
});

describe("titleCase", () => {
  it("capitalizes the first letter of each word", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("normalizes mixed casing", () => {
    expect(titleCase("tHE qUICK bROWN")).toBe("The Quick Brown");
  });

  it("capitalizes after hyphens and preserves whitespace", () => {
    expect(titleCase("well-known  duck")).toBe("Well-Known  Duck");
  });

  it("handles non-ASCII letters", () => {
    expect(titleCase("élan vital")).toBe("Élan Vital");
  });
});
