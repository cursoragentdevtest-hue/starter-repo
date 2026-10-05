const ELLIPSIS = "...";
const HIGH_SURROGATE_START = 0xd800;
const HIGH_SURROGATE_END = 0xdbff;

/**
 * Turn text into a URL slug: lowercase, hyphen-separated, and ASCII.
 * Diacritics are stripped, "ß" becomes "ss", and runs of other
 * non-alphanumeric characters collapse into a single hyphen.
 */
export function slugify(value: string): string {
  assertString(value, "value");

  const folded = foldToAscii(value).toLowerCase().trim();
  const hyphenated = folded.replace(/[^a-z0-9]+/g, "-");
  return hyphenated.replace(/^-+|-+$/g, "");
}

/**
 * Shorten `value` to at most `maxLength` characters.
 * A cut result ends with "..." and that ellipsis counts toward the limit.
 * When the limit is shorter than the ellipsis, the ellipsis is sliced so the
 * result never exceeds it. A cut that would split an emoji drops the dangling
 * surrogate instead.
 */
export function truncate(value: string, maxLength: number): string {
  assertString(value, "value");
  assertNonNegativeInteger(maxLength, "maxLength");

  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= ELLIPSIS.length) {
    return ELLIPSIS.slice(0, maxLength);
  }

  const budget = maxLength - ELLIPSIS.length;
  const head = dropDanglingSurrogate(value.slice(0, budget));
  return head + ELLIPSIS;
}

/**
 * Capitalize the first letter of each word and lowercase the rest.
 * Whitespace and punctuation stay put. Letters that continue a number
 * ("3rd") are left alone, and contractions such as "don't" stay one word.
 */
export function titleCase(value: string): string {
  assertString(value, "value");

  return value.replace(
    /(^|[^\p{L}\p{N}'])(\p{L}+(?:'\p{L}+)?)/gu,
    (_match, boundary: string, word: string) => boundary + capitalizeWord(word),
  );
}

function foldToAscii(value: string): string {
  return value
    .replace(/ß/gi, "ss")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "");
}

function capitalizeWord(word: string): string {
  const [first = "", ...rest] = Array.from(word);
  return first.toLocaleUpperCase("en-US") + rest.join("").toLocaleLowerCase("en-US");
}

function dropDanglingSurrogate(value: string): string {
  if (value.length === 0) {
    return value;
  }

  const last = value.charCodeAt(value.length - 1);
  const endsMidPair = last >= HIGH_SURROGATE_START && last <= HIGH_SURROGATE_END;
  return endsMidPair ? value.slice(0, -1) : value;
}

function assertString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string (received ${describe(value)})`);
  }
}

function assertNonNegativeInteger(
  value: unknown,
  label: string,
): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new RangeError(
      `${label} must be a non-negative integer (received ${describe(value)})`,
    );
  }
}

function describe(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (typeof value === "number") {
    return Object.is(value, -0) ? "-0" : String(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "bigint") {
    return `${value}n`;
  }
  if (typeof value === "symbol") {
    return value.toString();
  }
  if (typeof value === "function") {
    return "function";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  return "object";
}
