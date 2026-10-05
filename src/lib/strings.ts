const COMBINING_MARKS = /[\u0300-\u036f]/g;
const NON_ALPHANUMERIC_RUN = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;
const WORD_START = /(^|[\s\-_])(\p{L})/gu;

function assertString(value: unknown, name: string, fn: string): asserts value is string {
  if (typeof value !== "string") {
    const actual = value === null ? "null" : typeof value;
    throw new TypeError(`${fn}: expected ${name} to be a string, got ${actual}`);
  }
}

/** Counts user-perceived characters by code point so emoji are not split. */
function toCodePoints(value: string): string[] {
  return Array.from(value);
}

/** Converts text to a lowercase, hyphen-separated, ASCII-only URL slug. */
export function slugify(input: string): string {
  assertString(input, "input", "slugify");
  return input
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_RUN, "-")
    .replace(EDGE_HYPHENS, "");
}

/**
 * Shortens text to at most `maxLength` code points, including the ellipsis.
 * If `maxLength` cannot fit the full ellipsis, the ellipsis itself is cut.
 */
export function truncate(input: string, maxLength: number, ellipsis = "…"): string {
  assertString(input, "input", "truncate");
  assertString(ellipsis, "ellipsis", "truncate");
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError(
      `truncate: expected maxLength to be a non-negative integer, got ${String(maxLength)}`,
    );
  }

  const chars = toCodePoints(input);
  if (chars.length <= maxLength) {
    return input;
  }

  const ellipsisChars = toCodePoints(ellipsis);
  if (maxLength <= ellipsisChars.length) {
    return ellipsisChars.slice(0, maxLength).join("");
  }

  const kept = chars.slice(0, maxLength - ellipsisChars.length).join("");
  return kept.trimEnd() + ellipsis;
}

/** Capitalizes the first letter of every word; spaces, hyphens and underscores separate words. */
export function titleCase(input: string): string {
  assertString(input, "input", "titleCase");
  return input
    .toLowerCase()
    .replace(WORD_START, (_, separator: string, letter: string) => separator + letter.toUpperCase());
}
