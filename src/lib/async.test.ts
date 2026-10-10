import { describe, expect, it, vi } from "vitest";
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

describe("sleep", () => {
  it("resolves after the delay", async () => {
    vi.useFakeTimers();
    const pending = sleep(25);
    await vi.advanceTimersByTimeAsync(25);
    await expect(pending).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe("after", () => {
  it("runs the task after the delay", async () => {
    vi.useFakeTimers();
    const pending = after(10, () => 7);
    await vi.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBe(7);
    vi.useRealTimers();
  });
});

describe("backoffDelay", () => {
  it("grows until the cap", () => {
    expect(backoffDelay(0)).toBe(100);
    expect(backoffDelay(3, 100, 2, 1000)).toBe(800);
    expect(backoffDelay(20, 100, 2, 1000)).toBe(1000);
  });
});

describe("retry", () => {
  it("retries until success", async () => {
    vi.useFakeTimers();
    let calls = 0;
    const pending = retry(
      async () => {
        calls += 1;
        if (calls < 3) throw new Error("nope");
        return "ok";
      },
      { attempts: 3, baseMs: 5, maxMs: 5 },
    );
    await vi.runAllTimersAsync();
    await expect(pending).resolves.toBe("ok");
    expect(calls).toBe(3);
    vi.useRealTimers();
  });
});

describe("debounce", () => {
  it("invokes once after the quiet period", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = debounce(fn, 20);
    wrapped("a");
    wrapped("b");
    await vi.advanceTimersByTimeAsync(20);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("b");
    vi.useRealTimers();
  });
});

describe("throttle", () => {
  it("invokes immediately and once more for a trailing call", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const wrapped = throttle(fn, 20);
    wrapped("a");
    wrapped("b");
    expect(fn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(20);
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe("withTimeout", () => {
  it("rejects when the deadline passes", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(sleep(100), 10);
    const assertion = expect(pending).rejects.toThrow(/Timed out/);
    await vi.advanceTimersByTimeAsync(10);
    await assertion;
    vi.useRealTimers();
  });
});

describe("mapLimit", () => {
  it("preserves order and caps concurrency", async () => {
    let active = 0;
    let peak = 0;
    const result = await mapLimit([1, 2, 3, 4], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await sleep(1);
      active -= 1;
      return value * 2;
    });
    expect(result).toEqual([2, 4, 6, 8]);
    expect(peak).toBeLessThanOrEqual(2);
  });
});

describe("sequence", () => {
  it("runs tasks in order", async () => {
    const seen: number[] = [];
    const result = await sequence([
      async () => {
        seen.push(1);
        return "a";
      },
      async () => {
        seen.push(2);
        return "b";
      },
    ]);
    expect(result).toEqual(["a", "b"]);
    expect(seen).toEqual([1, 2]);
  });
});

describe("settle", () => {
  it("keeps both outcomes", async () => {
    const results = await settle([Promise.resolve(1), Promise.reject(new Error("x"))]);
    expect(results[0]).toEqual({ status: "fulfilled", value: 1 });
    expect(results[1].status).toBe("rejected");
  });
});

describe("defer", () => {
  it("resolves later", async () => {
    const deferred = defer<number>();
    deferred.resolve(4);
    await expect(deferred.promise).resolves.toBe(4);
  });
});

describe("createMutex", () => {
  it("serializes sections", async () => {
    const lock = createMutex();
    const order: string[] = [];
    await Promise.all([
      lock.run(async () => {
        order.push("start-a");
        await sleep(5);
        order.push("end-a");
      }),
      lock.run(async () => {
        order.push("start-b");
      }),
    ]);
    expect(order).toEqual(["start-a", "end-a", "start-b"]);
  });
});

describe("once", () => {
  it("shares one result", async () => {
    let calls = 0;
    const init = once(async () => {
      calls += 1;
      return 1;
    });
    await expect(Promise.all([init(), init()])).resolves.toEqual([1, 1]);
    expect(calls).toBe(1);
  });
});

describe("poll", () => {
  it("returns the first defined probe", async () => {
    let calls = 0;
    await expect(
      poll(
        () => {
          calls += 1;
          return calls < 2 ? undefined : "ready";
        },
        { intervalMs: 1, timeoutMs: 50 },
      ),
    ).resolves.toBe("ready");
  });
});

describe("tryAsync", () => {
  it("captures rejection", async () => {
    await expect(tryAsync(async () => 1)).resolves.toEqual({ ok: true, value: 1 });
    const failed = await tryAsync(async () => {
      throw new Error("nope");
    });
    expect(failed.ok).toBe(false);
  });
});

describe("firstFulfilled", () => {
  it("returns the first success", async () => {
    await expect(
      firstFulfilled([Promise.reject(new Error("a")), Promise.resolve(2)]),
    ).resolves.toBe(2);
  });
});

describe("createQueue", () => {
  it("does not count a finished task as pending", async () => {
    const queue = createQueue(1);
    const done = queue.add(async () => "ok");
    await expect(done).resolves.toBe("ok");
    await Promise.resolve();
    expect(queue.size()).toBe(0);
  });
});

describe("isPromise", () => {
  it("detects thenables", () => {
    expect(isPromise(Promise.resolve(1))).toBe(true);
    expect(isPromise(1)).toBe(false);
  });
});

describe("singleflight", () => {
  it("shares an in-flight call", async () => {
    let calls = 0;
    const load = singleflight(async (id: string) => {
      calls += 1;
      await sleep(1);
      return id;
    });
    await expect(Promise.all([load("a"), load("a")])).resolves.toEqual(["a", "a"]);
    expect(calls).toBe(1);
  });
});

describe("memoizeAsync", () => {
  it("caches a resolved value and forgets a rejection", async () => {
    let calls = 0;
    const cached = memoizeAsync(async (n: number) => {
      calls += 1;
      if (calls === 1) throw new Error("nope");
      return n;
    });
    await expect(cached(1)).rejects.toThrow("nope");
    await expect(cached(1)).resolves.toBe(1);
    await expect(cached(1)).resolves.toBe(1);
    expect(calls).toBe(2);
  });
});
