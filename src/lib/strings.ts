const ELLIPSIS = "...";

/** Turn text into a lowercase URL slug. */
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
 * Shortened results end with "..." and still fit in `maxLength`.
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

/** Capitalize the first letter of each whitespace-separated word. */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|\s)(\S)/g, (_match, boundary: string, char: string) => {
      return boundary + char.toUpperCase();
    });
}
