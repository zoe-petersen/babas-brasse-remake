import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { photographsQuery } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

const TILTS = ["-2deg", "3deg", "-1deg", "4deg", "-3deg", "2deg"];

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
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {photographs.map((photo, index) => (
              <figure
                key={photo.id}
                className={`group relative bg-cream p-3 pb-10 shadow-[10px_12px_0_0_var(--ink)] transition-transform duration-300 hover:rotate-0 ${TILTS[index % TILTS.length]}`}
              >
                <span
                  aria-hidden
                  className={`absolute -top-4 left-1/2 h-8 w-24 -translate-x-1/2 border border-ink/20 bg-cream/80 backdrop-blur-[1px] ${TAPE_TILTS[index % TAPE_TILTS.length]}`}
                />
                <div className="relative overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.caption ?? "Photograph"}
                    loading="lazy"
                    width={900}
                    height={700}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="absolute inset-0 flex translate-y-2 flex-col justify-end bg-ink/80 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="block h-1 w-10 bg-forest" aria-hidden />
                    <p className="mt-3 font-display text-lg leading-snug text-cream">
                      {photo.caption}
                    </p>
                    {photo.credit && (
                      <p className="label-xs mt-2 text-cream/70">{photo.credit}</p>
                    )}
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
