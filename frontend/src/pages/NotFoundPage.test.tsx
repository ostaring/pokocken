import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "./NotFoundPage";
import { renderWithMemoryRouter } from "../test/render";

describe("NotFoundPage", () => {
  it("shows recovery links back into the app", () => {
    renderWithMemoryRouter(<NotFoundPage />, ["/saknas"]);

    expect(screen.getByText("Vi hittade inte sidan du letade efter.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gå till startsidan/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /visa recept/i })).toHaveAttribute("href", "/recipes");
  });
});
