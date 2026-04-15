import { PageFrame } from "../components/PageFrame";

export function AdminDashboardPage() {
  return (
    <PageFrame
      eyebrow="Admin"
      title="Dashboard"
      description="This page will list recipes, drafts, and quick actions for publishing and editing."
    >
      <p className="text-slate-700">
        The admin shell is ready for protected-route handling and recipe management tables.
      </p>
    </PageFrame>
  );
}
