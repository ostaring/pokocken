import type { PropsWithChildren, ReactNode } from "react";

type PageFrameProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}>;

export function PageFrame({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageFrameProps) {
  return (
    <main className="page-shell px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-800/70">
              {eyebrow}
            </p>
            <h1 className="font-serif text-4xl leading-tight md:text-6xl">{title}</h1>
            <p className="max-w-2xl text-base text-slate-700 md:text-lg">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </header>
        <section className="content-card p-6 md:p-8">{children}</section>
      </div>
    </main>
  );
}
