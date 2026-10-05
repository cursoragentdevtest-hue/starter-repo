/** Returns the next index in a circular list (wraps at `length`). */
export function nextCircularIndex(current: number, length: number): number {
  if (length <= 0) {
    throw new RangeError("length must be positive");
  }
  if (!Number.isInteger(current) || current < 0 || current >= length) {
    throw new RangeError("current must be a valid index for the given length");
  }
  return (current + 1) % length;
}

/** Picks a uniform random element from a non-empty readonly array. */
export function pickRandomElement<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T {
  if (items.length === 0) {
    throw new RangeError("items must not be empty");
  }
  const index = Math.floor(random() * items.length);
  return items[index];
}
