/**
 * Object helpers. Plain objects are copied; callers' inputs are not mutated.
 */

/**
 * Copy the named own keys.
 *
 * @example
 * pick({ a: 1, b: 2 }, ["a"]); // { a: 1 }
 */
export function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Copy every own key except the named ones.
 *
 * @example
 * omit({ a: 1, b: 2 }, ["b"]); // { a: 1 }
 */
export function omit<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Omit<T, K> {
  const excluded = new Set<keyof T>(keys);
  const result = {} as Omit<T, K>;
  for (const key of Object.keys(source) as (keyof T)[]) {
    if (!excluded.has(key)) {
      (result as T)[key] = source[key];
    }
  }
  return result;
}

/**
 * Map the values of a plain object, keeping the keys.
 *
 * @example
 * mapValues({ a: 1 }, (value) => value * 2); // { a: 2 }
 */
export function mapValues<T, U>(
  source: Readonly<Record<string, T>>,
  mapper: (value: T, key: string) => U,
): Record<string, U> {
  const result: Record<string, U> = {};
  for (const key of Object.keys(source)) {
    result[key] = mapper(source[key]!, key);
  }
  return result;
}

/**
 * Map the keys of a plain object. Later keys win on collisions.
 *
 * @example
 * mapKeys({ a: 1 }, (key) => key.toUpperCase()); // { A: 1 }
 */
export function mapKeys<T>(
  source: Readonly<Record<string, T>>,
  mapper: (key: string, value: T) => string,
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of Object.keys(source)) {
    result[mapper(key, source[key]!)] = source[key]!;
  }
  return result;
}

/**
 * Swap keys and values. Values must be strings or numbers.
 *
 * @example
 * invert({ a: "x" }); // { x: "a" }
 */
export function invert(source: Readonly<Record<string, string | number>>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(source)) {
    result[String(source[key])] = key;
  }
  return result;
}

/**
 * Shallow merge. Later sources overwrite earlier keys.
 *
 * @example
 * merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 */
export function merge<T extends object>(...sources: readonly T[]): T {
  return Object.assign({}, ...sources) as T;
}

function cloneDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeep(item));
  }
  if (isPlainObject(value)) {
    return deepMerge({}, value);
  }
  return value;
}

/**
 * Deep-merge plain objects. Arrays and other values are replaced, not concatenated.
 * Nested objects and arrays from the source are cloned.
 *
 * @example
 * deepMerge({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: readonly Record<string, unknown>[]
): T {
  const result: Record<string, unknown> = { ...target };
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const incoming = source[key];
      const current = result[key];
      if (isPlainObject(current) && isPlainObject(incoming)) {
        result[key] = deepMerge(current, incoming);
      } else {
        result[key] = cloneDeep(incoming);
      }
    }
  }
  return result as T;
}

/**
 * Whether a plain object, array, or map has no entries. Other values are empty when nullish.
 *
 * @example
 * isEmpty({}); // true
 * isEmpty({ a: 1 }); // false
 */
export function isEmpty(value: object | null | undefined): boolean {
  if (value == null) {
    return true;
  }
  if (Array.isArray(value) || typeof value === "string") {
    return value.length === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  return Object.keys(value).length === 0;
}

/**
 * Whether `value` is a plain object created by `{}` or `Object.create(null)`.
 *
 * @example
 * isPlainObject({}); // true
 * isPlainObject([]); // false
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function pathSegments(path: string): string[] {
  if (path.length === 0) {
    throw new RangeError("path must not be empty");
  }
  return path.split(".");
}

function isIndexable(value: unknown): value is Record<string, unknown> | unknown[] {
  return isPlainObject(value) || Array.isArray(value);
}

/**
 * Read a dotted path. Missing segments yield `undefined`.
 *
 * @example
 * getPath({ a: { b: 1 } }, "a.b"); // 1
 * getPath({ items: ["x"] }, "items.0"); // "x"
 */
export function getPath(source: unknown, path: string): unknown {
  let current: unknown = source;
  for (const segment of pathSegments(path)) {
    if (!isIndexable(current)) {
      return undefined;
    }
    current = current[segment as keyof typeof current];
  }
  return current;
}

/**
 * Return a copy with `path` set to `value`. Intermediate objects are created.
 *
 * @example
 * setPath({ a: {} }, "a.b", 1); // { a: { b: 1 } }
 */
export function setPath<T>(source: T, path: string, value: unknown): T {
  const segments = pathSegments(path);
  const root: unknown = Array.isArray(source) ? [...source] : { ...(source as object) };
  let cursor: Record<string, unknown> | unknown[] = root as Record<string, unknown> | unknown[];
  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]!;
    const current = (cursor as Record<string, unknown>)[segment];
    const next = Array.isArray(current)
      ? [...current]
      : isPlainObject(current)
        ? { ...current }
        : {};
    (cursor as Record<string, unknown>)[segment] = next;
    cursor = next as Record<string, unknown> | unknown[];
  }
  (cursor as Record<string, unknown>)[segments[segments.length - 1]!] = value;
  return root as T;
}

