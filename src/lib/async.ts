/**
 * Async helpers. Timers are cleared when a race settles, and rejected attempts
 * surface as the original error rather than being swallowed.
 */

/**
 * Resolve after `ms` milliseconds.
 *
 * @example
 * await sleep(10);
 */
export function sleep(ms: number): Promise<void> {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError("ms must be a non-negative finite number");
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Resolve with `value` after `ms` milliseconds.
 *
 * @example
 * await after(10, "ok"); // "ok"
 */
export function after<T>(ms: number, value: T): Promise<T> {
  return sleep(ms).then(() => value);
}

/**
 * Exponential backoff delay for `attempt`, starting at `baseMs` and capped at `maxMs`.
 * Attempt numbers start at 0.
 *
 * @example
 * backoffDelay(0, 100, 1_000); // 100
 * backoffDelay(3, 100, 1_000); // 800
 */
export function backoffDelay(attempt: number, baseMs: number, maxMs: number): number {
  if (!Number.isInteger(attempt) || attempt < 0) {
    throw new RangeError("attempt must be a non-negative integer");
  }
  if (!Number.isFinite(baseMs) || baseMs < 0 || !Number.isFinite(maxMs) || maxMs < 0) {
    throw new RangeError("baseMs and maxMs must be non-negative finite numbers");
  }
  const delay = baseMs * 2 ** attempt;
  return Math.min(delay, maxMs);
}

/**
 * Call `fn` until it resolves or `attempts` are exhausted.
 * Waits {@link backoffDelay} between failures.
 *
 * @example
 * await retry(() => Promise.resolve("ok"), { attempts: 3 });
 */
export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: { attempts?: number; baseMs?: number; maxMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseMs = options.baseMs ?? 10;
  const maxMs = options.maxMs ?? 1_000;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts must be a positive integer");
  }
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(backoffDelay(attempt, baseMs, maxMs));
      }
    }
  }
  throw lastError;
}

/**
 * Return a function that delays invoking `fn` until `wait` ms after the last call.
 *
 * @example
 * const save = debounce((value: string) => value, 100);
 */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a non-negative finite number");
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };
}

/**
 * Return a function that invokes `fn` at most once per `wait` ms.
 * The first call runs immediately.
 *
 * @example
 * const log = throttle((value: string) => value, 100);
 */
export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): (...args: Args) => void {
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a non-negative finite number");
  }
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let trailing: Args | undefined;
  return (...args: Args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      last = now;
      fn(...args);
      return;
    }
    trailing = args;
    if (timer === undefined) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = undefined;
        const pending = trailing;
        trailing = undefined;
        if (pending) {
          fn(...pending);
        }
      }, remaining);
    }
  };
}

/**
 * Reject with `TimeoutError` when `promise` does not settle within `ms`.
 *
 * @example
 * await withTimeout(Promise.resolve(1), 50); // 1
 */
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError("ms must be a non-negative finite number");
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

/**
 * Map `items` with at most `limit` operations in flight.
 *
 * @example
 * await mapLimit([1, 2, 3], 2, async (n) => n * 2); // [2, 4, 6]
 */
export async function mapLimit<T, U>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("limit must be a positive integer");
  }
  const results = new Array<U>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(items[index]!, index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Run factories one after another.
 *
 * @example
 * await sequence([async () => 1, async () => 2]); // [1, 2]
 */
export async function sequence<T>(factories: readonly (() => Promise<T>)[]): Promise<T[]> {
  const results: T[] = [];
  for (const factory of factories) {
    results.push(await factory());
  }
  return results;
}

/**
 * Settle every promise and return `{ status, value }` or `{ status, reason }` entries.
 *
 * @example
 * await settle([Promise.resolve(1), Promise.reject(new Error("no"))]);
 */
export async function settle<T>(promises: readonly Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(promises);
}

/**
 * A deferred promise with exposed `resolve` and `reject`.
 *
 * @example
 * const pending = defer<number>();
 * pending.resolve(1);
 * await pending.promise;
 */
export function defer<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * A mutex that runs critical sections one at a time.
 *
 * @example
 * const mutex = createMutex();
 * await mutex.run(async () => "ok");
 */
export function createMutex(): { run: <T>(fn: () => Promise<T>) => Promise<T> } {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run<T>(fn: () => Promise<T>): Promise<T> {
      const run = tail.then(fn, fn);
      tail = run.then(
        () => undefined,
        () => undefined,
      );
      return run;
    },
  };
}

