/**
 * Object helpers. Nested structures are copied only by the functions that
 * say they go deep. Prototype properties are never copied.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value);
}

function ownKeys<T extends object>(value: T): (keyof T)[] {
  return Object.keys(value) as (keyof T)[];
}

/** @example pick({ a: 1, b: 2 }, ["a"]); // { a: 1 } */
export function pick<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[key] = value[key];
    }
  }
  return result;
}

/** @example omit({ a: 1, b: 2 }, ["b"]); // { a: 1 } */
export function omit<T extends object, K extends keyof T>(
  value: T,
  keys: readonly K[],
): Omit<T, K> {
  const blocked = new Set<keyof T>(keys);
  const result = {} as Omit<T, K>;
  for (const key of ownKeys(value)) {
    if (!blocked.has(key)) {
      (result as T)[key] = value[key];
    }
  }
  return result;
}

/** @example mapValues({ a: 1 }, (n) => n + 1); // { a: 2 } */
export function mapValues<T extends object, R>(
  value: T,
  mapper: (item: T[keyof T], key: keyof T) => R,
): { [K in keyof T]: R } {
  const result = {} as { [K in keyof T]: R };
  for (const key of ownKeys(value)) {
    result[key] = mapper(value[key], key);
  }
  return result;
}

/** @example mapKeys({ a: 1 }, (key) => String(key).toUpperCase()); // { A: 1 } */
export function mapKeys<T extends object>(
  value: T,
  mapper: (key: keyof T, item: T[keyof T]) => string,
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  for (const key of ownKeys(value)) {
    result[mapper(key, value[key])] = value[key];
  }
  return result;
}

/** @example invert({ a: "x" }); // { x: "a" } */
export function invert<T extends Record<string, string>>(
  value: T,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of Object.keys(value)) result[value[key]] = key;
  return result;
}

/**
 * Shallow merge. Later sources win. Arrays and nested objects are shared.
 *
 * @example
 * merge({ a: 1 }, { b: 2 }); // { a: 1, b: 2 }
 */
export function merge<T extends object>(
  ...sources: readonly (T | null | undefined)[]
): T {
  const result = {} as T;
  for (const source of sources) {
    if (source == null) continue;
    Object.assign(result, source);
  }
  return result;
}

function cloneDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneDeep(item)) as T;
  }
  if (!isRecord(value)) return value;
  const copy: Record<string, unknown> = {};
  for (const key of Object.keys(value)) copy[key] = cloneDeep(value[key]);
  return copy as T;
}

/**
 * Deep merge of plain objects. Arrays are cloned, not concatenated.
 *
 * @example
 * deepMerge({ a: { n: 1 } }, { a: { m: 2 } }); // { a: { n: 1, m: 2 } }
 */
export function deepMerge<T extends Record<string, unknown>>(
  ...sources: readonly (T | null | undefined)[]
): T {
  const result: Record<string, unknown> = {};
  for (const source of sources) {
    if (source == null) continue;
    for (const key of Object.keys(source)) {
      const next = source[key];
      const current = result[key];
      if (isRecord(current) && isRecord(next)) {
        result[key] = deepMerge(current, next);
      } else {
        result[key] = cloneDeep(next);
      }
    }
  }
  return result as T;
}

/** @example isEmpty({}); // true */
export function isEmpty(value: object): boolean {
  return Object.keys(value).length === 0;
}

/** @example isPlainObject({}); // true */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** @example getPath({ a: { b: 1 } }, ["a", "b"]); // 1 */
export function getPath(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const key of path) {
    if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, key)) {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * Set a nested path, copying each object along the way.
 *
 * @example
 * setPath({ a: { b: 1 } }, ["a", "b"], 2); // { a: { b: 2 } }
 */
export function setPath<T>(
  value: T,
  path: readonly string[],
  next: unknown,
): T {
  if (path.length === 0) return next as T;
  const [head, ...rest] = path;
  const source: Record<string, unknown> = isRecord(value) ? value : {};
  return {
    ...source,
    [head]: setPath(source[head], rest, next),
  } as T;
}

/** @example hasPath({ a: { b: 1 } }, ["a", "b"]); // true */
export function hasPath(value: unknown, path: readonly string[]): boolean {
  let current = value;
  for (const key of path) {
    if (!isRecord(current) || !Object.prototype.hasOwnProperty.call(current, key)) {
      return false;
    }
    current = current[key];
  }
  return true;
}

/** @example defaults({ a: 1 }, { a: 9, b: 2 }); // { a: 1, b: 2 } */
export function defaults<T extends object, D extends object>(
  value: T,
  fallback: D,
): T & D {
  return { ...fallback, ...value };
}

/** @example compactObject({ a: 1, b: undefined, c: null }); // { a: 1 } */
export function compactObject<T extends object>(value: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of ownKeys(value)) {
    const item = value[key];
    if (item !== undefined && item !== null) result[key] = item;
  }
  return result;
}

