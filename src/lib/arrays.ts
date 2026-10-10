/**
 * Immutable array helpers.
 *
 * Every function returns a new array or a derived value. Inputs are not mutated.
 */

/**
 * Returns a shallow copy of `values`.
 *
 * @param values - Source array.
 * @returns A new array with the same elements.
 * @example
 * const source = [1, 2];
 * copy(source) !== source;
 * // => true
 */
export function copy<T>(values: readonly T[]): T[] {
  return [...values];
}

/**
 * Unique values, keeping the first occurrence.
 *
 * @param values - Source array.
 * @returns Deduplicated values.
 * @example
 * unique([1, 2, 1, 3]);
 * // => [1, 2, 3]
 */
export function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/**
 * Unique values by a key function, keeping the first occurrence of each key.
 *
 * @param values - Source array.
 * @param keyOf - Key extractor.
 * @returns Deduplicated values.
 * @example
 * uniqueBy([{ id: 1 }, { id: 1, extra: true }], (item) => item.id);
 * // => [{ id: 1 }]
 */
export function uniqueBy<T, K>(values: readonly T[], keyOf: (value: T) => K): T[] {
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

/**
 * Splits `values` into chunks of `size`.
 *
 * The last chunk may be shorter.
 *
 * @param values - Source array.
 * @param size - Chunk length. Must be at least `1`.
 * @returns The chunks.
 * @throws {RangeError} When `size` is less than `1`.
 * @example
 * chunk([1, 2, 3, 4, 5], 2);
 * // => [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(values: readonly T[], size: number): T[][] {
  if (size < 1) throw new RangeError("size must be at least 1");
  const result: T[][] = [];
  for (let i = 0; i < values.length; i += size) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

/**
 * Flattens one level of nesting.
 *
 * @param values - Nested arrays.
 * @returns A single-level array.
 * @example
 * flatten([[1, 2], [3]]);
 * // => [1, 2, 3]
 */
export function flatten<T>(values: readonly (readonly T[])[]): T[] {
  return values.flat();
}

/**
 * Compact: drops `null` and `undefined`.
 *
 * @param values - Source array.
 * @returns Values that are present.
 * @example
 * compact([1, null, 2, undefined]);
 * // => [1, 2]
 */
export function compact<T>(values: readonly (T | null | undefined)[]): T[] {
  return values.filter((value): value is T => value != null);
}

/**
 * Groups values by a key.
 *
 * @param values - Source array.
 * @param keyOf - Key extractor.
 * @returns A map from key to matching values.
 * @example
 * groupBy(["ant", "bear", "ape"], (word) => word[0]);
 * // => Map { "a" => ["ant", "ape"], "b" => ["bear"] }
 */
export function groupBy<T, K>(values: readonly T[], keyOf: (value: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    const bucket = groups.get(key);
    if (bucket) bucket.push(value);
    else groups.set(key, [value]);
  }
  return groups;
}

/**
 * Counts values by a key.
 *
 * @param values - Source array.
 * @param keyOf - Key extractor. Defaults to identity.
 * @returns A map from key to count.
 * @example
 * countBy(["a", "b", "a"]);
 * // => Map { "a" => 2, "b" => 1 }
 */
export function countBy<T, K = T>(
  values: readonly T[],
  keyOf: (value: T) => K = (value) => value as unknown as K,
): Map<K, number> {
  const counts = new Map<K, number>();
  for (const value of values) {
    const key = keyOf(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Values that appear in both arrays, using `SameValueZero` equality.
 *
 * @param left - First array.
 * @param right - Second array.
 * @returns Intersection, ordered as in `left`.
 * @example
 * intersection([1, 2, 3], [2, 3, 4]);
 * // => [2, 3]
 */
export function intersection<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return unique(left.filter((value) => rightSet.has(value)));
}

/**
 * Values in `left` that are not in `right`.
 *
 * @param left - Source array.
 * @param right - Values to exclude.
 * @returns The difference, ordered as in `left`.
 * @example
 * difference([1, 2, 3], [2]);
 * // => [1, 3]
 */
export function difference<T>(left: readonly T[], right: readonly T[]): T[] {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

/**
 * Values that appear in exactly one of the two arrays.
 *
 * @param left - First array.
 * @param right - Second array.
 * @returns The symmetric difference.
 * @example
 * symmetricDifference([1, 2], [2, 3]);
 * // => [1, 3]
 */
export function symmetricDifference<T>(left: readonly T[], right: readonly T[]): T[] {
  return [...difference(left, right), ...difference(right, left)];
}

/**
 * Sorted copy.
 *
 * @param values - Source array.
 * @param compare - Comparator. Defaults to numeric subtraction for numbers, otherwise string order.
 * @returns A new sorted array.
 * @example
 * sortBy([3, 1, 2]);
 * // => [1, 2, 3]
 */
export function sortBy<T>(values: readonly T[], compare?: (a: T, b: T) => number): T[] {
  const copyOf = [...values];
  if (compare) return copyOf.sort(compare);
  return copyOf.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * Sorted copy by a key.
 *
 * @param values - Source array.
 * @param keyOf - Key extractor.
 * @returns A new sorted array.
 * @example
 * sortByKey([{ n: 2 }, { n: 1 }], (item) => item.n);
 * // => [{ n: 1 }, { n: 2 }]
 */
export function sortByKey<T, K>(values: readonly T[], keyOf: (value: T) => K): T[] {
  return sortBy(values, (a, b) => {
    const ka = keyOf(a);
    const kb = keyOf(b);
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/**
 * Moves the element at `from` to `to`.
 *
 * @param values - Source array.
 * @param from - Source index.
 * @param to - Destination index.
 * @returns A new array.
 * @throws {RangeError} When an index is out of range.
 * @example
 * move([1, 2, 3], 0, 2);
 * // => [2, 3, 1]
 */
export function move<T>(values: readonly T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= values.length || to >= values.length) {
    throw new RangeError("index out of range");
  }
  const next = [...values];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

/**
 * Rotates elements to the left by `count`.
 *
 * Negative counts rotate right.
 *
 * @param values - Source array.
 * @param count - Number of positions.
 * @returns A new array.
 * @example
 * rotate([1, 2, 3, 4], 1);
 * // => [2, 3, 4, 1]
 */
export function rotate<T>(values: readonly T[], count: number): T[] {
  if (values.length === 0) return [];
  const offset = ((count % values.length) + values.length) % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}

/**
 * Zip two arrays into pairs, stopping at the shorter one.
 *
 * @param left - First array.
 * @param right - Second array.
 * @returns Pairs.
 * @example
 * zip([1, 2], ["a", "b", "c"]);
 * // => [[1, "a"], [2, "b"]]
 */
export function zip<A, B>(left: readonly A[], right: readonly B[]): [A, B][] {
  const length = Math.min(left.length, right.length);
  const result: [A, B][] = [];
  for (let i = 0; i < length; i += 1) result.push([left[i] as A, right[i] as B]);
  return result;
}

/**
 * Unzips pairs into two arrays.
 *
 * @param pairs - Pairs to split.
 * @returns The two columns.
 * @example
 * unzip([[1, "a"], [2, "b"]]);
 * // => [[1, 2], ["a", "b"]]
 */
export function unzip<A, B>(pairs: readonly (readonly [A, B])[]): [A[], B[]] {
  const left: A[] = [];
  const right: B[] = [];
  for (const [a, b] of pairs) {
    left.push(a);
    right.push(b);
  }
  return [left, right];
}

/**
 * Elements at even indexes.
 *
 * @param values - Source array.
 * @returns Every other element, starting at index 0.
 * @example
 * evens([0, 1, 2, 3]);
 * // => [0, 2]
 */
export function evens<T>(values: readonly T[]): T[] {
  return values.filter((_, index) => index % 2 === 0);
}

/**
 * Elements at odd indexes.
 *
 * @param values - Source array.
 * @returns Every other element, starting at index 1.
 * @example
 * odds([0, 1, 2, 3]);
 * // => [1, 3]
 */
export function odds<T>(values: readonly T[]): T[] {
  return values.filter((_, index) => index % 2 === 1);
}

/**
 * A window of `size` consecutive elements.
 *
 * @param values - Source array.
 * @param size - Window length. Must be at least `1`.
 * @returns Sliding windows.
 * @throws {RangeError} When `size` is less than `1`.
 * @example
 * windows([1, 2, 3, 4], 2);
 * // => [[1, 2], [2, 3], [3, 4]]
 */
export function windows<T>(values: readonly T[], size: number): T[][] {
  if (size < 1) throw new RangeError("size must be at least 1");
  if (size > values.length) return [];
  const result: T[][] = [];
  for (let i = 0; i <= values.length - size; i += 1) {
    result.push(values.slice(i, i + size));
  }
  return result;
}

/**
 * Partition into elements that match `predicate` and those that do not.
 *
 * @param values - Source array.
 * @param predicate - Test.
 * @returns `[matches, rest]`.
 * @example
 * partition([1, 2, 3, 4], (n) => n % 2 === 0);
 * // => [[2, 4], [1, 3]]
 */
export function partition<T>(
  values: readonly T[],
  predicate: (value: T) => boolean,
): [T[], T[]] {
  const matches: T[] = [];
  const rest: T[] = [];
  for (const value of values) {
    if (predicate(value)) matches.push(value);
    else rest.push(value);
  }
  return [matches, rest];
}

/**
 * First value matching `predicate`.
 *
 * @param values - Source array.
 * @param predicate - Test.
 * @returns The match, or `undefined`.
 * @example
 * findLast([1, 2, 3], (n) => n > 1);
 * // => 3
 */
export function findLast<T>(
  values: readonly T[],
  predicate: (value: T) => boolean,
): T | undefined {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    const value = values[i] as T;
    if (predicate(value)) return value;
  }
  return undefined;
}

/**
 * Range of integers from `start` (inclusive) to `end` (exclusive).
 *
 * @param start - First integer.
 * @param end - Exclusive end.
 * @param step - Increment. Defaults to `1` or `-1` when `end < start`.
 * @returns The integers.
 * @throws {RangeError} When `step` is `0`.
 * @example
 * range(1, 4);
 * // => [1, 2, 3]
 */
export function range(start: number, end: number, step?: number): number[] {
  const delta = step ?? (end < start ? -1 : 1);
  if (delta === 0) throw new RangeError("step must be non-zero");
  const result: number[] = [];
  if (delta > 0) {
    for (let n = start; n < end; n += delta) result.push(n);
  } else {
    for (let n = start; n > end; n += delta) result.push(n);
  }
  return result;
}

/**
 * Takes up to `count` elements from the start.
 *
 * @param values - Source array.
 * @param count - How many to take.
 * @returns A new array.
 * @example
 * take([1, 2, 3], 2);
 * // => [1, 2]
 */
export function take<T>(values: readonly T[], count: number): T[] {
  return values.slice(0, Math.max(0, count));
}

/**
 * Drops up to `count` elements from the start.
 *
 * @param values - Source array.
 * @param count - How many to drop.
 * @returns A new array.
 * @example
 * drop([1, 2, 3], 2);
 * // => [3]
 */
export function drop<T>(values: readonly T[], count: number): T[] {
  return values.slice(Math.max(0, count));
}
