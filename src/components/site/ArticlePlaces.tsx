import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import type { Place } from "@/lib/magazine";

export function ArticlePlaces({ places }: { places: Place[] }) {
  if (places.length === 0) return null;

  return (
    <nav
      aria-label="Places covered in this piece"
      className="mx-auto mt-8 max-w-2xl border-l-4 border-magenta bg-cream px-5 py-4"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="label-xs inline-flex items-center gap-2 text-forest-deep">
          <MapPin className="h-4 w-4" aria-hidden />
          Places in this story
        </span>
        <span className="hidden h-5 w-px bg-ink/25 sm:block" aria-hidden />
        <span className="flex flex-wrap gap-2">
          {places.map((place) => (
            <Link
              key={place.id}
              to="/places/$slug"
              params={{ slug: place.slug }}
              className="label-xs border-b-2 border-ink pb-0.5 hover:border-magenta hover:text-forest-deep"
            >
              {place.name}
            </Link>
          ))}
        </span>
      </div>
    </nav>
  );
}
