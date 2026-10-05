import assert from "node:assert/strict";
import test from "node:test";

import { slugify, titleCase, truncate } from "./strings.ts";

test("slugify lowercases and hyphenates words", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("slugify trims and collapses separators", () => {
  assert.equal(slugify("  Foo---Bar & Baz  "), "foo-bar-baz");
});

test("slugify strips accents and drops symbol-only input", () => {
  assert.equal(slugify("Café au lait"), "cafe-au-lait");
  assert.equal(slugify("***"), "");
  assert.equal(slugify(""), "");
});

test("truncate leaves short strings unchanged", () => {
  assert.equal(truncate("duck", 4), "duck");
  assert.equal(truncate("duck", 10), "duck");
  assert.equal(truncate("", 3), "");
});

test("truncate adds an ellipsis within the max length", () => {
  assert.equal(truncate("Hello world", 8), "Hello...");
  assert.equal(truncate("Hello world", 8).length, 8);
});

test("truncate handles budgets shorter than the ellipsis", () => {
  assert.equal(truncate("Hello", 3), "...");
  assert.equal(truncate("Hello", 2), "..");
  assert.equal(truncate("Hello", 0), "");
});

test("truncate rejects invalid lengths", () => {
  assert.throws(() => truncate("Hello", -1), RangeError);
  assert.throws(() => truncate("Hello", 1.5), RangeError);
});

test("titleCase capitalizes each word", () => {
  assert.equal(titleCase("hello world"), "Hello World");
  assert.equal(titleCase("HELLO WORLD"), "Hello World");
});

test("titleCase preserves surrounding whitespace", () => {
  assert.equal(titleCase("  spaced   out  "), "  Spaced   Out  ");
});

test("titleCase leaves an empty string empty", () => {
  assert.equal(titleCase(""), "");
});
