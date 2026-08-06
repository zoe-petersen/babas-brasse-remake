import { Facebook, Instagram, Music2, PinIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Facebook", Icon: Facebook },
  { label: "Instagram", Icon: Instagram },
  { label: "TikTok", Icon: Music2 },
  { label: "Pinterest", Icon: PinIcon },
  { label: "X", Icon: X },
];

export function SocialRow({ variant = "plain" }: { variant?: "plain" | "circle" }) {
  return (
    <>
      {LINKS.map(({ label, Icon }) => (
        <a
          key={label}
          href="#"
          aria-label={label}
          className={cn(
            "inline-flex items-center justify-center transition-opacity hover:opacity-60",
            variant === "circle"
              ? "h-10 w-10 rounded-full border border-current"
              : "h-8 w-8",
          )}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </>
  );
}