/** @example renameKeys({ a: 1 }, { a: "b" }); // { b: 1 } */
export function renameKeys<T extends object>(
  value: T,
  names: Partial<Record<keyof T, string>>,
): Record<string, T[keyof T]> {
  const result: Record<string, T[keyof T]> = {};
  for (const key of ownKeys(value)) {
    const name = names[key] ?? String(key);
    result[name] = value[key];
  }
  return result;
}

/** @example pickBy({ a: 1, b: 0 }, (n) => n > 0); // { a: 1 } */
export function pickBy<T extends object>(
  value: T,
  predicate: (item: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of ownKeys(value)) {
    if (predicate(value[key], key)) result[key] = value[key];
  }
  return result;
}

/** @example omitBy({ a: 1, b: 0 }, (n) => n === 0); // { a: 1 } */
export function omitBy<T extends object>(
  value: T,
  predicate: (item: T[keyof T], key: keyof T) => boolean,
): Partial<T> {
  return pickBy(value, (item, key) => !predicate(item, key));
}

/**
 * Flatten nested plain objects into dotted keys. Arrays stay as values.
 *
 * @example
 * flattenObject({ a: { b: 1 } }); // { "a.b": 1 }
 */
export function flattenObject(
  value: Record<string, unknown>,
  prefix = "",
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    const path = prefix.length === 0 ? key : `${prefix}.${key}`;
    const item = value[key];
    if (isRecord(item)) Object.assign(result, flattenObject(item, path));
    else result[path] = item;
  }
  return result;
}

/** @example objectSize({ a: 1, b: 2 }); // 2 */
export function objectSize(value: object): number {
  return Object.keys(value).length;
}

/** @example shallowClone({ a: 1 }); // { a: 1 } */
export function shallowClone<T extends object>(value: T): T {
  return { ...value };
}

/** @example deepEquals({ a: [1] }, { a: [1] }); // true */
export function deepEquals(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => deepEquals(item, right[index]))
    );
  }
  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(right, key) &&
        deepEquals(left[key], right[key]),
    );
  }
  return false;
}

/**
 * Copy properties from `source` whose values are not `undefined`.
 *
 * @example
 * assignDefined({ a: 1, b: 2 }, { b: undefined, c: 3 }); // { a: 1, b: 2, c: 3 }
 */
export function assignDefined<T extends object, S extends object>(
  target: T,
  source: S,
): T & S {
  const result = { ...target } as T & S;
  for (const key of Object.keys(source) as (keyof S)[]) {
    if (source[key] !== undefined) {
      (result as S)[key] = source[key];
    }
  }
  return result;
}

/** @example entriesOf({ a: 1 }); // [["a", 1]] */
export function entriesOf<T extends object>(value: T): [keyof T, T[keyof T]][] {
  return ownKeys(value).map((key) => [key, value[key]]);
}

/** @example fromPairs([["a", 1]]); // { a: 1 } */
export function fromPairs<T>(pairs: readonly (readonly [string, T])[]): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of pairs) result[key] = value;
  return result;
}

/**
 * Keys whose values differ. Missing keys count as a difference.
 *
 * @example
 * diffKeys({ a: 1, b: 2 }, { a: 1, b: 3 }); // ["b"]
 */
export function diffKeys(left: object, right: object): string[] {
  const keys = uniqueKeys(left, right);
  return keys.filter((key) => !deepEquals(getPath(left, [key]), getPath(right, [key])));
}

function uniqueKeys(left: object, right: object): string[] {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])];
}
