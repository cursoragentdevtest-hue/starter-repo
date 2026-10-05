/**
 * Shared index helpers for rotating quote lists.
 * Empty or invalid lengths throw instead of producing NaN / empty UI.
 */

export function nextCyclicIndex(index: number, length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error(`length must be a positive integer, received ${length}`);
  }
  if (!Number.isInteger(index)) {
    throw new Error(`index must be an integer, received ${index}`);
  }
  return (((index + 1) % length) + length) % length;
}

export function pickDifferentIndex(
  length: number,
  currentIndex: number,
  random: () => number = Math.random,
): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error(`length must be a positive integer, received ${length}`);
  }
  if (length === 1) {
    return 0;
  }

  const roll = random();
  if (!Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new Error(`random() must return a number in [0, 1), received ${roll}`);
  }

  let next = Math.floor(roll * length);
  if (next === currentIndex) {
    next = nextCyclicIndex(currentIndex, length);
  }
  return next;
}
