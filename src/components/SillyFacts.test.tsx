import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SillyFacts } from "./SillyFacts";

describe("SillyFacts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("rotates to the next fact after the fade completes", () => {
    render(<SillyFacts />);
    const first = screen.getByText(/zero business logic/);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(first.className).toContain("opacity-0");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText(/This duck cannot/).className).toContain("opacity-100");
  });

  it("cancels the pending fade timeout when unmounted mid-transition", () => {
    const { unmount } = render(<SillyFacts />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
