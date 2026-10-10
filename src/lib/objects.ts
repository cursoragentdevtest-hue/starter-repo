/**
 * Immutable object helpers.
 *
 * Plain objects are cloned and merged without mutating inputs. Path helpers
 * walk own properties and array indexes, and they never follow the prototype chain.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isIndexable(value: unknown): value is Record<string, unknown> | unknown[] {
  return Array.isArray(value) || isPlainObject(value);
}

/**
 * Whether `value` is a plain object (not an array, date, or class instance).
 *
 * @param value - Candidate.
 * @returns `true` for `{}` and `Object.create(null)`.
 * @example
 * isObject({ a: 1 });
 * // => true
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}

/**
 * Shallow copy of the own enumerable properties.
 *
 * @param value - Source object.
 * @returns A new object.
 * @example
 * const source = { a: 1 };
 * shallowClone(source) !== source;
 * // => true
 */
export function shallowClone<T extends Record<string, unknown>>(value: T): T {
  return { ...value };
}

/**
 * Deep clone of plain objects and arrays.
 *
 * Dates are copied. Other objects are returned as-is.
 *
 * @param value - Value to clone.
 * @returns A deep copy of plain data.
 * @example
 * const source = { a: { b: 1 } };
 * deepClone(source).a !== source.a;
 * // => true
 */
export function deepClone<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => deepClone(item)) as T;
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (isPlainObject(value)) {
    const copy: Record<string, unknown> = {};
    for (const key of Object.keys(value)) copy[key] = deepClone(value[key]);
    return copy as T;
  }
  return value;
}

/**
 * Own enumerable keys.
 *
 * @param value - Source object.
 * @returns The keys.
 * @example
 * keys({ a: 1, b: 2 });
 * // => ["a", "b"]
 */
export function keys<T extends Record<string, unknown>>(value: T): (keyof T)[] {
  return Object.keys(value) as (keyof T)[];
}

/**
 * Own enumerable values.
 *
 * @param value - Source object.
 * @returns The values.
 * @example
 * values({ a: 1, b: 2 });
 * // => [1, 2]
 */
export function values<T extends Record<string, unknown>>(value: T): T[keyof T][] {
  return Object.values(value) as T[keyof T][];
}

/**
 * Own enumerable entries.
 *
 * @param value - Source object.
 * @returns Key/value pairs.
 * @example
 * entries({ a: 1 });
 * // => [["a", 1]]
 */
export function entries<T extends Record<string, unknown>>(value: T): [keyof T, T[keyof T]][] {
  return Object.entries(value) as [keyof T, T[keyof T]][];
}

/**
 * Builds an object from entries.
 *
 * @param pairs - Key/value pairs.
 * @returns The object.
 * @example
 * fromEntries([["a", 1]]);
 * // => { a: 1 }
 */
export function fromEntries<V>(pairs: readonly (readonly [string, V])[]): Record<string, V> {
  return Object.fromEntries(pairs) as Record<string, V>;
}

/**
 * Copies the named own properties.
 *
 * Inherited properties such as `toString` are ignored.
 *
 * @param value - Source object.
 * @param names - Keys to copy.
 * @returns A new object with those keys.
 * @example
 * pick({ a: 1, b: 2 }, ["a"]);
 * // => { a: 1 }
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  value: T,
  names: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const name of names) {
    if (hasOwn(value, name)) result[name] = value[name];
  }
  return result;
}

/**
 * Copies every own property except the named ones.
 *
 * @param value - Source object.
 * @param names - Keys to drop.
 * @returns A new object.
 * @example
 * omit({ a: 1, b: 2 }, ["b"]);
 * // => { a: 1 }
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  value: T,
  names: readonly K[],
): Omit<T, K> {
  const drop = new Set<keyof T>(names);
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(value) as (keyof T)[]) {
    if (!drop.has(key)) {
      (result as T)[key] = value[key];
    }
  }
  return result;
}

/**
 * Shallow merge. Later objects win.
 *
 * @param objects - Sources, left to right.
 * @returns A new object.
 * @example
 * merge({ a: 1 }, { b: 2 });
 * // => { a: 1, b: 2 }
 */
