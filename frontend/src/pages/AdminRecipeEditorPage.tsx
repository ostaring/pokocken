import { PageFrame } from "../components/PageFrame";

type AdminRecipeEditorPageProps = {
  mode: "create" | "edit";
};

export function AdminRecipeEditorPage({ mode }: AdminRecipeEditorPageProps) {
  const title = mode === "create" ? "Create recipe" : "Edit recipe";

  return (
    <PageFrame
      eyebrow="Admin"
      title={title}
      description="This shared route will host the recipe editor form for both create and edit flows."
    >
      <p className="text-slate-700">
        We can now add a typed recipe form component and connect it to create and update mutations.
      </p>
    </PageFrame>
  );
}
