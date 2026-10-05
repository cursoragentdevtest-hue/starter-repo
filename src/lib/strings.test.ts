import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { slugify, titleCase, truncate } from "./strings.ts";

describe("slugify", () => {
  it("lowercases and hyphenates words", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("trims, collapses separators, and drops punctuation", () => {
    assert.equal(slugify("  Foo---bar!! baz  "), "foo-bar-baz");
  });

  it("strips diacritics", () => {
    assert.equal(slugify("Café au lait"), "cafe-au-lait");
  });

  it("returns an empty string when nothing slug-worthy remains", () => {
    assert.equal(slugify("   ---!!!   "), "");
  });
});

describe("truncate", () => {
  it("returns the original string when it already fits", () => {
    assert.equal(truncate("hello", 10), "hello");
    assert.equal(truncate("hello", 5), "hello");
  });

  it("appends an ellipsis and keeps the result within maxLength", () => {
    const result = truncate("hello world", 8);
    assert.equal(result, "hello w…");
    assert.equal(result.length, 8);
  });

  it("counts a custom ellipsis toward the limit", () => {
    assert.equal(truncate("hello world", 5, "..."), "he...");
  });

  it("returns a sliced ellipsis when the limit is shorter than the marker", () => {
    assert.equal(truncate("hello", 1), "…");
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

  it("lowercases the rest of each word", () => {
    assert.equal(titleCase("hELLo WoRLD"), "Hello World");
  });

  it("preserves surrounding whitespace", () => {
    assert.equal(titleCase("  foo   bar "), "  Foo   Bar ");
  });

  it("leaves an empty string empty", () => {
    assert.equal(titleCase(""), "");
  });
});
