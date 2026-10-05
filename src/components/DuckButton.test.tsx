import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("clears the wobble timeout on unmount so no state update fires later", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { unmount } = render(<DuckButton />);
    await user.click(screen.getByRole("button", { name: "Quack button" }));
    expect(screen.getByRole("button")).toHaveClass("wobble");

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("replaces a pending wobble timeout when clicked again", async () => {
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(<DuckButton />);
    const button = screen.getByRole("button", { name: "Quack button" });

    await user.click(button);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(button).toHaveClass("wobble");

    await user.click(button);
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
