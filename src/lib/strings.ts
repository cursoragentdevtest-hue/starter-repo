/**
 * String helpers. Matching is case-sensitive unless a function says otherwise.
 * Empty affixes and empty search needles are ignored rather than treated as matches.
 */

function splitWords(input: string): string[] {
  const spaced = input.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.toLowerCase())
    .filter((word) => word.length > 0);
}

/**
 * Uppercase the first character and leave the rest unchanged.
 *
 * @example
 * capitalize("duck"); // "Duck"
 *
 * @example
 * capitalize(""); // ""
 */
export function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Lowercase the first character and leave the rest unchanged.
 *
 * @example
 * uncapitalize("Duck"); // "duck"
 *
 * @example
 * uncapitalize("ABC"); // "aBC"
 */
export function uncapitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/**
 * Join the words in `value` as lowerCamelCase.
 * Word breaks are camelCase boundaries and runs of non-alphanumeric characters.
 *
 * @example
 * camelCase("hello world"); // "helloWorld"
 *
 * @example
 * camelCase("hello-world"); // "helloWorld"
 */
export function camelCase(value: string): string {
  return splitWords(value)
    .map((word, index) => (index === 0 ? word : capitalize(word)))
    .join("");
}

/**
 * Join the words in `value` with hyphens.
 *
 * @example
 * kebabCase("helloWorld"); // "hello-world"
 *
 * @example
 * kebabCase("Hello World"); // "hello-world"
 */
export function kebabCase(value: string): string {
  return splitWords(value).join("-");
}

/**
 * Join the words in `value` with underscores.
 *
 * @example
 * snakeCase("Hello World"); // "hello_world"
 *
 * @example
 * snakeCase("helloWorld"); // "hello_world"
 */
export function snakeCase(value: string): string {
  return splitWords(value).join("_");
}

/**
 * Uppercase the first character of each whitespace-delimited word.
 * Characters after the first are left as written, including accents.
 *
 * @example
 * titleCase("déjà vu"); // "Déjà Vu"
 *
 * @example
 * titleCase("hello world"); // "Hello World"
 */
export function titleCase(value: string): string {
  return value.replace(/\S+/g, (word) => capitalize(word));
}

/**
 * Shorten `value` to `maxLength` characters.
 * The ellipsis counts toward `maxLength`. When `maxLength` is less than or
 * equal to the ellipsis length, the result is a plain slice with no ellipsis.
 *
 * @example
 * truncate("hello world", 8); // "hello..."
 *
 * @example
 * truncate("abcdef", 2); // "ab"
 */
