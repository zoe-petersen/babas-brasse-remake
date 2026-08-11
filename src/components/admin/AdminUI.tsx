import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
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

export const adminInputClass =
  "mt-2 w-full border-2 border-ink bg-background px-3 py-2 text-sm outline-none focus:border-forest";

export function AdminModal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-ink/70 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "mx-auto w-full border-2 border-ink bg-background",
          wide ? "max-w-4xl" : "max-w-2xl",
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b-2 border-ink bg-cream px-5 py-4">
          <h2 className="text-xl">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="border-2 border-ink p-2 hover:bg-background"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}