export function merge<T extends Record<string, unknown>>(...objects: readonly T[]): T {
  return Object.assign({}, ...objects);
}

/**
 * Copies properties whose value is not `undefined`.
 *
 * @param target - Base object.
 * @param source - Properties to overlay.
 * @returns A new object.
 * @example
 * assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 });
 * // => { a: 1, b: 2, c: 3 }
 */
export function assignDefined<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T,
  source: U,
): T & U {
  const result = { ...target } as T & U;
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value !== undefined) (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

/**
 * Deep-merges plain objects. Arrays are shallow-copied from the later source.
 *
 * @param objects - Sources, left to right.
 * @returns A new object.
 * @example
 * deepMerge({ a: { b: 1 } }, { a: { c: 2 } });
 * // => { a: { b: 1, c: 2 } }
 */
export function deepMerge(...objects: readonly Record<string, unknown>[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const object of objects) {
    for (const key of Object.keys(object)) {
      const next = object[key];
      const prev = result[key];
      if (Array.isArray(next)) {
        result[key] = next.slice();
      } else if (isPlainObject(next) && isPlainObject(prev)) {
        result[key] = deepMerge(prev, next);
      } else if (isPlainObject(next)) {
        result[key] = deepMerge(next);
      } else {
        result[key] = next;
      }
    }
  }
  return result;
}

/**
 * Reads a dotted path, including numeric array indexes.
 *
 * Empty segments are preserved as keys, so `"a..b"` looks up `""` between `a` and `b`.
 *
 * @param value - Root value.
 * @param path - Dotted path.
 * @returns The value, or `undefined` when a segment is missing.
 * @example
 * getPath({ a: { b: 1 } }, "a.b");
 * // => 1
 */
export function getPath(value: unknown, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = value;
  for (const segment of segments) {
    if (!isIndexable(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Whether a dotted path resolves to an own property or array index.
 *
 * @param value - Root value.
 * @param path - Dotted path.
 * @returns `true` when every segment exists.
 * @example
 * hasPath({ a: { b: 0 } }, "a.b");
 * // => true
 */
export function hasPath(value: unknown, path: string): boolean {
  const segments = path.split(".");
  let current: unknown = value;
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i]!;
    if (!isIndexable(current) || !hasOwn(current as object, segment)) return false;
    current = (current as Record<string, unknown>)[segment];
    if (i < segments.length - 1 && current == null) return false;
  }
  return true;
}

/**
 * Returns a new object with `path` set to `next`.
 *
 * Missing plain objects are created. Empty path segments are kept.
 *
 * @param value - Root object.
 * @param path - Dotted path.
 * @param next - Value to store.
 * @returns A new object.
 * @example
 * setPath({ a: { b: 1 } }, "a.c", 2);
 * // => { a: { b: 1, c: 2 } }
 */
export function setPath<T extends Record<string, unknown>>(value: T, path: string, next: unknown): T {
  const segments = path.split(".");
  const root: Record<string, unknown> = { ...value };
  let cursor: Record<string, unknown> = root;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!;
    const current = cursor[segment];
    const child = isIndexable(current) ? (Array.isArray(current) ? [...current] : { ...current }) : {};
    cursor[segment] = child;
    cursor = child as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]!] = next;
  return root as T;
}

/**
 * Maps own values.
 *
 * @param value - Source object.
 * @param mapper - Receives the value and key.
 * @returns A new object.
 * @example
 * mapValues({ a: 1, b: 2 }, (n) => n * 2);
 * // => { a: 2, b: 4 }
 */
export function mapValues<T extends Record<string, unknown>, R>(
  value: T,
  mapper: (item: T[keyof T], key: keyof T) => R,
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const key of Object.keys(value) as (keyof T)[]) {
    result[key] = mapper(value[key], key);
  }
  return result;
}

