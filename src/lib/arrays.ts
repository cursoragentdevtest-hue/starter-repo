/**
 * Array helpers. Inputs are not mutated. Returned arrays are new copies
 * unless a function's contract says it returns an element from the input.
 */

/**
 * Drop duplicate values, keeping the first occurrence. Equality is `SameValueZero`.
 *
 * @example
 * unique([1, 1, 2]); // [1, 2]
 */
export function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/**
 * Split `values` into groups of `size`. The last group may be shorter.
 * Throws when `size` is not a positive integer.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(values: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError("size must be a positive integer");
  }
  const groups: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    groups.push(values.slice(index, index + size));
  }
  return groups;
}

/**
 * Drop `null` and `undefined`. Other falsy values are kept.
 *
 * @example
 * compact([0, null, undefined, false, ""]); // [0, false, ""]
 */
export function compact<T>(values: readonly (T | null | undefined)[]): T[] {
  return values.filter((value): value is T => value != null);
}

/**
 * Flatten one level. Nested arrays inside an inner array stay nested.
 *
 * @example
 * flatten([1, [2, 3], 4]); // [1, 2, 3, 4]
 */
export function flatten<T>(values: readonly (T | readonly T[])[]): T[] {
  const result: T[] = [];
  for (const item of values) {
    if (Array.isArray(item)) {
      for (const inner of item) result.push(inner as T);
    } else {
      result.push(item as T);
    }
  }
  return result;
}

/**
 * Values present in both lists, unique, in the order they appear in `left`.
 *
 * @example
 * intersection([1, 2, 2, 3], [2, 4]); // [2]
 */
