import { describe, expect, it } from "vitest";
import { pickDifferent } from "./pickDifferent";

describe("pickDifferent", () => {
  const items = ["a", "b", "c"] as const;

  it("never returns the current item", () => {
    for (const roll of [0, 0.34, 0.5, 0.67, 0.999]) {
      expect(pickDifferent(items, "a", () => roll)).not.toBe("a");
    }
  });

  it("covers every other item across the random range", () => {
    expect(pickDifferent(items, "b", () => 0)).toBe("a");
    expect(pickDifferent(items, "b", () => 0.999)).toBe("c");
  });

  it("can return any item when current is not in the list", () => {
    expect(pickDifferent(items, "z" as string, () => 0)).toBe("a");
    expect(pickDifferent(items, "z" as string, () => 0.999)).toBe("c");
  });

  it("returns the only item when there is nothing else to choose", () => {
    expect(pickDifferent(["solo"], "solo")).toBe("solo");
  });

  it("throws on an empty list instead of returning undefined", () => {
    expect(() => pickDifferent([], "x")).toThrow(/at least one item/);
  });
});
