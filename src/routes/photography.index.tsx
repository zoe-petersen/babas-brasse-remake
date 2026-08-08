import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { photographsQuery } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

const TILTS = ["-3deg", "2.5deg", "-1.5deg", "4deg", "-2deg", "3.5deg"];
const OFFSETS = ["0rem", "2.5rem", "-1.5rem", "1.5rem", "-2rem", "3rem"];

export const Route = createFileRoute("/photography/")({
  head: () => ({
    meta: [
      { title: "Photography | Babas & Brasse" },
      {
        name: "description",
        content:
          "A mood board of photography and visual art submitted by South African image-makers.",
      },
      { property: "og:title", content: "Photography | Babas & Brasse" },
      {
        property: "og:description",
        content: "A scattered mood board of images from our contributors.",
      },
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
          <div className="grid grid-cols-2 gap-x-0 gap-y-4 sm:gap-y-8 lg:grid-cols-3">
            {photographs.map((photo, index) => (
              <Link
                key={photo.id}
                to="/photography/$id"
                params={{ id: photo.id }}
                style={{
                  rotate: TILTS[index % TILTS.length],
                  marginTop: OFFSETS[index % OFFSETS.length],
                }}
                className="group relative -mx-1 border-2 border-ink bg-[linear-gradient(135deg,#fffdf8_0%,#efe2c8_100%)] p-2 shadow-[2px_4px_15px_rgba(0,0,0,0.14),8px_8px_0_0_var(--ink)] transition-[rotate,scale,box-shadow] duration-300 odd:z-10 hover:z-20 hover:scale-[1.035] hover:shadow-[5px_15px_30px_rgba(0,0,0,0.2),8px_8px_0_0_var(--magenta)] sm:-mx-3 sm:p-3 sm:hover:rotate-0!"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-3 left-1/2 z-10 h-5 w-14 -translate-x-1/2 -rotate-2 bg-[rgba(230,215,185,0.88)] mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.18)] sm:h-6.5 sm:w-22"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-5.5 bottom-6 z-10 hidden h-6.5 w-22 -rotate-45 bg-[rgba(230,215,185,0.88)] mix-blend-multiply shadow-[0_1px_3px_rgba(0,0,0,0.18)] sm:block"
                />
                <div className="relative">
                  <img
                    src={photo.image_url}
                    alt={photo.title ?? photo.caption ?? "Photograph"}
                    loading="lazy"
                    width={900}
                    height={700}
                    className="block aspect-4/3 w-full border-[3px] border-ink object-cover"
                  />
                  <div className="absolute inset-x-2 bottom-2 z-20 grid translate-y-2 gap-2 border-2 border-ink bg-[linear-gradient(180deg,color-mix(in_oklab,var(--forest)_92%,transparent),color-mix(in_oklab,var(--ink)_96%,transparent))] p-3 opacity-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-3 sm:bottom-3 sm:p-4">
                    <p className="font-display text-base leading-snug text-cream sm:text-lg">
                      {photo.title ?? photo.caption}
                    </p>
                    {photo.credit && <p className="label-xs text-cream/75">{photo.credit}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
