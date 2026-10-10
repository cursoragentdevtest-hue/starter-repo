/**
 * Object helpers. Results are new objects. Nested plain objects are copied
 * only by the functions that say they recurse. Other values are shared.
 */

/**
 * Whether `value` is a plain object: prototype `Object.prototype` or `null`.
 * Arrays are not plain objects.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isIndexable(value: unknown): value is Record<string, unknown> | unknown[] {
  return isPlainObject(value) || Array.isArray(value);
}

/**
 * Copy the own properties named by `keys`. Inherited names such as `toString` are skipped.
 *
 * @example
 * pick({ a: 1, b: 2 }, ["a"]); // { a: 1 }
 */
export function pick<T extends object, K extends keyof T>(object: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(object, key)) result[key] = object[key];
  }
  return result;
}

/**
 * Copy own properties except those named by `keys`.
 *
 * @example
 * omit({ a: 1, b: 2 }, ["b"]); // { a: 1 }
 */
export function omit<T extends object, K extends keyof T>(object: T, keys: readonly K[]): Omit<T, K> {
  const skipped = new Set<PropertyKey>(keys);
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(object)) {
    if (!skipped.has(key)) result[key] = (object as Record<string, unknown>)[key];
  }
  return result as unknown as Omit<T, K>;
}

/**
 * Map each own-property value, keeping the keys.
 *
 * @example
 * mapValues({ a: 1, b: 2 }, (value) => value * 10); // { a: 10, b: 20 }
 */
export function mapValues<T extends object, V>(
  object: T,
  mapper: (value: T[keyof T], key: keyof T) => V,
): { [K in keyof T]: V } {
  const result = {} as { [K in keyof T]: V };
  for (const key of Object.keys(object) as (keyof T)[]) {
    result[key] = mapper(object[key], key);
  }
  return result;
}

/**
 * Map each own-property key. The last write wins when two keys map to the same name.
 *
 * @example
 * mapKeys({ a: 1 }, (key) => key.toUpperCase()); // { A: 1 }
 */
export function mapKeys<T extends object>(
  object: T,
  mapper: (key: string, value: T[keyof T]) => string,
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  for (const key of Object.keys(object)) {
    const value = (object as Record<string, T[keyof T]>)[key];
    result[mapper(key, value)] = value;
  }
  return result;
}

/**
 * Swap keys and values. Values are stringified. Later keys overwrite earlier ones.
 *
 * @example
 * invert({ a: "x", b: "y" }); // { x: "a", y: "b" }
 */
export function invert(object: Record<string, PropertyKey>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(object)) result[String(object[key])] = key;
  return result;
}

/**
 * Shallow-assign own properties from each source into a new object.
 * `undefined` sources are skipped. Later own properties overwrite earlier ones, including explicit `undefined`.
 *
 * @example
 * merge({ a: 1 }, undefined, { b: 2 }); // { a: 1, b: 2 }
 */
export function merge(...sources: readonly (object | undefined)[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const source of sources) {
    if (source == null) continue;
    Object.assign(result, source);
  }
  return result;
}

/**
 * Recursively merge plain objects into a new object.
 * Arrays are replaced with a one-level copy. Other non-plain values are shared by reference.
 *
 * @example
 * deepMerge({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }
 */
export function deepMerge(...sources: readonly (object | undefined)[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const source of sources) {
    if (!isPlainObject(source)) continue;
    for (const key of Object.keys(source)) {
      const incoming = source[key];
      const current = result[key];
      if (isPlainObject(current) && isPlainObject(incoming)) {
        result[key] = deepMerge(current, incoming);
      } else if (Array.isArray(incoming)) {
        result[key] = [...incoming];
      } else {
        result[key] = incoming;
      }
    }
  }
  return result;
}

/**
 * Whether `value` has no entries. `null` and `undefined` are empty.
 * Strings and arrays are empty when their length is `0`. Plain objects are empty when they have no own keys.
 *
 * @example
 * isEmpty(null); // true
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string" || Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Read a dotted path. An empty path returns `value`.
 * The walk visits plain objects and arrays. A missing segment or an `undefined` value returns `fallback`.
 *
 * @example
 * getPath({ a: [10] }, "a.0"); // 10
 */
