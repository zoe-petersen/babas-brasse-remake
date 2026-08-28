import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { articleQuery, articlesQuery, byline, placesForArticle } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { PiecePage } from "@/components/site/PiecePage";
import {
  SITE_NAME,
  SITE_URL,
  absoluteSiteUrl,
  articleCanonicalUrl,
  articleSeoDescription,
  articleSeoTitle,
  publisherJsonLd,
} from "@/lib/seo";

export const Route = createFileRoute("/content/$category/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();

    const category = article.categories?.slug ?? "uncategorised";
    if (params.category !== category) {
      throw redirect({
        to: "/content/$category/$slug",
        params: { category, slug: article.slug },
        replace: true,
        statusCode: 301,
      });
    }

    await context.queryClient.ensureQueryData(articlesQuery());
    return { article };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Piece unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const article = loaderData.article;
    const seoTitle = articleSeoTitle(article);
    const pageTitle = article.seo_title?.trim() ? seoTitle : `${seoTitle} | ${SITE_NAME}`;
    const description = articleSeoDescription(article);
    const canonicalUrl = articleCanonicalUrl(article);
    const imageUrl = article.cover_image_url ? absoluteSiteUrl(article.cover_image_url) : null;
    const author = byline(article);
    const places = placesForArticle(article);
    const categoryName = article.categories?.name ?? "Content";
    const categorySlug = article.categories?.slug ?? "uncategorised";
    const placeNodes = places.map((place) => ({
      "@type": "Place",
      "@id": `${SITE_URL}/places/${place.slug}#place`,
      name: place.name,
      url: `${SITE_URL}/places/${place.slug}`,
    }));
    const articleJsonLd = {
      "@type": "Article",
      "@id": `${canonicalUrl}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
      headline: article.title,
      ...(article.seo_title?.trim() && article.seo_title.trim() !== article.title
        ? { alternativeHeadline: article.seo_title.trim() }
        : {}),
      description,
      ...(imageUrl ? { image: [imageUrl] } : {}),
      ...(article.published_at ? { datePublished: article.published_at } : {}),
      dateModified: article.updated_at,
      ...(author
        ? {
            author: {
              "@type": "Person",
              name: author,
              ...(article.contributors
                ? { url: `${SITE_URL}/contributors/${article.contributors.slug}` }
                : {}),
            },
          }
        : {}),
      publisher: publisherJsonLd(),
      articleSection: categoryName,
      ...(placeNodes.length > 0 ? { about: placeNodes, contentLocation: placeNodes } : {}),
      keywords: [categoryName, ...places.map((place) => place.name)].join(", "),
      isAccessibleForFree: true,
      inLanguage: "en-ZA",
    };
    const breadcrumbsJsonLd = {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Content", item: `${SITE_URL}/content` },
        {
          "@type": "ListItem",
          position: 3,
          name: categoryName,
          item: `${SITE_URL}/content/${categorySlug}`,
        },
        { "@type": "ListItem", position: 4, name: article.title, item: canonicalUrl },
      ],
    };
    return {
      meta: [
        { title: pageTitle },
        { name: "description", content: description },
        { property: "og:title", content: seoTitle },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Babas & Brasse" },
        { property: "og:locale", content: "en_ZA" },
        { property: "og:url", content: canonicalUrl },
        ...(imageUrl
          ? [
              { property: "og:image", content: imageUrl },
              { property: "og:image:secure_url", content: imageUrl },
              { property: "og:image:alt", content: article.title },
            ]
          : []),
        ...(article.published_at
          ? [{ property: "article:published_time", content: article.published_at }]
          : []),
        { property: "article:modified_time", content: article.updated_at },
        { property: "article:section", content: categoryName },
        ...(author ? [{ property: "article:author", content: author }] : []),
        { name: "twitter:card", content: imageUrl ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: seoTitle },
        { name: "twitter:description", content: description },
        { name: "twitter:domain", content: "babasandbrasse.co.za" },
        { name: "twitter:url", content: canonicalUrl },
        ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
        {
          "script:ld+json": {
            "@context": "https://schema.org",
            "@graph": [articleJsonLd, breadcrumbsJsonLd],
          },
        },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Piece not found</h1>
      <p className="mt-4 text-muted-foreground">That magazine piece does not exist.</p>
      <div className="mt-8">
        <ActionLink to="/content" label="Back to the magazine" />
      </div>
    </div>
  ),
  component: CanonicalPiecePage,
});

function CanonicalPiecePage() {
  const { article } = Route.useLoaderData();
  return <PiecePage slug={article.slug} />;
}
