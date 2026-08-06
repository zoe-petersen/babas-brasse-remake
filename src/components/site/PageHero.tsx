import type { ReactNode } from "react";

export function PageHero({
  title,
  intro,
  children,
}: {
  title: ReactNode;
  intro?: string | undefined;
  children?: ReactNode;
}) {
  return (
    <section className="relative border-b-2 border-ink bg-forest">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-cream px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <h1 className="max-w-2xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{title}</h1>
          {intro && <p className="mt-6 max-w-xl text-base text-muted-foreground">{intro}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        <div className="relative hidden overflow-hidden bg-forest lg:block">
          <div className="absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border-2 border-ink bg-magenta" />
        </div>
      </div>
    </section>
  );
}