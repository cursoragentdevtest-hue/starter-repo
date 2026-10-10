/**
 * String helpers for formatting, casing, and light parsing.
 *
 * Functions return new strings and do not mutate their inputs. Regular
 * expressions are written so user text is escaped before it is interpolated.
 */

/**
 * Trims `value` and collapses internal whitespace to single spaces.
 *
 * @param value - Text to tidy.
 * @returns The collapsed string.
 * @example
 * collapseWhitespace("  a \n  b\t c  ");
 * // => "a b c"
 * @example
 * collapseWhitespace("");
 * // => ""
 */
export function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Capitalizes the first character and lowercases the rest.
 *
 * @param value - Text to capitalize.
 * @returns The capitalized string. Empty input stays empty.
 * @example
 * capitalize("hELLo");
 * // => "Hello"
 * @example
 * capitalize("");
 * // => ""
 */
export function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/**
 * Converts `camelCase`, `PascalCase`, or `snake_case` text to space-separated words.
 *
 * @param value - Identifier-like text.
 * @returns Lowercase words separated by spaces.
 * @example
 * toWords("helloWorld");
 * // => "hello world"
 * @example
 * toWords("hello_world");
 * // => "hello world"
 */
export function toWords(value: string): string {
  return collapseWhitespace(
    value
      .replace(/[_-]+/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .toLowerCase(),
  );
}

/**
 * Converts text to `camelCase`.
 *
 * @param value - Words, snake case, or kebab case.
 * @returns A camelCase identifier.
 * @example
 * camelCase("hello world");
 * // => "helloWorld"
 * @example
 * camelCase("Hello-world");
 * // => "helloWorld"
 */
export function camelCase(value: string): string {
  const words = toWords(value).split(" ").filter(Boolean);
  return words
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join("");
}

/**
 * Converts text to `PascalCase`.
 *
 * @param value - Words, snake case, or kebab case.
 * @returns A PascalCase identifier.
 * @example
 * pascalCase("hello world");
 * // => "HelloWorld"
 * @example
 * pascalCase("hello_world");
 * // => "HelloWorld"
 */
export function pascalCase(value: string): string {
  return toWords(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join("");
}

/**
 * Converts text to `snake_case`.
 *
 * @param value - Words or camel case.
 * @returns A snake_case identifier.
 * @example
 * snakeCase("helloWorld");
 * // => "hello_world"
 * @example
 * snakeCase("Hello World");
 * // => "hello_world"
 */
export function snakeCase(value: string): string {
  return toWords(value).replace(/ /g, "_");
}

/**
 * Converts text to `kebab-case`.
 *
 * @param value - Words or camel case.
 * @returns A kebab-case identifier.
 * @example
 * kebabCase("helloWorld");
 * // => "hello-world"
 * @example
 * kebabCase("Hello World");
 * // => "hello-world"
 */
export function kebabCase(value: string): string {
  return toWords(value).replace(/ /g, "-");
}

/**
 * Title-cases each word.
 *
 * @param value - Text to title-case.
 * @returns Words with an uppercase first letter.
 * @example
 * titleCase("the quick brown fox");
 * // => "The Quick Brown Fox"
 * @example
 * titleCase("hello");
 * // => "Hello"
 */
export function titleCase(value: string): string {
  return toWords(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Truncates `value` to `maxLength`, appending `ellipsis` when it is cut.
 *
 * The ellipsis counts toward `maxLength`.
 *
 * @param value - Text to shorten.
 * @param maxLength - Maximum length of the result. Must be non-negative.
 * @param ellipsis - Suffix used when the text is cut. Defaults to `"…"`.
 * @returns The original string, or a shortened copy.
 * @throws {RangeError} When `maxLength` is negative.
 * @example
 * truncate("hello world", 8);
 * // => "hello w…"
 * @example
 * truncate("hi", 8);
 * // => "hi"
 */
export function truncate(value: string, maxLength: number, ellipsis = "…"): string {
  if (maxLength < 0) throw new RangeError("maxLength must be non-negative");
  if (value.length <= maxLength) return value;
  if (ellipsis.length >= maxLength) return ellipsis.slice(0, maxLength);
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Pads `value` on the left until it reaches `length`.
 *
 * @param value - Text to pad.
 * @param length - Minimum length.
 * @param fill - Pad string. Defaults to a space.
 * @returns The padded string.
 * @example
 * padStart("7", 3, "0");
 * // => "007"
 * @example
 * padStart("abc", 2, "0");
 * // => "abc"
 */
export function padStart(value: string, length: number, fill = " "): string {
  return value.padStart(length, fill);
}

/**
 * Pads `value` on the right until it reaches `length`.
 *
 * @param value - Text to pad.
 * @param length - Minimum length.
 * @param fill - Pad string. Defaults to a space.
 * @returns The padded string.
 * @example
 * padEnd("7", 3, "0");
 * // => "700"
 * @example
 * padEnd("abc", 2, "0");
 * // => "abc"
 */
export function padEnd(value: string, length: number, fill = " "): string {
  return value.padEnd(length, fill);
}

/**
 * Counts occurrences of `needle` in `haystack`.
 *
 * Overlapping matches count. An empty needle returns `0`.
 *
 * @param haystack - Text to search.
 * @param needle - Substring to count.
 * @returns The number of matches.
 * @example
 * countOccurrences("aaa", "aa");
 * // => 2
 * @example
 * countOccurrences("abc", "");
 * // => 0
 */
export function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = 0;
  while (index <= haystack.length - needle.length) {
    const found = haystack.indexOf(needle, index);
    if (found === -1) break;
    count += 1;
    index = found + 1;
  }
  return count;
}

/**
 * Escapes characters that are special in a regular expression.
 *
 * @param value - Literal text.
 * @returns A pattern that matches `value` exactly.
 * @example
 * escapeRegExp("a+b");
 * // => "a\\+b"
 * @example
 * new RegExp(escapeRegExp(".")).test("a");
 * // => false
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Removes a prefix when `value` starts with it.
 *
 * @param value - Text to trim.
 * @param prefix - Prefix to drop.
 * @returns The remainder, or `value` when the prefix is absent.
 * @example
 * stripPrefix("foobar", "foo");
 * // => "bar"
 * @example
 * stripPrefix("foobar", "bar");
 * // => "foobar"
 */
export function stripPrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/**
 * Removes a suffix when `value` ends with it.
 *
 * @param value - Text to trim.
 * @param suffix - Suffix to drop.
 * @returns The remainder, or `value` when the suffix is absent.
 * @example
 * stripSuffix("foobar", "bar");
 * // => "foo"
 * @example
 * stripSuffix("foobar", "foo");
 * // => "foobar"
 */
export function stripSuffix(value: string, suffix: string): string {
  return suffix.length > 0 && value.endsWith(suffix)
    ? value.slice(0, -suffix.length)
    : value;
}

/**
 * Ensures `value` starts with `prefix`.
 *
 * @param value - Text to check.
 * @param prefix - Required prefix.
 * @returns `value` unchanged when it already starts with `prefix`.
 * @example
 * ensurePrefix("world", "hello ");
 * // => "hello world"
 * @example
 * ensurePrefix("hello", "hello");
 * // => "hello"
 */
export function ensurePrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value : prefix + value;
}

/**
 * Ensures `value` ends with `suffix`.
 *
 * @param value - Text to check.
 * @param suffix - Required suffix.
 * @returns `value` unchanged when it already ends with `suffix`.
 * @example
 * ensureSuffix("file", ".txt");
 * // => "file.txt"
 * @example
 * ensureSuffix("file.txt", ".txt");
 * // => "file.txt"
 */
export function ensureSuffix(value: string, suffix: string): string {
  return value.endsWith(suffix) ? value : value + suffix;
}

/**
 * Splits `value` into lines, dropping a trailing empty line from a final newline.
 *
 * @param value - Multiline text.
 * @returns The lines.
 * @example
 * lines("a\nb\n");
 * // => ["a", "b"]
 * @example
 * lines("");
 * // => [""]
 */
export function lines(value: string): string[] {
  if (value.endsWith("\n")) return value.slice(0, -1).split("\n");
  return value.split("\n");
}

/**
 * Wraps `value` in double quotes and escapes embedded quotes and backslashes.
 *
 * @param value - Text to quote.
 * @returns A quoted string.
 * @example
 * quote("say \"hi\"");
 * // => "\"say \\\"hi\\\"\""
 * @example
 * quote("plain");
 * // => "\"plain\""
 */
export function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Initials of the words in `value`.
 *
 * @param value - A name or phrase.
 * @param limit - Maximum number of initials. Defaults to `2`.
 * @returns Uppercase initials.
 * @example
 * initials("Ada Lovelace");
 * // => "AL"
 * @example
 * initials("a b c", 1);
 * // => "A"
 */
export function initials(value: string, limit = 2): string {
  return toWords(value)
    .split(" ")
    .filter(Boolean)
    .slice(0, limit)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/**
 * Whether `value` is empty or only whitespace.
 *
 * @param value - Text to test.
 * @returns `true` when `trim()` is empty.
 * @example
 * isBlank("  \n");
 * // => true
 * @example
 * isBlank("a");
 * // => false
 */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Reverses the characters of `value`.
 *
 * @param value - Text to reverse.
 * @returns The reversed string.
 * @example
 * reverse("abc");
 * // => "cba"
 * @example
 * reverse("");
 * // => ""
 */
export function reverse(value: string): string {
  return [...value].reverse().join("");
}

/**
 * A stable non-cryptographic hash of `value`.
 *
 * @param value - Text to hash.
 * @returns A non-negative 32-bit integer.
 * @example
 * hashString("hello") === hashString("hello");
 * // => true
 * @example
 * hashString("a") === hashString("b");
 * // => false
 */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Inserts `separator` every `group` characters, starting from the right.
 *
 * Useful for thousands separators.
 *
 * @param value - Digit string or other text.
 * @param separator - Text to insert. Defaults to `","`.
 * @param group - Group size. Defaults to `3`.
 * @returns The grouped string.
 * @throws {RangeError} When `group` is less than `1`.
 * @example
 * groupDigits("1234567");
 * // => "1,234,567"
 * @example
 * groupDigits("abcd", "-", 2);
 * // => "ab-cd"
 */
export function groupDigits(value: string, separator = ",", group = 3): string {
  if (group < 1) throw new RangeError("group must be at least 1");
  const sign = value.startsWith("-") ? "-" : "";
  const body = sign ? value.slice(1) : value;
  const parts: string[] = [];
  for (let i = body.length; i > 0; i -= group) {
    parts.unshift(body.slice(Math.max(0, i - group), i));
  }
  return sign + parts.join(separator);
}

/**
 * Replaces each run of `pattern` using `replacer`.
 *
 * @param value - Text to search.
 * @param pattern - Substring or regular expression.
 * @param replacer - Replacement string or function.
 * @returns The replaced string.
 * @example
 * replaceAll("a-b-a", "a", "c");
 * // => "c-b-c"
 * @example
 * replaceAll("aa", /a/g, () => "b");
 * // => "bb"
 */
export function replaceAll(
  value: string,
  pattern: string | RegExp,
  replacer: string | ((match: string) => string),
): string {
  if (typeof pattern === "string") {
    if (pattern.length === 0) return value;
    const parts = value.split(pattern);
    const replacement = typeof replacer === "function" ? replacer(pattern) : replacer;
    return parts.join(replacement);
  }
  const flags = pattern.global ? pattern.flags : `${pattern.flags}g`;
  const global = new RegExp(pattern.source, flags);
  return value.replace(global, (match) =>
    typeof replacer === "function" ? replacer(match) : replacer,
  );
}
