import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { initials, type Article } from "@/lib/magazine";

type LinkedContributor = NonNullable<Article["contributors"]>;

export function ArticleContributor({ contributor }: { contributor: LinkedContributor }) {
  const profileLink = {
    to: "/contributors/$slug" as const,
    params: { slug: contributor.slug },
  };

  return (
    <section
      aria-labelledby={`about-${contributor.id}`}
      className="mt-14 grid overflow-hidden border-2 border-ink md:grid-cols-[13rem_minmax(0,1fr)]"
    >
      <Link
        {...profileLink}
        aria-label={`View all work by ${contributor.name}`}
        className="group block min-h-52 overflow-hidden border-b-2 border-ink bg-cream md:min-h-full md:border-b-0 md:border-r-2"
      >
        {contributor.image_url ? (
          <img
            src={contributor.image_url}
            alt={contributor.name}
            loading="lazy"
            width={640}
            height={640}
            className="h-full max-h-80 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:max-h-none"
          />
        ) : (
          <span className="grid h-full min-h-52 place-items-center bg-magenta font-display text-5xl text-ink">
            {initials(contributor.name)}
          </span>
        )}
      </Link>

      <div className="flex flex-col justify-center bg-forest p-6 text-primary-foreground sm:p-8">
        <p className="label-xs text-magenta">About the author</p>
        <Link {...profileLink} className="group mt-2 inline-flex w-fit items-center gap-3">
          <h2 id={`about-${contributor.id}`} className="text-2xl sm:text-3xl">
            {contributor.name}
          </h2>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Link>
        {contributor.role_title && (
          <p className="label-xs mt-2 opacity-75">{contributor.role_title}</p>
        )}
        {contributor.bio && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed opacity-90">{contributor.bio}</p>
        )}
        <Link
          {...profileLink}
          className="label-xs mt-6 w-fit border-b-2 border-magenta pb-1 transition-colors hover:text-magenta"
        >
          View all work by {contributor.name}
        </Link>
      </div>
    </section>
  );
}
