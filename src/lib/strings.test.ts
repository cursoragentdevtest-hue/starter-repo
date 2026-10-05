import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { slugify, titleCase, truncate } from "./strings.ts";

const nonStrings: Array<[unknown, string]> = [
  [null, "null"],
  [undefined, "undefined"],
  [42, "42"],
  [true, "true"],
  [["hello"], "array"],
  [{ text: "hello" }, "object"],
];

describe("slugify", () => {
  it("lowercases words and joins them with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
  });

  it("collapses whitespace and trims the ends", () => {
    assert.equal(slugify("  Multiple   spaces "), "multiple-spaces");
  });

  it("treats newlines and tabs as separators", () => {
    assert.equal(slugify("\nHello\tWorld\n"), "hello-world");
  });

  it("strips punctuation and diacritics", () => {
    assert.equal(slugify("Café au lait!"), "cafe-au-lait");
    assert.equal(slugify("naïve résumé"), "naive-resume");
  });

  it("folds eszett to ss", () => {
    assert.equal(slugify("Straße"), "strasse");
  });

  it("keeps digits and drops symbols and emoji", () => {
    assert.equal(slugify("Item #42: On Sale!"), "item-42-on-sale");
    assert.equal(slugify("hello 🦆 world"), "hello-world");
    assert.equal(slugify("123"), "123");
  });

  it("treats underscores and symbols as separators", () => {
    assert.equal(slugify("Hello_World / Part 2"), "hello-world-part-2");
  });

  it("strips hyphens that wrapping punctuation would leave behind", () => {
    assert.equal(slugify("---Hello---"), "hello");
  });

  it("returns an empty string when nothing slug-worthy remains", () => {
    assert.equal(slugify(""), "");
    assert.equal(slugify("---"), "");
    assert.equal(slugify("   !!!   "), "");
    assert.equal(slugify("🦆"), "");
  });

  it("leaves an existing slug unchanged", () => {
    assert.equal(slugify("already-a-slug"), "already-a-slug");
  });

  it("rejects non-string input and names what it received", () => {
    for (const [input, received] of nonStrings) {
      assert.throws(() => slugify(input as string), {
        name: "TypeError",
        message: `value must be a string (received ${received})`,
      });
    }
  });
});

describe("truncate", () => {
  it("returns the original string when it already fits", () => {
    assert.equal(truncate("hello", 10), "hello");
    assert.equal(truncate("hello", 5), "hello");
    assert.equal(truncate("", 4), "");
    assert.equal(truncate("   ", 3), "   ");
  });

  it("cuts the string and appends an ellipsis within the limit", () => {
    assert.equal(truncate("hello world", 8), "hello...");
    assert.equal(truncate("hello world", 8).length, 8);
    assert.equal(truncate("abcde", 4), "a...");
  });

  it("returns an empty string when the limit is zero", () => {
    assert.equal(truncate("hello", 0), "");
    assert.equal(truncate("", 0), "");
  });

  it("slices the ellipsis when the limit is shorter than it", () => {
    assert.equal(truncate("hello", 3), "...");
    assert.equal(truncate("hello", 2), "..");
    assert.equal(truncate("hello", 1), ".");
    assert.equal(truncate("   ", 2), "..");
  });

  it("drops a dangling surrogate instead of splitting an emoji", () => {
    assert.equal(truncate("ab\u{1F986}cdef", 6), "ab...");
    assert.equal(truncate("\u{1F986}duck", 4), "...");
  });

  it("rejects a non-string value before checking the limit", () => {
    assert.throws(() => truncate(null as unknown as string, -1), {
      name: "TypeError",
      message: "value must be a string (received null)",
    });
  });

  it("rejects a negative, fractional, or non-numeric limit", () => {
    const cases: Array<[unknown, string]> = [
      [-1, "-1"],
      [1.5, "1.5"],
      [Number.NaN, "NaN"],
      [Number.POSITIVE_INFINITY, "Infinity"],
      ["8", '"8"'],
      [null, "null"],
    ];

    for (const [maxLength, received] of cases) {
      assert.throws(() => truncate("hello", maxLength as number), {
        name: "RangeError",
        message: `maxLength must be a non-negative integer (received ${received})`,
      });
    }
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    assert.equal(titleCase("hello world"), "Hello World");
  });

  it("lowercases the remainder of each word", () => {
    assert.equal(titleCase("HELLO WORLD"), "Hello World");
    assert.equal(titleCase("hElLo"), "Hello");
  });

  it("preserves surrounding and repeated whitespace", () => {
    assert.equal(titleCase("  spaced   out "), "  Spaced   Out ");
    assert.equal(titleCase("hello\nworld"), "Hello\nWorld");
  });

  it("handles apostrophes inside a word", () => {
    assert.equal(titleCase("don't stop"), "Don't Stop");
    assert.equal(titleCase("O'BRIEN"), "O'brien");
    assert.equal(titleCase("rock 'n' roll"), "Rock 'n' Roll");
  });

  it("capitalizes hyphenated words and letters after punctuation", () => {
    assert.equal(titleCase("state-of-the-art"), "State-Of-The-Art");
    assert.equal(titleCase("hello, world!"), "Hello, World!");
  });

  it("leaves letters that continue a number unchanged", () => {
    assert.equal(titleCase("the 3rd place"), "The 3rd Place");
    assert.equal(titleCase("123 abc"), "123 Abc");
  });

  it("capitalizes accented words", () => {
    assert.equal(titleCase("élève des écoles"), "Élève Des Écoles");
  });

  it("returns an empty string and punctuation unchanged", () => {
    assert.equal(titleCase(""), "");
    assert.equal(titleCase("!!!"), "!!!");
  });

  it("capitalizes a single letter", () => {
    assert.equal(titleCase("a"), "A");
  });

  it("rejects non-string input and names what it received", () => {
    for (const [input, received] of nonStrings) {
      assert.throws(() => titleCase(input as string), {
        name: "TypeError",
        message: `value must be a string (received ${received})`,
      });
    }
  });
});
