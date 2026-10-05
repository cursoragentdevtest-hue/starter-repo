const ELLIPSIS = "...";

/**
 * Turn text into a URL slug: lowercase, diacritics removed, and
 * non-alphanumeric runs collapsed into single hyphens.
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
 * Shorten `value` so the result is at most `maxLength` characters.
 * When the string is shortened, the returned value ends with "..." and
 * that ellipsis counts toward `maxLength`.
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
 * Capitalize the first character of each whitespace-separated word and
 * lowercase the rest. Existing spacing is preserved.
 */
export function titleCase(value: string): string {
  return value.replace(/\S+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}
