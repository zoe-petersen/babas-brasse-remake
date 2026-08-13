import { createFileRoute, redirect } from "@tanstack/react-router";
import { articleQuery } from "@/lib/magazine";

export const Route = createFileRoute("/article/$slug")({
  beforeLoad: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    const category = article?.categories?.slug ?? "uncategorised";
    throw redirect({
      to: "/content/$category/$slug",
      params: { category, slug: params.slug },
      replace: true,
      statusCode: 301,
    });
  },
});