export function truncate(value: string, maxLength: number, ellipsis = "..."): string {
  if (maxLength < 0) throw new RangeError("maxLength must be non-negative");
  if (value.length <= maxLength) return value;
  if (maxLength <= ellipsis.length) return value.slice(0, maxLength);
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Build a URL slug. The string is normalized to NFKD, combining marks are
 * removed, and remaining non-alphanumeric runs become single hyphens.
 *
 * @example
 * slugify("Café"); // "cafe"
 *
 * @example
 * slugify("Hello, World!"); // "hello-world"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Reverse `value` by Unicode code point, so surrogate pairs stay intact.
 *
 * @example
 * reverseString("a🦆b"); // "b🦆a"
 *
 * @example
 * reverseString("ab"); // "ba"
 */
export function reverseString(value: string): string {
  return [...value].reverse().join("");
}

/**
 * Count non-overlapping occurrences of `needle` in `value`.
 * An empty needle counts as `0`.
 *
 * @example
 * countOccurrences("aaaa", "aa"); // 2
 *
 * @example
 * countOccurrences("abc", ""); // 0
 */
export function countOccurrences(value: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = 0;
  while (index <= value.length - needle.length) {
    const found = value.indexOf(needle, index);
    if (found === -1) break;
    count += 1;
    index = found + needle.length;
  }
  return count;
}

/**
 * Whether `value` is empty or contains only whitespace.
 *
 * @example
 * isBlank("  \n"); // true
 *
 * @example
 * isBlank(" a "); // false
 */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Whether `value` is a palindrome after lowercasing and dropping characters
 * outside `[a-z0-9]`.
 *
 * @example
 * isPalindrome("A man, a plan, a canal: Panama"); // true
 *
 * @example
 * isPalindrome("duck"); // false
 */
export function isPalindrome(value: string): boolean {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned === [...cleaned].reverse().join("");
}

/**
 * Count whitespace-delimited words. Camel-case boundaries are not splits.
 *
 * @example
 * wordCount("hello world"); // 2
 *
 * @example
 * wordCount("  a   b  "); // 2
 */
export function wordCount(value: string): number {
  const trimmed = value.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Uppercase initials of the whitespace-delimited words in `value`.
 * `limit` keeps only the first that many initials.
 *
 * @example
 * initials("Ada Lovelace"); // "AL"
 *
 * @example
 * initials("Grace Brewster Hopper", 2); // "GB"
 */
export function initials(value: string, limit?: number): string {
  const letters = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => [...word][0]?.toUpperCase() ?? "");
  const selected = limit == null ? letters : letters.slice(0, Math.max(0, limit));
  return selected.join("");
}

/**
 * Trim `value` and collapse internal whitespace runs to a single space.
 *
 * @example
 * collapseWhitespace("  a \n b\t"); // "a b"
 *
 * @example
 * collapseWhitespace("hello"); // "hello"
 */
export function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Remove `prefix` from `value` when it is present.
 * An empty prefix is ignored and `value` is returned unchanged.
 *
 * @example
 * removePrefix("prefix-value", "prefix"); // "-value"
 *
 * @example
 * removePrefix("prefix-value", ""); // "prefix-value"
 */
export function removePrefix(value: string, prefix: string): string {
  if (prefix.length === 0) return value;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/**
 * Remove `suffix` from `value` when it is present.
 * An empty suffix is ignored and `value` is returned unchanged.
 *
 * @example
 * removeSuffix("value-suffix", "suffix"); // "value-"
 *
 * @example
 * removeSuffix("value-suffix", ""); // "value-suffix"
 */
export function removeSuffix(value: string, suffix: string): string {
  if (suffix.length === 0) return value;
  return value.endsWith(suffix) ? value.slice(0, -suffix.length) : value;
}

/**
 * Surround `value` with `wrapper` on both sides.
 *
 * @example
 * wrap("x", "*"); // "*x*"
 *
 * @example
 * wrap("duck", "«"); // "«duck«"
 */
export function wrap(value: string, wrapper: string): string {
  return `${wrapper}${value}${wrapper}`;
}

/**
 * Split `value` into lines on `\n`, `\r\n`, or `\r`.
 * An empty string returns `[]`. A trailing break yields a trailing empty line.
 *
 * @example
 * lines(""); // []
 *
 * @example
 * lines("a\r\nb\n"); // ["a", "b", ""]
 */
export function lines(value: string): string[] {
  if (value.length === 0) return [];
  return value.split(/\r\n|\n|\r/);
}

/**
 * Replace `{key}` placeholders with `String(values[key])`.
 * Keys are trimmed. Placeholders with no matching key are left intact.
 *
 * @example
 * interpolate("Hi { name }", { name: "Ada" }); // "Hi Ada"
 *
 * @example
 * interpolate("Hi {name}", {}); // "Hi {name}"
 */
export function interpolate(template: string, values: Record<string, unknown>): string {
  return template.replace(/\{([^{}]+)\}/g, (match, rawKey: string) => {
    const key = rawKey.trim();
    if (!Object.prototype.hasOwnProperty.call(values, key)) return match;
    return String(values[key]);
  });
}

/**
 * Mask the middle of `value`.
 * `keepStart` and `keepEnd` default to `0`, and negative keeps are treated as `0`.
 * `maskChar` defaults to `"*"`. When the kept ends cover the whole string, the original is returned.
 *
 * @example
 * mask("secret", { keepStart: 1, keepEnd: 1 }); // "s****t"
 *
 * @example
 * mask("ab", { keepStart: 5 }); // "ab"
 */
export function mask(
  value: string,
  options?: { keepStart?: number; keepEnd?: number; maskChar?: string },
): string {
  const keepStart = Math.max(0, Math.trunc(options?.keepStart ?? 0));
  const keepEnd = Math.max(0, Math.trunc(options?.keepEnd ?? 0));
  const maskChar = options?.maskChar ?? "*";
  if (keepStart + keepEnd >= [...value].length) return value;
  const chars = [...value];
  const middle = chars.length - keepStart - keepEnd;
  return chars.slice(0, keepStart).join("") + maskChar.repeat(middle) + chars.slice(chars.length - keepEnd).join("");
}

/**
 * Choose a singular or plural noun for `count`.
 * `singular` is used only when `count === 1`. Otherwise `plural` is used, or `singular` plus `"s"`.
 *
 * @example
 * pluralize("duck", 1); // "duck"
 *
 * @example
 * pluralize("duck", 0); // "ducks"
 */
export function pluralize(singular: string, count: number, plural?: string): string {
  if (count === 1) return singular;
  return plural ?? `${singular}s`;
}

/**
 * Swap the case of each character. Characters without case are unchanged.
 *
 * @example
 * swapCase("AbC"); // "aBc"
 *
 * @example
 * swapCase("a1B"); // "A1b"
 */
export function swapCase(value: string): string {
  return [...value]
    .map((character) =>
      character === character.toUpperCase() ? character.toLowerCase() : character.toUpperCase(),
    )
    .join("");
}

/**
 * Whether `value` is a decimal numeric string after trimming.
 * An optional sign is allowed, followed by digits with an optional decimal
 * or a leading dot and digits. Scientific notation is not accepted.
 *
 * @example
 * isNumericString("  -12.5 "); // true
 *
 * @example
 * isNumericString("1e5"); // false
 */
export function isNumericString(value: string): boolean {
  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim());
}

/**
 * Return the text strictly between the first `start` and the following `end`.
 * Returns `""` when either delimiter is missing.
 *
 * @example
 * between("a[b]c", "[", "]"); // "b"
 *
 * @example
 * between("no delimiters", "[", "]"); // ""
 */
export function between(value: string, start: string, end: string): string {
  const startIndex = value.indexOf(start);
  if (startIndex === -1) return "";
  const from = startIndex + start.length;
  const endIndex = value.indexOf(end, from);
  if (endIndex === -1) return "";
  return value.slice(from, endIndex);
}
