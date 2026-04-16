import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRecipeHttp,
  deleteRecipeHttp,
  fetchAdminRecipeByIdHttp,
  fetchAdminRecipesHttp,
  fetchRecipesHttp,
  toggleRecipePublishedHttp,
} from "./recipes-adapter";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

describe("http recipes adapter", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("fetches admin recipes with credentials", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([{ id: "1", slug: "brown-butter-pancakes" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await fetchAdminRecipesHttp();

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:5080/api/admin/recipes", {
      credentials: "include",
    });
  });

  it("includes search and category query params for public recipes", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await fetchRecipesHttp({ search: "pasta", category: "Dinner" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5080/api/recipes?search=pasta&category=Dinner",
    );
  });

  it("finds an admin recipe by id from the admin list endpoint", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify([
          { id: "1", slug: "brown-butter-pancakes" },
          { id: "2", slug: "roasted-tomato-pasta" },
        ]),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const recipe = await fetchAdminRecipeByIdHttp("2");

    expect(recipe).toEqual({ id: "2", slug: "roasted-tomato-pasta" });
  });

  it("creates a recipe with a generated slug and credentials", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "10", slug: "fresh-pasta-salad" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await createRecipeHttp({
      title: "Fresh Pasta Salad",
      description: "Bright and herby.",
      category: "Lunch",
      prepTimeMinutes: 20,
      servings: 4,
      imageUrl: "https://example.com/pasta.jpg",
      ingredients: ["Pasta", "Herbs"],
      steps: ["Cook", "Mix"],
      isPublished: false,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5080/api/admin/recipes",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(JSON.parse(fetchMock.mock.calls[0]![1].body as string)).toEqual({
      title: "Fresh Pasta Salad",
      slug: "fresh-pasta-salad",
      description: "Bright and herby.",
      category: "Lunch",
      prepTimeMinutes: 20,
      servings: 4,
      imageUrl: "https://example.com/pasta.jpg",
      ingredients: ["Pasta", "Herbs"],
      steps: ["Cook", "Mix"],
      isPublished: false,
    });
  });

  it("deletes a recipe by first resolving its slug", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "1", slug: "brown-butter-pancakes" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await deleteRecipeHttp("1");

    expect(fetchMock).toHaveBeenNthCalledWith(1, "http://localhost:5080/api/admin/recipes", {
      credentials: "include",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:5080/api/admin/recipes/brown-butter-pancakes",
      {
        method: "DELETE",
        credentials: "include",
      },
    );
  });

  it("toggles recipe published state by issuing an update request", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "1",
              title: "Brown butter pancakes",
              slug: "brown-butter-pancakes",
              description: "Soft and golden.",
              category: "Breakfast",
              prepTimeMinutes: 25,
              servings: 4,
              imageUrl: "https://example.com/pancakes.jpg",
              ingredients: ["Flour"],
              steps: ["Mix"],
              isPublished: true,
            },
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "1", slug: "brown-butter-pancakes", isPublished: false }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    await toggleRecipePublishedHttp("1");

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:5080/api/admin/recipes/brown-butter-pancakes",
      expect.objectContaining({
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    expect(JSON.parse(fetchMock.mock.calls[1]![1].body as string)).toMatchObject({
      slug: "brown-butter-pancakes",
      isPublished: false,
    });
  });
});
