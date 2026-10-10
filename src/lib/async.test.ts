import { expect, it, vi } from "vitest";
import {
  after,
  backoffDelay,
  createMutex,
  createQueue,
  debounce,
  defer,
  firstFulfilled,
  isPromise,
  mapLimit,
  memoizeAsync,
  once,
  poll,
  retry,
  sequence,
  settle,
  singleflight,
  sleep,
  throttle,
  tryAsync,
  withTimeout,
} from "./async";

it("sleeps and rejects an aborted signal", async () => {
  const started = Date.now();
  await sleep(15);
  expect(Date.now() - started).toBeGreaterThanOrEqual(10);
  const controller = new AbortController();
  controller.abort();
  await expect(sleep(10, controller.signal)).rejects.toMatchObject({ name: "AbortError" });
  expect(() => sleep(-1)).toThrow(RangeError);
});

it("resolves a value after a delay", async () => {
  await expect(after(10, "done")).resolves.toBe("done");
});

it("computes capped exponential backoff", () => {
  expect(backoffDelay(1)).toBe(100);
  expect(backoffDelay(2)).toBe(200);
  expect(backoffDelay(3, { baseMs: 50, factor: 2, maxMs: 75 })).toBe(75);
  expect(() => backoffDelay(0)).toThrow(RangeError);
});

it("retries until success and honors shouldRetry", async () => {
  let attempts = 0;
  const value = await retry(
    async () => {
      attempts += 1;
      if (attempts < 3) throw new Error("not yet");
      return "ok";
    },
    { attempts: 3, baseMs: 0 },
  );
  expect(value).toBe("ok");
  expect(attempts).toBe(3);

  await expect(
    retry(async () => {
      throw new Error("stop");
    }, {
      attempts: 3,
      baseMs: 0,
      shouldRetry: () => false,
    }),
  ).rejects.toThrow("stop");
});

it("debounces trailing calls and supports cancel and flush", async () => {
  vi.useFakeTimers();
  try {
    const calls: string[] = [];
    const debounced = debounce((value: string) => {
      calls.push(value);
    }, 100);
    debounced("a");
    debounced("b");
    await vi.advanceTimersByTimeAsync(100);
    expect(calls).toEqual(["b"]);
    debounced("c");
    debounced.cancel();
    await vi.advanceTimersByTimeAsync(100);
    expect(calls).toEqual(["b"]);
    debounced("d");
    debounced.flush();
    expect(calls).toEqual(["b", "d"]);
  } finally {
    vi.useRealTimers();
  }
});

it("throttles with a leading call and the latest call in the window", async () => {
  vi.useFakeTimers();
  try {
    const calls: number[] = [];
    const throttled = throttle((value: number) => {
      calls.push(value);
    }, 100);
    throttled(1);
    throttled(2);
    throttled(3);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);
    throttled(4);
    throttled(5);
    throttled.cancel();
    await vi.advanceTimersByTimeAsync(100);
    expect(calls).toEqual([1, 3, 4]);
  } finally {
    vi.useRealTimers();
  }
});

it("times out without cancelling the original promise", async () => {
  await expect(withTimeout(Promise.resolve(1), 20)).resolves.toBe(1);
  vi.useFakeTimers();
  try {
    let settled = false;
    const original = new Promise<number>(() => {});
    const pending = withTimeout(original, 50);
    const assertion = expect(pending).rejects.toThrow(/timed out/);
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
    settled = true;
    expect(settled).toBe(true);
    await expect(Promise.race([original, Promise.resolve("still-pending")])).resolves.toBe("still-pending");
  } finally {
    vi.useRealTimers();
  }
});

it("maps with a concurrency limit and rejects a zero limit", async () => {
  let active = 0;
  let peak = 0;
  const result = await mapLimit([1, 2, 3, 4], 2, async (item) => {
    active += 1;
    peak = Math.max(peak, active);
    await sleep(5);
    active -= 1;
    return item * 2;
  });
  expect(result).toEqual([2, 4, 6, 8]);
  expect(peak).toBeLessThanOrEqual(2);
  await expect(mapLimit([1], 0, async (item) => item)).rejects.toThrow(RangeError);
});

it("runs tasks in order", async () => {
  const order: number[] = [];
  const result = await sequence([
    async () => {
      order.push(1);
      return "a";
    },
    () => {
      order.push(2);
      return "b";
    },
  ]);
  expect(result).toEqual(["a", "b"]);
  expect(order).toEqual([1, 2]);
});

