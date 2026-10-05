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
  const chars = Array.from(input);
  if (chars.length <= maxLength) {
    return input;
  }
  const ellipsisChars = Array.from(ellipsis);
  if (maxLength <= ellipsisChars.length) {
    return ellipsisChars.slice(0, maxLength).join("");
  }
  return chars.slice(0, maxLength - ellipsisChars.length).join("").trimEnd() + ellipsis;
}

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/(^|[\s\-_])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}
