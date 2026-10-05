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

  it("strips diacritics, including decomposed marks and the eszett", () => {
    assert.equal(slugify("Café au lait"), "cafe-au-lait");
    assert.equal(slugify("Cafe\u0301"), "cafe");
    assert.equal(slugify("Straße"), "strasse");
  });

  it("keeps digits and drops separators that are already hyphens", () => {
    assert.equal(slugify("Catch-22"), "catch-22");
    assert.equal(slugify("hello_world/foo"), "hello-world-foo");
    assert.equal(slugify("hello-world"), "hello-world");
  });

  it("expands compatibility ligatures", () => {
    assert.equal(slugify("ﬁle"), "file");
  });

  it("returns an empty string when nothing slug-worthy remains", () => {
    assert.equal(slugify("---"), "");
    assert.equal(slugify(""), "");
    assert.equal(slugify("   "), "");
    assert.equal(slugify("東京"), "");
  });

  it("rejects non-strings with the function name and received type", () => {
    assert.throws(() => slugify(null as unknown as string), {
      name: "TypeError",
      message: "slugify() expected a string but received null.",
    });
    assert.throws(() => slugify(undefined as unknown as string), {
      name: "TypeError",
      message: "slugify() expected a string but received undefined.",
    });
    assert.throws(() => slugify(12 as unknown as string), {
      name: "TypeError",
      message: "slugify() expected a string but received 12.",
    });
  });
});

describe("truncate", () => {
  it("returns the original string when it already fits", () => {
    assert.equal(truncate("duck", 4), "duck");
    assert.equal(truncate("duck", 10), "duck");
    assert.equal(truncate("", 0), "");
    assert.equal(truncate("", 3), "");
  });

  it("ends a shortened string with an ellipsis inside the limit", () => {
    assert.equal(truncate("hello world", 8), "hello...");
    assert.equal(truncate("hello world", 8).length, 8);
  });

  it("uses a full ellipsis when the limit is exactly three characters", () => {
    assert.equal(truncate("hello", 3), "...");
    assert.equal(truncate("abcde", 4), "a...");
  });

  it("uses only as much ellipsis as maxLength allows", () => {
    assert.equal(truncate("hello", 2), "..");
    assert.equal(truncate("hello", 0), "");
    assert.equal(truncate("hello", -0), "");
  });

  it("does not split an emoji when the cut falls inside it", () => {
    assert.equal("🦆".length, 2);
    assert.equal(truncate("🦆duck", 4), "...");
    assert.equal(truncate("a🦆bc", 4), "a...");
    assert.equal(truncate("hi🦆!", 4), "h...");
  });

  it("rejects a negative maxLength with the received number", () => {
    assert.throws(() => truncate("hello", -1), {
      name: "RangeError",
      message: "truncate() expected maxLength to be greater than or equal to 0 but received -1.",
    });
  });

  it("rejects a non-integer maxLength with the received value", () => {
    assert.throws(() => truncate("hello", 1.5), {
      name: "TypeError",
      message: "truncate() expected maxLength to be an integer but received 1.5.",
    });
    assert.throws(() => truncate("hello", Number.NaN), {
      name: "TypeError",
      message: "truncate() expected maxLength to be an integer but received NaN.",
    });
    assert.throws(() => truncate("hello", Number.POSITIVE_INFINITY), {
      name: "TypeError",
      message: "truncate() expected maxLength to be an integer but received Infinity.",
    });
    assert.throws(() => truncate("hello", "8" as unknown as number), {
      name: "TypeError",
      message: 'truncate() expected maxLength to be an integer but received "8".',
    });
  });

  it("rejects a non-string value before checking the limit", () => {
    assert.throws(() => truncate(null as unknown as string, 4), {
      name: "TypeError",
      message: "truncate() expected a string but received null.",
    });
    assert.throws(() => truncate({ text: "hi" } as unknown as string, 4), {
      name: "TypeError",
      message: "truncate() expected a string but received an object.",
    });
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    assert.equal(titleCase("hello world"), "Hello World");
  });

  it("lowercases the remainder of each word", () => {
    assert.equal(titleCase("hELLo wORLD"), "Hello World");
  });

  it("preserves existing spacing, including tabs and newlines", () => {
    assert.equal(titleCase("  spaced   out "), "  Spaced   Out ");
    assert.equal(titleCase("hello\tworld\nagain"), "Hello\tWorld\nAgain");
    assert.equal(titleCase("   "), "   ");
  });

  it("capitalizes the first letter after leading punctuation", () => {
    assert.equal(titleCase("(hello) world"), "(Hello) World");
    assert.equal(titleCase("it's fine"), "It's Fine");
  });

  it("leaves a word with no letters unchanged aside from case folding", () => {
    assert.equal(titleCase("... 404"), "... 404");
  });

  it("title-cases a single unicode word", () => {
    assert.equal(titleCase("école"), "École");
    assert.equal(titleCase("ÉCOLE"), "École");
  });

  it("returns an empty string unchanged", () => {
    assert.equal(titleCase(""), "");
  });

  it("rejects non-strings with the function name and received type", () => {
    assert.throws(() => titleCase(false as unknown as string), {
      name: "TypeError",
      message: "titleCase() expected a string but received false.",
    });
    assert.throws(() => titleCase(["Hello"] as unknown as string), {
      name: "TypeError",
      message: "titleCase() expected a string but received an array.",
    });
  });
});
