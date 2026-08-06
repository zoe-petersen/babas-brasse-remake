import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "magenta" | "forest" | "outline" | "underline";

const VARIANTS: Record<Variant, string> = {
  magenta: "bg-magenta text-ink border-2 border-ink px-5 py-3 hover:-translate-y-0.5",
  forest: "bg-forest text-primary-foreground border-2 border-ink px-5 py-3 hover:-translate-y-0.5",
  outline: "border-2 border-ink px-5 py-3 hover:bg-cream",
  underline: "border-b-2 border-ink pb-1",
};

type ActionLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  variant?: Variant;
  label: string;
  showArrow?: boolean;
};

export function ActionLink({
  variant = "magenta",
  className,
  label,
  showArrow = true,
  ...props
}: ActionLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "label-xs inline-flex items-center gap-2 transition-transform",
        VARIANTS[variant],
        className,
      )}
    >
      {label}
      {showArrow && <ArrowRight className="h-3.5 w-3.5" />}
    </Link>
  );
}
