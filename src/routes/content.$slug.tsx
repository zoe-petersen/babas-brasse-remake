import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { articlesQuery, categoriesQuery, formatDate } from "@/lib/magazine";
import { PageHero } from "@/components/site/PageHero";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/content/$slug")({
  loader: async ({ context, params }) => {
    const categories = await context.queryClient.ensureQueryData(categoriesQuery());
    const category = categories.find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    await context.queryClient.ensureQueryData(articlesQuery());
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Section unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.category.name} | Babas & Brasse`;
    const description =
      loaderData.category.description ?? "Stories from the Babas & Brasse magazine.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  notFoundComponent: SectionNotFound,
  component: CategoryPage,
});

function SectionNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Section not found</h1>
      <p className="mt-4 text-muted-foreground">That magazine section does not exist.</p>
      <div className="mt-8">
        <ActionLink to="/content" label="Browse all sections" />
      </div>
    </div>
  );
}

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const items = articles.filter((article) => article.categories?.slug === category.slug);
  const lead = items[0]!;
  const rest = items.slice(1);

  return (
    <div>
      <PageHero
        title={
          <>
            {category.name} that
            <br />
            refuse to sit quietly.
          </>
        }
        intro={category.description ?? undefined}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b-2 border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-3xl sm:text-4xl">Latest in {category.name}</h2>
          <ActionLink
            to="/content"
            label="Browse all sections"
            className="self-start sm:self-auto"
          />
        </div>

        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyState message="No published pieces in this section yet." />
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            <Link
              to="/article/$slug"
              params={{ slug: lead.slug }}
              className="group block border-2 border-ink"
            >
              <div className="grid md:grid-cols-2">
                {lead.cover_image_url && (
                  <img
                    src={lead.cover_image_url}
                    alt={lead.title}
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="h-full max-h-95 w-full border-b-2 border-ink object-cover md:border-b-0 md:border-r-2"
                  />
                )}
                <div className="flex flex-col p-8">
                  <h3 className="text-3xl leading-tight lg:text-4xl">{lead.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground">{lead.excerpt}</p>
                  <p className="label-xs mt-auto border-t border-border pt-6">
                    {lead.contributors?.name}
                    <span className="mx-2 opacity-40">/</span>
                    <span className="opacity-70">{formatDate(lead.published_at)}</span>
                  </p>
                </div>
              </div>
              <div className="label-xs flex items-center justify-between border-t-2 border-ink bg-forest px-6 py-4 text-primary-foreground">
                Read piece <ArrowRight className="h-4 w-4" />
              </div>
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  to="/article/$slug"
                  params={{ slug: article.slug }}
                  className="flex flex-col border-2 border-ink transition-transform hover:-translate-y-1"
                >
                  {article.cover_image_url && (
                    <img
                      src={article.cover_image_url}
                      alt={article.title}
                      loading="lazy"
                      width={1200}
                      height={800}
                      className="aspect-video w-full border-b-2 border-ink object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-2xl leading-tight">{article.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{article.excerpt}</p>
                    <p className="label-xs mt-auto border-t border-border pt-4">
                      {article.contributors?.name}
                      <span className="mx-2 opacity-40">/</span>
                      <span className="opacity-70">{formatDate(article.published_at)}</span>
                    </p>
                  </div>
                  <div className="label-xs flex items-center justify-between border-t-2 border-ink bg-forest px-6 py-4 text-primary-foreground">
                    Read piece <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
