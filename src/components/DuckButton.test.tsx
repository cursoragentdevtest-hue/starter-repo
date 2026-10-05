import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DuckButton } from "./DuckButton";

describe("DuckButton", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows a quack from the list when clicked", async () => {
    const user = userEvent.setup();
    render(<DuckButton />);

    await user.click(screen.getByRole("button", { name: "Quack button" }));

    expect(screen.getByText("Quack!")).toBeInTheDocument();
  });

  it("clears the wobble timeout on unmount", () => {
    vi.useFakeTimers();
    const { unmount } = render(<DuckButton />);

    fireEvent.click(screen.getByRole("button", { name: "Quack button" }));
    unmount();

    expect(() => vi.runAllTimers()).not.toThrow();
  });
});
