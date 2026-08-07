import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Music2, Twitter } from "lucide-react";
import {
  articlesQuery,
  contributorQuery,
  formatDate,
  initials,
} from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/contributors/$slug")({
  loader: async ({ context, params }) => {
    const contributor = await context.queryClient.ensureQueryData(contributorQuery(params.slug));
    if (!contributor) throw notFound();
    await context.queryClient.ensureQueryData(articlesQuery());
    return { name: contributor.name, role: contributor.role_title, bio: contributor.bio };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Profile unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} — Babas & Brasse`;
    const description = loaderData.bio ?? `${loaderData.name}, ${loaderData.role ?? "contributor"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Contributor not found</h1>
      <div className="mt-8">
        <ActionLink to="/contributors" label="All contributors" />
      </div>
    </div>
  ),
  component: ContributorPage,
});

function ContributorPage() {
  const { slug } = Route.useParams();
  const { data: person } = useSuspenseQuery(contributorQuery(slug));
  const { data: articles } = useSuspenseQuery(articlesQuery());

  if (!person) return null;
  const theirs = articles.filter((article) => article.contributors?.slug === person.slug);

  const socials = [
    { href: person.facebook_url, Icon: Facebook, label: "Facebook" },
    { href: person.instagram_url, Icon: Instagram, label: "Instagram" },
    {
      href: (person as { twitter_url?: string | null }).twitter_url,
      Icon: Twitter,
      label: "Twitter",
    },
    { href: person.tiktok_url, Icon: Music2, label: "TikTok" },
  ].filter((item) => item.href);

  return (
    <div>
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-5xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1fr] lg:px-8">
          <div className="border-2 border-ink bg-cream">
            {person.image_url ? (
              <img
                src={person.image_url}
                alt={person.name}
                width={900}
                height={1100}
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-[4/5] place-items-center font-display text-6xl text-forest-deep">
                {initials(person.name)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-t-0 border-ink bg-forest p-8 text-center text-primary-foreground lg:border-l-0 lg:border-t-2">
            <p className="label-xs text-magenta">{person.role_title}</p>
            <h1 className="mt-3 text-3xl sm:text-4xl">{person.name}</h1>
            <p className="mt-5 max-w-md text-sm opacity-90">{person.bio}</p>

            <div className="mt-8 flex w-full max-w-sm items-center gap-3">
              <span className="h-px flex-1 bg-primary-foreground/25" />
              <span className="h-2 w-2 rotate-45 bg-magenta" />
              <span className="h-px flex-1 bg-primary-foreground/25" />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <ActionLink
                to="/contributors"
                variant="outline"
                label="All contributors"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-forest-deep"
              />
              {socials.length > 0 && (
                <>
                  <span className="hidden h-8 w-px bg-primary-foreground/30 sm:block" />
                  <div className="flex items-center gap-2">
                    {socials.map(({ href, Icon, label }) => (
                      <a
                        key={label}
                        href={href!}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${person.name} on ${label}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/50 transition-colors hover:bg-magenta hover:text-ink"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b-2 border-ink pb-4">
          <h2 className="text-3xl sm:text-4xl">Articles &amp; media</h2>
          <span className="label-xs opacity-60">{theirs.length} published</span>
        </div>
        {theirs.length === 0 ? (
          <div className="mt-10">
            <EmptyState message="No published work from this contributor yet." />
          </div>
        ) : (
          <div className="mt-10 divide-y-2 divide-ink border-2 border-ink">
            {theirs.map((article) => (
              <Link
                key={article.id}
                to="/article/$slug"
                params={{ slug: article.slug }}
                className="grid gap-4 p-6 transition-colors hover:bg-cream sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="label-xs text-forest-deep">{article.categories?.name}</p>
                  <h3 className="mt-2 text-2xl leading-tight">{article.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{article.excerpt}</p>
                </div>
                <span className="label-xs shrink-0 opacity-60">
                  {formatDate(article.published_at)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
