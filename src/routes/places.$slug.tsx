import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { placeArticlesQuery, placeQuery } from "@/lib/magazine";
import { SITE_NAME, SITE_URL, articleCanonicalUrl } from "@/lib/seo";
import { ActionLink } from "@/components/site/ActionLink";
import { ArticleCard } from "@/components/site/ArticleCard";
import { EmptyState } from "@/components/site/EmptyState";
import { PageHero } from "@/components/site/PageHero";

function descriptionFor(name: string) {
  return `Read essays, interviews, reviews and cultural stories connected to ${name} from Babas & Brasse.`;
}

export const Route = createFileRoute("/places/$slug")({
  loader: async ({ context, params }) => {
    const place = await context.queryClient.ensureQueryData(placeQuery(params.slug));
    if (!place) throw notFound();
    const articles = await context.queryClient.ensureQueryData(placeArticlesQuery(place.id));
    return { place, articles };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Place unavailable" }, { name: "robots", content: "noindex" }] };
    }

    const { place, articles } = loaderData;
    const canonicalUrl = `${SITE_URL}/places/${place.slug}`;
    const description = descriptionFor(place.name);
    return {
      meta: [
        { title: `${place.name} Stories | ${SITE_NAME}` },
        { name: "description", content: description },
        ...(articles.length === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
        { property: "og:title", content: `${place.name} Stories | ${SITE_NAME}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonicalUrl },
        { name: "twitter:card", content: "summary" },
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "CollectionPage",
                "@id": `${canonicalUrl}#collection`,
                name: `${place.name} stories`,
                description,
                url: canonicalUrl,
                about: {
                  "@type": "Place",
                  "@id": `${canonicalUrl}#place`,
                  name: place.name,
                  url: canonicalUrl,
                },
                mainEntity: {
                  "@type": "ItemList",
                  itemListElement: articles.map((article, index) => ({
                    "@type": "ListItem",
                    position: index + 1,
                    name: article.title,
                    url: articleCanonicalUrl(article),
                  })),
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Places",
                    item: `${SITE_URL}/places`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: place.name,
                    item: canonicalUrl,
                  },
                ],
              },
            ],
          },
        },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Place not found</h1>
      <p className="mt-4 text-muted-foreground">That place is not in our story archive.</p>
      <div className="mt-8">
        <ActionLink to="/places" label="Explore all places" />
      </div>
    </div>
  ),
  component: PlacePage,
});

function PlacePage() {
  const { slug } = Route.useParams();
  const { data: place } = useSuspenseQuery(placeQuery(slug));
  if (!place) return null;
  return <LoadedPlacePage placeId={place.id} placeName={place.name} />;
}

function LoadedPlacePage({ placeId, placeName }: { placeId: string; placeName: string }) {
  const { data: articles } = useSuspenseQuery(placeArticlesQuery(placeId));

  return (
    <div>
      <PageHero
        title={
          <>
            Stories from
            <br />
            {placeName}.
          </>
        }
        intro={descriptionFor(placeName)}
      >
        <p className="label-xs inline-flex items-center gap-2 text-forest-deep">
          <MapPin className="h-4 w-4" aria-hidden />
          {articles.length} {articles.length === 1 ? "published piece" : "published pieces"}
        </p>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <EmptyState message={`No published pieces connected to ${placeName} yet.`} />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                accent={index % 2 === 0 ? "magenta" : "forest"}
              />
            ))}
          </div>
        )}

        <div className="mt-12 border-t-2 border-ink pt-6">
          <ActionLink to="/places" label="Explore all places" />
        </div>
      </section>
    </div>
  );
}
