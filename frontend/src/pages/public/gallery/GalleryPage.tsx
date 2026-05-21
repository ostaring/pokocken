import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PageFrame } from "@/components/layout/public/PageFrame";
import { useGalleryImagesQuery } from "@/features/gallery/hooks/gallery-hooks";
import type { GalleryImage } from "@/types/gallery/gallery";

export function GalleryPage() {
  const galleryQuery = useGalleryImagesQuery();
  const images = galleryQuery.data ?? [];
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  const lightbox = selectedImage
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-3 py-5 sm:px-4 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Förstorad bild: ${selectedImage.altText}`}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-h-full w-full max-w-5xl overflow-hidden rounded-[1.25rem] bg-white shadow-2xl sm:rounded-[1.75rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="max-h-[75vh] w-full object-contain bg-slate-950"
              src={selectedImage.imageUrl}
              alt={selectedImage.altText}
            />
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
              <p className="text-sm text-slate-700">{selectedImage.altText}</p>
              <button
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
                type="button"
                onClick={() => setSelectedImage(null)}
              >
                Stäng
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <PageFrame
        title="Galleriet"
        description="Titta på bilder av våra guldkäftars senaste kulinariska äventyr och låt dig inspireras av Pockockens kreationer."
        contentVariant="plain"
      >
        <div className="space-y-6">
          {galleryQuery.isLoading ? (
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/70 p-8 text-sm text-slate-600">
              Laddar galleriet...
            </div>
          ) : null}

          {galleryQuery.isError ? (
            <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700">
              Kunde inte läsa in galleribilderna just nu.
            </div>
          ) : null}

          {!galleryQuery.isLoading && !galleryQuery.isError && images.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center">
              <h2 className="text-xl font-semibold text-slate-900">Galleriet är tomt just nu</h2>
              <p className="mt-2 text-sm text-slate-600">
                Fler bilder kommer när nya rätter hamnar på bordet.
              </p>
            </div>
          ) : null}

          {!galleryQuery.isLoading && !galleryQuery.isError && images.length > 0 ? (
            <div className="grid grid-cols-2 items-start gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {images.map((image) => (
                <button
                  key={image.id}
                  className="group overflow-hidden rounded-2xl border border-white/70 bg-white/90 text-left shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20"
                  type="button"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      src={image.imageUrl}
                      alt={image.altText}
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </PageFrame>
      {lightbox}
    </>
  );
}
