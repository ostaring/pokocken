import type { PropsWithChildren, ReactNode } from "react";

type PageFrameProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  align?: "left" | "center";
  contentVariant?: "card" | "plain";
}>;

export function PageFrame({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  contentVariant = "card",
  children,
}: PageFrameProps) {
  const isCentered = align === "center";

  return (
    <main className="page-shell px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <header
          className={`flex min-w-0 flex-col gap-5 ${
            isCentered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
          }`}
        >
          <div className={`max-w-3xl space-y-3 ${isCentered ? "mx-auto" : ""}`}>
            {eyebrow ? (
              <p className="break-anywhere text-xs font-semibold uppercase tracking-[0.22em] text-lime-950/70 sm:text-sm sm:tracking-[0.35em]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="display-type break-anywhere text-3xl leading-tight sm:text-4xl md:text-6xl">
              {title}
            </h1>
            <p className={`max-w-2xl text-base text-slate-700 md:text-lg ${isCentered ? "mx-auto" : ""}`}>
              {description}
            </p>
          </div>
          {actions ? (
            <div className="flex w-full flex-wrap gap-3 sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
              {actions}
            </div>
          ) : null}
        </header>
        <section className={contentVariant === "card" ? "content-card p-4 sm:p-6 md:p-8" : ""}>
          {children}
        </section>
      </div>
    </main>
  );
}