export function getPath(value: unknown, path: string, fallback?: unknown): unknown {
  if (path.length === 0) return value;
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (!isIndexable(current) || !Object.prototype.hasOwnProperty.call(current, segment)) return fallback;
    current = (current as Record<string, unknown>)[segment];
  }
  return current === undefined ? fallback : current;
}

/**
 * Return a copy of `value` with `path` set to `next`.
 * An empty path returns `next`. Empty segments are kept, so `"a..b"` is not collapsed.
 * Plain objects and arrays along the path are shallow-copied.
 *
 * @example
 * setPath({ a: 1 }, "b.c", 2); // { a: 1, b: { c: 2 } }
 */
export function setPath(value: unknown, path: string, next: unknown): unknown {
  if (path.length === 0) return next;
  const segments = path.split(".");
  const root: Record<string, unknown> | unknown[] = Array.isArray(value)
    ? [...value]
    : isPlainObject(value)
      ? { ...value }
      : {};
  let cursor: Record<string, unknown> | unknown[] = root;
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const existing = (cursor as Record<string, unknown>)[segment];
    const child: Record<string, unknown> | unknown[] = Array.isArray(existing)
      ? [...existing]
      : isPlainObject(existing)
        ? { ...existing }
        : {};
    (cursor as Record<string, unknown>)[segment] = child;
    cursor = child;
  }
  (cursor as Record<string, unknown>)[segments[segments.length - 1]] = next;
  return root;
}

/**
 * Whether `path` addresses an own property along plain objects and arrays.
 * An empty path is false. A stored `undefined` still counts as present.
 *
 * @example
 * hasPath({ a: undefined }, "a"); // true
 */
export function hasPath(value: unknown, path: string): boolean {
  if (path.length === 0) return false;
  let current: unknown = value;
  const segments = path.split(".");
  for (let index = 0; index < segments.length; index += 1) {
    if (!isIndexable(current) || !Object.prototype.hasOwnProperty.call(current, segments[index])) return false;
    if (index === segments.length - 1) return true;
    current = (current as Record<string, unknown>)[segments[index]];
  }
  return false;
}

/**
 * Fill keys that are missing or `undefined` on `object` from `fallback`.
 * Defined values on `object` are kept.
 *
 * @example
 * defaults({ a: undefined, b: 1 }, { a: 2, b: 3 }); // { a: 2, b: 1 }
 */
export function defaults<T extends object>(object: T, fallback: object): T {
  const result: Record<string, unknown> = { ...(object as Record<string, unknown>) };
  const source = fallback as Record<string, unknown>;
  for (const key of Object.keys(source)) {
    if (result[key] === undefined) result[key] = source[key];
  }
  return result as T;
}

/**
 * Copy own properties whose values are neither `null` nor `undefined`.
 *
 * @example
 * compactObject({ a: 1, b: null, c: undefined }); // { a: 1 }
 */
export function compactObject<T extends object>(object: T): Partial<T> {
  const result = {} as Partial<T>;
  for (const key of Object.keys(object) as (keyof T)[]) {
    const value = object[key];
    if (value != null) result[key] = value;
  }
  return result;
}

/**
 * Copy `object`, renaming keys listed in `mapping`. Unlisted keys keep their names.
 *
 * @example
 * renameKeys({ a: 1, b: 2 }, { a: "alpha" }); // { alpha: 1, b: 2 }
 */
export function renameKeys<T extends object>(object: T, mapping: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(object)) {
    result[mapping[key] ?? key] = (object as Record<string, unknown>)[key];
  }
  return result;
}

/**
 * Copy own properties for which `predicate` returns true.
 *
 * @example
 * pickBy({ a: 1, b: 2 }, (value) => value > 1); // { b: 2 }
 */
export function pickBy<T extends object>(
  object: T,
  predicate: (value: T[keyof T], key: string) => boolean,
): Partial<T> {
  const result = {} as Partial<T>;
  for (const key of Object.keys(object) as (keyof T & string)[]) {
    if (predicate(object[key], key)) result[key] = object[key];
  }
  return result;
}

