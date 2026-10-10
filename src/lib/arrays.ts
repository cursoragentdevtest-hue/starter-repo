/**
 * Array helpers. Inputs are never mutated; every function returns a new value.
 */

/**
 * Unique values, keeping the first occurrence.
 *
 * @example
 * unique([1, 1, 2]); // [1, 2]
 */
export function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/**
 * Split `values` into chunks of `size`. The last chunk may be shorter.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(values: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer");
  }
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

/**
 * Drop nullish entries.
 *
 * @example
 * compact([0, null, 1, undefined, false]); // [0, 1, false]
 */
export function compact<T>(values: readonly (T | null | undefined)[]): T[] {
  return values.filter((value): value is T => value != null);
}

/**
 * Flatten one level of nested arrays.
 *
 * @example
 * flatten([[1, 2], [3]]); // [1, 2, 3]
 */
export function flatten<T>(values: readonly (T | readonly T[])[]): T[] {
  const result: T[] = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      result.push(...(value as readonly T[]));
    } else {
      result.push(value as T);
    }
  }
  return result;
}

/**
 * Values present in both lists, in the order of `left`.
 *
 * @example
 * intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
 */
export function intersection<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return unique(left.filter((value) => rightSet.has(value)));
}

/**
 * Values in `left` that are absent from `right`.
 *
 * @example
 * difference([1, 2, 3], [2]); // [1, 3]
 */
export function difference<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

/**
 * Unique values from both lists, `left` first.
 *
 * @example
 * union([1, 2], [2, 3]); // [1, 2, 3]
 */
export function union<T>(left: readonly T[], right: readonly T[]): T[] {
  return unique([...left, ...right]);
}

/**
 * Group items by a key function.
 *
 * @example
 * groupBy(["a", "bb", "c"], (item) => item.length);
 * // Map { 1 => ["a", "c"], 2 => ["bb"] }
 */
export function groupBy<T, K>(values: readonly T[], keyOf: (value: T, index: number) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  values.forEach((value, index) => {
    const key = keyOf(value, index);
    const group = groups.get(key);
    if (group) {
      group.push(value);
    } else {
      groups.set(key, [value]);
    }
  });
  return groups;
}

/**
 * Split into `[matching, rejected]` according to `predicate`.
 *
 * @example
 * partition([1, 2, 3, 4], (n) => n % 2 === 0); // [[2, 4], [1, 3]]
 */
export function partition<T>(values: readonly T[], predicate: (value: T, index: number) => boolean): [T[], T[]] {
  const matching: T[] = [];
  const rejected: T[] = [];
  values.forEach((value, index) => {
    if (predicate(value, index)) {
      matching.push(value);
    } else {
      rejected.push(value);
    }
  });
  return [matching, rejected];
}

/**
 * Pair items by index. The result length is the shorter input.
 *
 * @example
 * zip(["a", "b"], [1, 2, 3]); // [["a", 1], ["b", 2]]
 */
export function zip<A, B>(left: readonly A[], right: readonly B[]): [A, B][] {
  const length = Math.min(left.length, right.length);
  const pairs: [A, B][] = [];
  for (let index = 0; index < length; index += 1) {
    pairs.push([left[index]!, right[index]!]);
  }
  return pairs;
}

/**
 * The first `count` items.
 *
 * @example
 * take([1, 2, 3], 2); // [1, 2]
 */
export function take<T>(values: readonly T[], count: number): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  return values.slice(0, count);
}

/**
 * Everything after the first `count` items.
 *
 * @example
 * drop([1, 2, 3], 1); // [2, 3]
 */
export function drop<T>(values: readonly T[], count: number): T[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("count must be a non-negative integer");
  }
  return values.slice(count);
}

/**
 * Items from the start while `predicate` holds.
 *
 * @example
 * takeWhile([1, 2, 3, 0], (n) => n < 3); // [1, 2]
 */
export function takeWhile<T>(values: readonly T[], predicate: (value: T, index: number) => boolean): T[] {
  const result: T[] = [];
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (!predicate(value, index)) {
      break;
    }
    result.push(value);
  }
  return result;
}

/**
 * Items after the prefix where `predicate` holds.
 *
 * @example
 * dropWhile([1, 2, 3], (n) => n < 3); // [3]
 */
