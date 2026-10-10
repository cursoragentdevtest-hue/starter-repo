/**
 * String helpers. They do not trim unless the function name says they do,
 * and they never mutate the input.
 */

/**
 * Uppercase the first character and leave the rest alone.
 *
 * @example
 * capitalize("duck"); // "Duck"
 * @example
 * capitalize(""); // ""
 */
export function capitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Lowercase the first character and leave the rest alone.
 *
 * @example
 * uncapitalize("Duck"); // "duck"
 */
export function uncapitalize(value: string): string {
  if (value.length === 0) return value;
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function wordsOf(value: string): string[] {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0);
}

/**
 * Convert a phrase to camelCase.
 *
 * @example
 * camelCase("silly starter"); // "sillyStarter"
 * @example
 * camelCase("already-kebab"); // "alreadyKebab"
 */
export function camelCase(value: string): string {
  const words = wordsOf(value);
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : capitalize(lower);
    })
    .join("");
}

/**
 * Convert a phrase to kebab-case.
 *
 * @example
 * kebabCase("Silly Starter"); // "silly-starter"
 */
export function kebabCase(value: string): string {
  return wordsOf(value).map((word) => word.toLowerCase()).join("-");
}

/**
 * Convert a phrase to snake_case.
 *
 * @example
 * snakeCase("Silly Starter"); // "silly_starter"
 */
export function snakeCase(value: string): string {
  return wordsOf(value).map((word) => word.toLowerCase()).join("_");
}

/**
 * Capitalize each word, using whitespace as the separator.
 *
 * @example
 * titleCase("silly starter"); // "Silly Starter"
 */
export function titleCase(value: string): string {
  return value.replace(/\S+/g, (word) => capitalize(word.toLowerCase()));
}

/**
 * Shorten `value` to at most `maxLength` characters, ending with `suffix`
 * when truncation happens.
 *
 * @example
 * truncate("breadcrumbs", 6); // "bre..."
 * @example
 * truncate("duck", 10); // "duck"
 */
export function truncate(value: string, maxLength: number, suffix = "..."): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError("maxLength must be a non-negative integer.");
  }
  if (value.length <= maxLength) return value;
  if (suffix.length >= maxLength) return suffix.slice(0, maxLength);
  return value.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * URL slug: lowercase, hyphen-separated, stripped of other punctuation.
 *
 * @example
 * slugify("Hello, Duck!"); // "hello-duck"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** @example reverseString("duck"); // "kcud" */
export function reverseString(value: string): string {
  return [...value].reverse().join("");
}

/**
 * Count non-overlapping occurrences of `needle`. An empty needle returns 0.
 *
 * @example
 * countOccurrences("banana", "na"); // 2
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

/** @example isBlank("  \n"); // true */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Whether the string reads the same forwards and backwards, ignoring case
 * and non-alphanumeric characters.
 *
 * @example
 * isPalindrome("A man, a plan, a canal: Panama"); // true
 */
export function isPalindrome(value: string): boolean {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized === reverseString(normalized);
}

/** @example wordCount("one two  three"); // 3 */
export function wordCount(value: string): number {
  return wordsOf(value).length;
}

/**
 * Initials from the first letter of each word, uppercased.
 *
 * @example
 * initials("silly starter"); // "SS"
 */
export function initials(value: string, limit?: number): string {
  const letters = wordsOf(value).map((word) => word.charAt(0).toUpperCase());
  const sliced = limit === undefined ? letters : letters.slice(0, limit);
  return sliced.join("");
}

/** @example collapseWhitespace("a \n  b"); // "a b" */
export function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** @example removePrefix("unduck", "un"); // "duck" */
export function removePrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/** @example removeSuffix("ducks", "s"); // "duck" */
export function removeSuffix(value: string, suffix: string): string {
  if (suffix.length === 0 || !value.endsWith(suffix)) return value;
  return value.slice(0, -suffix.length);
}

/** @example wrap("duck", "*"); // "*duck*" */
export function wrap(value: string, wrapper: string): string {
  return `${wrapper}${value}${wrapper}`;
}

/** @example lines("a\nb"); // ["a", "b"] */
export function lines(value: string): string[] {
  if (value.length === 0) return [];
  return value.split(/\r\n|\n|\r/);
}

/**
 * Replace `{key}` placeholders. Missing keys are left in place.
 *
 * @example
 * interpolate("Hello {name}", { name: "Duck" }); // "Hello Duck"
 */
export function interpolate(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) return match;
    return String(values[key]);
  });
}

/**
 * Mask the middle of a string, keeping `keepStart` and `keepEnd` characters.
 *
 * @example
 * mask("1234567890", 2, 2); // "12******90"
 */
export function mask(
  value: string,
  keepStart = 1,
  keepEnd = 1,
  maskChar = "*",
): string {
  if (keepStart < 0 || keepEnd < 0) {
    throw new RangeError("keepStart and keepEnd must be non-negative.");
  }
  if (value.length <= keepStart + keepEnd) return value;
  const hidden = value.length - keepStart - keepEnd;
  return (
    value.slice(0, keepStart) +
    maskChar.repeat(hidden) +
    value.slice(value.length - keepEnd)
  );
}

/**
 * Pick a singular or plural label from `count`.
 *
 * @example
 * pluralize(1, "duck", "ducks"); // "duck"
 * @example
 * pluralize(2, "duck", "ducks"); // "ducks"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/** @example swapCase("Duck"); // "dUCK" */
export function swapCase(value: string): string {
  return [...value]
    .map((char) => {
      const lower = char.toLowerCase();
      return char === lower ? char.toUpperCase() : lower;
    })
    .join("");
}

/** @example isNumericString("42"); // true */
export function isNumericString(value: string): boolean {
  return /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value.trim());
}

/**
 * Slice between the first `start` and the following `end`.
 * Returns an empty string when either marker is missing.
 *
 * @example
 * between("a[duck]b", "[", "]"); // "duck"
 */
export function between(value: string, start: string, end: string): string {
  if (start.length === 0 || end.length === 0) return "";
  const startIndex = value.indexOf(start);
  if (startIndex === -1) return "";
  const from = startIndex + start.length;
  const endIndex = value.indexOf(end, from);
  if (endIndex === -1) return "";
  return value.slice(from, endIndex);
}
