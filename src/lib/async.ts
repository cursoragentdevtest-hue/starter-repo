/**
 * Async helpers. Delays reject a non-negative finite duration.
 * An already-aborted signal rejects with `signal.reason`, or with an
 * `AbortError` `DOMException` when the signal has no reason.
 */

export type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

function assertDelay(ms: number): void {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError("delay must be a non-negative finite number");
  }
}

function abortReason(signal: AbortSignal): unknown {
  if (signal.reason !== undefined) return signal.reason;
  return new DOMException("The operation was aborted", "AbortError");
}

function rejectIfAborted(signal: AbortSignal | undefined, reject: (reason?: unknown) => void): boolean {
  if (signal?.aborted) {
    reject(abortReason(signal));
    return true;
  }
  return false;
}

function invoke<T>(fn: () => Promise<T> | T): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Resolve after `ms` milliseconds. Rejects when `signal` aborts.
 *
 * @example
 * await sleep(10);
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  assertDelay(ms);
  return new Promise((resolve, reject) => {
    if (rejectIfAborted(signal, reject)) return;
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal as AbortSignal));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Resolve with `value` after `ms` milliseconds. Rejects when `signal` aborts.
 *
 * @example
 * await after(10, "done"); // "done"
 */
export function after<T>(ms: number, value: T, signal?: AbortSignal): Promise<T> {
  return sleep(ms, signal).then(() => value);
}

/**
 * Exponential backoff for a 1-based `attempt`: `min(maxMs, baseMs * factor ** (attempt - 1))`.
 * Defaults are `baseMs` 100, `factor` 2, and `maxMs` 10000. There is no jitter.
 *
 * @example
 * backoffDelay(1); // 100
 *
 * @example
 * backoffDelay(3, { baseMs: 50, factor: 2, maxMs: 75 }); // 75
 */
export function backoffDelay(
  attempt: number,
  options?: { baseMs?: number; factor?: number; maxMs?: number },
): number {
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new RangeError("attempt must be a positive integer");
  }
  const baseMs = options?.baseMs ?? 100;
  const factor = options?.factor ?? 2;
  const maxMs = options?.maxMs ?? 10_000;
  return Math.min(maxMs, baseMs * factor ** (attempt - 1));
}

/**
 * Call `fn` until it resolves or the attempt budget is spent.
 * The wait before the next attempt is {@link backoffDelay} for the attempt that just failed.
 * `shouldRetry` can stop the loop early. Defaults to 3 attempts.
 *
 * @example
 * await retry(async () => "ok", { attempts: 1 }); // "ok"
 */
export async function retry<T>(
  fn: (attempt: number) => Promise<T> | T,
  options?: {
    attempts?: number;
    baseMs?: number;
    factor?: number;
    maxMs?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
  },
): Promise<T> {
  const attempts = options?.attempts ?? 3;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new RangeError("attempts must be a positive integer");
  }
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      const retryable = options?.shouldRetry?.(error, attempt) ?? true;
      if (!retryable || attempt === attempts) throw error;
      await sleep(backoffDelay(attempt, options));
    }
  }
  throw lastError;
}

/**
 * Trailing debounce. `cancel` drops a pending call. `flush` invokes it immediately.
 *
 * @example
 * const save = debounce((value: string) => value, 200);
 * save("a");
 * save.flush();
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): ((...args: A) => void) & { cancel: () => void; flush: () => void } {
  assertDelay(waitMs);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;

  const debounced = (...args: A) => {
    pending = args;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      const call = pending;
      pending = undefined;
      if (call) fn(...call);
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
  };

  debounced.flush = () => {
    if (pending === undefined) return;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    const call = pending;
    pending = undefined;
    fn(...call);
  };

  return debounced;
}

/**
 * Leading throttle that keeps the latest call from the current window and
 * invokes it when the window ends. That trailing invoke opens a new window.
 * `cancel` drops the pending call and ends the window.
 *
 * @example
 * const log = throttle((value: number) => value, 100);
 * log(1);
 */
