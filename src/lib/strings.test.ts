import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { slugify, titleCase, truncate } from "./strings.ts";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("strips punctuation, accents, and surrounding separators", () => {
    assert.equal(slugify("  Crème Brûlée: A Recipe!  "), "creme-brulee-a-recipe");
  });

  it("collapses repeated separators", () => {
    assert.equal(slugify("a -- b__c"), "a-b-c");
  });

  it("returns an empty string for input with no alphanumerics", () => {
    assert.equal(slugify("!!!"), "");
  });
});

describe("truncate", () => {
  it("returns the input unchanged when it fits", () => {
    assert.equal(truncate("short", 10), "short");
    assert.equal(truncate("exact", 5), "exact");
  });

  it("truncates and appends an ellipsis within maxLength", () => {
    const result = truncate("The quick brown fox", 10);
    assert.equal(result, "The quick…");
    assert.ok(Array.from(result).length <= 10);
  });

  it("supports a custom ellipsis", () => {
    assert.equal(truncate("abcdefghij", 6, "..."), "abc...");
  });

  it("handles maxLength smaller than the ellipsis", () => {
    assert.equal(truncate("abcdef", 2, "..."), "..");
    assert.equal(truncate("abcdef", 0), "");
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

  it("capitalizes after hyphens and underscores", () => {
    assert.equal(titleCase("well-known snake_case"), "Well-Known Snake_Case");
  });

  it("handles non-ASCII letters and empty input", () => {
    assert.equal(titleCase("élan vital"), "Élan Vital");
    assert.equal(titleCase(""), "");
  });
});
