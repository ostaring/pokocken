import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin/AdminLayout";
import { createRecipeSlug, getRecipeCategoryLabel } from "@/features/recipes/utils/recipe-utils";
import {
  useCreateRecipeMutation,
  useRecipeByIdQuery,
  useUpdateRecipeMutation,
} from "@/features/recipes/hooks/recipe-hooks";
import {
  recipeFormSchema,
  type RecipeFormValues,
} from "@/features/recipes/schemas/recipe-form-schema";
import { AdminSessionExpiredError, RecipeValidationError } from "@/lib/api/recipes/http/recipes-adapter";

type AdminRecipeEditorPageProps = {
  mode: "create" | "edit";
};

const emptyRecipeListItem = { value: "" };

export function AdminRecipeEditorPage({ mode }: AdminRecipeEditorPageProps) {
  const title = mode === "create" ? "Skapa recept" : "Redigera recept";
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const recipeQuery = useRecipeByIdQuery(mode === "edit" ? id : undefined);
  const recipe = recipeQuery.data;
  const createRecipeMutation = useCreateRecipeMutation();
  const updateRecipeMutation = useUpdateRecipeMutation();
  const [submissionErrorMessage, setSubmissionErrorMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
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
      ingredients: [{ ...emptyRecipeListItem }],
      steps: [{ ...emptyRecipeListItem }],
      isPublished: false,
    },
  });

  const ingredientsFieldArray = useFieldArray({
    control,
    name: "ingredients",
  });

  const stepsFieldArray = useFieldArray({
    control,
    name: "steps",
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
      ingredients:
        recipe.ingredients.length > 0
          ? recipe.ingredients.map((ingredient) => ({ value: ingredient }))
          : [{ ...emptyRecipeListItem }],
      steps:
        recipe.steps.length > 0
          ? recipe.steps.map((step) => ({ value: step }))
          : [{ ...emptyRecipeListItem }],
      isPublished: recipe.isPublished,
    });
  }, [recipe, reset]);

  const watchedTitle = watch("title");
  const watchedCategory = watch("category");
  const watchedPrepTimeMinutes = watch("prepTimeMinutes");
  const watchedServings = watch("servings");
  const watchedIsPublished = watch("isPublished");
  const slugPreview = createRecipeSlug(watchedTitle ?? "");
  const redirectToLogin = () => {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    navigate(`/admin/login?redirect=${redirect}`, {
      replace: true,
      state: { feedbackMessage: "Logga in igen för att fortsätta administrera recepten." },
    });
  };

  useEffect(() => {
    if (recipeQuery.error instanceof AdminSessionExpiredError) {
      redirectToLogin();
    }
  }, [recipeQuery.error]);

  async function onSubmit(values: RecipeFormValues) {
    clearErrors([
      "title",
      "description",
      "category",
      "imageUrl",
      "prepTimeMinutes",
      "servings",
      "ingredients",
      "steps",
    ]);
    setSubmissionErrorMessage(null);

    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      prepTimeMinutes: Number(values.prepTimeMinutes),
      servings: Number(values.servings),
      imageUrl: values.imageUrl.trim(),
      ingredients: values.ingredients.map((entry) => entry.value.trim()),
      steps: values.steps.map((entry) => entry.value.trim()),
      isPublished: values.isPublished,
    };

    try {
      if (mode === "create") {
        const createdRecipe = await createRecipeMutation.mutateAsync(payload);
        navigate(`/admin/recipes/${createdRecipe.id}/edit`, {
          replace: true,
          state: { feedbackMessage: "Receptet skapades." },
        });
        return;
      }

      if (!id) {
        return;
      }

      await updateRecipeMutation.mutateAsync({ id, input: payload });
      navigate("/admin", {
        replace: true,
        state: { feedbackMessage: "Receptet uppdaterades." },
      });
    } catch (error) {
      if (error instanceof AdminSessionExpiredError) {
        redirectToLogin();
        return;
      }

      if (error instanceof RecipeValidationError) {
        applyValidationErrors(error, setError);
        return;
      }

      setSubmissionErrorMessage(
        error instanceof Error ? error.message : "Kunde inte spara receptet.",
      );
    }
  }

  if (mode === "edit" && recipeQuery.isLoading) {
    return (
      <AdminLayout title="Laddar recept" description="Hämtar receptdata till editorn.">
        <p className="text-slate-700">Laddar recepteditorn...</p>
      </AdminLayout>
    );
  }

  if (mode === "edit" && recipeQuery.isError) {
    return (
      <AdminLayout
        title="Editorn är inte tillgänglig"
        description="Något gick fel när receptet skulle laddas."
      >
        <p className="text-slate-700">Försök igen senare.</p>
      </AdminLayout>
    );
  }

  if (mode === "edit" && !recipe) {
    return (
      <AdminLayout
        title="Receptet hittades inte"
        description="Vi kunde inte hitta något recept som matchar den här adminrouten."
      >
        <p className="text-slate-700">
          När backend är inkopplad fullt ut ska detta motsvara en autentiserad adminhämtning och ett
          tydligt not-found-läge.
        </p>
      </AdminLayout>
    );
  }

  const mutationError = createRecipeMutation.error ?? updateRecipeMutation.error;
  const visibleErrorMessage =
    submissionErrorMessage ??
    (mutationError instanceof Error
      ? mutationError.message
      : mutationError
        ? "Kunde inte spara receptet."
        : null);
  const isSaving = isSubmitting || createRecipeMutation.isPending || updateRecipeMutation.isPending;
  const ingredientErrors = Array.isArray(errors.ingredients) ? errors.ingredients : [];
  const stepErrors = Array.isArray(errors.steps) ? errors.steps : [];

  return (
    <AdminLayout
      title={title}
      description="En gemensam admineditor för både skapa- och redigeraläge. Formkontraktet är nu tillräckligt stabilt för att kopplas till backendens create- och update-endpoints."
      actions={
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
          to="/admin"
        >
          Tillbaka till översikten
        </Link>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_320px]">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          {visibleErrorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {visibleErrorMessage}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Titel</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                type="text"
                placeholder="Rostad tomatpasta"
                {...register("title")}
              />
              {errors.title ? <p className="text-sm text-rose-600">{errors.title.message}</p> : null}
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Beskrivning</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                placeholder="En snabb pasta med söta rostade tomater..."
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-rose-600">{errors.description.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Kategori</span>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                {...register("category")}
              >
                <option value="Breakfast">Frukost</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Middag</option>
                <option value="Dessert">Dessert</option>
                <option value="Snack">Mellanmål</option>
              </select>
              {errors.category ? (
                <p className="text-sm text-rose-600">{errors.category.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Bild-URL</span>
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
              <span className="text-sm font-semibold text-slate-700">Tillagningstid (minuter)</span>
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
              <span className="text-sm font-semibold text-slate-700">Portioner</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                type="number"
                {...register("servings")}
              />
              {errors.servings ? (
                <p className="text-sm text-rose-600">{errors.servings.message}</p>
              ) : null}
            </label>

            <section className="space-y-3 md:col-span-2" aria-labelledby="ingredients-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 id="ingredients-heading" className="text-sm font-semibold text-slate-700">
                  Ingredienser
                </h2>
                <button
                  className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
                  type="button"
                  onClick={() => ingredientsFieldArray.append({ ...emptyRecipeListItem })}
                >
                  Lägg till ingrediens
                </button>
              </div>
              <div className="space-y-3">
                {ingredientsFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                      type="text"
                      aria-label={`Ingrediens ${index + 1}`}
                      placeholder={`Ingrediens ${index + 1}`}
                      {...register(`ingredients.${index}.value`)}
                    />
                    <button
                      className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
                      type="button"
                      onClick={() => ingredientsFieldArray.remove(index)}
                      disabled={ingredientsFieldArray.fields.length === 1}
                    >
                      Ta bort
                    </button>
                  </div>
                ))}
              </div>
              {errors.ingredients?.message ? (
                <p className="text-sm text-rose-600">{errors.ingredients.message}</p>
              ) : null}
              {ingredientErrors.map((itemError, index) =>
                itemError?.value ? (
                  <p key={index} className="text-sm text-rose-600">
                    Ingrediens {index + 1}: {itemError.value.message}
                  </p>
                ) : null,
              )}
            </section>

            <section className="space-y-3 md:col-span-2" aria-labelledby="steps-heading">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 id="steps-heading" className="text-sm font-semibold text-slate-700">
                  Steg
                </h2>
                <button
                  className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
                  type="button"
                  onClick={() => stepsFieldArray.append({ ...emptyRecipeListItem })}
                >
                  Lägg till steg
                </button>
              </div>
              <div className="space-y-3">
                {stepsFieldArray.fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
                      type="text"
                      aria-label={`Steg ${index + 1}`}
                      placeholder={`Steg ${index + 1}`}
                      {...register(`steps.${index}.value`)}
                    />
                    <button
                      className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:shrink-0"
                      type="button"
                      onClick={() => stepsFieldArray.remove(index)}
                      disabled={stepsFieldArray.fields.length === 1}
                    >
                      Ta bort
                    </button>
                  </div>
                ))}
              </div>
              {errors.steps?.message ? (
                <p className="text-sm text-rose-600">{errors.steps.message}</p>
              ) : null}
              {stepErrors.map((itemError, index) =>
                itemError?.value ? (
                  <p key={index} className="text-sm text-rose-600">
                    Steg {index + 1}: {itemError.value.message}
                  </p>
                ) : null,
              )}
            </section>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <input className="h-4 w-4" type="checkbox" {...register("isPublished")} />
            <span className="text-sm font-semibold text-slate-800">Publicerad</span>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!isValid || isSaving}
            >
              {isSaving ? "Sparar..." : mode === "create" ? "Skapa recept" : "Spara ändringar"}
            </button>
            <button
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              type="button"
            >
              Spara som utkast
            </button>
          </div>
        </form>

        <aside className="space-y-4 rounded-[1.25rem] bg-slate-900 px-5 py-6 text-white sm:rounded-[1.75rem] sm:px-6 sm:py-7">
          <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-sm sm:tracking-[0.3em]">
            Editorinfo
          </p>
          <h2 className="text-2xl font-semibold">Redo för backendkoppling</h2>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
              Förhandsvisning
            </p>
            <dl className="mt-4 grid gap-3 text-sm text-white/85">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <dt className="text-white/55">Slug</dt>
                <dd className="break-anywhere font-mono text-white sm:text-right">
                  {slugPreview || "skapas-från-titeln"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-white/55">Status</dt>
                <dd>{watchedIsPublished ? "Publicerad" : "Utkast"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-white/55">Kategori</dt>
                <dd>{getRecipeCategoryLabel(watchedCategory ?? "Dinner")}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-white/55">Tillagningstid</dt>
                <dd>{Number(watchedPrepTimeMinutes ?? 0)} min</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-white/55">Portioner</dt>
                <dd>{Number(watchedServings ?? 0)}</dd>
              </div>
            </dl>
          </div>
          <ul className="space-y-3 text-sm leading-6 text-white/80">
            <li>Skapa- och redigeraläge delar samma validerade formkontrakt.</li>
            <li>Ingredienser och steg redigeras nu som strukturerade listor i formuläret.</li>
            <li>Submit mappas fortfarande direkt till backendens DTO-format.</li>
          </ul>
        </aside>
      </div>
    </AdminLayout>
  );
}

function applyValidationErrors(
  error: RecipeValidationError,
  setError: ReturnType<typeof useForm<RecipeFormValues>>["setError"],
) {
  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const message = messages[0];
    if (!message) {
      continue;
    }

    switch (field) {
      case "title":
        setError("title", { type: "server", message });
        break;
      case "slug":
        setError("title", { type: "server", message });
        break;
      case "description":
        setError("description", { type: "server", message });
        break;
      case "category":
        setError("category", { type: "server", message });
        break;
      case "imageUrl":
        setError("imageUrl", { type: "server", message });
        break;
      case "prepTimeMinutes":
        setError("prepTimeMinutes", { type: "server", message });
        break;
      case "servings":
        setError("servings", { type: "server", message });
        break;
      case "ingredients":
        setError("ingredients", { type: "server", message });
        break;
      case "steps":
        setError("steps", { type: "server", message });
        break;
    }
  }
}