export function dropWhile<T>(values: readonly T[], predicate: (value: T, index: number) => boolean): T[] {
  let index = 0;
  while (index < values.length && predicate(values[index]!, index)) {
    index += 1;
  }
  return values.slice(index);
}

/**
 * The first item, or `undefined` when the list is empty.
 *
 * @example
 * first([1, 2]); // 1
 */
export function first<T>(values: readonly T[]): T | undefined {
  return values[0];
}

/**
 * The last item, or `undefined` when the list is empty.
 *
 * @example
 * last([1, 2]); // 2
 */
export function last<T>(values: readonly T[]): T | undefined {
  return values[values.length - 1];
}

/**
 * A copy sorted by the projection. The original order is stable for ties.
 *
 * @example
 * sortBy(["bb", "a"], (item) => item.length); // ["a", "bb"]
 */
export function sortBy<T>(values: readonly T[], select: (value: T) => number | string): T[] {
  return values
    .map((value, index) => ({ value, index, key: select(value) }))
    .sort((left, right) => {
      if (left.key < right.key) {
        return -1;
      }
      if (left.key > right.key) {
        return 1;
      }
      return left.index - right.index;
    })
    .map((entry) => entry.value);
}

/**
 * Index items by a key. Later duplicates replace earlier ones.
 *
 * @example
 * keyBy([{ id: "a" }], (item) => item.id).get("a");
 */
export function keyBy<T, K>(values: readonly T[], keyOf: (value: T) => K): Map<K, T> {
  const map = new Map<K, T>();
  for (const value of values) {
    map.set(keyOf(value), value);
  }
  return map;
}

/**
 * Count how often each value appears.
 *
 * @example
 * frequencies(["a", "b", "a"]).get("a"); // 2
 */
export function frequencies<T>(values: readonly T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/**
 * Rotate left by `offset` positions. Negative offsets rotate right.
 *
 * @example
 * rotate([1, 2, 3, 4], 1); // [2, 3, 4, 1]
 */
export function rotate<T>(values: readonly T[], offset: number): T[] {
  if (!Number.isInteger(offset)) {
    throw new RangeError("offset must be an integer");
  }
  if (values.length === 0) {
    return [];
  }
  const normalized = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)];
}

/**
 * Sliding windows of `size`.
 *
 * @example
 * windows([1, 2, 3], 2); // [[1, 2], [2, 3]]
 */
export function windows<T>(values: readonly T[], size: number): T[][] {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer");
  }
  if (size > values.length) {
    return [];
  }
  const result: T[][] = [];
  for (let index = 0; index <= values.length - size; index += 1) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

/**
 * Unique values by a projection, keeping the first match.
 *
 * @example
 * uniqBy([{ id: 1 }, { id: 1, extra: true }], (item) => item.id);
 */
export function uniqBy<T, K>(values: readonly T[], keyOf: (value: T) => K): T[] {
  const seen = new Set<K>();
  const result: T[] = [];
  for (const value of values) {
    const key = keyOf(value);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}

/**
 * A copy with the item at `index` removed. Negative indexes count from the end.
 *
 * @example
 * removeAt(["a", "b", "c"], 1); // ["a", "c"]
 */
export function removeAt<T>(values: readonly T[], index: number): T[] {
  if (!Number.isInteger(index)) {
    throw new RangeError("index must be an integer");
  }
  const resolved = index < 0 ? values.length + index : index;
  if (resolved < 0 || resolved >= values.length) {
    return [...values];
  }
  return [...values.slice(0, resolved), ...values.slice(resolved + 1)];
}

/**
 * Whether `values` is sorted non-decreasing under the default comparison.
 *
 * @example
 * isSorted([1, 2, 2]); // true
 */
export function isSorted<T>(values: readonly T[], compare: (left: T, right: T) => number = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0,
): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (compare(values[index - 1]!, values[index]!) > 0) {
      return false;
    }
  }
  return true;
}

/**
 * The item with the smallest projection, or `undefined` when empty.
 *
 * @example
 * minBy(["bb", "a"], (item) => item.length); // "a"
 */
export function minBy<T>(values: readonly T[], select: (value: T) => number): T | undefined {
  let best: T | undefined;
  let bestKey = Infinity;
  for (const value of values) {
    const key = select(value);
    if (!Number.isFinite(key)) {
      throw new RangeError("select must return a finite number");
    }
    if (best === undefined || key < bestKey) {
      best = value;
      bestKey = key;
    }
  }
  return best;
}
