import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b-2 border-ink pb-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("border-2 border-ink bg-background p-4 sm:p-5", className)}>{children}</div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <AdminCard>
      <p className="label-xs text-forest-deep">{label}</p>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </AdminCard>
  );
}

export function Pill({ tone, children }: { tone: "green" | "amber" | "red" | "grey"; children: ReactNode }) {
  const tones = {
    green: "bg-forest text-primary-foreground border-ink",
    amber: "bg-magenta text-ink border-ink",
    red: "bg-destructive/15 text-destructive border-destructive",
    grey: "bg-cream text-muted-foreground border-border",
  } as const;
  return (
    <span className={cn("label-xs inline-flex border px-2 py-1", tones[tone])}>{children}</span>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return (
    <div className="border-2 border-dashed border-border bg-background px-6 py-14 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}