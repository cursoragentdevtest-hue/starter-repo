import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DuckButton, QUACKS } from "./DuckButton";

describe("DuckButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("replaces the prompt with a quack and keeps wobble until the timeout is cleared", () => {
    render(<DuckButton />);
    const button = screen.getByRole("button", { name: "Quack button" });

    expect(screen.getByText("Press for wisdom")).toBeDefined();
    expect(screen.getByRole("status")).toBeDefined();

    fireEvent.click(button);
    expect(button.className).toContain("wobble");
    expect(QUACKS.some((quack) => screen.queryByText(quack) !== null)).toBe(
      true,
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(button.className).not.toContain("wobble");
  });

  it("cancels the previous wobble timeout on rapid clicks", () => {
    render(<DuckButton />);
    const button = screen.getByRole("button", { name: "Quack button" });

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    fireEvent.click(button);

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(button.className).toContain("wobble");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(button.className).not.toContain("wobble");
  });

  it("does not update state after unmount", () => {
    const { unmount } = render(<DuckButton />);
    fireEvent.click(screen.getByRole("button", { name: "Quack button" }));
    unmount();

    expect(() => {
      act(() => {
        vi.runAllTimers();
      });
    }).not.toThrow();
  });
});
