import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify, titleCase, truncate } from "./strings.ts";

describe("slugify", () => {
  it("lowercases words and joins them with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("collapses extra spaces and punctuation", () => {
    assert.equal(slugify("  Hello,   World!  "), "hello-world");
  });

  it("strips diacritics", () => {
    assert.equal(slugify("Café au lait"), "cafe-au-lait");
  });

  it("returns an empty string when nothing slug-worthy remains", () => {
    assert.equal(slugify("---"), "");
    assert.equal(slugify(""), "");
  });
});

describe("truncate", () => {
  it("returns the original string when it already fits", () => {
    assert.equal(truncate("duck", 4), "duck");
    assert.equal(truncate("duck", 10), "duck");
  });

  it("ends a shortened string with an ellipsis inside the limit", () => {
    assert.equal(truncate("hello world", 8), "hello...");
    assert.equal(truncate("hello world", 8).length, 8);
  });

  it("uses only as much ellipsis as maxLength allows", () => {
    assert.equal(truncate("hello", 2), "..");
    assert.equal(truncate("hello", 0), "");
  });

  it("rejects a negative or non-integer maxLength", () => {
    assert.throws(() => truncate("hello", -1), RangeError);
    assert.throws(() => truncate("hello", 1.5), RangeError);
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    assert.equal(titleCase("hello world"), "Hello World");
  });

  it("lowercases the remainder of each word", () => {
    assert.equal(titleCase("hELLo wORLD"), "Hello World");
  });

  it("preserves existing spacing", () => {
    assert.equal(titleCase("  spaced   out "), "  Spaced   Out ");
  });

  it("returns an empty string unchanged", () => {
    assert.equal(titleCase(""), "");
  });
});
