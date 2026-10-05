import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { slugify, titleCase, truncate } from "./strings.ts";

describe("slugify", () => {
  it("lowercases words and joins them with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("collapses whitespace and trims the ends", () => {
    assert.equal(slugify("  Multiple   spaces "), "multiple-spaces");
  });

  it("strips punctuation and diacritics", () => {
    assert.equal(slugify("Café au lait!"), "cafe-au-lait");
  });

  it("treats underscores and symbols as separators", () => {
    assert.equal(slugify("Hello_World / Part 2"), "hello-world-part-2");
  });

  it("returns an empty string when nothing slug-worthy remains", () => {
    assert.equal(slugify(""), "");
    assert.equal(slugify("---"), "");
    assert.equal(slugify("   !!!   "), "");
  });

  it("leaves an existing slug unchanged", () => {
    assert.equal(slugify("already-a-slug"), "already-a-slug");
  });
});

describe("truncate", () => {
  it("returns the original string when it already fits", () => {
    assert.equal(truncate("hello", 10), "hello");
    assert.equal(truncate("hello", 5), "hello");
  });

  it("cuts the string and appends an ellipsis within the limit", () => {
    assert.equal(truncate("hello world", 8), "hello...");
    assert.equal(truncate("hello world", 8).length, 8);
  });

  it("returns an empty string when the limit is zero", () => {
    assert.equal(truncate("hello", 0), "");
  });

  it("slices the ellipsis when the limit is shorter than it", () => {
    assert.equal(truncate("hello", 3), "...");
    assert.equal(truncate("hello", 2), "..");
    assert.equal(truncate("hello", 1), ".");
  });

  it("rejects a negative or non-integer limit", () => {
    assert.throws(() => truncate("hello", -1), RangeError);
    assert.throws(() => truncate("hello", 1.5), RangeError);
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    assert.equal(titleCase("hello world"), "Hello World");
  });

  it("lowercases the remainder of each word", () => {
    assert.equal(titleCase("HELLO WORLD"), "Hello World");
  });

  it("preserves surrounding and repeated whitespace", () => {
    assert.equal(titleCase("  spaced   out "), "  Spaced   Out ");
  });

  it("handles apostrophes inside a word", () => {
    assert.equal(titleCase("don't stop"), "Don't Stop");
  });

  it("returns an empty string unchanged", () => {
    assert.equal(titleCase(""), "");
  });

  it("capitalizes a single letter", () => {
    assert.equal(titleCase("a"), "A");
  });
});
