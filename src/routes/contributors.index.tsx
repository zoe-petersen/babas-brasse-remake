import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { contributorsQuery, initials } from "@/lib/magazine";
import { PageHero } from "@/components/site/PageHero";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/contributors/")({
  head: () => ({
    meta: [
      { title: "Contributors | Babas & Brasse" },
      {
        name: "description",
        content:
          "Meet the writers, reviewers, essayists and cultural voices behind Babas & Brasse.",
      },
      { property: "og:title", content: "Contributors | Babas & Brasse" },
      {
        property: "og:description",
        content: "Writers, reviewers, essayists, and cultural voices of the magazine.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(contributorsQuery(false)),
      context.queryClient.ensureQueryData(contributorsQuery(true)),
    ]);
  },
  component: ContributorsPage,
});

function ContributorsPage() {
  const { data: writers } = useSuspenseQuery(contributorsQuery(false));
  const { data: team } = useSuspenseQuery(contributorsQuery(true));
  const people = [...writers, ...team];

  return (
    <div>
      <PageHero
        title={
          <>
            Writers, reviewers,
            <br />
            essayists, and
            <br />
            cultural voices.
          </>
        }
        intro="The people who make the magazine - critics, photographers, poets and editors writing from across South Africa."
      >
        <ActionLink to="/contact" label="Write for us" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {people.length === 0 ? (
          <EmptyState message="No contributors have been added yet." />
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <article key={person.id} className="flex flex-col border-2 border-ink bg-background">
                <div className="aspect-4/3 overflow-hidden border-b-2 border-ink bg-cream">
                  {person.image_url ? (
                    <img
                      src={person.image_url}
                      alt={person.name}
                      loading="lazy"
                      width={800}
                      height={1000}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center font-display text-4xl text-forest-deep">
                      {initials(person.name)}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="label-xs text-magenta">{person.role_title}</p>
                  <h2 className="mt-1.5 text-xl">{person.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{person.bio}</p>
                  <div className="mt-auto pt-4">
                    <Link
                      to="/contributors/$slug"
                      params={{ slug: person.slug }}
                      className="label-xs border-b-2 border-ink pb-1"
                    >
                      View profile →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
