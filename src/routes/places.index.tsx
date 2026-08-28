import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";
import { articlesQuery, placesForArticle, placesQuery } from "@/lib/magazine";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { EmptyState } from "@/components/site/EmptyState";
import { PageHero } from "@/components/site/PageHero";

const DESCRIPTION =
  "Explore Babas & Brasse stories through the South African places, neighbourhoods and cultural spaces they cover.";

export const Route = createFileRoute("/places/")({
  loader: async ({ context }) => {
    const [places, articles] = await Promise.all([
      context.queryClient.ensureQueryData(placesQuery()),
      context.queryClient.ensureQueryData(articlesQuery()),
    ]);
    const activePlaces = places.filter((place) =>
      articles.some((article) =>
        placesForArticle(article).some((articlePlace) => articlePlace.id === place.id),
      ),
    );
    return { places: activePlaces };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Places in Our Stories | ${SITE_NAME}` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: `Places in Our Stories | ${SITE_NAME}` },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/places` },
      {
        "script:ld+json": {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/places#collection`,
          name: "Places in Our Stories",
          description: DESCRIPTION,
          url: `${SITE_URL}/places`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: (loaderData?.places ?? []).map((place, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: place.name,
              url: `${SITE_URL}/places/${place.slug}`,
            })),
          },
        },
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/places` }],
  }),
  component: PlacesPage,
});

function PlacesPage() {
  const { data: places } = useSuspenseQuery(placesQuery());
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const activePlaces = places
    .map((place) => ({
      place,
      articles: articles.filter((article) =>
        placesForArticle(article).some((articlePlace) => articlePlace.id === place.id),
      ),
    }))
    .filter((entry) => entry.articles.length > 0);

  return (
    <div>
      <PageHero
        title={
          <>
            Stories rooted
            <br />
            in place.
          </>
        }
        intro={DESCRIPTION}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {activePlaces.length === 0 ? (
          <EmptyState message="No places have been added to published stories yet." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activePlaces.map(({ place, articles: placeArticles }, index) => (
              <article
                key={place.id}
                className="hard-shadow flex flex-col border-2 border-ink bg-cream p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <MapPin className="h-5 w-5 text-magenta" aria-hidden />
                  <span className="label-xs text-forest-deep">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl leading-tight">{place.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {placeArticles.length} {placeArticles.length === 1 ? "piece" : "pieces"} from this
                  place.
                </p>
                <ul className="mt-5 space-y-2 border-t border-ink/20 pt-4 text-sm">
                  {placeArticles.slice(0, 3).map((article) => (
                    <li key={article.id} className="font-semibold">
                      <Link
                        to="/content/$category/$slug"
                        params={{
                          category: article.categories?.slug ?? "uncategorised",
                          slug: article.slug,
                        }}
                        className="hover:underline"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/places/$slug"
                  params={{ slug: place.slug }}
                  className="label-xs mt-auto flex items-center justify-between border-t-2 border-ink pt-5"
                >
                  Explore {place.name}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
