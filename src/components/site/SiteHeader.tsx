import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Menu, X } from "lucide-react";
import logoAsset from "@/assets/logo.png";
import { categoriesQuery } from "@/lib/magazine";
import { SocialRow } from "./SocialRow";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Content", to: "/content" },
  { label: "Contributors", to: "/contributors" },
  { label: "Photography", to: "/photography" },
  { label: "Contact Us", to: "/contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { data } = useQuery(categoriesQuery());
  const categories = hydrated ? (data ?? []) : [];

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-4 px-4 py-1.5 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0">
          <img
            src={logoAsset}
            alt="Babas and Brasse"
            className="h-16 w-auto"
            width={500}
            height={500}
          />
        </Link>

        <div className="flex items-center justify-end gap-4">
          <nav className="hidden items-center gap-5 lg:flex">
            {NAV.map((item) => (
              <div key={item.to} className="group relative">
                <Link
                  to={item.to}
                  className="label-xs rounded-full px-3 py-2 transition-colors hover:text-forest-deep"
                  activeProps={{ className: "bg-cream text-forest-deep" }}
                  activeOptions={{ exact: item.to === "/" }}
                >
                  {item.label}
                </Link>
                {item.label === "Content" && categories.length > 0 && (
                  <div className="invisible absolute left-0 top-full w-56 border-2 border-ink bg-background opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to="/content/$slug"
                        params={{ slug: category.slug }}
                        className="label-xs block border-b border-border px-4 py-3 last:border-0 hover:bg-cream"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-1 border-l border-border pl-4 lg:flex">
            <SocialRow />
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="border-2 border-ink p-2 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("border-t-2 border-ink lg:hidden", open ? "block" : "hidden")}>
        <nav className="flex flex-col">
          {NAV.map((item) =>
            item.label === "Content" && categories.length > 0 ? (
              <div key={item.to} className="border-b border-border">
                <div className="grid grid-cols-[minmax(0,1fr)_auto]">
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="label-xs flex items-center px-5 py-4"
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={contentOpen}
                    aria-label="Toggle content sections"
                    onClick={() => setContentOpen((value) => !value)}
                    className="flex items-center justify-center border-l border-border px-5 py-4"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", contentOpen && "rotate-180")}
                    />
                  </button>
                </div>
                {contentOpen && (
                  <div className="flex flex-col bg-cream">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to="/content/$slug"
                        params={{ slug: category.slug }}
                        onClick={() => {
                          setOpen(false);
                          setContentOpen(false);
                        }}
                        className="label-xs border-t border-border px-8 py-3"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="label-xs border-b border-border px-5 py-4"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
