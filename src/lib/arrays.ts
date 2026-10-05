import {
  ValidationError,
  assertNonEmptyReadonlyArray,
  assertPositiveInteger,
  assertRandomFn,
} from "@/lib/assert";

/** Returns the next index in a circular list (wraps at `length`). */
export function nextCircularIndex(current: number, length: number): number {
  const safeLength = assertPositiveInteger("nextCircularIndex", length, "length");
  if (!Number.isInteger(current) || current < 0 || current >= safeLength) {
    throw new ValidationError(
      "nextCircularIndex",
      `current must be an integer from 0 to ${safeLength - 1}, received ${current}`,
    );
  }
  return (current + 1) % safeLength;
}

/** Picks a uniform random element from a non-empty readonly array. */
export function pickRandomElement<T>(
  items: readonly T[],
  random: () => number = Math.random,
): T {
  const safeItems = assertNonEmptyReadonlyArray<T>("pickRandomElement", items);
  const safeRandom = assertRandomFn("pickRandomElement", random);
  const sample = safeRandom();
  if (typeof sample !== "number" || !Number.isFinite(sample) || sample < 0 || sample >= 1) {
    throw new ValidationError(
      "pickRandomElement",
      `random() must return a finite number in [0, 1), received ${sample}`,
    );
  }
  const index = Math.floor(sample * safeItems.length);
  return safeItems[index];
}
