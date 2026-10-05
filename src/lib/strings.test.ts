import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify, titleCase, truncate } from "./strings.ts";

describe("slugify", () => {
  it("lowercases words and joins them with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("strips punctuation and collapses separators", () => {
    assert.equal(slugify("  Hello,   World!  "), "hello-world");
  });

  it("removes accents", () => {
    assert.equal(slugify("Café au lait"), "cafe-au-lait");
  });

  it("keeps digits and drops leading or trailing hyphens", () => {
    assert.equal(slugify("--Already---slug 123--"), "already-slug-123");
  });

  it("returns an empty string for empty or symbol-only input", () => {
    assert.equal(slugify(""), "");
    assert.equal(slugify("..."), "");
  });
});

describe("truncate", () => {
  it("returns the original string when it fits", () => {
    assert.equal(truncate("hello", 5), "hello");
    assert.equal(truncate("hi", 10), "hi");
  });

  it("appends an ellipsis and stays within the limit", () => {
    assert.equal(truncate("hello world", 8), "hello...");
    assert.equal(truncate("hello world", 8).length, 8);
  });

  it("accepts a custom ellipsis", () => {
    assert.equal(truncate("hello world", 7, "…"), "hello …");
  });

  it("returns a shortened ellipsis when the limit is smaller than the ellipsis", () => {
    assert.equal(truncate("hello world", 2), "..");
    assert.equal(truncate("hello world", 0), "");
  });

  it("rejects a negative max length", () => {
    assert.throws(() => truncate("hello", -1), RangeError);
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    assert.equal(titleCase("hello world"), "Hello World");
  });

  it("lowercases the remainder of each word", () => {
    assert.equal(titleCase("hELLo WORLD"), "Hello World");
  });

  it("preserves whitespace between words", () => {
    assert.equal(titleCase("  spaced   out"), "  Spaced   Out");
  });

  it("treats punctuation-attached tokens as a single word", () => {
    assert.equal(titleCase("foo-bar baz"), "Foo-bar Baz");
  });

  it("returns an empty string unchanged", () => {
    assert.equal(titleCase(""), "");
  });
});
