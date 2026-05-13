import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  return (
    <PageFrame
      eyebrow="Pokocken"
      title="Matgalleri"
      description="Små ögonblick från köket, samlade på en plats. Klicka på en bild för att se den större."
      actions={
        <Link
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white/70"
          to="/"
        >
          Tillbaka till startsidan
        </Link>
      }
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <button
                key={image.id}
                className="group overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                <div className="px-4 py-3">
                  <p className="text-sm text-slate-700">{image.altText}</p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Förstorad bild: ${selectedImage.altText}`}
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-h-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="max-h-[75vh] w-full object-contain bg-slate-950"
              src={selectedImage.imageUrl}
              alt={selectedImage.altText}
            />
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <p className="text-sm text-slate-700">{selectedImage.altText}</p>
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                type="button"
                onClick={() => setSelectedImage(null)}
              >
                Stäng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageFrame>
  );
}
