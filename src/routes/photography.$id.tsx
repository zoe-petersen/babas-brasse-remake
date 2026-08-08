import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { photographQuery, formatLongDate } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";

export const Route = createFileRoute("/photography/$id")({
  loader: async ({ context, params }) => {
    const photo = await context.queryClient.ensureQueryData(photographQuery(params.id));
    if (!photo) throw notFound();
    return { title: photo.title ?? photo.caption ?? "Photograph", caption: photo.caption };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Photograph unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const description = loaderData.caption ?? "A photograph from the Babas & Brasse mood board.";
    return {
      meta: [
        { title: `${loaderData.title} | Babas & Brasse` },
        { name: "description", content: description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center" role="alert">
      <h1 className="text-3xl">{error.message}</h1>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Photograph not found</h1>
      <div className="mt-8">
        <ActionLink to="/photography" label="Back to the mood board" />
      </div>
    </div>
  ),
  component: PhotographPage,
});

function PhotographPage() {
  const { id } = Route.useParams();
  const { data: photo } = useSuspenseQuery(photographQuery(id));
  if (!photo) return null;

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <ActionLink to="/photography" variant="underline" showArrow={false} label="← Back to mood board" />
      </div>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <figure className="border-2 border-ink bg-background p-3 shadow-[8px_8px_0_0_var(--ink)]">
          <img
            src={photo.image_url}
            alt={photo.title ?? photo.caption ?? "Photograph"}
            width={1400}
            height={1000}
            className="w-full border-[3px] border-ink object-cover"
          />
        </figure>

        <div className="mt-10 grid gap-8 border-2 border-ink bg-background p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="label-xs text-forest-deep">Photograph</p>
            <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
              {photo.title ?? photo.caption ?? "Untitled"}
            </h1>
            {photo.caption && photo.title && (
              <p className="mt-4 text-base text-muted-foreground">{photo.caption}</p>
            )}
          </div>
          <dl className="space-y-4 border-t-2 border-ink pt-6 lg:border-l-2 lg:border-t-0 lg:pl-8 lg:pt-0">
            {photo.credit && (
              <div>
                <dt className="label-xs opacity-60">Credit</dt>
                <dd className="mt-1 text-sm">{photo.credit}</dd>
              </div>
            )}
            {photo.taken_on && (
              <div>
                <dt className="label-xs opacity-60">Taken</dt>
                <dd className="mt-1 text-sm">{formatLongDate(photo.taken_on)}</dd>
              </div>
            )}
            <div className="pt-2">
              <ActionLink to="/contact" variant="outline" showArrow={false} label="Submit visual work" />
            </div>
          </dl>
        </div>
      </article>
    </div>
  );
}