import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { DuckButton } from "./DuckButton";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function getDuck() {
  return screen.getByRole("button", { name: "Quack button" });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

test("wobbles on click and stops when the animation ends", () => {
  render(<DuckButton />);

  fireEvent.click(getDuck());
  expect(getDuck().classList).toContain("wobble");

  fireEvent.animationEnd(getDuck());
  expect(getDuck().classList).not.toContain("wobble");
});

test("an earlier click does not cut a later wobble short", () => {
  render(<DuckButton />);

  fireEvent.click(getDuck());
  advance(400);
  fireEvent.click(getDuck());
  advance(100);
  fireEvent.animationEnd(getDuck());

  advance(100);
  fireEvent.click(getDuck());
  advance(300);
  expect(getDuck().classList).toContain("wobble");
});

test("leaves no pending timers when unmounted mid-wobble", () => {
  const { unmount } = render(<DuckButton />);

  fireEvent.click(getDuck());
  unmount();

  expect(vi.getTimerCount()).toBe(0);
});
