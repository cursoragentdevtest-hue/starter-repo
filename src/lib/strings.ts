const DEFAULT_ELLIPSIS = "...";

/**
 * Turn text into a URL slug: lowercase, accents stripped, runs of
 * non-alphanumeric characters collapsed to a single hyphen.
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
 * Shorten `value` so it is at most `maxLength` characters, appending an
 * ellipsis when the string is cut. The ellipsis counts toward the limit.
 */
export function truncate(
  value: string,
  maxLength: number,
  ellipsis: string = DEFAULT_ELLIPSIS,
): string {
  if (!Number.isFinite(maxLength) || maxLength < 0) {
    throw new RangeError("maxLength must be a non-negative finite number");
  }

  const limit = Math.floor(maxLength);
  if (value.length <= limit) {
    return value;
  }
  if (ellipsis.length >= limit) {
    return ellipsis.slice(0, limit);
  }
  return value.slice(0, limit - ellipsis.length) + ellipsis;
}

/**
 * Capitalize the first character of each whitespace-delimited word and
 * lowercase the rest.
 */
export function titleCase(value: string): string {
  return value.replace(/\S+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}