/**
 * Copy own properties for which `predicate` returns false.
 *
 * @example
 * omitBy({ a: 1, b: 2 }, (value) => value > 1); // { a: 1 }
 */
export function omitBy<T extends object>(
  object: T,
  predicate: (value: T[keyof T], key: string) => boolean,
): Partial<T> {
  return pickBy(object, (value, key) => !predicate(value, key));
}

/**
 * Flatten nested plain objects into dotted keys.
 * Arrays are leaves. An empty nested object contributes no keys.
 *
 * @example
 * flattenObject({ a: { b: 1, c: {} }, d: [2] }); // { "a.b": 1, d: [2] }
 */
export function flattenObject(object: object, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!isPlainObject(object)) return result;
  for (const key of Object.keys(object)) {
    const value = object[key];
    const path = prefix.length === 0 ? key : `${prefix}.${key}`;
    if (isPlainObject(value)) Object.assign(result, flattenObject(value, path));
    else result[path] = value;
  }
  return result;
}

/**
 * Number of own string keys.
 *
 * @example
 * objectSize({ a: 1, b: 2 }); // 2
 */
export function objectSize(object: object): number {
  return Object.keys(object).length;
}

/**
 * Shallow copy of a plain object or array.
 *
 * @example
 * shallowClone({ a: 1 }); // { a: 1 }
 */
export function shallowClone<T extends object>(object: T): T {
  if (Array.isArray(object)) return [...object] as T;
  return { ...object };
}

/**
 * Deep equality for arrays and plain objects.
 * Uses `Object.is`, so `NaN` equals `NaN`. Cyclic values are not supported.
 *
 * @example
 * deepEquals({ a: [1, NaN] }, { a: [1, NaN] }); // true
 */
export function deepEquals(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;
    return left.every((item, index) => deepEquals(item, right[index]));
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    if (leftKeys.length !== Object.keys(right).length) return false;
    return leftKeys.every((key) => deepEquals(left[key], right[key]));
  }
  return false;
}

/**
 * Copy `target`, then copy defined own properties from each source.
 * `undefined` values are skipped, and sources may introduce new keys.
 *
 * @example
 * assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 }); // { a: 1, b: 2, c: 3 }
 */
export function assignDefined(
  target: object,
  ...sources: readonly (object | undefined)[]
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target };
  for (const source of sources) {
    if (source == null) continue;
    const record = source as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (record[key] !== undefined) result[key] = record[key];
    }
  }
  return result;
}

/**
 * Own string-key entries of `object`.
 *
 * @example
 * entriesOf({ a: 1 }); // [["a", 1]]
 */
export function entriesOf<T extends object>(object: T): [string, T[keyof T]][] {
  return Object.keys(object).map((key) => [key, (object as Record<string, T[keyof T]>)[key]]);
}

/**
 * Build an object from `[key, value]` pairs. Later pairs overwrite earlier ones.
 *
 * @example
 * fromPairs([["a", 1], ["b", 2]]); // { a: 1, b: 2 }
 */
export function fromPairs<V>(pairs: readonly (readonly [string, V])[]): Record<string, V> {
  const result: Record<string, V> = {};
  for (const [key, value] of pairs) result[key] = value;
  return result;
}

/**
 * Own keys added, removed, or changed from `before` to `after`.
 * Change detection uses `Object.is`.
 *
 * @example
 * diffKeys({ a: 1, b: 2 }, { b: 3, c: 4 }); // { added: ["c"], removed: ["a"], changed: ["b"] }
 */
export function diffKeys(
  before: object,
  after: object,
): { added: string[]; removed: string[]; changed: string[] } {
  const left = before as Record<string, unknown>;
  const right = after as Record<string, unknown>;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  const rightSet = new Set(rightKeys);
  return {
    added: rightKeys.filter((key) => !Object.prototype.hasOwnProperty.call(left, key)),
    removed: leftKeys.filter((key) => !rightSet.has(key)),
    changed: leftKeys.filter((key) => rightSet.has(key) && !Object.is(left[key], right[key])),
  };
}
