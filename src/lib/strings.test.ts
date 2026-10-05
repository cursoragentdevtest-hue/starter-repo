import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify, titleCase, truncate } from "./strings.ts";

// Bypasses the type checker so runtime validation can be exercised.
const loose = <T extends (...args: never[]) => unknown>(fn: T) =>
  fn as unknown as (...args: unknown[]) => unknown;

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("collapses punctuation and trims leading/trailing separators", () => {
    assert.equal(slugify("  --Hello, World!!  "), "hello-world");
  });

  it("strips diacritics", () => {
    assert.equal(slugify("Crème Brûlée"), "creme-brulee");
  });

  it("keeps digits and treats underscores and tabs/newlines as separators", () => {
    assert.equal(slugify("Top_10\tTips\nfor 2026"), "top-10-tips-for-2026");
  });

  it("drops characters with no ASCII equivalent", () => {
    assert.equal(slugify("日本 rocks 🚀"), "rocks");
  });

  it("is idempotent", () => {
    const once = slugify("Some Title: Part II");
    assert.equal(slugify(once), once);
  });

  it("returns an empty string for empty or non-sluggable input", () => {
    assert.equal(slugify(""), "");
    assert.equal(slugify("!!!"), "");
  });

  it("rejects non-string input with a descriptive TypeError", () => {
    assert.throws(() => loose(slugify)(42), {
      name: "TypeError",
      message: "slugify: expected input to be a string, got number",
    });
    assert.throws(() => loose(slugify)(null), {
      message: "slugify: expected input to be a string, got null",
    });
    assert.throws(() => loose(slugify)(undefined), {
      message: "slugify: expected input to be a string, got undefined",
    });
  });
});

describe("truncate", () => {
  it("returns the input unchanged when it fits", () => {
    assert.equal(truncate("short", 10), "short");
    assert.equal(truncate("exact", 5), "exact");
    assert.equal(truncate("", 0), "");
  });

  it("truncates and appends an ellipsis within maxLength", () => {
    const result = truncate("Hello wonderful world", 10);
    assert.equal(result, "Hello won…");
    assert.equal(Array.from(result).length, 10);
  });

  it("trims trailing whitespace before the ellipsis", () => {
    assert.equal(truncate("Hello world", 7), "Hello…");
  });

  it("supports custom and empty ellipses", () => {
    assert.equal(truncate("abcdefghij", 6, "..."), "abc...");
    assert.equal(truncate("abcdefghij", 4, ""), "abcd");
  });

  it("cuts the ellipsis itself when maxLength cannot fit it", () => {
    assert.equal(truncate("abcdefghij", 3, "..."), "...");
    assert.equal(truncate("abcdefghij", 2, "..."), "..");
    assert.equal(truncate("abc", 0), "");
  });

  it("does not split surrogate pairs in input or ellipsis", () => {
    assert.equal(truncate("😀😀😀😀", 3), "😀😀…");
    assert.equal(truncate("abcdef", 3, "👉👉"), "a👉👉");
  });

  it("rejects invalid maxLength with a descriptive RangeError", () => {
    for (const bad of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => truncate("abc", bad), {
        name: "RangeError",
        message: `truncate: expected maxLength to be a non-negative integer, got ${bad}`,
      });
    }
    assert.throws(() => loose(truncate)("abc", "5"), RangeError);
  });

  it("rejects non-string input and ellipsis with a descriptive TypeError", () => {
    assert.throws(() => loose(truncate)(123, 2), {
      name: "TypeError",
      message: "truncate: expected input to be a string, got number",
    });
    assert.throws(() => loose(truncate)("abc", 2, null), {
      name: "TypeError",
      message: "truncate: expected ellipsis to be a string, got null",
    });
  });
});

describe("titleCase", () => {
  it("capitalizes the first letter of each word", () => {
    assert.equal(titleCase("hello world"), "Hello World");
  });

  it("lowercases the rest of each word", () => {
    assert.equal(titleCase("hELLO wORLD"), "Hello World");
  });

  it("treats hyphens and underscores as word boundaries", () => {
    assert.equal(titleCase("well-known snake_case"), "Well-Known Snake_Case");
  });

  it("preserves surrounding and repeated whitespace", () => {
    assert.equal(titleCase("  hello   world  "), "  Hello   World  ");
  });

  it("leaves words starting with digits or punctuation alone", () => {
    assert.equal(titleCase("2nd place 'quoted'"), "2nd Place 'quoted'");
  });

  it("handles non-ASCII letters", () => {
    assert.equal(titleCase("élan vital"), "Élan Vital");
  });

  it("returns an empty string for empty input", () => {
    assert.equal(titleCase(""), "");
  });

  it("rejects non-string input with a descriptive TypeError", () => {
    assert.throws(() => loose(titleCase)({}), {
      name: "TypeError",
      message: "titleCase: expected input to be a string, got object",
    });
  });
});