export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number,
): ((...args: A) => void) & { cancel: () => void } {
  assertDelay(waitMs);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  let inWindow = false;

  const arm = () => {
    inWindow = true;
    timer = setTimeout(() => {
      timer = undefined;
      inWindow = false;
      if (pending === undefined) return;
      const call = pending;
      pending = undefined;
      fn(...call);
      arm();
    }, waitMs);
  };

  const throttled = (...args: A) => {
    if (!inWindow) {
      fn(...args);
      arm();
      return;
    }
    pending = args;
  };

  throttled.cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    pending = undefined;
    inWindow = false;
  };

  return throttled;
}

/**
 * Reject when `promise` is still pending after `ms`.
 * The original promise is not cancelled. A non-thenable is wrapped with `Promise.resolve`.
 *
 * @example
 * await withTimeout(Promise.resolve(1), 20); // 1
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message = "timed out"): Promise<T> {
  assertDelay(ms);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, ms);
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
 * Map `items` with at most `limit` calls in flight. Results keep input order.
 * A limit below 1 rejects, because this function is async.
 *
 * @example
 * await mapLimit([1, 2, 3], 2, async (item) => item * 2); // [2, 4, 6]
 */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R> | R,
): Promise<R[]> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("limit must be a positive integer");
  }
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const workerCount = Math.min(limit, items.length);
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Run `tasks` one after another and collect their results.
 *
 * @example
 * await sequence([() => 1, async () => 2]); // [1, 2]
 */
export async function sequence<T>(tasks: readonly (() => Promise<T> | T)[]): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) results.push(await task());
  return results;
}

/**
 * `Promise.allSettled` for a readonly list.
 *
 * @example
 * await settle([Promise.resolve(1), Promise.reject(new Error("no"))]);
 */
export function settle<T>(promises: readonly Promise<T>[]): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(promises);
}

/**
 * A promise together with its `resolve` and `reject` functions.
 *
 * @example
 * const pending = defer<number>();
 * pending.resolve(1);
 * await pending.promise; // 1
 */
export function defer<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Run functions one at a time. A rejection does not jam the mutex:
 * the internal tail swallows it so the next call still starts.
 *
 * @example
 * const run = createMutex();
 * await run(async () => "ok");
 */
export function createMutex(): <T>(fn: () => Promise<T> | T) => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve();
  return (fn) => {
    const run = tail.then(() => fn());
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };
}

/**
 * Call `fn` once and cache its promise, including a rejection.
 *
 * @example
 * const load = once(async () => 1);
 * await load();
 * await load(); // does not call the original function again
 */
export function once<A extends unknown[], T>(fn: (...args: A) => Promise<T> | T): (...args: A) => Promise<T> {
  let cached: Promise<T> | undefined;
  return (...args) => {
    if (!cached) cached = invoke(() => fn(...args));
    return cached;
  };
}

/**
 * Call `until` until it returns something other than `undefined`, or throw
 * `Error("poll timed out")` once `timeoutMs` has elapsed. `intervalMs` defaults to `0`.
 *
 * @example
 * await poll({ timeoutMs: 20, until: () => "ready" }); // "ready"
 */
export async function poll<T>(options: {
  intervalMs?: number;
  timeoutMs: number;
  until: () => Promise<T | undefined> | T | undefined;
}): Promise<T> {
  const intervalMs = options.intervalMs ?? 0;
  assertDelay(intervalMs);
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 0) {
    throw new RangeError("timeoutMs must be a non-negative finite number");
  }
  const start = Date.now();
  for (;;) {
    if (Date.now() - start >= options.timeoutMs) throw new Error("poll timed out");
    const value = await options.until();
    if (value !== undefined) return value;
    await sleep(intervalMs);
  }
}

/**
 * Return `[undefined, value]` when `fn` resolves, or `[error, undefined]` when it throws.
 *
 * @example
 * await tryAsync(() => 1); // [undefined, 1]
 */
