import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DuckButton } from "./DuckButton";

describe("DuckButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("keeps wobbling until the animation ends, regardless of earlier clicks", () => {
    render(<DuckButton />);
    const button = screen.getByRole("button", { name: "Quack button" });

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(button.className).toContain("wobble");

    fireEvent.animationEnd(button);
    expect(button.className).not.toContain("wobble");
  });

  it("leaves no pending timers after unmounting mid-wobble", () => {
    const { unmount } = render(<DuckButton />);

    fireEvent.click(screen.getByRole("button", { name: "Quack button" }));
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
