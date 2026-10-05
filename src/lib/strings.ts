const DEFAULT_ELLIPSIS = "…";

/** Lowercase, strip diacritics, and turn the rest into a hyphenated slug. */
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
 * Shorten `value` so its length is at most `maxLength`.
 * The ellipsis counts toward that limit. Strings that already fit are returned unchanged.
 */
export function truncate(
  value: string,
  maxLength: number,
  ellipsis: string = DEFAULT_ELLIPSIS,
): string {
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

/** Capitalize the first character of each whitespace-delimited word. */
export function titleCase(value: string): string {
  return value.replace(/\S+/g, (word) => {
    const lower = word.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  });
}
