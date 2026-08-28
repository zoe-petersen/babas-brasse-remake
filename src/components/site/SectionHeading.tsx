import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-b-2 border-ink pb-4">
      {eyebrow && <p className="label-xs mb-3 text-forest-deep">{eyebrow}</p>}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
