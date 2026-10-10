import { describe, expect, it } from "vitest";
import {
  camelCase,
  capitalize,
  collapseWhitespace,
  countOccurrences,
  ensurePrefix,
  ensureSuffix,
  escapeRegExp,
  groupDigits,
  hashString,
  initials,
  isBlank,
  kebabCase,
  lines,
  padEnd,
  padStart,
  pascalCase,
  quote,
  replaceAll,
  reverse,
  snakeCase,
  stripPrefix,
  stripSuffix,
  titleCase,
  toWords,
  truncate,
} from "./strings";

describe("collapseWhitespace", () => {
  it("collapses whitespace", () => {
    expect(collapseWhitespace("  a \n  b\t c  ")).toBe("a b c");
    expect(collapseWhitespace("")).toBe("");
  });
});

describe("capitalize", () => {
  it("capitalizes the first letter", () => {
    expect(capitalize("hELLo")).toBe("Hello");
    expect(capitalize("")).toBe("");
  });
});

describe("toWords", () => {
  it("splits identifiers into words", () => {
    expect(toWords("helloWorld")).toBe("hello world");
    expect(toWords("hello_world")).toBe("hello world");
  });
});

describe("camelCase", () => {
  it("builds camelCase", () => {
    expect(camelCase("hello world")).toBe("helloWorld");
    expect(camelCase("Hello-world")).toBe("helloWorld");
  });
});

describe("pascalCase", () => {
  it("builds PascalCase", () => {
    expect(pascalCase("hello world")).toBe("HelloWorld");
    expect(pascalCase("hello_world")).toBe("HelloWorld");
  });
});

describe("snakeCase", () => {
  it("builds snake_case", () => {
    expect(snakeCase("helloWorld")).toBe("hello_world");
    expect(snakeCase("Hello World")).toBe("hello_world");
  });
});

describe("kebabCase", () => {
  it("builds kebab-case", () => {
    expect(kebabCase("helloWorld")).toBe("hello-world");
    expect(kebabCase("Hello World")).toBe("hello-world");
  });
});

describe("titleCase", () => {
  it("title-cases words", () => {
    expect(titleCase("the quick brown fox")).toBe("The Quick Brown Fox");
    expect(titleCase("hello")).toBe("Hello");
  });
});

describe("truncate", () => {
  it("shortens long strings", () => {
    expect(truncate("hello world", 8)).toBe("hello w…");
    expect(truncate("hi", 8)).toBe("hi");
  });
});

describe("padStart", () => {
  it("pads on the left", () => {
    expect(padStart("7", 3, "0")).toBe("007");
    expect(padStart("abc", 2, "0")).toBe("abc");
  });
});

describe("padEnd", () => {
  it("pads on the right", () => {
    expect(padEnd("7", 3, "0")).toBe("700");
    expect(padEnd("abc", 2, "0")).toBe("abc");
  });
});

describe("countOccurrences", () => {
  it("counts overlapping matches", () => {
    expect(countOccurrences("aaa", "aa")).toBe(2);
    expect(countOccurrences("abc", "")).toBe(0);
  });
});

describe("escapeRegExp", () => {
  it("escapes special characters", () => {
    expect(escapeRegExp("a+b")).toBe("a\\+b");
    expect(new RegExp(escapeRegExp(".")).test("a")).toBe(false);
  });
});

describe("stripPrefix", () => {
  it("drops a leading prefix", () => {
    expect(stripPrefix("foobar", "foo")).toBe("bar");
    expect(stripPrefix("foobar", "bar")).toBe("foobar");
  });
});

describe("stripSuffix", () => {
  it("drops a trailing suffix", () => {
    expect(stripSuffix("foobar", "bar")).toBe("foo");
    expect(stripSuffix("foobar", "foo")).toBe("foobar");
  });
});

describe("ensurePrefix", () => {
  it("adds a missing prefix", () => {
    expect(ensurePrefix("world", "hello ")).toBe("hello world");
    expect(ensurePrefix("hello", "hello")).toBe("hello");
  });
});

describe("ensureSuffix", () => {
  it("adds a missing suffix", () => {
    expect(ensureSuffix("file", ".txt")).toBe("file.txt");
    expect(ensureSuffix("file.txt", ".txt")).toBe("file.txt");
  });
});

describe("lines", () => {
  it("splits lines", () => {
    expect(lines("a\nb\n")).toEqual(["a", "b"]);
    expect(lines("")).toEqual([""]);
  });
});

describe("quote", () => {
  it("wraps text in quotes", () => {
    expect(quote('say "hi"')).toBe('"say \\"hi\\""');
    expect(quote("plain")).toBe('"plain"');
  });
});

describe("initials", () => {
  it("takes leading letters", () => {
    expect(initials("Ada Lovelace")).toBe("AL");
    expect(initials("a b c", 1)).toBe("A");
  });
});

describe("isBlank", () => {
  it("detects blank text", () => {
    expect(isBlank("  \n")).toBe(true);
    expect(isBlank("a")).toBe(false);
  });
});

describe("reverse", () => {
  it("reverses characters", () => {
    expect(reverse("abc")).toBe("cba");
    expect(reverse("")).toBe("");
  });
});

describe("hashString", () => {
  it("is stable and distinguishes strings", () => {
    expect(hashString("hello")).toBe(hashString("hello"));
    expect(hashString("a")).not.toBe(hashString("b"));
  });
});

describe("groupDigits", () => {
  it("groups from the right", () => {
    expect(groupDigits("1234567")).toBe("1,234,567");
    expect(groupDigits("abcd", "-", 2)).toBe("ab-cd");
  });
});

describe("replaceAll", () => {
  it("replaces every match", () => {
    expect(replaceAll("a-b-a", "a", "c")).toBe("c-b-c");
    expect(replaceAll("aa", /a/g, () => "b")).toBe("bb");
  });
});
