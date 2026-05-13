import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin/AdminLayout";
import {
  useAdminGalleryImagesQuery,
  useCreateGalleryImageMutation,
  useDeleteGalleryImageMutation,
} from "@/features/gallery/hooks/gallery-hooks";
import { AdminSessionExpiredError } from "@/lib/api/recipes/http/recipes-adapter";

export function AdminGalleryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const galleryQuery = useAdminGalleryImagesQuery();
  const createImageMutation = useCreateGalleryImageMutation();
  const deleteImageMutation = useDeleteGalleryImageMutation();
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectToLogin = () => {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    navigate(`/admin/login?redirect=${redirect}`, {
      replace: true,
      state: { feedbackMessage: "Logga in igen för att fortsätta administrera galleriet." },
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      await createImageMutation.mutateAsync({ imageUrl, altText });
      setImageUrl("");
      setAltText("");
      setFeedbackMessage("Bilden lades till i galleriet.");
    } catch (error) {
      if (error instanceof AdminSessionExpiredError) {
        redirectToLogin();
        return;
      }

      setErrorMessage(error instanceof Error ? error.message : "Kunde inte lägga till bilden.");
    }
  }

  async function handleDelete(id: string) {
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      await deleteImageMutation.mutateAsync(id);
      setFeedbackMessage("Bilden togs bort från galleriet.");
    } catch (error) {
      if (error instanceof AdminSessionExpiredError) {
        redirectToLogin();
        return;
      }

      setErrorMessage(error instanceof Error ? error.message : "Kunde inte ta bort bilden.");
    }
  }

  return (
    <AdminLayout
      title="Galleri"
      description="Lägg till matbilder som ska visas publikt i ett enkelt rutnät. Klick på bild förstorar den för besökaren."
      actions={
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
          to="/gallery"
        >
          Visa publika galleriet
        </Link>
      }
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <form
          className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white/80 p-6"
          onSubmit={handleSubmit}
        >
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Lägg till bild</h2>
            <p className="mt-2 text-sm text-slate-600">
              Klistra in en bild-URL och skriv en kort beskrivning som fungerar som alt-text.
            </p>
          </div>

          {feedbackMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {feedbackMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Bild-URL</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/matbild.jpg"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Beskrivning</span>
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Exempel: Nybakad citronkaka på serveringsfat."
              required
            />
          </label>

          <button
            className="rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            type="submit"
            disabled={createImageMutation.isPending}
          >
            {createImageMutation.isPending ? "Sparar..." : "Lägg till bild"}
          </button>
        </form>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Nuvarande bilder</h2>
            <p className="mt-2 text-sm text-slate-600">
              Bilderna visas publikt i fallande datumordning, med de senaste först.
            </p>
          </div>

          {galleryQuery.isLoading ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-8 text-sm text-slate-600">
              Laddar galleriet för administration...
            </div>
          ) : null}

          {galleryQuery.isError ? (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
              Kunde inte läsa in galleriet för administrationen.
            </div>
          ) : null}

          {!galleryQuery.isLoading && !galleryQuery.isError && (galleryQuery.data?.length ?? 0) === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-8 text-sm text-slate-600">
              Inga bilder finns i galleriet ännu.
            </div>
          ) : null}

          {!galleryQuery.isLoading && !galleryQuery.isError && (galleryQuery.data?.length ?? 0) > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryQuery.data!.map((image) => (
                <article
                  key={image.id}
                  className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/80 shadow-sm"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img className="h-full w-full object-cover" src={image.imageUrl} alt={image.altText} />
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="text-sm leading-6 text-slate-700">{image.altText}</p>
                    <button
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                      type="button"
                      onClick={() => void handleDelete(image.id)}
                      disabled={deleteImageMutation.isPending}
                    >
                      {deleteImageMutation.isPending ? "Tar bort..." : "Ta bort"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </AdminLayout>
  );
}
