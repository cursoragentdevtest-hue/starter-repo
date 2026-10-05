import { describe, expect, it } from "vitest";
import {
  FACTS,
  QUACKS,
  getFact,
  getQuack,
  pickFact,
  pickQuack,
} from "./catalog";

describe("catalog helpers", () => {
  it("pickQuack uses the provided random source", () => {
    expect(pickQuack(() => 0)).toBe(QUACKS[0]);
    expect(pickQuack(() => 0.999)).toBe(QUACKS[QUACKS.length - 1]);
  });

  it("pickFact uses the provided random source", () => {
    expect(pickFact(() => 0)).toBe(FACTS[0]);
    expect(pickFact(() => 0.999)).toBe(FACTS[FACTS.length - 1]);
  });

  it("getQuack and getFact reject invalid indexes", () => {
    expect(() => getQuack(-1)).toThrow(RangeError);
    expect(() => getFact(FACTS.length)).toThrow(RangeError);
  });
});