export function intersection<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of left) {
    if (rightSet.has(item) && !seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

/**
 * Values from `left` that are absent from `right`. Duplicates in `left` are kept.
 *
 * @example
 * difference([1, 2, 2, 3], [2]); // [1, 3]
 */
export function difference<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

/**
 * Concatenate `lists`, dropping values already seen. Order is first-seen.
 *
 * @example
 * union([1, 2], [2, 3]); // [1, 2, 3]
 */
export function union<T>(...lists: readonly (readonly T[])[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (seen.has(item)) continue;
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

/**
 * Group items by `keyOf`. Each group's array preserves input order.
 *
 * @example
 * groupBy(["aa", "b", "cc"], (item) => item.length); // { 2: ["aa", "cc"], 1: ["b"] }
 */
export function groupBy<T, K extends PropertyKey>(
  values: readonly T[],
  keyOf: (item: T, index: number) => K,
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;
  values.forEach((item, index) => {
    const key = keyOf(item, index);
    const bucket = groups[key] ?? [];
    bucket.push(item);
    groups[key] = bucket;
  });
  return groups;
}

/**
 * Split `values` into `[matches, rest]` according to `predicate`.
 *
 * @example
 * partition([1, 2, 3, 4], (n) => n % 2 === 0); // [[2, 4], [1, 3]]
 */
export function partition<T>(
  values: readonly T[],
  predicate: (item: T, index: number) => boolean,
): [T[], T[]] {
  const matches: T[] = [];
  const rest: T[] = [];
  values.forEach((item, index) => {
    (predicate(item, index) ? matches : rest).push(item);
  });
  return [matches, rest];
}

/**
 * Pair items from `left` and `right` up to the shorter length.
 *
 * @example
 * zip([1, 2], ["a"]); // [[1, "a"]]
 */
export function zip<A, B>(left: readonly A[], right: readonly B[]): [A, B][] {
  const length = Math.min(left.length, right.length);
  const pairs: [A, B][] = [];
  for (let index = 0; index < length; index += 1) pairs.push([left[index], right[index]]);
  return pairs;
}

/**
 * First `count` items. A non-positive `count` returns `[]`.
 *
 * @example
 * take([1, 2, 3], 2); // [1, 2]
 */
export function take<T>(values: readonly T[], count: number): T[] {
  if (count <= 0) return [];
  return values.slice(0, count);
}

/**
 * Items after dropping the first `count`. A non-positive `count` returns a shallow copy.
 *
 * @example
 * drop([1, 2, 3], 1); // [2, 3]
 */
export function drop<T>(values: readonly T[], count: number): T[] {
  if (count <= 0) return values.slice();
  return values.slice(count);
}

/**
 * Leading items while `predicate` returns true.
 *
 * @example
 * takeWhile([2, 4, 5, 6], (n) => n % 2 === 0); // [2, 4]
 */
export function takeWhile<T>(
  values: readonly T[],
  predicate: (item: T, index: number) => boolean,
): T[] {
  const result: T[] = [];
  for (let index = 0; index < values.length; index += 1) {
    if (!predicate(values[index], index)) break;
    result.push(values[index]);
  }
  return result;
}

/**
 * Items after the leading run for which `predicate` returns true.
 *
 * @example
 * dropWhile([2, 4, 5, 6], (n) => n % 2 === 0); // [5, 6]
 */
export function dropWhile<T>(
  values: readonly T[],
  predicate: (item: T, index: number) => boolean,
): T[] {
  let index = 0;
  while (index < values.length && predicate(values[index], index)) index += 1;
  return values.slice(index);
}

/**
 * First item, or `undefined` when `values` is empty.
 *
 * @example
 * first([10, 20]); // 10
 */
export function first<T>(values: readonly T[]): T | undefined {
  return values[0];
}

/**
 * Last item, or `undefined` when `values` is empty.
 *
 * @example
 * last([10, 20]); // 20
 */
export function last<T>(values: readonly T[]): T | undefined {
  return values[values.length - 1];
}

/**
 * Stable sort of a copy by a number or string key.
 *
 * @example
 * sortBy([{ n: 2 }, { n: 1 }], (item) => item.n); // [{ n: 1 }, { n: 2 }]
 */
export function sortBy<T>(values: readonly T[], keyOf: (item: T) => number | string): T[] {
  return values
    .map((item, index) => ({ item, index, key: keyOf(item) }))
    .sort((left, right) => {
      if (left.key < right.key) return -1;
      if (left.key > right.key) return 1;
      return left.index - right.index;
    })
    .map((entry) => entry.item);
}

/**
 * Index items by `keyOf`. Later items overwrite earlier ones with the same key.
 *
 * @example
 * keyBy([{ id: "a", n: 1 }, { id: "a", n: 2 }], (item) => item.id); // { a: { id: "a", n: 2 } }
 */
export function keyBy<T>(values: readonly T[], keyOf: (item: T) => PropertyKey): Record<PropertyKey, T> {
  const result: Record<PropertyKey, T> = {};
  for (const item of values) result[keyOf(item)] = item;
  return result;
}

/**
 * Count occurrences of each value.
 *
 * @example
 * frequencies([1, 1, 2]); // { 1: 2, 2: 1 }
 */
export function frequencies<T extends PropertyKey>(values: readonly T[]): Record<T, number> {
  const counts = {} as Record<T, number>;
  for (const item of values) counts[item] = (counts[item] ?? 0) + 1;
  return counts;
}

/**
 * Rotate `values` left by `offset` places. A negative offset rotates right.
 * The offset is truncated toward zero and wraps. An empty list returns `[]`.
 *
 * @example
 * rotate([1, 2, 3, 4], 1); // [2, 3, 4, 1]
 */
export function rotate<T>(values: readonly T[], offset: number): T[] {
  const length = values.length;
  if (length === 0) return [];
  const steps = Math.trunc(offset) % length;
  const left = ((steps % length) + length) % length;
  return values.slice(left).concat(values.slice(0, left));
}

/**
 * Sliding windows of `size`. Throws when `size` is not a positive integer.
 * Returns `[]` when `size` is greater than `values.length`.
 *
 * @example
 * windows([1, 2, 3, 4], 2); // [[1, 2], [2, 3], [3, 4]]
 */
export function windows<T>(values: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new RangeError("size must be a positive integer");
  }
  if (size > values.length) return [];
  const result: T[][] = [];
  for (let index = 0; index <= values.length - size; index += 1) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

/**
 * Drop later items whose key was already seen. The first item for each key wins.
 *
 * @example
 * uniqBy([{ id: 1, n: "a" }, { id: 1, n: "b" }], (item) => item.id); // [{ id: 1, n: "a" }]
 */
export function uniqBy<T>(values: readonly T[], keyOf: (item: T) => unknown): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of values) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

/**
 * Copy of `values` without the item at `index`.
 * A non-integer, negative, or out-of-range index returns an unchanged copy.
 *
 * @example
 * removeAt([1, 2, 3], 1); // [1, 3]
 */
export function removeAt<T>(values: readonly T[], index: number): T[] {
  if (!Number.isInteger(index) || index < 0 || index >= values.length) return values.slice();
  return values.slice(0, index).concat(values.slice(index + 1));
}

function compareOrdered(left: unknown, right: unknown): number {
  const a = left as number | string;
  const b = right as number | string;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Whether `values` is sorted under `compare`.
 * The default comparator orders number and string values with `<`.
 *
 * @example
 * isSorted([1, 2, 2]); // true
 */
export function isSorted<T>(
  values: readonly T[],
  compare: (left: T, right: T) => number = compareOrdered as (left: T, right: T) => number,
): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (compare(values[index - 1], values[index]) > 0) return false;
  }
  return true;
}

/**
 * Item with the smallest key. Ties keep the earlier item. An empty list returns `undefined`.
 *
 * @example
 * minBy([{ n: 2 }, { n: 1 }, { n: 1 }], (item) => item.n); // { n: 1 } (the first of the ties)
 */
export function minBy<T>(values: readonly T[], keyOf: (item: T) => number | string): T | undefined {
  if (values.length === 0) return undefined;
  let best = values[0];
  let bestKey = keyOf(best);
  for (let index = 1; index < values.length; index += 1) {
    const key = keyOf(values[index]);
    if (key < bestKey) {
      best = values[index];
      bestKey = key;
    }
  }
  return best;
}