/**
 * Maps own keys. Later keys overwrite earlier ones on collision.
 *
 * @param value - Source object.
 * @param mapper - Receives the key and value.
 * @returns A new object.
 * @example
 * mapKeys({ a: 1 }, (key) => key.toUpperCase());
 * // => { A: 1 }
 */
export function mapKeys<T extends Record<string, unknown>>(
  value: T,
  mapper: (key: keyof T, item: T[keyof T]) => string,
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  for (const key of Object.keys(value) as (keyof T)[]) {
    result[mapper(key, value[key])] = value[key];
  }
  return result;
}

/**
 * Swaps keys and values. Values are stringified.
 *
 * @param value - Source object.
 * @returns The inverted object.
 * @example
 * invert({ a: "x" });
 * // => { x: "a" }
 */
export function invert<T extends Record<string, string | number>>(value: T): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(value)) result[String(value[key])] = key;
  return result;
}

/**
 * Keeps properties for which `predicate` returns true.
 *
 * @param value - Source object.
 * @param predicate - Test.
 * @returns A new object.
 * @example
 * pickBy({ a: 1, b: 0 }, (n) => n > 0);
 * // => { a: 1 }
 */
export function pickBy<T extends Record<string, unknown>>(
  value: T,
  predicate: (item: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  const result = {} as Partial<T>;
  for (const key of Object.keys(value) as (keyof T)[]) {
    if (predicate(value[key], key)) result[key] = value[key];
  }
  return result;
}

/**
 * Drops properties for which `predicate` returns true.
 *
 * @param value - Source object.
 * @param predicate - Test.
 * @returns A new object.
 * @example
 * omitBy({ a: 1, b: 0 }, (n) => n === 0);
 * // => { a: 1 }
 */
export function omitBy<T extends Record<string, unknown>>(
  value: T,
  predicate: (item: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  return pickBy(value, (item, key) => !predicate(item, key));
}

/**
 * Fills missing keys from `fallback`. Existing keys, including `undefined`, win.
 *
 * @param value - Preferred object.
 * @param fallback - Defaults.
 * @returns A new object.
 * @example
 * defaults({ a: 1 }, { a: 9, b: 2 });
 * // => { a: 1, b: 2 }
 */
export function defaults<T extends Record<string, unknown>, U extends Record<string, unknown>>(
  value: T,
  fallback: U,
): T & U {
  return { ...fallback, ...value };
}

/**
 * Drops properties whose value is `null` or `undefined`.
 *
 * @param value - Source object.
 * @returns A new object.
 * @example
 * compactObject({ a: 1, b: null, c: undefined });
 * // => { a: 1 }
 */
export function compactObject<T extends Record<string, unknown>>(value: T): Partial<T> {
  return omitBy(value, (item) => item == null);
}

/**
 * Renames an own key. The original key is removed. Missing keys return a shallow copy.
 *
 * @param value - Source object.
 * @param from - Existing key.
 * @param to - New key.
 * @returns A new object.
 * @example
 * rename({ a: 1 }, "a", "b");
 * // => { b: 1 }
 */
export function rename<T extends Record<string, unknown>>(value: T, from: keyof T, to: string): Record<string, unknown> {
  if (!hasOwn(value, from) || from === to) return { ...value };
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    result[key === from ? to : key] = value[key];
  }
  return result;
}

/**
 * Number of own enumerable properties.
 *
 * @param value - Source object.
 * @returns The size.
 * @example
 * size({ a: 1, b: 2 });
 * // => 2
 */
export function size(value: Record<string, unknown>): number {
  return Object.keys(value).length;
}

/**
 * Whether the object has no own enumerable properties.
 *
 * @param value - Source object.
 * @returns `true` when empty.
 * @example
 * isEmpty({});
 * // => true
 */
export function isEmpty(value: Record<string, unknown>): boolean {
  return Object.keys(value).length === 0;
}
