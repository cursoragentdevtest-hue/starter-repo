import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { FACTS, FADE_MS, ROTATE_MS, SillyFacts } from "./SillyFacts";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function quoted(fact: string) {
  return `\u201c${fact}\u201d`;
}

test("fades to the next fact after each rotation", () => {
  render(<SillyFacts />);
  expect(screen.getByText(quoted(FACTS[0]))).toBeDefined();

  act(() => {
    vi.advanceTimersByTime(ROTATE_MS);
  });
  expect(screen.getByText(quoted(FACTS[0])).className).toContain("opacity-0");

  act(() => {
    vi.advanceTimersByTime(FADE_MS);
  });
  const next = screen.getByText(quoted(FACTS[1]));
  expect(next.className).toContain("opacity-100");
});

test("wraps back to the first fact after the last one", () => {
  render(<SillyFacts />);

  act(() => {
    vi.advanceTimersByTime(ROTATE_MS * FACTS.length + FADE_MS);
  });
  expect(screen.getByText(quoted(FACTS[0]))).toBeDefined();
});

test("leaves no pending timers when unmounted mid-fade", () => {
  const { unmount } = render(<SillyFacts />);

  act(() => {
    vi.advanceTimersByTime(ROTATE_MS);
  });
  unmount();

  expect(vi.getTimerCount()).toBe(0);
});
