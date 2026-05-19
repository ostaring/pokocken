import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "@/pages/system/not-found/NotFoundPage";
import { renderWithMemoryRouter } from "@/test/utils/render";

describe("NotFoundPage", () => {
  it("shows a simple not found state without duplicate navigation links", () => {
    renderWithMemoryRouter(<NotFoundPage />, ["/saknas"]);

    expect(screen.getByText("Vi hittade inte sidan du letade efter.")).toBeInTheDocument();
    expect(screen.getByText("Sidan finns inte")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /gå till startsidan/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /visa recept/i })).not.toBeInTheDocument();
  });
});
