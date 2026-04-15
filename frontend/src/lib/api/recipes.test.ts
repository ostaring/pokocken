import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAdminRecipeById,
  fetchAdminRecipes,
  createRecipe,
  deleteRecipe,
  fetchRecipeBySlug,
  fetchRecipes,
  toggleRecipePublished,
  updateRecipe,
} from "./recipes";

const {
  mockResolveAppConfig,
  mockFetchAdminRecipesHttp,
  mockFetchAdminRecipeByIdHttp,
  mockFetchRecipesHttp,
  mockFetchRecipeBySlugHttp,
  mockCreateRecipeHttp,
  mockUpdateRecipeHttp,
  mockToggleRecipePublishedHttp,
  mockDeleteRecipeHttp,
  mockFetchAdminRecipesMock,
  mockFetchAdminRecipeByIdMock,
  mockFetchRecipesMock,
  mockFetchRecipeBySlugMock,
  mockCreateRecipeMock,
  mockUpdateRecipeMock,
  mockToggleRecipePublishedMock,
  mockDeleteRecipeMock,
} = vi.hoisted(() => ({
  mockResolveAppConfig: vi.fn(),
  mockFetchAdminRecipesHttp: vi.fn(),
  mockFetchAdminRecipeByIdHttp: vi.fn(),
  mockFetchRecipesHttp: vi.fn(),
  mockFetchRecipeBySlugHttp: vi.fn(),
  mockCreateRecipeHttp: vi.fn(),
  mockUpdateRecipeHttp: vi.fn(),
  mockToggleRecipePublishedHttp: vi.fn(),
  mockDeleteRecipeHttp: vi.fn(),
  mockFetchAdminRecipesMock: vi.fn(),
  mockFetchAdminRecipeByIdMock: vi.fn(),
  mockFetchRecipesMock: vi.fn(),
  mockFetchRecipeBySlugMock: vi.fn(),
  mockCreateRecipeMock: vi.fn(),
  mockUpdateRecipeMock: vi.fn(),
  mockToggleRecipePublishedMock: vi.fn(),
  mockDeleteRecipeMock: vi.fn(),
}));

const recipeInput = {
  title: "Test recipe",
  description: "A recipe used in tests.",
  category: "Dinner" as const,
  prepTimeMinutes: 20,
  servings: 4,
  imageUrl: "https://example.com/recipe.jpg",
  ingredients: ["A", "B"],
  steps: ["Step 1", "Step 2"],
  isPublished: false,
};

vi.mock("../config", () => ({
  resolveAppConfig: mockResolveAppConfig,
}));

vi.mock("./http/recipes-adapter", () => ({
  fetchAdminRecipesHttp: mockFetchAdminRecipesHttp,
  fetchAdminRecipeByIdHttp: mockFetchAdminRecipeByIdHttp,
  fetchRecipesHttp: mockFetchRecipesHttp,
  fetchRecipeBySlugHttp: mockFetchRecipeBySlugHttp,
  createRecipeHttp: mockCreateRecipeHttp,
  updateRecipeHttp: mockUpdateRecipeHttp,
  toggleRecipePublishedHttp: mockToggleRecipePublishedHttp,
  deleteRecipeHttp: mockDeleteRecipeHttp,
}));

vi.mock("./mock/recipes-adapter", () => ({
  fetchAdminRecipesMock: mockFetchAdminRecipesMock,
  fetchAdminRecipeByIdMock: mockFetchAdminRecipeByIdMock,
  fetchRecipesMock: mockFetchRecipesMock,
  fetchRecipeBySlugMock: mockFetchRecipeBySlugMock,
  createRecipeMock: mockCreateRecipeMock,
  updateRecipeMock: mockUpdateRecipeMock,
  toggleRecipePublishedMock: mockToggleRecipePublishedMock,
  deleteRecipeMock: mockDeleteRecipeMock,
}));

describe("recipes api adapter selection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses mock recipe adapters in mock mode", async () => {
    mockResolveAppConfig.mockReturnValue({
      apiMode: "mock",
      apiBaseUrl: "http://localhost:5080",
    });

    await fetchRecipes();
    await fetchAdminRecipes();
    await fetchRecipeBySlug("slug");
    await fetchAdminRecipeById("id");
    await createRecipe(recipeInput);
    await updateRecipe("id", recipeInput);
    await toggleRecipePublished("id");
    await deleteRecipe("id");

    expect(mockFetchRecipesMock).toHaveBeenCalled();
    expect(mockFetchAdminRecipesMock).toHaveBeenCalled();
    expect(mockFetchRecipeBySlugMock).toHaveBeenCalledWith("slug");
    expect(mockFetchAdminRecipeByIdMock).toHaveBeenCalledWith("id");
    expect(mockCreateRecipeMock).toHaveBeenCalledWith(recipeInput);
    expect(mockUpdateRecipeMock).toHaveBeenCalledWith("id", recipeInput);
    expect(mockToggleRecipePublishedMock).toHaveBeenCalledWith("id");
    expect(mockDeleteRecipeMock).toHaveBeenCalledWith("id");
    expect(mockFetchRecipesHttp).not.toHaveBeenCalled();
  });

  it("uses http recipe adapters in http mode", async () => {
    mockResolveAppConfig.mockReturnValue({
      apiMode: "http",
      apiBaseUrl: "http://localhost:5080",
    });

    await fetchRecipes();
    await fetchAdminRecipes();
    await fetchRecipeBySlug("slug");
    await fetchAdminRecipeById("id");
    await createRecipe(recipeInput);
    await updateRecipe("id", recipeInput);
    await toggleRecipePublished("id");
    await deleteRecipe("id");

    expect(mockFetchRecipesHttp).toHaveBeenCalled();
    expect(mockFetchAdminRecipesHttp).toHaveBeenCalled();
    expect(mockFetchRecipeBySlugHttp).toHaveBeenCalledWith("slug");
    expect(mockFetchAdminRecipeByIdHttp).toHaveBeenCalledWith("id");
    expect(mockCreateRecipeHttp).toHaveBeenCalledWith(recipeInput);
    expect(mockUpdateRecipeHttp).toHaveBeenCalledWith("id", recipeInput);
    expect(mockToggleRecipePublishedHttp).toHaveBeenCalledWith("id");
    expect(mockDeleteRecipeHttp).toHaveBeenCalledWith("id");
    expect(mockFetchRecipesMock).not.toHaveBeenCalled();
  });
});