it("settles every promise", async () => {
  const results = await settle([Promise.resolve(1), Promise.reject(new Error("no"))]);
  expect(results[0]).toEqual({ status: "fulfilled", value: 1 });
  expect(results[1].status).toBe("rejected");
});

it("exposes resolve and reject", async () => {
  const pending = defer<number>();
  pending.resolve(1);
  await expect(pending.promise).resolves.toBe(1);
  const failing = defer<number>();
  failing.reject(new Error("nope"));
  await expect(failing.promise).rejects.toThrow("nope");
});

it("serializes calls and continues after a rejection", async () => {
  const mutex = createMutex();
  const order: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const first = mutex(async () => {
    order.push("start1");
    await gate;
    order.push("end1");
    throw new Error("fail");
  });
  const second = mutex(async () => {
    order.push("start2");
    return "ok";
  });
  release();
  await expect(first).rejects.toThrow("fail");
  await expect(second).resolves.toBe("ok");
  expect(order).toEqual(["start1", "end1", "start2"]);
});

it("caches a rejection", async () => {
  let calls = 0;
  const fn = once(async () => {
    calls += 1;
    throw new Error("nope");
  });
  await expect(fn()).rejects.toThrow("nope");
  await expect(fn()).rejects.toThrow("nope");
  expect(calls).toBe(1);
});

it("polls until a value appears and times out", async () => {
  let calls = 0;
  await expect(
    poll({
      intervalMs: 5,
      timeoutMs: 200,
      until: () => {
        calls += 1;
        return calls >= 3 ? "done" : undefined;
      },
    }),
  ).resolves.toBe("done");
  await expect(poll({ timeoutMs: 0, until: () => undefined })).rejects.toThrow("poll timed out");
});

it("returns a result tuple", async () => {
  await expect(tryAsync(() => 1)).resolves.toEqual([undefined, 1]);
  const [error, value] = await tryAsync(() => {
    throw new Error("nope");
  });
  expect(error).toBeInstanceOf(Error);
  expect(value).toBeUndefined();
});

it("returns the first fulfillment and throws synchronously for an empty list", async () => {
  expect(() => firstFulfilled([])).toThrow(RangeError);
  await expect(firstFulfilled([Promise.reject(new Error("no")), Promise.resolve(1)])).resolves.toBe(1);
  await expect(firstFulfilled([Promise.reject(new Error("a")), Promise.reject(new Error("b"))])).rejects.toBeInstanceOf(
    AggregateError,
  );
});

it("limits queue concurrency and releases the slot before resolving", async () => {
  const queue = createQueue(1);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const order: number[] = [];
  const first = queue.add(async () => {
    await gate;
    order.push(1);
  });
  const second = queue.add(async () => {
    order.push(2);
  });
  expect(queue.size).toBe(2);
  const third = queue.add(async () => {
    order.push(3);
  });
  release();
  await Promise.all([first, second, third]);
  expect(order).toEqual([1, 2, 3]);
  expect(queue.size).toBe(0);
});

it("detects thenables", () => {
  expect(isPromise(Promise.resolve(1))).toBe(true);
  expect(isPromise({ then: () => undefined })).toBe(true);
  expect(isPromise(1)).toBe(false);
  expect(isPromise(null)).toBe(false);
});

it("shares only the in-flight call", async () => {
  let calls = 0;
  let release!: (value: string) => void;
  const gate = new Promise<string>((resolve) => {
    release = resolve;
  });
  const load = singleflight(async () => {
    calls += 1;
    return gate;
  });
  const first = load();
  const second = load();
  expect(calls).toBe(1);
  release("ok");
  await expect(first).resolves.toBe("ok");
  await expect(second).resolves.toBe("ok");
  await expect(load()).resolves.toBe("ok");
  expect(calls).toBe(2);
});

it("caches fulfillment and forgets a rejection", async () => {
  let calls = 0;
  const load = memoizeAsync(async () => {
    calls += 1;
    if (calls === 1) throw new Error("nope");
    return "ok";
  });
  await expect(load()).rejects.toThrow("nope");
  await expect(load()).resolves.toBe("ok");
  await expect(load()).resolves.toBe("ok");
  expect(calls).toBe(2);
});
