/**
 * String helpers. Functions return new strings and throw `RangeError`
 * when a numeric argument is outside its documented domain.
 */

/**
 * Uppercase the first character and leave the rest unchanged.
 *
 * @example
 * capitalize("hello"); // "Hello"
 */
export function capitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Lowercase the first character and leave the rest unchanged.
 *
 * @example
 * uncapitalize("Hello"); // "hello"
 */
export function uncapitalize(value: string): string {
  if (value.length === 0) {
    return value;
  }
  return value.charAt(0).toLowerCase() + value.slice(1);
}

const WORD_SPLIT = /[^A-Za-z0-9]+|(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/;

function words(value: string): string[] {
  return value
    .split(WORD_SPLIT)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Convert a phrase to camelCase.
 *
 * @example
 * camelCase("hello world"); // "helloWorld"
 */
export function camelCase(value: string): string {
  const parts = words(value).map((part) => part.toLowerCase());
  if (parts.length === 0) {
    return "";
  }
  return parts[0]! + parts.slice(1).map((part) => capitalize(part)).join("");
}

/**
 * Convert a phrase to kebab-case.
 *
 * @example
 * kebabCase("Hello World"); // "hello-world"
 */
export function kebabCase(value: string): string {
  return words(value)
    .map((part) => part.toLowerCase())
    .join("-");
}

/**
 * Convert a phrase to snake_case.
 *
 * @example
 * snakeCase("Hello World"); // "hello_world"
 */
export function snakeCase(value: string): string {
  return words(value)
    .map((part) => part.toLowerCase())
    .join("_");
}

/**
 * Capitalize each word, splitting on whitespace.
 *
 * @example
 * titleCase("hello world"); // "Hello World"
 */
export function titleCase(value: string): string {
  return value
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : capitalize(part.toLowerCase())))
    .join("");
}

/**
 * Shorten `value` so its length is at most `maxLength`, appending `ellipsis`.
 *
 * @example
 * truncate("hello world", 8); // "hello..."
 */
export function truncate(value: string, maxLength: number, ellipsis = "..."): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError("maxLength must be a non-negative integer");
  }
  if (value.length <= maxLength) {
    return value;
  }
  if (ellipsis.length >= maxLength) {
    return ellipsis.slice(0, maxLength);
  }
  return value.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Build a URL slug from a phrase.
 *
 * @example
 * slugify("Hello, World!"); // "hello-world"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Reverse the characters of a string.
 *
 * @example
 * reverseString("duck"); // "kcud"
 */
export function reverseString(value: string): string {
  return [...value].reverse().join("");
}

/**
 * Count non-overlapping occurrences of `needle`.
 *
 * @example
 * countOccurrences("banana", "na"); // 2
 */
export function countOccurrences(value: string, needle: string): number {
  if (needle.length === 0) {
    throw new RangeError("needle must not be empty");
  }
  let count = 0;
  let index = 0;
  while (index <= value.length - needle.length) {
    const found = value.indexOf(needle, index);
    if (found === -1) {
      break;
    }
    count += 1;
    index = found + needle.length;
  }
  return count;
}

/**
 * Whether the string is empty or contains only whitespace.
 *
 * @example
 * isBlank("  \n"); // true
 */
export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

/**
 * Whether the string reads the same forwards and backwards, ignoring case and non-letters.
 *
 * @example
 * isPalindrome("A man, a plan, a canal: Panama"); // true
 */
export function isPalindrome(value: string): boolean {
  const letters = [...value.toLowerCase()].filter((char) => /[a-z0-9]/.test(char));
  return letters.join("") === letters.reverse().join("");
}

/**
 * Count words separated by whitespace.
 *
 * @example
 * wordCount("one two  three"); // 3
 */
export function wordCount(value: string): number {
  if (isBlank(value)) {
    return 0;
  }
  return value.trim().split(/\s+/).length;
}

