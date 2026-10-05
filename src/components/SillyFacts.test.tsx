import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SillyFacts } from "./SillyFacts";

describe("SillyFacts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("clears pending fade timeout on unmount", () => {
    const { unmount } = render(<SillyFacts />);
    expect(screen.getByText(/This app has zero business logic/)).toBeInTheDocument();

    vi.advanceTimersByTime(4000);
    unmount();

    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
