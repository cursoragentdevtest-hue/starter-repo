export function pickDifferent<T>(
  items: readonly T[],
  current: T,
  random: () => number = Math.random,
): T {
  if (items.length === 0) {
    throw new Error("pickDifferent requires at least one item");
  }
  const candidates = items.filter((item) => item !== current);
  if (candidates.length === 0) {
    return current;
  }
  return candidates[Math.floor(random() * candidates.length)];
}
