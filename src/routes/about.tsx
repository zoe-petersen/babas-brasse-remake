import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import logoAsset from "@/assets/logo-real.png.asset.json";
import { contributorsQuery, initials } from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Babas & Brasse" },
      {
        name: "description",
        content:
          "Babas & Brasse is an independent South African arts and culture magazine publishing reviews, essays, photography and art.",
      },
      { property: "og:title", content: "About Us — Babas & Brasse" },
      {
        property: "og:description",
        content: "Who we are, what the name means, and the creative team behind the magazine.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(contributorsQuery(true)),
  component: AboutPage,
});

function AboutPage() {
  const { data: team } = useSuspenseQuery(contributorsQuery(true));

  return (
    <div>
      <section className="border-b-2 border-ink bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="label-xs text-forest-deep">About us</p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            An independent home for South African culture, criticism and creative work.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="label-xs text-magenta">01 &mdash; Who we are</p>
            <h2 className="mt-4 text-3xl leading-[1.05] sm:text-4xl lg:text-5xl">
              A magazine built
              <br />
              on nerve and care.
            </h2>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-1 w-16 bg-magenta" />
              <span className="h-1 w-6 bg-forest" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="hard-shadow border-2 border-ink bg-cream p-6">
              <p className="text-base leading-relaxed">
                Babas &amp; Brasse is an independent magazine covering theatre, film, books, music,
                photography and the arguments happening around them. We publish the reviews and
                essays that bigger outlets skip.
              </p>
            </div>
            <div className="hard-shadow border-2 border-ink bg-forest p-6 text-primary-foreground">
              <p className="text-base leading-relaxed">
                We are writers, critics, photographers and editors who believe local work deserves
                serious, unhurried attention &mdash; and readers who deserve more than a press
                release.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 border-2 border-ink bg-background p-6 sm:col-span-2">
              {[
                { value: "100%", label: "Independent" },
                { value: "SA", label: "Voices first" },
                { value: "Always", label: "Open to pitches" },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="font-display text-2xl text-forest-deep sm:text-3xl">{item.value}</p>
                  <p className="label-xs mt-2 opacity-70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-ink bg-forest text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <p className="font-display text-3xl leading-snug sm:text-4xl lg:text-5xl">
            &ldquo;Culture is not decoration. It is the argument a country has with itself, out
            loud.&rdquo;
          </p>
          <p className="label-xs mt-8 text-magenta">The editors</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-3xl sm:text-4xl">What&rsquo;s in the name?</h2>
            <div className="mt-5 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                &ldquo;Babas&rdquo; and &ldquo;brasse&rdquo; are how people here greet each other —
                familiar, warm, a little cheeky. It is the language of the stoep, the taxi rank and
                the theatre foyer.
              </p>
              <p>
                We wanted a name that sounded like a conversation rather than an institution.
                That is the tone we aim for on every page.
              </p>
            </div>
          </div>
          <div className="hard-shadow grid place-items-center border-2 border-ink bg-cream p-10">
            <img
              src={logoAsset.url}
              alt="Babas & Brasse logo"
              width={500}
              height={500}
              className="w-full max-w-[260px]"
            />
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            title="Meet the creative team"
            action={<ActionLink to="/contributors" variant="underline" label="All contributors" />}
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((person) => (
              <div key={person.id} className="border-2 border-ink bg-background">
                <div className="aspect-[4/5] border-b-2 border-ink">
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
                    <div className="grid h-full place-items-center font-display text-5xl text-forest-deep">
                      {initials(person.name)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-xl">{person.name}</h3>
                  <p className="label-xs mt-1 text-magenta">{person.role_title}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{person.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
