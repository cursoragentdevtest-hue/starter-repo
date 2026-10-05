import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DuckButton, INITIAL_CAPTION, QUACKS } from "./DuckButton";

describe("DuckButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("clears the wobble timeout on unmount so no state update fires later", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { unmount } = render(<DuckButton />);
    fireEvent.click(screen.getByRole("button", { name: "Quack button" }));
    expect(screen.getByRole("button")).toHaveClass("wobble");

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("replaces a pending wobble timeout when clicked again", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<DuckButton />);
    const button = screen.getByRole("button", { name: "Quack button" });

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(button).toHaveClass("wobble");

    fireEvent.click(button);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    // First timeout would have fired at 500ms from first click; it must be cleared.
    expect(button).toHaveClass("wobble");

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(button).not.toHaveClass("wobble");
    expect(screen.getByText(QUACKS[0])).toBeInTheDocument();
  });

  it("announces caption changes with aria-live and starts from the idle prompt", () => {
    render(<DuckButton />);

    const liveRegion = screen.getByText(INITIAL_CAPTION);
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });
});
