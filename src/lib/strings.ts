const ELLIPSIS = "...";

/**
 * Turn text into a URL slug: lowercase, diacritics removed, and
 * non-alphanumeric runs collapsed into single hyphens.
 */
export function slugify(value: string): string {
  assertString(value, "slugify");

  const ascii = stripDiacritics(value.toLowerCase().replace(/ß/g, "ss"));
  const parts = ascii.match(/[a-z0-9]+/g);
  return parts === null ? "" : parts.join("-");
}

/**
 * Shorten `value` so the result is at most `maxLength` characters.
 * When the string is shortened, the returned value ends with "..." and
 * that ellipsis counts toward `maxLength`. Length is measured in UTF-16
 * code units, and the cut never splits a surrogate pair.
 */
export function truncate(value: string, maxLength: number): string {
  assertString(value, "truncate");
  const limit = assertMaxLength(maxLength);

  if (value.length <= limit) {
    return value;
  }

  const marker = ELLIPSIS.slice(0, limit);
  const kept = cutAtCodePointBoundary(value, limit - marker.length);
  return kept + marker;
}

/**
 * Capitalize the first letter of each whitespace-separated word and
 * lowercase the rest. Leading punctuation stays in place, and existing
 * spacing is preserved.
 */
export function titleCase(value: string): string {
  assertString(value, "titleCase");
  return value.replace(/\S+/g, capitalizeWord);
}

function capitalizeWord(word: string): string {
  const lower = word.toLowerCase();
  const letterIndex = indexOfFirstLetter(lower);
  if (letterIndex === -1) {
    return lower;
  }

  const letter = lower.charAt(letterIndex).toUpperCase();
  return lower.slice(0, letterIndex) + letter + lower.slice(letterIndex + 1);
}

function indexOfFirstLetter(word: string): number {
  const match = /\p{L}/u.exec(word);
  return match === null ? -1 : match.index;
}

function stripDiacritics(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "");
}

function cutAtCodePointBoundary(value: string, length: number): string {
  if (length <= 0) {
    return "";
  }
  if (length >= value.length) {
    return value;
  }

  const endsOnHighSurrogate = isHighSurrogate(value.charCodeAt(length - 1));
  const nextIsLowSurrogate = isLowSurrogate(value.charCodeAt(length));
  const safeLength = endsOnHighSurrogate && nextIsLowSurrogate ? length - 1 : length;
  return value.slice(0, safeLength);
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff;
}

function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`${name}() expected a string but received ${describeValue(value)}.`);
  }
}

function assertMaxLength(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new TypeError(
      `truncate() expected maxLength to be an integer but received ${describeValue(value)}.`,
    );
  }
  if (value < 0) {
    throw new RangeError(
      `truncate() expected maxLength to be greater than or equal to 0 but received ${value}.`,
    );
  }
  return value === 0 ? 0 : value;
}

function describeValue(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? "NaN" : String(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "bigint" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return "an array";
  }
  if (typeof value === "object") {
    return "an object";
  }
  return `a ${typeof value}`;
}
