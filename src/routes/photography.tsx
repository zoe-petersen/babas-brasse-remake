import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { photographsQuery } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

const TILTS = ["-2deg", "3deg", "-1deg", "4deg", "-3deg", "2deg"];

export const Route = createFileRoute("/photography")({
  head: () => ({
    meta: [
      { title: "Photography | Babas & Brasse" },
      {
        name: "description",
        content:
          "A mood board of photography and visual art submitted by South African image-makers.",
      },
      { property: "og:title", content: "Photography | Babas & Brasse" },
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
              Pinned, taped and stacked images from photographers and artists documenting the
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
          <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {photographs.map((photo, index) => (
              <figure
                key={photo.id}
                style={{ rotate: TILTS[index % TILTS.length] }}
                className="group relative border-2 border-ink bg-[linear-gradient(135deg,#fffdf8_0%,#efe2c8_100%)] p-3 shadow-[2px_4px_15px_rgba(0,0,0,0.14),8px_8px_0_0_var(--ink)] transition-[rotate,scale,box-shadow] duration-300 hover:z-20 hover:scale-[1.035] hover:shadow-[5px_15px_30px_rgba(0,0,0,0.2),8px_8px_0_0_var(--magenta)] sm:hover:rotate-0!"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3 left-1/2 z-10 h-6.5 w-22 -translate-x-1/2 -rotate-2 bg-[rgba(230,215,185,0.88)] mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.18)]"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-5.5 bottom-6 z-10 hidden h-6.5 w-22 -rotate-45 bg-[rgba(230,215,185,0.88)] mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.18)] sm:block"
                />
                <div className="relative">
                  <img
                    src={photo.image_url}
                    alt={photo.caption ?? "Photograph"}
                    loading="lazy"
                    width={900}
                    height={700}
                    className="block aspect-4/3 w-full border-[3px] border-ink object-cover"
                  />
                  <figcaption className="absolute inset-x-3 bottom-3 z-20 grid translate-y-2 gap-2 border-2 border-ink bg-[linear-gradient(180deg,color-mix(in_oklab,var(--forest)_92%,transparent),color-mix(in_oklab,var(--ink)_96%,transparent))] p-4 opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="font-display text-lg leading-snug text-cream">{photo.caption}</p>
                    {photo.credit && (
                      <p className="label-xs text-cream/75">{photo.credit}</p>
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
