import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AdminSessionExpiredError,
  RecipeValidationError,
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

  it("includes search and category query params for admin recipes", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await fetchAdminRecipesHttp({ search: "tårta", category: "Dessert" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5080/api/admin/recipes?search=t%C3%A5rta&category=Dessert",
      {
        credentials: "include",
      },
    );
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

  it("normalizes Swedish characters when building a slug for the backend", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "11", slug: "rakmacka-med-aioli" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await createRecipeHttp({
      title: "Räkmacka med aioli",
      description: "Klassisk smörgås med räkor.",
      category: "Lunch",
      prepTimeMinutes: 15,
      servings: 2,
      imageUrl: "https://example.com/rakmacka.jpg",
      ingredients: ["Bröd", "Räkor"],
      steps: ["Montera", "Servera"],
      isPublished: true,
    });

    expect(JSON.parse(fetchMock.mock.calls[0]![1].body as string)).toMatchObject({
      slug: "rakmacka-med-aioli",
    });
  });

  it("maps backend validation problems to a structured frontend error", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          errors: {
            slug: ["Slug must contain lowercase letters, digits and hyphens only."],
            ingredients: ["At least one ingredient is required."],
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(
      createRecipeHttp({
        title: "Crème brûlée",
        description: "Silky custard dessert.",
        category: "Dessert",
        prepTimeMinutes: 45,
        servings: 6,
        imageUrl: "https://example.com/creme-brulee.jpg",
        ingredients: [],
        steps: ["Bake gently"],
        isPublished: false,
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<RecipeValidationError>>({
        name: "RecipeValidationError",
        fieldErrors: {
          slug: ["Titeln genererar en ogiltig slug. Använd bokstäver, siffror och bindestreck."],
          ingredients: ["Lägg till minst en ingrediens."],
        },
      }),
    );
  });

  it("throws a dedicated auth error when admin list fetch gets 401", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(fetchAdminRecipesHttp()).rejects.toBeInstanceOf(AdminSessionExpiredError);
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

  it("throws a dedicated auth error when deleting after session expiry", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "1", slug: "brown-butter-pancakes" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(deleteRecipeHttp("1")).rejects.toBeInstanceOf(AdminSessionExpiredError);
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
