const ELLIPSIS = "...";

/**
 * Turn a string into a URL slug: lowercase, hyphen-separated, ASCII-ish.
 * Diacritics are stripped, and runs of non-alphanumeric characters collapse
 * into a single hyphen. Leading and trailing hyphens are removed.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Shorten `value` so it is at most `maxLength` characters.
 * When the string is cut, the result ends with an ellipsis (`...`) and the
 * ellipsis counts toward the limit. If `maxLength` is shorter than the
 * ellipsis, the ellipsis itself is sliced so the result never exceeds the limit.
 */
export function truncate(value: string, maxLength: number): string {
  if (!Number.isInteger(maxLength) || maxLength < 0) {
    throw new RangeError("maxLength must be a non-negative integer");
  }

  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= ELLIPSIS.length) {
    return ELLIPSIS.slice(0, maxLength);
  }

  return value.slice(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
}

/**
 * Capitalize the first letter of each word and lowercase the rest.
 * Whitespace and punctuation stay in place.
 */
export function titleCase(value: string): string {
  return value.replace(
    /[A-Za-z]+(?:'[A-Za-z]+)?/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}
