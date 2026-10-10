/**
 * Promise and timing helpers.
 *
 * Timers are explicit so callers can control retries, concurrency, and
 * cancellation. `createQueue` drops a task from its count before the returned
 * promise settles, so a follow-up scheduled from a `then` callback sees the
 * updated size.
 */

/**
 * Resolves after `ms` milliseconds.
 *
 * @param ms - Delay. Negative values are treated as `0`.
 * @returns A promise that resolves with `undefined`.
 * @example
 * await sleep(10);
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.max(0, ms));
  });
}

/**
 * Resolves with `value` after `ms` milliseconds.
 *
 * @param ms - Delay.
 * @param value - Value to resolve.
 * @returns The delayed value.
 * @example
 * await after(10, "ok");
 * // => "ok"
 */
export function after<T>(ms: number, value: T): Promise<T> {
  return sleep(ms).then(() => value);
}

/**
 * Exponential backoff delay.
 *
 * @param attempt - Zero-based attempt number.
 * @param baseMs - Delay for attempt `0`. Defaults to `100`.
 * @param factor - Growth factor. Defaults to `2`.
 * @returns The delay in milliseconds.
 * @example
 * backoffDelay(3);
 * // => 800
 */
export function backoffDelay(attempt: number, baseMs = 100, factor = 2): number {
  if (attempt < 0) throw new RangeError("attempt must be non-negative");
  return baseMs * factor ** attempt;
}

export type RetryOptions = {
  attempts: number;
  baseMs?: number;
  factor?: number;
  sleep?: (ms: number) => Promise<void>;
};

/**
 * Calls `fn` until it resolves or attempts run out.
 *
 * @param fn - Operation. Receives the zero-based attempt.
 * @param options - Attempt count and backoff.
 * @returns The resolved value.
 * @throws The last rejection when every attempt fails.
 * @example
 * await retry(async () => 1, { attempts: 2 });
 * // => 1
 */
export async function retry<T>(fn: (attempt: number) => Promise<T>, options: RetryOptions): Promise<T> {
  if (options.attempts < 1) throw new RangeError("attempts must be at least 1");
  const wait = options.sleep ?? sleep;
  let lastError: unknown;
  for (let attempt = 0; attempt < options.attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < options.attempts - 1) {
        await wait(backoffDelay(attempt, options.baseMs ?? 100, options.factor ?? 2));
      }
    }
  }
  throw lastError;
}

/**
 * Delays invoking `fn` until `ms` have passed without another call.
 *
 * @param fn - Function to delay.
 * @param ms - Quiet period.
 * @returns A debounced function with `cancel` and `flush`.
 * @example
 * const save = debounce(() => "saved", 50);
 * save();
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): ((...args: A) => void) & { cancel: () => void; flush: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: A | undefined;
  const debounced = (...args: A) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      const pending = lastArgs;
      lastArgs = undefined;
      if (pending) fn(...pending);
    }, ms);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
  };
  debounced.flush = () => {
    if (!timer || !lastArgs) return;
    clearTimeout(timer);
    timer = undefined;
    const pending = lastArgs;
    lastArgs = undefined;
    fn(...pending);
  };
  return debounced;
}

/**
 * Invokes `fn` at most once per `ms`.
 *
 * The first call runs immediately. Later calls within the window are dropped,
 * except the latest, which runs when the window ends.
 *
 * @param fn - Function to limit.
 * @param ms - Minimum gap between calls.
 * @returns A throttled function.
 * @example
 * const ping = throttle(() => "pong", 50);
 * ping();
 */
export function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let trailing: A | undefined;
  return (...args: A) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      if (timer) clearTimeout(timer);
      timer = undefined;
      last = now;
      fn(...args);
      return;
    }
    trailing = args;
    if (!timer) {
      timer = setTimeout(() => {
        timer = undefined;
        last = Date.now();
        const pending = trailing;
        trailing = undefined;
        if (pending) fn(...pending);
      }, remaining);
    }
  };
}

/**
 * Rejects when `promise` does not settle within `ms`.
 *
 * `promise` may be a plain value; it is wrapped with `Promise.resolve`.
 *
 * @param promise - Operation or value.
 * @param ms - Timeout.
 * @returns The resolved value.
 * @throws {Error} When the timeout fires first.
 * @example
 * await withTimeout(Promise.resolve(1), 50);
 * // => 1
 */
export function withTimeout<T>(promise: Promise<T> | T, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * Maps `items` with at most `limit` operations in flight.
 *
 * @param items - Inputs.
 * @param limit - Maximum concurrency. Must be at least `1`.
 * @param mapper - Async mapper.
 * @returns Results in input order.
 * @example
 * await mapLimit([1, 2], 1, async (n) => n * 2);
 * // => [2, 4]
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (limit < 1) throw new RangeError("limit must be at least 1");
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index] as T, index);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Runs `tasks` one after another.
 *
 * @param tasks - Factories.
 * @returns Results in order.
 * @example
 * await sequence([async () => 1, async () => 2]);
 * // => [1, 2]
 */
export async function sequence<T>(tasks: readonly (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) results.push(await task());
  return results;
}

/**
 * Settles every promise and returns statuses.
 *
 * @param promises - Operations.
 * @returns Fulfilled and rejected records.
 * @example
 * await settle([Promise.resolve(1), Promise.reject(new Error("no"))]);
 */
export function settle<T>(promises: readonly Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(promises);
}

/**
 * A deferred promise with exposed `resolve` and `reject`.
 *
 * @returns The deferred handle.
 * @example
 * const pending = defer<number>();
 * pending.resolve(1);
 */
