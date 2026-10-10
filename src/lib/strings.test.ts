import { describe, expect, it } from "vitest";
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

describe("strings", () => {
  it("capitalize", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("")).toBe("");
  });

  it("uncapitalize", () => {
    expect(uncapitalize("Hello")).toBe("hello");
  });

  it("camelCase", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
  });

  it("kebabCase", () => {
    expect(kebabCase("Hello World")).toBe("hello-world");
  });

  it("snakeCase", () => {
    expect(snakeCase("Hello World")).toBe("hello_world");
  });

  it("titleCase", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("truncate", () => {
    expect(truncate("hello world", 8)).toBe("hello...");
    expect(truncate("hi", 8)).toBe("hi");
  });

  it("slugify", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("reverseString", () => {
    expect(reverseString("duck")).toBe("kcud");
  });

  it("countOccurrences", () => {
    expect(countOccurrences("banana", "na")).toBe(2);
  });

  it("isBlank", () => {
    expect(isBlank("  \n")).toBe(true);
    expect(isBlank("a")).toBe(false);
  });

  it("isPalindrome", () => {
    expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
    expect(isPalindrome("duck")).toBe(false);
  });

  it("wordCount", () => {
    expect(wordCount("one two  three")).toBe(3);
    expect(wordCount("   ")).toBe(0);
  });

  it("initials", () => {
    expect(initials("ada lovelace")).toBe("AL");
  });

  it("collapseWhitespace", () => {
    expect(collapseWhitespace("  a \n b  ")).toBe("a b");
  });

  it("removePrefix", () => {
    expect(removePrefix("untitled", "un")).toBe("titled");
  });

  it("removeSuffix", () => {
    expect(removeSuffix("filename.txt", ".txt")).toBe("filename");
  });

  it("wrap", () => {
    expect(wrap("duck", "*")).toBe("*duck*");
  });

  it("lines", () => {
    expect(lines("a\r\nb")).toEqual(["a", "b"]);
    expect(lines("")).toEqual([]);
  });

  it("interpolate", () => {
    expect(interpolate("Hello {name}", { name: "Ada" })).toBe("Hello Ada");
    expect(interpolate("{missing}", {})).toBe("{missing}");
  });

  it("mask", () => {
    expect(mask("1234567890", 4)).toBe("******7890");
  });

  it("pluralize", () => {
    expect(pluralize(1, "duck")).toBe("1 duck");
    expect(pluralize(2, "duck")).toBe("2 ducks");
  });

  it("swapCase", () => {
    expect(swapCase("AbC")).toBe("aBc");
  });

  it("isNumericString", () => {
    expect(isNumericString("-12.5")).toBe(true);
    expect(isNumericString("12px")).toBe(false);
  });

  it("between", () => {
    expect(between("a[b]c", "[", "]")).toBe("b");
    expect(between("abc", "[", "]")).toBe("");
  });
});
