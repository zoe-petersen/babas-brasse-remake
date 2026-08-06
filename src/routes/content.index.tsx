import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articlesQuery, categoriesQuery, contributorsQuery, formatDate } from "@/lib/magazine";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ActionLink } from "@/components/site/ActionLink";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/content/")({
  head: () => ({
    meta: [
      { title: "Content — Babas & Brasse" },
      {
        name: "description",
        content:
          "Browse essays, reviews, interviews and fiction across every section of the Babas & Brasse magazine.",
      },
      { property: "og:title", content: "Content — Babas & Brasse" },
      {
        property: "og:description",
        content: "Bold essays, sharp reviews, intimate fiction and the voices shaping SA culture.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery()),
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(contributorsQuery(false)),
    ]);
  },
  component: ContentPage,
});

function ContentPage() {
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: contributors } = useSuspenseQuery(contributorsQuery(false));

  const usedSections = categories.filter((category) =>
    articles.some((article) => article.categories?.slug === category.slug),
  );
  const startHere = articles.slice(0, 3);

  const stats = [
    { value: articles.length, label: "Published pieces" },
    { value: usedSections.length, label: "Magazine sections" },
    { value: contributors.length, label: "Contributing voices" },
  ];

  return (
    <div>
      <PageHero
        title={
          <>
            Find your
            <br />
            next read.
          </>
        }
        intro="Come for the story that catches your eye. Stay for bold essays, sharp reviews, intimate fiction, and the voices shaping South African culture."
      >
        <div className="flex flex-wrap gap-3">
          <ActionLink to="/content" variant="forest" label="Browse the archive" />
          <ActionLink to="/contributors" variant="outline" label="Meet the voices" showArrow={false} />
        </div>
      </PageHero>

      <div className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border-b border-ink/20 px-6 py-8 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-4xl text-forest">
                  {String(stat.value).padStart(2, "0")}
                </span>
                <span className="label-xs max-w-[8rem] text-right">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Start here"
          description="Three reads selected from across the magazine for your next quiet hour."
          action={<ActionLink to="/content" variant="underline" label="All stories" />}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {startHere.map((article, index) => (
            <Link
              key={article.id}
              to="/article/$slug"
              params={{ slug: article.slug }}
              className="group flex flex-col border-2 border-ink transition-transform hover:-translate-y-1"
            >
              <div className="relative">
                {article.cover_image_url && (
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="aspect-[16/10] w-full border-b-2 border-ink object-cover"
                  />
                )}
                <span
                  className={cn(
                    "label-xs absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full",
                    index === 1 ? "bg-forest text-primary-foreground" : "bg-magenta text-ink",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="label-xs text-forest">{article.categories?.name}</p>
                <h3 className="mt-3 text-2xl leading-tight">{article.title}</h3>
                <p className="label-xs mt-3 opacity-60">
                  {article.contributors?.name} &middot; {formatDate(article.published_at)}
                </p>
                <span className="label-xs mt-auto pt-6 underline-offset-4 group-hover:underline">
                  Read story →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-ink bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            title="Magazine sections"
            action={<ActionLink to="/content" variant="underline" label="View full archive" showArrow={false} />}
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const items = articles.filter((a) => a.categories?.slug === category.slug);
              const dark = index === 1;
              return (
                <div
                  key={category.id}
                  className={cn(
                    "hard-shadow flex flex-col border-2 border-ink p-6",
                    dark ? "bg-ink text-cream" : "bg-cream",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="label-xs opacity-70">
                      {items.length} {items.length === 1 ? "piece" : "pieces"}
                    </span>
                    <span className="font-display text-2xl text-magenta">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl">{category.name}</h3>
                  <p className={cn("mt-2 text-sm", dark ? "opacity-80" : "text-muted-foreground")}>
                    {category.description}
                  </p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {items.slice(0, 3).map((item) => (
                      <li key={item.id} className="border-t border-current/20 pt-2 font-semibold">
                        <Link to="/article/$slug" params={{ slug: item.slug }} className="hover:underline">
                          {item.title}
                        </Link>
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="pt-2 text-sm opacity-70">No published pieces in this section yet.</li>
                    )}
                  </ul>
                  <div className="mt-6 pt-2">
                    <ActionLink
                      to="/content/$slug"
                      params={{ slug: category.slug }}
                      variant="outline"
                      showArrow={false}
                      label={`Browse ${category.name}`}
                      className={dark ? "border-cream text-cream hover:bg-cream hover:text-ink" : ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
