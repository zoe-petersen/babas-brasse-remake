import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import logoAsset from "@/assets/logo.png";
import { SocialRow } from "./SocialRow";

const EXPLORE = [
  { label: "Content", to: "/content" },
  { label: "Contributors", to: "/contributors" },
  { label: "Photography", to: "/photography" },
  { label: "About", to: "/about" },
  { label: "Contact Us", to: "/contact" },
] as const;

const READ = ["literature", "opinion", "interviews", "theatre", "short-stories"];
const READ_LABELS: Record<string, string> = {
  literature: "Literature",
  opinion: "Opinion",
  interviews: "Interviews",
  theatre: "Theatre",
  "short-stories": "Short Stories",
};

export function SiteFooter() {
  return (
    <footer className="gradient-forest text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr] lg:px-8">
        <div>
          <img
            src={logoAsset}
            alt="Babas and Brasse"
            loading="lazy"
            width={500}
            height={500}
            className="h-40 w-auto brightness-0 invert sm:h-48"
          />
          <p className="mt-6 max-w-xs text-sm opacity-90">
            Culture, criticism, and creative work made with nerve, care, and a point of view.
          </p>
          <Link
            to="/contact"
            className="label-xs mt-8 inline-flex items-center gap-2 rounded-full bg-magenta px-6 py-3 text-ink transition-transform hover:-translate-y-0.5"
          >
            Submit your work <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div>
          <h3 className="label-xs inline-block border-b-2 border-magenta pb-1">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="opacity-90 hover:opacity-100 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-xs inline-block border-b-2 border-magenta pb-1">Read</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {READ.map((slug) => (
              <li key={slug}>
                <Link
                  to="/content/$slug"
                  params={{ slug }}
                  className="opacity-90 hover:opacity-100 hover:underline"
                >
                  {READ_LABELS[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label-xs inline-block border-b-2 border-magenta pb-1">
            Follow the magazine
          </h3>
          <p className="mt-5 max-w-xs text-sm opacity-90">
            Keep up with new stories, contributors, and open calls.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SocialRow variant="circle" />
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs opacity-80 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p>Copyright {new Date().getFullYear()} Babas &amp; Brasse. All rights reserved.</p>
          <p>Independent arts &amp; culture from South Africa.</p>
        </div>
      </div>
    </footer>
  );
}