/**
 * Whether every segment of `path` exists.
 *
 * @example
 * hasPath({ a: { b: 0 } }, "a.b"); // true
 */
export function hasPath(source: unknown, path: string): boolean {
  let current: unknown = source;
  for (const segment of pathSegments(path)) {
    if (!isIndexable(current) || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return false;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return true;
}

/**
 * Fill missing keys from `fallback`. Existing keys, including `undefined`, win.
 *
 * @example
 * defaults({ a: 1 }, { a: 9, b: 2 }); // { a: 1, b: 2 }
 */
export function defaults<T extends Record<string, unknown>>(
  source: T,
  fallback: Readonly<Record<string, unknown>>,
): T {
  const result: Record<string, unknown> = { ...fallback, ...source };
  return result as T;
}

/**
 * Drop keys whose values are null or undefined.
 *
 * @example
 * compactObject({ a: 1, b: null }); // { a: 1 }
 */
export function compactObject<T>(source: Readonly<Record<string, T | null | undefined>>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (value != null) {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Rename keys. Unmentioned keys are copied through.
 *
 * @example
 * renameKeys({ a: 1 }, { a: "b" }); // { b: 1 }
 */
export function renameKeys<T>(
  source: Readonly<Record<string, T>>,
  mapping: Readonly<Record<string, string>>,
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of Object.keys(source)) {
    result[mapping[key] ?? key] = source[key]!;
  }
  return result;
}

/**
 * Keep keys for which `predicate` returns true.
 *
 * @example
 * pickBy({ a: 1, b: 2 }, (value) => value > 1); // { b: 2 }
 */
export function pickBy<T>(
  source: Readonly<Record<string, T>>,
  predicate: (value: T, key: string) => boolean,
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of Object.keys(source)) {
    if (predicate(source[key]!, key)) {
      result[key] = source[key]!;
    }
  }
  return result;
}

/**
 * Drop keys for which `predicate` returns true.
 *
 * @example
 * omitBy({ a: 1, b: 2 }, (value) => value > 1); // { a: 1 }
 */
export function omitBy<T>(
  source: Readonly<Record<string, T>>,
  predicate: (value: T, key: string) => boolean,
): Record<string, T> {
  return pickBy(source, (value, key) => !predicate(value, key));
}

/**
 * Flatten nested plain objects into dotted keys.
 *
 * @example
 * flattenObject({ a: { b: 1 } }); // { "a.b": 1 }
 */
export function flattenObject(source: Readonly<Record<string, unknown>>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    const path = prefix.length === 0 ? key : `${prefix}.${key}`;
    const value = source[key];
    if (isPlainObject(value)) {
      Object.assign(result, flattenObject(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

/**
 * Number of own enumerable string keys.
 *
 * @example
 * objectSize({ a: 1, b: 2 }); // 2
 */
export function objectSize(source: object): number {
  return Object.keys(source).length;
}

/**
 * Shallow copy of a plain object's own enumerable keys.
 *
 * @example
 * shallowClone({ a: 1 }); // { a: 1 }
 */
export function shallowClone<T extends object>(source: T): T {
  return { ...source };
}

/**
 * Structural equality for plain data: objects, arrays, and primitives.
 *
 * @example
 * deepEquals({ a: [1] }, { a: [1] }); // true
 */
export function deepEquals(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => deepEquals(item, right[index]));
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) && deepEquals(left[key], right[key]))
    );
  }
  return false;
}

/**
 * Copy `source`, then overlay keys from `patch` whose values are not `undefined`.
 *
 * @example
 * assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 }); // { a: 1, b: 2, c: 3 }
 */
export function assignDefined<T extends Record<string, unknown>>(
  source: T,
  patch: Readonly<Record<string, unknown>>,
): T {
  const result: Record<string, unknown> = { ...source };
  for (const key of Object.keys(patch)) {
    if (patch[key] !== undefined) {
      result[key] = patch[key];
    }
  }
  return result as T;
}

/**
 * Own enumerable entries as pairs.
 *
 * @example
 * entriesOf({ a: 1 }); // [["a", 1]]
 */
export function entriesOf<T>(source: Readonly<Record<string, T>>): [string, T][] {
  return Object.entries(source);
}

/**
 * Build an object from pairs. Later pairs overwrite earlier keys.
 *
 * @example
 * fromPairs([["a", 1]]); // { a: 1 }
 */
export function fromPairs<T>(pairs: readonly (readonly [string, T])[]): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of pairs) {
    result[key] = value;
  }
  return result;
}

/**
 * Keys whose values differ between two objects, including keys present on only one side.
 *
 * @example
 * diffKeys({ a: 1, b: 2 }, { a: 1, b: 3 }); // ["b"]
 */
export function diffKeys(
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>,
): string[] {
  const keys = uniqueKeys(left, right);
  return keys.filter((key) => !deepEquals(left[key], right[key]));
}

function uniqueKeys(left: object, right: object): string[] {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])];
}
