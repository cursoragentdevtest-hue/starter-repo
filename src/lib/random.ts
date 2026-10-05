export type RandomSource = () => number;

function assertItems(fn: string, items: unknown): asserts items is readonly unknown[] {
  if (!Array.isArray(items)) {
    throw new TypeError(`${fn}: items must be an array, got ${describe(items)}`);
  }
  if (items.length === 0) {
    throw new RangeError(`${fn}: items must contain at least one item`);
  }
}

function assertRandomSource(fn: string, random: unknown): asserts random is RandomSource {
  if (typeof random !== "function") {
    throw new TypeError(`${fn}: random must be a function, got ${describe(random)}`);
  }
}

function roll(fn: string, random: RandomSource): number {
  const value = random();
  if (typeof value !== "number" || !(value >= 0 && value < 1)) {
    throw new RangeError(
      `${fn}: random() must return a number in [0, 1), got ${describe(value)}`,
    );
  }
  return value;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  if (typeof value === "number") return String(value);
  return typeof value;
}

export function pickRandom<T>(items: readonly T[], random: RandomSource = Math.random): T {
  assertItems("pickRandom", items);
  assertRandomSource("pickRandom", random);
  return items[Math.floor(roll("pickRandom", random) * items.length)];
}

export function pickDifferent<T>(
  items: readonly T[],
  current: T,
  random: RandomSource = Math.random,
): T {
  assertItems("pickDifferent", items);
  assertRandomSource("pickDifferent", random);
  const candidates = items.filter((item) => item !== current);
  if (candidates.length === 0) {
    return current;
  }
  return candidates[Math.floor(roll("pickDifferent", random) * candidates.length)];
}