export function defer<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * A mutex that runs critical sections one at a time.
 *
 * @returns A `run` function.
 * @example
 * const lock = createMutex();
 * await lock(async () => "ok");
 */
export function createMutex(): <T>(fn: () => Promise<T>) => Promise<T> {
  let tail = Promise.resolve();
  return <T>(fn: () => Promise<T>) => {
    const run = tail.then(fn, fn);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
}

/**
 * Invokes `fn` once and returns the same promise afterwards.
 *
 * @param fn - Factory.
 * @returns A function that shares one result.
 * @example
 * const load = once(async () => 1);
 * await load();
 */
export function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= fn();
    return pending;
  };
}

/**
 * Calls `fn` every `ms` until it returns `true` or `attempts` run out.
 *
 * @param fn - Predicate.
 * @param options - Interval and attempt count.
 * @returns `true` when the predicate succeeds.
 * @example
 * await poll(async () => true, { intervalMs: 1, attempts: 2 });
 * // => true
 */
export async function poll(
  fn: () => Promise<boolean>,
  options: { intervalMs: number; attempts: number; sleep?: (ms: number) => Promise<void> },
): Promise<boolean> {
  const wait = options.sleep ?? sleep;
  for (let attempt = 0; attempt < options.attempts; attempt += 1) {
    if (await fn()) return true;
    if (attempt < options.attempts - 1) await wait(options.intervalMs);
  }
  return false;
}

/**
 * Converts a rejection into a result object.
 *
 * @param fn - Operation.
 * @returns `{ ok: true, value }` or `{ ok: false, error }`.
 * @example
 * await tryAsync(async () => 1);
 * // => { ok: true, value: 1 }
 */
export async function tryAsync<T>(fn: () => Promise<T>): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await fn() };
  } catch (error) {
    return { ok: false, error };
  }
}

/**
 * Resolves with the first fulfilled promise.
 *
 * @param promises - Operations. Must be non-empty.
 * @returns The first success.
 * @throws {AggregateError} When every promise rejects.
 * @example
 * await firstFulfilled([Promise.reject(new Error("no")), Promise.resolve(2)]);
 * // => 2
 */
export function firstFulfilled<T>(promises: readonly Promise<T>[]): Promise<T> {
  if (promises.length === 0) throw new RangeError("firstFulfilled requires a promise");
  return new Promise((resolve, reject) => {
    const errors: unknown[] = [];
    let pending = promises.length;
    for (const promise of promises) {
      promise.then(resolve, (error: unknown) => {
        errors.push(error);
        pending -= 1;
        if (pending === 0) reject(new AggregateError(errors, "all promises rejected"));
      });
    }
  });
}

/**
 * A concurrency-limited task queue.
 *
 * `size` drops as soon as a task finishes, before its promise settles, so work
 * queued from a completion callback observes the free slot.
 *
 * @param concurrency - Maximum in-flight tasks.
 * @returns `push` and `size`.
 * @example
 * const queue = createQueue(1);
 * await queue.push(async () => "done");
 */
export function createQueue(concurrency: number): {
  push: <T>(task: () => Promise<T>) => Promise<T>;
  size: () => number;
} {
  if (concurrency < 1) throw new RangeError("concurrency must be at least 1");
  let active = 0;
  const pending: (() => void)[] = [];
  const pump = () => {
    while (active < concurrency && pending.length > 0) {
      active += 1;
      const start = pending.shift()!;
      start();
    }
  };
  return {
    size: () => active + pending.length,
    push: <T>(task: () => Promise<T>) =>
      new Promise<T>((resolve, reject) => {
        pending.push(() => {
          const finish = () => {
            active -= 1;
            pump();
          };
          task().then(
            (value) => {
              finish();
              resolve(value);
            },
            (error: unknown) => {
              finish();
              reject(error);
            },
          );
        });
        pump();
      }),
  };
}

/**
 * Whether `value` is a thenable.
 *
 * @param value - Candidate.
 * @returns `true` when `then` is a function.
 * @example
 * isPromise(Promise.resolve(1));
 * // => true
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

/**
 * Shares one in-flight call per key.
 *
 * @param fn - Operation.
 * @returns A function that coalesces concurrent calls.
 * @example
 * const load = singleflight(async (id: string) => id);
 * await Promise.all([load("a"), load("a")]);
 */
export function singleflight<A extends unknown[], T>(
  fn: (...args: A) => Promise<T>,
  keyOf: (...args: A) => string = (...args) => JSON.stringify(args),
): (...args: A) => Promise<T> {
  const inflight = new Map<string, Promise<T>>();
  return (...args: A) => {
    const key = keyOf(...args);
    const existing = inflight.get(key);
    if (existing) return existing;
    const promise = fn(...args).finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, promise);
    return promise;
  };
}

/**
 * Memoizes a successful async result by key.
 *
 * Rejections are not cached.
 *
 * @param fn - Operation.
 * @param keyOf - Cache key. Defaults to `JSON.stringify`.
 * @returns A memoized function.
 * @example
 * const load = memoizeAsync(async (id: number) => id);
 * await load(1);
 */
export function memoizeAsync<A extends unknown[], T>(
  fn: (...args: A) => Promise<T>,
  keyOf: (...args: A) => string = (...args) => JSON.stringify(args),
): (...args: A) => Promise<T> {
  const cache = new Map<string, Promise<T>>();
  return (...args: A) => {
    const key = keyOf(...args);
    const cached = cache.get(key);
    if (cached) return cached;
    const promise = fn(...args).catch((error: unknown) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, promise);
    return promise;
  };
}