export async function tryAsync<T>(fn: () => Promise<T> | T): Promise<[undefined, T] | [unknown, undefined]> {
  try {
    return [undefined, await fn()];
  } catch (error) {
    return [error, undefined];
  }
}

/**
 * First fulfilled promise. An empty list throws `RangeError` synchronously.
 * When every promise rejects, the returned promise rejects with an `AggregateError`.
 *
 * @example
 * await firstFulfilled([Promise.reject(new Error("no")), Promise.resolve(1)]); // 1
 */
export function firstFulfilled<T>(promises: readonly Promise<T>[]): Promise<T> {
  if (promises.length === 0) {
    throw new RangeError("firstFulfilled requires at least one promise");
  }
  return new Promise((resolve, reject) => {
    const errors: unknown[] = [];
    let remaining = promises.length;
    for (const promise of promises) {
      Promise.resolve(promise).then(
        (value) => resolve(value),
        (error: unknown) => {
          errors.push(error);
          remaining -= 1;
          if (remaining === 0) reject(new AggregateError(errors, "all promises rejected"));
        },
      );
    }
  });
}

/**
 * A concurrency-limited queue. `size` counts the running task and the waiting tasks.
 * The slot is released before the caller's promise resolves, so `size` is `0`
 * once the returned promise has settled and nothing else is queued.
 *
 * @example
 * const queue = createQueue(1);
 * await queue.add(async () => 1);
 */
export function createQueue(concurrency = 1): {
  add: <T>(task: () => Promise<T> | T) => Promise<T>;
  readonly size: number;
} {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("concurrency must be a positive integer");
  }
  let active = 0;
  const waiters: Array<() => void> = [];

  const finish = () => {
    active -= 1;
    const next = waiters.shift();
    if (next) next();
  };

  const start = <T>(task: () => Promise<T> | T, resolve: (value: T) => void, reject: (reason?: unknown) => void) => {
    active += 1;
    Promise.resolve()
      .then(task)
      .then(
        (value) => {
          finish();
          resolve(value);
        },
        (error: unknown) => {
          finish();
          reject(error);
        },
      );
  };

  return {
    add<T>(task: () => Promise<T> | T): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        if (active < concurrency) start(task, resolve, reject);
        else waiters.push(() => start(task, resolve, reject));
      });
    },
    get size() {
      return active + waiters.length;
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
 * Share one in-flight call per JSON key. A later call after settlement runs `fn` again.
 *
 * @example
 * const load = singleflight(async (id: string) => id);
 * await Promise.all([load("a"), load("a")]);
 */
export function singleflight<A extends unknown[], T>(
  fn: (...args: A) => Promise<T> | T,
): (...args: A) => Promise<T> {
  const inflight = new Map<string, Promise<T>>();
  return (...args) => {
    const key = JSON.stringify(args);
    const existing = inflight.get(key);
    if (existing) return existing;
    const promise = invoke(() => fn(...args));
    inflight.set(key, promise);
    const forget = () => {
      if (inflight.get(key) === promise) inflight.delete(key);
    };
    promise.then(forget, forget);
    return promise;
  };
}

/**
 * Cache a fulfilled result by JSON key. A rejection is forgotten so the next call retries.
 *
 * @example
 * const load = memoizeAsync(async (id: string) => id);
 * await load("a");
 * await load("a"); // cached
 */
export function memoizeAsync<A extends unknown[], T>(
  fn: (...args: A) => Promise<T> | T,
): (...args: A) => Promise<T> {
  const cache = new Map<string, Promise<T>>();
  return (...args) => {
    const key = JSON.stringify(args);
    const existing = cache.get(key);
    if (existing) return existing;
    const promise = invoke(() => fn(...args));
    cache.set(key, promise);
    promise.then(
      () => undefined,
      () => {
        if (cache.get(key) === promise) cache.delete(key);
      },
    );
    return promise;
  };
}
