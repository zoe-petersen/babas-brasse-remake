import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articlesQuery, categoriesQuery, contributorsQuery } from "@/lib/magazine";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ActionLink } from "@/components/site/ActionLink";

export const Route = createFileRoute("/content/")({
  head: () => ({
    meta: [
      { title: "Content | Babas & Brasse" },
      {
        name: "description",
        content:
          "Browse essays, reviews, interviews and fiction across every section of the Babas & Brasse magazine.",
      },
      { property: "og:title", content: "Content | Babas & Brasse" },
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
          <a
            href="#magazine-sections"
            className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-forest px-6 py-3 text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Browse the archive →
          </a>
          <ActionLink
            to="/contributors"
            variant="outline"
            label="Meet the voices"
            showArrow={false}
          />
        </div>
      </PageHero>

      <div className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border-b border-ink/20 px-6 py-8 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-4xl text-forest-deep">
                  {String(stat.value).padStart(2, "0")}
                </span>
                <span className="label-xs max-w-32 text-right">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section id="magazine-sections" className="scroll-mt-24 border-t-2 border-ink bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading title="Magazine sections" />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const items = articles.filter((a) => a.categories?.slug === category.slug);
              return (
                <div
                  key={category.id}
                  className="hard-shadow flex flex-col border-2 border-ink bg-cream p-6 transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_var(--magenta)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="label-xs text-forest-deep">Magazine section</span>
                    <span className="font-display text-2xl text-magenta">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl">{category.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                  <ul className="mt-5 space-y-2 text-sm">
                    {items.slice(0, 3).map((item) => (
                      <li key={item.id} className="border-t border-current/20 pt-2 font-semibold">
                        <Link
                          to="/article/$slug"
                          params={{ slug: item.slug }}
                          className="hover:underline"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                    {items.length === 0 && (
                      <li className="pt-2 text-sm opacity-70">
                        No published pieces in this section yet.
                      </li>
                    )}
                  </ul>
                  <div className="mt-6 pt-2">
                    <ActionLink
                      to="/content/$slug"
                      params={{ slug: category.slug }}
                      variant="outline"
                      showArrow={false}
                      label={`Browse ${category.name}`}
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
