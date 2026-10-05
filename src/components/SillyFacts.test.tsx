import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FACTS, SillyFacts } from "./SillyFacts";

describe("SillyFacts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("clears the nested fade timeout on unmount so no state update fires later", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { unmount } = render(<SillyFacts />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText(`“${FACTS[0]}”`)).toHaveClass("opacity-0");

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("cycles to the next fact after the fade timeout completes", () => {
    render(<SillyFacts />);

    expect(screen.getByText(`“${FACTS[0]}”`)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(`“${FACTS[1]}”`)).toBeInTheDocument();
  });

  it("exposes an assertive-safe live region for rotating facts", () => {
    render(<SillyFacts />);

    const liveRegion = screen.getByText(`“${FACTS[0]}”`);
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });
});
