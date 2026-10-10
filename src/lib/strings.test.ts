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

describe("capitalize", () => {
  it("uppercases the first character", () => {
    expect(capitalize("duck")).toBe("Duck");
    expect(capitalize("")).toBe("");
  });
});

describe("uncapitalize", () => {
  it("lowercases the first character", () => {
    expect(uncapitalize("Duck")).toBe("duck");
  });
});

describe("camelCase", () => {
  it("joins words in camel case", () => {
    expect(camelCase("silly starter")).toBe("sillyStarter");
    expect(camelCase("already-kebab")).toBe("alreadyKebab");
  });
});

describe("kebabCase", () => {
  it("joins words with hyphens", () => {
    expect(kebabCase("Silly Starter")).toBe("silly-starter");
  });
});

describe("snakeCase", () => {
  it("joins words with underscores", () => {
    expect(snakeCase("Silly Starter")).toBe("silly_starter");
  });
});

describe("titleCase", () => {
  it("capitalizes each word", () => {
    expect(titleCase("silly starter")).toBe("Silly Starter");
  });
});

describe("truncate", () => {
  it("shortens long strings", () => {
    expect(truncate("breadcrumbs", 6)).toBe("bre...");
    expect(truncate("duck", 10)).toBe("duck");
  });
});

describe("slugify", () => {
  it("builds a url slug", () => {
    expect(slugify("Hello, Duck!")).toBe("hello-duck");
  });
});

describe("reverseString", () => {
  it("reverses characters", () => {
    expect(reverseString("duck")).toBe("kcud");
  });
});

describe("countOccurrences", () => {
  it("counts non-overlapping matches", () => {
    expect(countOccurrences("banana", "na")).toBe(2);
    expect(countOccurrences("aaa", "")).toBe(0);
  });
});

describe("isBlank", () => {
  it("treats whitespace as blank", () => {
    expect(isBlank("  \n")).toBe(true);
    expect(isBlank("a")).toBe(false);
  });
});

describe("isPalindrome", () => {
  it("ignores case and punctuation", () => {
    expect(isPalindrome("A man, a plan, a canal: Panama")).toBe(true);
    expect(isPalindrome("duck")).toBe(false);
  });
});

describe("wordCount", () => {
  it("counts words", () => {
    expect(wordCount("one two  three")).toBe(3);
  });
});

describe("initials", () => {
  it("takes the first letter of each word", () => {
    expect(initials("silly starter")).toBe("SS");
    expect(initials("one two three", 2)).toBe("OT");
  });
});

describe("collapseWhitespace", () => {
  it("collapses runs of whitespace", () => {
    expect(collapseWhitespace("a \n  b")).toBe("a b");
  });
});

describe("removePrefix", () => {
  it("removes a leading prefix", () => {
    expect(removePrefix("unduck", "un")).toBe("duck");
    expect(removePrefix("duck", "un")).toBe("duck");
  });
});

describe("removeSuffix", () => {
  it("removes a trailing suffix", () => {
    expect(removeSuffix("ducks", "s")).toBe("duck");
  });
});

describe("wrap", () => {
  it("wraps both sides", () => {
    expect(wrap("duck", "*")).toBe("*duck*");
  });
});

describe("lines", () => {
  it("splits on newlines", () => {
    expect(lines("a\nb")).toEqual(["a", "b"]);
    expect(lines("")).toEqual([]);
  });
});

describe("interpolate", () => {
  it("fills placeholders", () => {
    expect(interpolate("Hello {name}", { name: "Duck" })).toBe("Hello Duck");
    expect(interpolate("{missing}", {})).toBe("{missing}");
  });
});

describe("mask", () => {
  it("hides the middle", () => {
    expect(mask("1234567890", 2, 2)).toBe("12******90");
  });
});

describe("pluralize", () => {
  it("picks a label from the count", () => {
    expect(pluralize(1, "duck", "ducks")).toBe("duck");
    expect(pluralize(2, "duck", "ducks")).toBe("ducks");
  });
});

describe("swapCase", () => {
  it("swaps character case", () => {
    expect(swapCase("Duck")).toBe("dUCK");
  });
});

describe("isNumericString", () => {
  it("accepts plain numbers", () => {
    expect(isNumericString("42")).toBe(true);
    expect(isNumericString("4a")).toBe(false);
  });
});

describe("between", () => {
  it("returns the slice between markers", () => {
    expect(between("a[duck]b", "[", "]")).toBe("duck");
    expect(between("nope", "[", "]")).toBe("");
  });
});
