import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify, titleCase, truncate } from "./strings.ts";

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

  it("returns an empty string when nothing is sluggable", () => {
    assert.equal(slugify("!!!"), "");
  });
});

describe("truncate", () => {
  it("returns the input unchanged when it fits", () => {
    assert.equal(truncate("short", 10), "short");
    assert.equal(truncate("exact", 5), "exact");
  });

  it("truncates and appends an ellipsis within maxLength", () => {
    const result = truncate("Hello wonderful world", 10);
    assert.equal(result, "Hello won…");
    assert.ok(Array.from(result).length <= 10);
  });

  it("trims trailing whitespace before the ellipsis", () => {
    assert.equal(truncate("Hello world", 7), "Hello…");
  });

  it("supports a custom ellipsis", () => {
    assert.equal(truncate("abcdefghij", 6, "..."), "abc...");
  });

  it("handles maxLength smaller than the ellipsis", () => {
    assert.equal(truncate("abcdefghij", 2, "..."), "..");
    assert.equal(truncate("abc", 0), "");
  });

  it("does not split surrogate pairs", () => {
    assert.equal(truncate("😀😀😀😀", 3), "😀😀…");
  });

  it("throws on negative maxLength", () => {
    assert.throws(() => truncate("abc", -1), RangeError);
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

  it("handles non-ASCII letters", () => {
    assert.equal(titleCase("élan vital"), "Élan Vital");
  });

  it("returns an empty string for empty input", () => {
    assert.equal(titleCase(""), "");
  });
});