/**
 * Wrap `fn` so later calls return the first successful result.
 * A rejection is not cached.
 *
 * @example
 * const load = once(async () => 1);
 * await load();
 */
export function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => {
    if (pending) {
      return pending;
    }
    pending = fn().catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}

/**
 * Call `fn` until it returns a non-nullish value or `attempts` run out.
 *
 * @example
 * await poll(async () => "ready", { intervalMs: 1, attempts: 3 });
 */
export async function poll<T>(
  fn: () => Promise<T | null | undefined>,
  options: { intervalMs?: number; attempts?: number } = {},
): Promise<T> {
  const intervalMs = options.intervalMs ?? 10;
  const attempts = options.attempts ?? 10;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts must be a positive integer");
  }
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const value = await fn();
    if (value != null) {
      return value;
    }
    if (attempt < attempts - 1) {
      await sleep(intervalMs);
    }
  }
  throw new Error("poll exhausted attempts");
}

/**
 * Return `[error, undefined]` or `[undefined, value]` instead of throwing.
 *
 * @example
 * const [error, value] = await tryAsync(Promise.resolve(1));
 */
export async function tryAsync<T>(promise: Promise<T>): Promise<[undefined, T] | [unknown, undefined]> {
  try {
    return [undefined, await promise];
  } catch (error) {
    return [error, undefined];
  }
}

/**
 * Resolve with the first fulfilled promise. Reject when every promise rejects.
 *
 * @example
 * await firstFulfilled([Promise.reject(new Error("no")), Promise.resolve(1)]); // 1
 */
export async function firstFulfilled<T>(promises: readonly Promise<T>[]): Promise<T> {
  if (promises.length === 0) {
    throw new RangeError("firstFulfilled requires at least one promise");
  }
  const errors: unknown[] = [];
  return new Promise<T>((resolve, reject) => {
    let remaining = promises.length;
    for (const promise of promises) {
      promise.then(
        (value) => resolve(value),
        (error: unknown) => {
          errors.push(error);
          remaining -= 1;
          if (remaining === 0) {
            reject(errors[errors.length - 1]);
          }
        },
      );
    }
  });
}

/**
 * A concurrency-limited queue.
 *
 * @example
 * const queue = createQueue(1);
 * await queue.add(async () => "ok");
 */
export function createQueue(concurrency: number): {
  add: <T>(fn: () => Promise<T>) => Promise<T>;
} {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive integer");
  }
  let active = 0;
  const pending: (() => void)[] = [];
  function pump(): void {
    while (active < concurrency && pending.length > 0) {
      active += 1;
      const start = pending.shift()!;
      start();
    }
  }
  return {
    add<T>(fn: () => Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        pending.push(() => {
          fn().then(resolve, reject).finally(() => {
            active -= 1;
            pump();
          });
        });
        pump();
      });
    },
  };
}

/**
 * Whether `value` is a thenable.
 *
 * @example
 * isPromise(Promise.resolve(1)); // true
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

/**
 * Collapse concurrent calls that share a key into one in-flight promise.
 *
 * @example
 * const load = singleflight(async (id: string) => id);
 * await Promise.all([load("a"), load("a")]);
 */
export function singleflight<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
  keyOf: (...args: Args) => string = (...args) => JSON.stringify(args),
): (...args: Args) => Promise<T> {
  const inflight = new Map<string, Promise<T>>();
  return (...args: Args) => {
    const key = keyOf(...args);
    const existing = inflight.get(key);
    if (existing) {
      return existing;
    }
    const promise = fn(...args).finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, promise);
    return promise;
  };
}

/**
 * Memoize a successful async result by key. Rejections are not cached.
 *
 * @example
 * const load = memoizeAsync(async (id: string) => id);
 * await load("a");
 */
export function memoizeAsync<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>,
  keyOf: (...args: Args) => string = (...args) => JSON.stringify(args),
): (...args: Args) => Promise<T> {
  const cache = new Map<string, Promise<T>>();
  return (...args: Args) => {
    const key = keyOf(...args);
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
    const promise = fn(...args).catch((error: unknown) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, promise);
    return promise;
  };
}
