import { describe, expect, it } from "vitest";
import {
  TimeoutError,
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

describe("async", () => {
  it("sleep", async () => {
    const started = Date.now();
    await sleep(15);
    expect(Date.now() - started).toBeGreaterThanOrEqual(10);
  });

  it("after", async () => {
    await expect(after(1, "ok")).resolves.toBe("ok");
  });

  it("backoffDelay", () => {
    expect(backoffDelay(0, 100, 1_000)).toBe(100);
    expect(backoffDelay(3, 100, 1_000)).toBe(800);
    expect(backoffDelay(10, 100, 1_000)).toBe(1_000);
  });

  it("retry", async () => {
    let calls = 0;
    const value = await retry(async () => {
      calls += 1;
      if (calls < 2) {
        throw new Error("not yet");
      }
      return "ok";
    }, { attempts: 3, baseMs: 1, maxMs: 5 });
    expect(value).toBe("ok");
    expect(calls).toBe(2);
  });

  it("debounce", async () => {
    let seen = "";
    const save = debounce((value: string) => {
      seen = value;
    }, 20);
    save("a");
    save("b");
    await sleep(40);
    expect(seen).toBe("b");
  });

  it("throttle", async () => {
    const seen: string[] = [];
    const log = throttle((value: string) => {
      seen.push(value);
    }, 30);
    log("a");
    log("b");
    await sleep(50);
    expect(seen[0]).toBe("a");
    expect(seen).toContain("b");
  });

  it("withTimeout", async () => {
    await expect(withTimeout(Promise.resolve(1), 50)).resolves.toBe(1);
    await expect(withTimeout(sleep(50).then(() => 1), 5)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("mapLimit", async () => {
    let active = 0;
    let peak = 0;
    const result = await mapLimit([1, 2, 3, 4], 2, async (n) => {
      active += 1;
      peak = Math.max(peak, active);
      await sleep(5);
      active -= 1;
      return n * 2;
    });
    expect(result).toEqual([2, 4, 6, 8]);
    expect(peak).toBeLessThanOrEqual(2);
  });

  it("sequence", async () => {
    await expect(sequence([async () => 1, async () => 2])).resolves.toEqual([1, 2]);
  });

  it("settle", async () => {
    const results = await settle([Promise.resolve(1), Promise.reject(new Error("no"))]);
    expect(results[0]).toEqual({ status: "fulfilled", value: 1 });
    expect(results[1]?.status).toBe("rejected");
  });

  it("defer", async () => {
    const pending = defer<number>();
    pending.resolve(1);
    await expect(pending.promise).resolves.toBe(1);
  });

  it("createMutex", async () => {
    const mutex = createMutex();
    const order: string[] = [];
    await Promise.all([
      mutex.run(async () => {
        order.push("start-a");
        await sleep(15);
        order.push("end-a");
      }),
      mutex.run(async () => {
        order.push("start-b");
      }),
    ]);
    expect(order).toEqual(["start-a", "end-a", "start-b"]);
  });

  it("once", async () => {
    let calls = 0;
    const load = once(async () => {
      calls += 1;
      return 1;
    });
    await expect(Promise.all([load(), load()])).resolves.toEqual([1, 1]);
    expect(calls).toBe(1);
  });

  it("poll", async () => {
    let calls = 0;
    await expect(
      poll(async () => {
        calls += 1;
        return calls === 2 ? "ready" : null;
      }, { intervalMs: 1, attempts: 3 }),
    ).resolves.toBe("ready");
  });

  it("tryAsync", async () => {
    await expect(tryAsync(Promise.resolve(1))).resolves.toEqual([undefined, 1]);
    const [error, value] = await tryAsync(Promise.reject(new Error("no")));
    expect(error).toBeInstanceOf(Error);
    expect(value).toBeUndefined();
  });

  it("firstFulfilled", async () => {
    await expect(firstFulfilled([Promise.reject(new Error("no")), Promise.resolve(1)])).resolves.toBe(1);
  });

  it("createQueue", async () => {
    const queue = createQueue(1);
    await expect(queue.add(async () => "ok")).resolves.toBe("ok");
  });

  it("isPromise", () => {
    expect(isPromise(Promise.resolve(1))).toBe(true);
    expect(isPromise(1)).toBe(false);
  });

  it("singleflight", async () => {
    let calls = 0;
    const load = singleflight(async (id: string) => {
      calls += 1;
      await sleep(10);
      return id;
    });
    await expect(Promise.all([load("a"), load("a")])).resolves.toEqual(["a", "a"]);
    expect(calls).toBe(1);
  });

  it("memoizeAsync", async () => {
    let calls = 0;
    const load = memoizeAsync(async (id: string) => {
      calls += 1;
      return id;
    });
    await load("a");
    await load("a");
    expect(calls).toBe(1);
  });
});
