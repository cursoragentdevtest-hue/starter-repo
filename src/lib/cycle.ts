/**
 * Shared index helpers for rotating quote lists.
 * Empty or invalid lengths throw instead of producing NaN / empty UI.
 */

import { assertFunction, assertInteger, assertPositiveInteger } from "./validate";

export function nextCyclicIndex(index: number, length: number): number {
  assertInteger("nextCyclicIndex", "index", index);
  assertPositiveInteger("nextCyclicIndex", "length", length);
  return (((index + 1) % length) + length) % length;
}

export function pickDifferentIndex(
  length: number,
  currentIndex: number,
  random: () => number = Math.random,
): number {
  assertPositiveInteger("pickDifferentIndex", "length", length);
  assertInteger("pickDifferentIndex", "currentIndex", currentIndex);
  assertFunction("pickDifferentIndex", "random", random);

  if (length === 1) {
    return 0;
  }

  let roll: unknown;
  try {
    roll = random();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`pickDifferentIndex: "random" threw: ${message}`);
  }

  if (typeof roll !== "number" || !Number.isFinite(roll) || roll < 0 || roll >= 1) {
    throw new Error(
      `pickDifferentIndex: "random" must return a number in [0, 1), received ${String(roll)}`,
    );
  }

  let next = Math.floor(roll * length);
  if (next === currentIndex) {
    next = nextCyclicIndex(currentIndex, length);
  }
  return next;
}
