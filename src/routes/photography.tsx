import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { photographsQuery } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

const TILTS = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];

export const Route = createFileRoute("/photography")({
  head: () => ({
    meta: [
      { title: "Photography — Babas & Brasse" },
      {
        name: "description",
        content:
          "A mood board of photography and visual art submitted by South African image-makers.",
      },
      { property: "og:title", content: "Photography — Babas & Brasse" },
      { property: "og:description", content: "A scattered mood board of images from our contributors." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(photographsQuery()),
  component: PhotographyPage,
});

function PhotographyPage() {
  const { data: photographs } = useSuspenseQuery(photographsQuery());

  return (
    <div className="bg-cream">
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_auto] lg:items-end lg:px-8">
          <div>
            <p className="label-xs text-forest-deep">Photography &amp; art</p>
            <h1 className="mt-3 text-5xl leading-none sm:text-6xl lg:text-7xl">Mood board</h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground">
              Pinned, taped and stacked — images from photographers and artists documenting the
              culture around them.
            </p>
          </div>
          <ActionLink to="/contact" label="Submit photography" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {photographs.length === 0 ? (
          <EmptyState message="No photographs have been published yet." />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {photographs.map((photo, index) => (
              <figure
                key={photo.id}
                className={`hard-shadow border-2 border-ink bg-background p-3 transition-transform duration-300 hover:rotate-0 ${TILTS[index % TILTS.length]}`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption ?? "Photograph"}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="aspect-square w-full border border-ink object-cover"
                />
                <figcaption className="px-1 pb-1 pt-3">
                  <p className="text-sm font-semibold">{photo.caption}</p>
                  {photo.credit && <p className="label-xs mt-1 opacity-60">{photo.credit}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
