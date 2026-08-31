import { Facebook, Instagram, Linkedin, Music2, Newspaper, PinIcon, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/babasandbrasse?igsi=cW9hbzYyMmZndXRt",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61593628658683",
    Icon: Facebook,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/babas-and-brasse-magazine-400112432/",
    Icon: Linkedin,
  },
  {
    label: "Substack",
    href: "https://substack.com/@babasandbrasse?utm_source=user-menu",
    Icon: Newspaper,
  },
];

const ADDITIONAL_NAV_ICONS = [
  { label: "TikTok", Icon: Music2 },
  { label: "YouTube", Icon: Youtube },
  { label: "Pinterest", Icon: PinIcon },
];

export function SocialRow({
  variant = "plain",
  includeAdditionalNavIcons = false,
}: {
  variant?: "plain" | "circle";
  includeAdditionalNavIcons?: boolean;
}) {
  const iconClassName = cn(
    "inline-flex items-center justify-center transition-opacity hover:opacity-60",
    variant === "circle" ? "h-10 w-10 rounded-full border border-current" : "h-8 w-8",
  );

  return (
    <>
      {LINKS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={iconClassName}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      {includeAdditionalNavIcons &&
        ADDITIONAL_NAV_ICONS.map(({ label, Icon }) => (
          <span
            key={label}
            role="img"
            aria-label={label}
            title={`${label} — profile link coming soon`}
            className={iconClassName}
          >
            <Icon className="h-4 w-4" />
          </span>
        ))}
    </>
  );
}
