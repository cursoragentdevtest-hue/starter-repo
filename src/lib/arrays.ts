/**
 * Array helpers. Inputs are not mutated; results are new arrays unless the
 * function returns a scalar or a record.
 */

/** @example unique([1, 1, 2]); // [1, 2] */
export function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/**
 * Split into chunks of `size`. The last chunk may be shorter.
 *
 * @example
 * chunk([1, 2, 3, 4], 3); // [[1, 2, 3], [4]]
 */
export function chunk<T>(values: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer.");
  }
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

/** @example compact([0, 1, "", null]); // [1] */
export function compact<T>(
  values: readonly T[],
): Exclude<T, null | undefined | false | 0 | "">[] {
  return values.filter(Boolean) as Exclude<T, null | undefined | false | 0 | "">[];
}

/** @example flatten([[1], [2, 3]]); // [1, 2, 3] */
export function flatten<T>(values: readonly (readonly T[])[]): T[] {
  return values.flat();
}

/** @example intersection([1, 2], [2, 3]); // [2] */
export function intersection<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return unique(left.filter((value) => rightSet.has(value)));
}

/** @example difference([1, 2], [2, 3]); // [1] */
export function difference<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

/** @example union([1, 2], [2, 3]); // [1, 2, 3] */
export function union<T>(left: readonly T[], right: readonly T[]): T[] {
  return unique([...left, ...right]);
}

/** @example groupBy(["a", "bb"], (value) => String(value.length)) */
export function groupBy<T, K extends string | number>(
  values: readonly T[],
  keyOf: (value: T, index: number) => K,
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  values.forEach((value, index) => {
    const key = keyOf(value, index);
    const bucket = groups[key] ?? [];
    bucket.push(value);
    groups[key] = bucket;
  });
  return groups;
}

/** @example partition([1, 2, 3], (value) => value % 2 === 0); // [[2], [1, 3]] */
export function partition<T>(
  values: readonly T[],
  predicate: (value: T, index: number) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  values.forEach((value, index) => {
    (predicate(value, index) ? pass : fail).push(value);
  });
  return [pass, fail];
}

/** @example zip([1, 2], ["a", "b"]); // [[1, "a"], [2, "b"]] */
export function zip<A, B>(left: readonly A[], right: readonly B[]): [A, B][] {
  const length = Math.min(left.length, right.length);
  const pairs: [A, B][] = [];
  for (let index = 0; index < length; index += 1) {
    pairs.push([left[index], right[index]]);
  }
  return pairs;
}

/** @example take([1, 2, 3], 2); // [1, 2] */
export function take<T>(values: readonly T[], count: number): T[] {
  if (count <= 0) return [];
  return values.slice(0, count);
}

/** @example drop([1, 2, 3], 1); // [2, 3] */
export function drop<T>(values: readonly T[], count: number): T[] {
  if (count <= 0) return [...values];
  return values.slice(count);
}

/** @example takeWhile([1, 2, 5], (value) => value < 3); // [1, 2] */
export function takeWhile<T>(
  values: readonly T[],
  predicate: (value: T, index: number) => boolean,
): T[] {
  const result: T[] = [];
  for (let index = 0; index < values.length; index += 1) {
    if (!predicate(values[index], index)) break;
    result.push(values[index]);
  }
  return result;
}

/** @example dropWhile([1, 2, 5], (value) => value < 3); // [5] */
export function dropWhile<T>(
  values: readonly T[],
  predicate: (value: T, index: number) => boolean,
): T[] {
  let index = 0;
  while (index < values.length && predicate(values[index], index)) {
    index += 1;
  }
  return values.slice(index);
}

/** @example first([1, 2]); // 1 */
export function first<T>(values: readonly T[]): T | undefined {
  return values[0];
}

/** @example last([1, 2]); // 2 */
export function last<T>(values: readonly T[]): T | undefined {
  return values[values.length - 1];
}

/** @example sortBy([{ n: 2 }, { n: 1 }], (item) => item.n) */
export function sortBy<T>(
  values: readonly T[],
  keyOf: (value: T) => number | string,
): T[] {
  return [...values].sort((left, right) => {
    const a = keyOf(left);
    const b = keyOf(right);
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
}

/** @example keyBy([{ id: "a" }], (item) => item.id) */
export function keyBy<T, K extends string | number>(
  values: readonly T[],
  keyOf: (value: T) => K,
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (const value of values) result[keyOf(value)] = value;
  return result;
}

/** @example frequencies(["a", "a", "b"]); // { a: 2, b: 1 } */
export function frequencies<T extends string | number>(
  values: readonly T[],
): Record<T, number> {
  const counts = {} as Record<T, number>;
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

/**
 * Rotate left by `amount` positions. Negative amounts rotate right.
 *
 * @example
 * rotate([1, 2, 3, 4], 1); // [2, 3, 4, 1]
 */
export function rotate<T>(values: readonly T[], amount: number): T[] {
  if (values.length === 0 || !Number.isFinite(amount)) return [...values];
  const shift = ((amount % values.length) + values.length) % values.length;
  return [...values.slice(shift), ...values.slice(0, shift)];
}

/** @example windows([1, 2, 3], 2); // [[1, 2], [2, 3]] */
export function windows<T>(values: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer.");
  }
  if (size > values.length) return [];
  const result: T[][] = [];
  for (let index = 0; index <= values.length - size; index += 1) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

/** @example uniqBy([{ id: 1 }, { id: 1 }], (item) => item.id) */
export function uniqBy<T, K>(
  values: readonly T[],
  keyOf: (value: T) => K,
): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const value of values) {
    const key = keyOf(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

/** @example removeAt([1, 2, 3], 1); // [1, 3] */
export function removeAt<T>(values: readonly T[], index: number): T[] {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) {
    return [...values];
  }
  return [...values.slice(0, index), ...values.slice(index + 1)];
}

/** @example isSorted([1, 2, 2]); // true */
export function isSorted(values: readonly number[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] < values[index - 1]) return false;
  }
  return true;
}

/** @example minBy([{ n: 3 }, { n: 1 }], (item) => item.n) */
export function minBy<T>(
  values: readonly T[],
  keyOf: (value: T) => number,
): T | undefined {
  let best: T | undefined;
  let bestKey = Number.POSITIVE_INFINITY;
  for (const value of values) {
    const key = keyOf(value);
    if (key < bestKey) {
      best = value;
      bestKey = key;
    }
  }
  return best;
}
