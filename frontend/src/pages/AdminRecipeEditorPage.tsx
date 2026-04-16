import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const title = mode === "create" ? "Skapa recept" : "Redigera recept";
  const navigate = useNavigate();
  const { id } = useParams();
  const recipeQuery = useRecipeByIdQuery(mode === "edit" ? id : undefined);
  const recipe = recipeQuery.data;
  const createRecipeMutation = useCreateRecipeMutation();
  const updateRecipeMutation = useUpdateRecipeMutation();

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
  }

  if (mode === "edit" && recipeQuery.isLoading) {
    return (
      <AdminLayout
        title="Laddar recept"
        description="Hämtar receptdata till editorn."
      >
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
  const isSaving = isSubmitting || createRecipeMutation.isPending || updateRecipeMutation.isPending;

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
          {mutationError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {mutationError instanceof Error ? mutationError.message : "Kunde inte spara receptet."}
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

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Ingredienser</span>
              <textarea
                className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                placeholder={"1 gul lök\n2 msk olivolja\n300 g pasta"}
                {...register("ingredientsText")}
              />
              {errors.ingredientsText ? (
                <p className="text-sm text-rose-600">{errors.ingredientsText.message}</p>
              ) : null}
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Steg</span>
              <textarea
                className="min-h-48 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-emerald-500"
                placeholder={"Koka pastan.\nRosta tomaterna.\nBlanda ihop allt."}
                {...register("stepsText")}
              />
              {errors.stepsText ? (
                <p className="text-sm text-rose-600">{errors.stepsText.message}</p>
              ) : null}
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <input className="h-4 w-4" type="checkbox" {...register("isPublished")} />
            <span className="text-sm font-semibold text-slate-800">Publicerad</span>
          </label>

          <div className="flex flex-wrap gap-3">
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

        <aside className="space-y-4 rounded-[1.75rem] bg-slate-900 px-6 py-7 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            Editorinfo
          </p>
          <h2 className="text-2xl font-semibold">Redo för backendkoppling</h2>
          <ul className="space-y-3 text-sm leading-6 text-white/80">
            <li>Skapa- och redigeraläge delar samma validerade formkontrakt.</li>
            <li>Ingredienser och steg lagras just nu som radseparerad text i formuläret.</li>
            <li>Nästa steg är att översätta dessa värden till backendens DTO-format vid submit.</li>
          </ul>
        </aside>
      </div>
    </AdminLayout>
  );
}
