import { expect, it } from "vitest";
import {
  between,
  camelCase,
  capitalize,
  collapseWhitespace,
  countOccurrences,
  initials,
  interpolate,
  isBlank,
  isNumericString,
  isPalindrome,
  kebabCase,
  lines,
  mask,
  pluralize,
  removePrefix,
  removeSuffix,
  reverseString,
  slugify,
  snakeCase,
  swapCase,
  titleCase,
  truncate,
  uncapitalize,
  wordCount,
  wrap,
} from "./strings";

it("capitalizes the first character", () => {
  expect(capitalize("duck")).toBe("Duck");
  expect(capitalize("")).toBe("");
});

it("lowercases the first character", () => {
  expect(uncapitalize("Duck")).toBe("duck");
  expect(uncapitalize("ABC")).toBe("aBC");
});

it("builds camel case", () => {
  expect(camelCase("hello world")).toBe("helloWorld");
  expect(camelCase("hello-world")).toBe("helloWorld");
});

it("builds kebab case", () => {
  expect(kebabCase("helloWorld")).toBe("hello-world");
  expect(kebabCase("Hello World")).toBe("hello-world");
});

it("builds snake case", () => {
  expect(snakeCase("Hello World")).toBe("hello_world");
  expect(snakeCase("helloWorld")).toBe("hello_world");
});

it("title-cases words without stripping accents", () => {
  expect(titleCase("déjà vu")).toBe("Déjà Vu");
  expect(titleCase("hello world")).toBe("Hello World");
});

it("truncates with an ellipsis that counts toward the limit", () => {
  expect(truncate("hello world", 8)).toBe("hello...");
  expect(truncate("abcdef", 2)).toBe("ab");
  expect(truncate("hi", 8)).toBe("hi");
});

it("slugifies with NFKD and drops combining marks", () => {
  expect(slugify("Café")).toBe("cafe");
  expect(slugify("Hello, World!")).toBe("hello-world");
});

it("reverses by code point", () => {
  expect(reverseString("a🦆b")).toBe("b🦆a");
  expect(reverseString("ab")).toBe("ba");
});

it("counts non-overlapping occurrences", () => {
  expect(countOccurrences("aaaa", "aa")).toBe(2);
  expect(countOccurrences("aaa", "aa")).toBe(1);
  expect(countOccurrences("abc", "")).toBe(0);
});

it("detects blank strings", () => {
  expect(isBlank("  \n")).toBe(true);
  expect(isBlank(" a ")).toBe(false);
});

it("detects palindromes after dropping punctuation", () => {
  expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
  expect(isPalindrome("duck")).toBe(false);
});

it("counts whitespace-delimited words", () => {
  expect(wordCount("hello world")).toBe(2);
  expect(wordCount("  a   b  ")).toBe(2);
  expect(wordCount("helloWorld")).toBe(1);
  expect(wordCount("   ")).toBe(0);
});

it("builds initials", () => {
  expect(initials("Ada Lovelace")).toBe("AL");
  expect(initials("Grace Brewster Hopper", 2)).toBe("GB");
});

it("collapses whitespace", () => {
  expect(collapseWhitespace("  a \n b\t")).toBe("a b");
  expect(collapseWhitespace("hello")).toBe("hello");
});

it("removes a prefix and ignores an empty prefix", () => {
  expect(removePrefix("prefix-value", "prefix")).toBe("-value");
  expect(removePrefix("prefix-value", "")).toBe("prefix-value");
  expect(removePrefix("prefix-value", "nope")).toBe("prefix-value");
});

it("removes a suffix and ignores an empty suffix", () => {
  expect(removeSuffix("value-suffix", "suffix")).toBe("value-");
  expect(removeSuffix("value-suffix", "")).toBe("value-suffix");
});

it("wraps a string", () => {
  expect(wrap("x", "*")).toBe("*x*");
  expect(wrap("duck", "«")).toBe("«duck«");
});

it("splits lines and keeps a trailing empty line", () => {
  expect(lines("")).toEqual([]);
  expect(lines("a\r\nb\n")).toEqual(["a", "b", ""]);
  expect(lines("a\rb")).toEqual(["a", "b"]);
});

it("interpolates known keys and leaves unknown placeholders", () => {
  expect(interpolate("Hi { name }", { name: "Ada" })).toBe("Hi Ada");
  expect(interpolate("Hi {name}", {})).toBe("Hi {name}");
  expect(interpolate("{n}", { n: 3 })).toBe("3");
});

it("masks the middle and treats a negative keep as zero", () => {
  expect(mask("secret", { keepStart: 1, keepEnd: 1 })).toBe("s****t");
  expect(mask("ab", { keepStart: 5 })).toBe("ab");
  expect(mask("secret", { keepStart: -1 })).toBe("******");
  expect(mask("secret")).toBe("******");
});

it("uses the singular only when the count is 1", () => {
  expect(pluralize("duck", 1)).toBe("duck");
  expect(pluralize("duck", 0)).toBe("ducks");
  expect(pluralize("goose", 2, "geese")).toBe("geese");
});

it("swaps case", () => {
  expect(swapCase("AbC")).toBe("aBc");
  expect(swapCase("a1B")).toBe("A1b");
});

it("accepts trimmed decimal strings and rejects scientific notation", () => {
  expect(isNumericString("  -12.5 ")).toBe(true);
  expect(isNumericString(".5")).toBe(true);
  expect(isNumericString("1.")).toBe(true);
  expect(isNumericString("1e5")).toBe(false);
  expect(isNumericString("")).toBe(false);
});

it("returns the text between delimiters", () => {
  expect(between("a[b]c", "[", "]")).toBe("b");
  expect(between("no delimiters", "[", "]")).toBe("");
});
