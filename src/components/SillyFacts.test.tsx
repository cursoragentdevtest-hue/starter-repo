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
  });

  it("cycles to the next fact after the fade timeout", () => {
    render(<SillyFacts />);
    expect(screen.getByText(`“${FACTS[0]}”`)).toBeDefined();
    expect(screen.getByRole("status")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText(`“${FACTS[1]}”`)).toBeDefined();
  });

  it("clears the nested fade timeout on unmount so state is not updated", () => {
    const { unmount } = render(<SillyFacts />);

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(300);
      });
    }).not.toThrow();
  });
});
