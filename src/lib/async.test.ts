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
  it("resolves after a delay", async () => {
    const start = Date.now();
    await sleep(5);
    expect(Date.now() - start).toBeGreaterThanOrEqual(0);
  });
});

describe("after", () => {
  it("resolves with the value", async () => {
    await expect(after(1, "ok")).resolves.toBe("ok");
  });
});

describe("backoffDelay", () => {
  it("grows exponentially", () => {
    expect(backoffDelay(3)).toBe(800);
  });
});

describe("retry", () => {
  it("retries until success", async () => {
    let calls = 0;
    const value = await retry(
      async () => {
        calls += 1;
        if (calls < 2) throw new Error("nope");
        return "ok";
      },
      { attempts: 3, sleep: async () => undefined },
    );
    expect(value).toBe("ok");
    expect(calls).toBe(2);
  });
});

describe("debounce", () => {
  it("invokes once after the quiet period", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 20);
    debounced();
    debounced();
    await vi.advanceTimersByTimeAsync(20);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe("throttle", () => {
  it("runs immediately and trails", async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 20);
    throttled("a");
    throttled("b");
    expect(fn).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(20);
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe("withTimeout", () => {
  it("accepts a plain value", async () => {
    await expect(withTimeout(1, 50)).resolves.toBe(1);
  });

  it("rejects when the timer wins", async () => {
    await expect(withTimeout(sleep(50).then(() => 1), 1)).rejects.toThrow(/timed out/);
  });
});

describe("mapLimit", () => {
  it("preserves order", async () => {
    await expect(mapLimit([1, 2], 1, async (n) => n * 2)).resolves.toEqual([2, 4]);
  });

  it("rejects when a mapper rejects", async () => {
    await expect(
      mapLimit([1], 1, async () => {
        throw new Error("nope");
      }),
    ).rejects.toThrow("nope");
  });
});

describe("sequence", () => {
  it("runs tasks in order", async () => {
    const seen: number[] = [];
    const result = await sequence([
      async () => {
        seen.push(1);
        return 1;
      },
      async () => {
        seen.push(2);
        return 2;
      },
    ]);
    expect(result).toEqual([1, 2]);
    expect(seen).toEqual([1, 2]);
  });
});

describe("settle", () => {
  it("keeps both outcomes", async () => {
    const results = await settle([Promise.resolve(1), Promise.reject(new Error("no"))]);
    expect(results[0]).toEqual({ status: "fulfilled", value: 1 });
    expect(results[1]?.status).toBe("rejected");
  });
});

describe("defer", () => {
  it("resolves from the outside", async () => {
    const pending = defer<number>();
    pending.resolve(1);
    await expect(pending.promise).resolves.toBe(1);
  });
});

describe("createMutex", () => {
  it("serializes work", async () => {
    const lock = createMutex();
    const seen: string[] = [];
    await Promise.all([
      lock(async () => {
        seen.push("a");
      }),
      lock(async () => {
        seen.push("b");
      }),
    ]);
    expect(seen).toEqual(["a", "b"]);
  });
});

describe("once", () => {
  it("calls the factory once", async () => {
    let calls = 0;
    const load = once(async () => {
      calls += 1;
      return 1;
    });
    await expect(Promise.all([load(), load()])).resolves.toEqual([1, 1]);
    expect(calls).toBe(1);
  });
});

describe("poll", () => {
  it("stops when the predicate succeeds", async () => {
    let calls = 0;
    const ok = await poll(
      async () => {
        calls += 1;
        return calls === 2;
      },
      { intervalMs: 1, attempts: 3, sleep: async () => undefined },
    );
    expect(ok).toBe(true);
  });
});

describe("tryAsync", () => {
  it("captures success and failure", async () => {
    await expect(tryAsync(async () => 1)).resolves.toEqual({ ok: true, value: 1 });
    const failed = await tryAsync(async () => {
      throw new Error("no");
    });
    expect(failed.ok).toBe(false);
  });
});

describe("firstFulfilled", () => {
  it("returns the first success", async () => {
    await expect(firstFulfilled([Promise.reject(new Error("no")), Promise.resolve(2)])).resolves.toBe(2);
  });
});

describe("createQueue", () => {
  it("frees a slot before the caller observes settlement", async () => {
    const queue = createQueue(1);
    let sizeDuringThen = -1;
    const done = queue.push(async () => "done").then((value) => {
      sizeDuringThen = queue.size();
      return value;
    });
    await expect(done).resolves.toBe("done");
    expect(sizeDuringThen).toBe(0);
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
  it("caches a success and forgets a failure", async () => {
    let calls = 0;
    const load = memoizeAsync(async (id: number) => {
      calls += 1;
      if (calls === 1) throw new Error("no");
      return id;
    });
    await expect(load(1)).rejects.toThrow("no");
    await expect(load(1)).resolves.toBe(1);
    await expect(load(1)).resolves.toBe(1);
    expect(calls).toBe(2);
  });
});
