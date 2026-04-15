import { useParams } from "react-router-dom";
import { PageFrame } from "../components/PageFrame";

export function RecipeDetailsPage() {
  const { slug } = useParams();

  return (
    <PageFrame
      eyebrow="Public"
      title="Recipe details"
      description="This page will render one published recipe by slug."
    >
      <p className="text-slate-700">
        Current route param: <span className="font-semibold">{slug ?? "missing slug"}</span>
      </p>
    </PageFrame>
  );
}
