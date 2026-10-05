export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(input: string, maxLength: number, ellipsis = "…"): string {
  if (maxLength < 0) {
    throw new RangeError("maxLength must be non-negative");
  }
  if (input.length <= maxLength) {
    return input;
  }
  if (maxLength <= ellipsis.length) {
    return ellipsis.slice(0, maxLength);
  }
  return input.slice(0, maxLength - ellipsis.length).trimEnd() + ellipsis;
}

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
