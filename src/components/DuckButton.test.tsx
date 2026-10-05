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

  it("shows a new quack on every click, even when the random roll repeats", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<DuckButton />);
    const button = screen.getByRole("button", { name: "Quack button" });

    fireEvent.click(button);
    expect(screen.getByText("Quack!")).toBeDefined();

    fireEvent.click(button);
    expect(screen.queryByText("Quack!")).toBeNull();
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