/**
 * Initials formed from the first character of each word, uppercased.
 *
 * @example
 * initials("ada lovelace"); // "AL"
 */
export function initials(value: string, limit?: number): string {
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 0)) {
    throw new RangeError("limit must be a non-negative integer");
  }
  const letters = words(value).map((part) => part.charAt(0).toUpperCase());
  const sliced = limit === undefined ? letters : letters.slice(0, limit);
  return sliced.join("");
}

/**
 * Collapse runs of whitespace into a single space and trim the ends.
 *
 * @example
 * collapseWhitespace("  a \n b  "); // "a b"
 */
export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Remove `prefix` when `value` starts with it.
 *
 * @example
 * removePrefix("untitled", "un"); // "titled"
 */
export function removePrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

/**
 * Remove `suffix` when `value` ends with it.
 *
 * @example
 * removeSuffix("filename.txt", ".txt"); // "filename"
 */
export function removeSuffix(value: string, suffix: string): string {
  if (suffix.length === 0 || !value.endsWith(suffix)) {
    return value;
  }
  return value.slice(0, -suffix.length);
}

/**
 * Surround `value` with `wrapper` on both sides.
 *
 * @example
 * wrap("duck", "*"); // "*duck*"
 */
export function wrap(value: string, wrapper: string): string {
  return `${wrapper}${value}${wrapper}`;
}

/**
 * Split a string into lines, accepting `\n`, `\r\n`, and `\r`.
 *
 * @example
 * lines("a\r\nb"); // ["a", "b"]
 */
export function lines(value: string): string[] {
  if (value.length === 0) {
    return [];
  }
  return value.split(/\r\n|\n|\r/);
}

/**
 * Replace `{key}` placeholders using `values`. Missing keys are left intact.
 *
 * @example
 * interpolate("Hello {name}", { name: "Ada" }); // "Hello Ada"
 */
export function interpolate(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      return match;
    }
    return String(values[key]);
  });
}

/**
 * Mask all but the last `visible` characters.
 *
 * @example
 * mask("1234567890", 4); // "******7890"
 */
export function mask(value: string, visible = 4, maskChar = "*"): string {
  if (!Number.isInteger(visible) || visible < 0) {
    throw new RangeError("visible must be a non-negative integer");
  }
  if ([...maskChar].length !== 1) {
    throw new RangeError("maskChar must be a single character");
  }
  const chars = [...value];
  if (chars.length <= visible) {
    return value;
  }
  const hidden = chars.length - visible;
  return maskChar.repeat(hidden) + chars.slice(hidden).join("");
}

/**
 * Pick a singular or plural label based on `count`.
 *
 * @example
 * pluralize(1, "duck"); // "1 duck"
 * pluralize(2, "duck"); // "2 ducks"
 */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  if (!Number.isFinite(count)) {
    throw new RangeError("count must be a finite number");
  }
  return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * Swap the case of every character.
 *
 * @example
 * swapCase("AbC"); // "aBc"
 */
export function swapCase(value: string): string {
  return [...value]
    .map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
    .join("");
}

/**
 * Whether the string is a canonical decimal number (optional sign and fraction).
 *
 * @example
 * isNumericString("-12.5"); // true
 * isNumericString("12px"); // false
 */
export function isNumericString(value: string): boolean {
  return /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(value);
}

/**
 * Return the substring strictly between the first `start` and the following `end`.
 * Returns an empty string when either marker is missing.
 *
 * @example
 * between("a[b]c", "[", "]"); // "b"
 */
export function between(value: string, start: string, end: string): string {
  if (start.length === 0 || end.length === 0) {
    throw new RangeError("start and end must not be empty");
  }
  const startIndex = value.indexOf(start);
  if (startIndex === -1) {
    return "";
  }
  const from = startIndex + start.length;
  const endIndex = value.indexOf(end, from);
  if (endIndex === -1) {
    return "";
  }
  return value.slice(from, endIndex);
}
