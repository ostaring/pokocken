import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminRecipesQueryWithFilters } from "./recipe-hooks";

const { mockFetchAdminRecipes } = vi.hoisted(() => ({
  mockFetchAdminRecipes: vi.fn(),
}));

vi.mock("../../lib/api/recipes", async () => {
  const actual = await vi.importActual<typeof import("../../lib/api/recipes")>(
    "../../lib/api/recipes",
  );

  return {
    ...actual,
    fetchAdminRecipes: mockFetchAdminRecipes,
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useAdminRecipesQueryWithFilters", () => {
  beforeEach(() => {
    mockFetchAdminRecipes.mockReset();
    mockFetchAdminRecipes.mockResolvedValue([]);
  });

  it("forwards normalized filters to the admin recipes api", async () => {
    const { result } = renderHook(
      () =>
        useAdminRecipesQueryWithFilters({
          search: "  pasta  ",
          category: "Dinner",
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetchAdminRecipes).toHaveBeenCalledWith({
      search: "pasta",
      category: "Dinner",
    });
  });
});
