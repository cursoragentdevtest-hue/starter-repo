/**
 * Async and concurrency helpers. Timers are real; tests that need them
 * should use fake timers or short delays.
 */

/** @example await sleep(10) */
export function sleep(ms: number): Promise<void> {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(new RangeError("ms must be a non-negative finite number."));
  }
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** @example after(10, () => 1) */
export function after<T>(ms: number, task: () => T | Promise<T>): Promise<T> {
  return sleep(ms).then(task);
}

/**
 * Exponential backoff delay in milliseconds.
 *
 * @example
 * backoffDelay(0); // 100
 * @example
 * backoffDelay(3, 100, 2, 1000); // 800
 */
export function backoffDelay(
  attempt: number,
  baseMs = 100,
  factor = 2,
  maxMs = 10_000,
): number {
  if (!Number.isInteger(attempt) || attempt < 0) {
    throw new RangeError("attempt must be a non-negative integer.");
  }
  if (baseMs < 0 || factor < 1 || maxMs < 0) {
    throw new RangeError("backoff parameters are out of range.");
  }
  return Math.min(maxMs, baseMs * factor ** attempt);
}

/**
 * Retry `task` until it resolves or `attempts` are exhausted.
 *
 * @example
 * await retry(() => fetch("/health"), { attempts: 3 });
 */
export async function retry<T>(
  task: (attempt: number) => Promise<T>,
  options: { attempts?: number; baseMs?: number; factor?: number; maxMs?: number } = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts must be a positive integer.");
  }
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await sleep(backoffDelay(attempt, options.baseMs, options.factor, options.maxMs));
      }
    }
  }
  throw lastError;
}

/** @example const save = debounce((value: string) => value, 200) */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, waitMs);
  };
}

/** @example const ping = throttle(() => {}, 1000) */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): (...args: A) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  return (...args: A) => {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    pending = args;
    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
      last = now;
      fn(...pending);
      pending = undefined;
      return;
    }
    if (timer === undefined) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = undefined;
        if (pending !== undefined) fn(...pending);
        pending = undefined;
      }, remaining);
    }
  };
}

/** @example await withTimeout(sleep(10), 50) */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  if (!Number.isFinite(ms) || ms < 0) {
    return Promise.reject(new RangeError("ms must be a non-negative finite number."));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms.`)), ms);
    promise.then(
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
 * Map with at most `limit` tasks in flight.
 *
 * @example
 * await mapLimit([1, 2, 3], 2, async (n) => n * 2);
 */
export async function mapLimit<T, R>(
  values: readonly T[],
  limit: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("limit must be a positive integer.");
  }
  const results = new Array<R>(values.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < values.length) {
      const index = next;
      next += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  const workers = Array.from({ length: Math.min(limit, values.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** @example await sequence([() => 1, () => 2]) */
export async function sequence<T>(tasks: readonly (() => Promise<T> | T)[]): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) results.push(await task());
  return results;
}

/** @example await settle([Promise.resolve(1), Promise.reject(new Error("x"))]) */
export function settle<T>(promises: readonly Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(promises);
}

/** @example const { promise, resolve } = defer<number>() */
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
 * const lock = createMutex();
 * await lock.run(async () => "ok");
 */
export function createMutex(): { run: <T>(task: () => Promise<T> | T) => Promise<T> } {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    run(task) {
      const result = tail.then(task, task);
      tail = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
  };
}

/** @example const init = once(async () => 1) */
export function once<T>(task: () => Promise<T> | T): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= Promise.resolve().then(task);
    return pending;
  };
}

/** @example await poll(() => true, { intervalMs: 1, timeoutMs: 20 }) */
export async function poll<T>(
  probe: () => Promise<T | undefined> | T | undefined,
  options: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<T> {
  const intervalMs = options.intervalMs ?? 10;
  const timeoutMs = options.timeoutMs ?? 1000;
  const started = Date.now();
  for (;;) {
    const value = await probe();
    if (value !== undefined) return value;
    if (Date.now() - started >= timeoutMs) {
      throw new Error(`poll timed out after ${timeoutMs}ms.`);
    }
    await sleep(intervalMs);
  }
}

/** @example await tryAsync(async () => 1) */
export async function tryAsync<T>(
  task: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
  try {
    return { ok: true, value: await task() };
  } catch (error) {
    return { ok: false, error };
  }
}

/** @example await firstFulfilled([Promise.reject(1), Promise.resolve(2)]) */
export async function firstFulfilled<T>(promises: readonly Promise<T>[]): Promise<T> {
  if (promises.length === 0) {
    throw new RangeError("firstFulfilled expects at least one promise.");
  }
  return new Promise((resolve, reject) => {
    let remaining = promises.length;
    const errors: unknown[] = [];
    for (const promise of promises) {
      promise.then(resolve, (error: unknown) => {
        errors.push(error);
        remaining -= 1;
        if (remaining === 0) reject(new AggregateError(errors, "All promises were rejected."));
      });
    }
  });
}

/**
 * A fixed-concurrency queue. `size` counts work that has not finished.
 *
 * @example
 * const queue = createQueue(1);
 * await queue.add(async () => 1);
 */
export function createQueue(concurrency: number): {
  add: <T>(task: () => Promise<T> | T) => Promise<T>;
  size: () => number;
} {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive integer.");
  }
  let active = 0;
  let pending = 0;
  const waiting: (() => void)[] = [];

  function finish(): void {
    active -= 1;
    pending -= 1;
    const next = waiting.shift();
    if (next) next();
  }

  async function run<T>(task: () => Promise<T> | T): Promise<T> {
    active += 1;
    try {
      return await task();
    } finally {
      finish();
    }
  }

  return {
    size: () => pending,
    add<T>(task: () => Promise<T> | T) {
      pending += 1;
      if (active < concurrency) return run(task);
      return new Promise<T>((resolve, reject) => {
        waiting.push(() => {
          run(task).then(resolve, reject);
        });
      });
    },
  };
}

/** @example isPromise(Promise.resolve(1)); // true */
export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

/**
 * Collapse concurrent calls that share a key into one in-flight promise.
 *
 * @example
 * const load = singleflight(async (id: string) => id);
 */
export function singleflight<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyOf: (...args: A) => string = (...args) => JSON.stringify(args),
): (...args: A) => Promise<R> {
  const inflight = new Map<string, Promise<R>>();
  return (...args: A) => {
    const key = keyOf(...args);
    const existing = inflight.get(key);
    if (existing) return existing;
    const promise = Promise.resolve()
      .then(() => fn(...args))
      .finally(() => {
        inflight.delete(key);
      });
    inflight.set(key, promise);
    return promise;
  };
}

/** @example const cached = memoizeAsync(async (n: number) => n) */
export function memoizeAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyOf: (...args: A) => string = (...args) => JSON.stringify(args),
): (...args: A) => Promise<R> {
  const cache = new Map<string, Promise<R>>();
  return (...args: A) => {
    const key = keyOf(...args);
    const cached = cache.get(key);
    if (cached) return cached;
    const promise = Promise.resolve().then(() => fn(...args));
    cache.set(key, promise);
    promise.catch(() => {
      cache.delete(key);
    });
    return promise;
  };
}
