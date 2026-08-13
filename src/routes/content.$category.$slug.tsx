import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { articleQuery, articlesQuery } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { PiecePage } from "@/components/site/PiecePage";

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
    const description = loaderData.article.excerpt ?? "A story from Babas & Brasse.";
    return {
      meta: [
        { title: `${loaderData.article.title} | Babas & Brasse` },
        { name: "description", content: description },
        { property: "og:title", content: loaderData.article.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
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
