import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { AdminLayout } from "../components/AdminLayout";
import {
  useCreateRecipeMutation,
  useRecipeByIdQuery,
  useUpdateRecipeMutation,
} from "../features/recipes/recipe-hooks";
import {
  recipeFormSchema,
  type RecipeFormValues,
} from "../features/recipes/recipe-form-schema";

type AdminRecipeEditorPageProps = {
  mode: "create" | "edit";
};

export function AdminRecipeEditorPage({ mode }: AdminRecipeEditorPageProps) {
  const title = mode === "create" ? "Create recipe" : "Edit recipe";
  const { id } = useParams();
  const recipeQuery = useRecipeByIdQuery(mode === "edit" ? id : undefined);
  const recipe = recipeQuery.data;
  const createRecipeMutation = useCreateRecipeMutation();
  const updateRecipeMutation = useUpdateRecipeMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      category: "Dinner",
      prepTimeMinutes: 30,
      servings: 4,
      imageUrl: "",
      ingredientsText: "",
      stepsText: "",
      isPublished: false,
    },
  });

  useEffect(() => {
    if (!recipe) {
      return;
    }

    reset({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      prepTimeMinutes: recipe.prepTimeMinutes,
      servings: recipe.servings,
      imageUrl: recipe.imageUrl,
      ingredientsText: recipe.ingredients.join("\n"),
      stepsText: recipe.steps.join("\n"),
      isPublished: recipe.isPublished,
    });
  }, [recipe, reset]);

  async function onSubmit(values: RecipeFormValues) {
    setSuccessMessage(null);

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      prepTimeMinutes: Number(values.prepTimeMinutes),
      servings: Number(values.servings),
      imageUrl: values.imageUrl.trim(),
      ingredients: values.ingredientsText
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean),
      steps: values.stepsText
        .split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean),
      isPublished: values.isPublished,
    };

    if (mode === "create") {
      await createRecipeMutation.mutateAsync(payload);
      setSuccessMessage("Recipe created successfully.");
      reset();
      return;
    }

    if (!id) {
      return;
    }

    await updateRecipeMutation.mutateAsync({ id, input: payload });
    setSuccessMessage("Recipe updated successfully.");
  }

  if (mode === "edit" && recipeQuery.isLoading) {
    return (
      <AdminLayout
        title="Loading recipe"
        description="Fetching recipe data for the editor."
      >
        <p className="text-slate-700">Loading recipe editor...</p>
      </AdminLayout>
    );
  }

  if (mode === "edit" && recipeQuery.isError) {
    return (
      <AdminLayout
        title="Editor unavailable"
        description="Something went wrong while loading the recipe."
      >
        <p className="text-slate-700">Please try again later.</p>
      </AdminLayout>
    );
  }

  if (mode === "edit" && !recipe) {
    return (
      <AdminLayout
        title="Recipe not found"
        description="We could not find a recipe matching that admin edit route."
      >
        <p className="text-slate-700">
          Once the backend is connected this should map to an authenticated admin fetch plus a clean
          not-found state.
        </p>
      </AdminLayout>
    );
  }

  const mutationError = createRecipeMutation.error ?? updateRecipeMutation.error;
  const isSaving = isSubmitting || createRecipeMutation.isPending || updateRecipeMutation.isPending;

  return (
    <AdminLayout
      title={title}
      description="A shared admin editor for create and edit mode. The form contract is now stable enough to connect to backend create and update endpoints."
      actions={
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
          to="/admin"
        >
          Back to dashboard
        </Link>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_320px]">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {successMessage}
            </div>
          ) : null}

          {mutationError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {mutationError instanceof Error ? mutationError.message : "Could not save recipe."}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                type="text"
                placeholder="Roasted tomato pasta"
                {...register("title")}
              />
              {errors.title ? <p className="text-sm text-rose-600">{errors.title.message}</p> : null}
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                placeholder="A quick pasta built around sweet roasted tomatoes..."
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-rose-600">{errors.description.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                {...register("category")}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Snack</option>
              </select>
              {errors.category ? (
                <p className="text-sm text-rose-600">{errors.category.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Image URL</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                type="url"
                placeholder="https://example.com/recipe.jpg"
                {...register("imageUrl")}
              />
              {errors.imageUrl ? (
                <p className="text-sm text-rose-600">{errors.imageUrl.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Prep time (minutes)</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                type="number"
                {...register("prepTimeMinutes")}
              />
              {errors.prepTimeMinutes ? (
                <p className="text-sm text-rose-600">{errors.prepTimeMinutes.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Servings</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                type="number"
                {...register("servings")}
              />
              {errors.servings ? (
                <p className="text-sm text-rose-600">{errors.servings.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Ingredients</span>
              <textarea
                className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                placeholder={"1 onion\n2 tbsp olive oil\n300 g pasta"}
                {...register("ingredientsText")}
              />
              {errors.ingredientsText ? (
                <p className="text-sm text-rose-600">{errors.ingredientsText.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Steps</span>
              <textarea
                className="min-h-48 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                placeholder={"Cook the pasta.\nRoast the tomatoes.\nMix everything together."}
                {...register("stepsText")}
              />
              {errors.stepsText ? (
                <p className="text-sm text-rose-600">{errors.stepsText.message}</p>
              ) : null}
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <input className="h-4 w-4" type="checkbox" {...register("isPublished")} />
            <span className="text-sm font-semibold text-slate-800">Published</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!isValid || isSaving}
            >
              {isSaving ? "Saving..." : mode === "create" ? "Create recipe" : "Save changes"}
            </button>
            <button
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              type="button"
            >
              Save draft
            </button>
          </div>
        </form>

        <aside className="space-y-4 rounded-[1.75rem] bg-slate-900 px-6 py-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            Editor Notes
          </p>
          <h2 className="text-2xl font-semibold">Ready for backend wiring</h2>
          <ul className="space-y-3 text-sm leading-6 text-white/80">
            <li>Create and edit mode share the same validated form contract.</li>
            <li>Ingredients and steps are currently stored as newline-separated text in the form.</li>
            <li>Next step is translating these values into the backend DTO shape during submit.</li>
          </ul>
        </aside>
      </div>
    </AdminLayout>
  );
}
