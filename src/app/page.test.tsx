import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "./page";

test("renders the heading, the duck button, and a fact", () => {
  render(<Home />);

  expect(screen.getByRole("heading", { level: 1, name: "Silly Starter™" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Quack button" })).toBeDefined();
  expect(screen.getByText(/zero business logic/)).toBeDefined();
});
