import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import logoAsset from "@/assets/logo.png";
import { contributorsQuery, initials } from "@/lib/magazine";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Babas & Brasse" },
      {
        name: "description",
        content:
          "Babas & Brasse is an independent South African arts and culture magazine publishing reviews, essays, photography and art.",
      },
      { property: "og:title", content: "About Us | Babas & Brasse" },
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
          <h1 className="mt-4 max-w-4xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            An independent home for South African culture.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="label-xs text-magenta">01 &mdash; Who we are</p>
            <h2 className="mt-4 text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
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
                Babas and Brasse is an inclusive non-profit arts, fashion, and literary platform and
                collective created to showcase, archive, and celebrate local creative work. Created
                in 2026 from a response to the gatekeeping often found in mainstream media and
                online publishing spaces, Babas and Brasse aims to support creatives who may not
                always have access to the resources, visibility, and archive needed to share their
                stories, build their profiles, and reach wider audiences.
              </p>
            </div>
            <div className="hard-shadow border-2 border-ink bg-forest p-6 text-primary-foreground">
              <p className="text-base leading-relaxed">
                Beyond art, fashion, and literature, we are committed to giving voice to individuals
                from marginalised communities and creating a space where their lived experiences,
                creativity, and contributions can be seen, heard, and celebrated.
              </p>
            </div>
            <div className="hard-shadow border-2 border-ink bg-cream p-6 sm:col-span-2">
              <p className="text-base leading-relaxed">
                Our collective is for all the babas and brasse out there: the artists, misfits,
                writers, makers and shakers, and lovers of all things creative who are hustling
                through the gatekeeping and kapping aan despite the many challenges of life in South
                Africa.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 border-2 border-ink bg-background p-6 sm:col-span-2">
              {[
                { value: "100%", label: "Independent" },
                { value: "SA", label: "Voices first" },
                { value: "Respect & Love", label: "For all opinions & views" },
                
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
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="label-xs text-magenta">02 &mdash; What&rsquo;s in the name</p>
            <div className="mt-4 flex items-center gap-1 sm:gap-4">
              <h2 className="text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
                A greeting,
                <br />
                not an institution.
              </h2>
              <img
                src={logoAsset}
                alt="Babas & Brasse logo"
                loading="lazy"
                width={200}
                height={200}
                className="-ml-2 h-28 w-28 shrink-0 object-contain sm:ml-0 sm:h-32 sm:w-32 lg:hidden"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="h-1 w-16 bg-forest" />
              <span className="h-1 w-6 bg-magenta" />
            </div>
            <div className="hard-shadow mt-8 hidden place-items-center border-2 border-ink bg-cream p-8 lg:grid">
              <img
                src={logoAsset}
                alt="Babas & Brasse logo"
                loading="lazy"
                width={500}
                height={500}
                className="w-full max-w-55"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="hard-shadow border-2 border-ink bg-cream p-6">
              <p className="font-display text-4xl text-forest-deep">Baba</p>
              <p className="mt-3 text-base leading-relaxed">
                &ldquo;Baba&rdquo; is the Afrikaans word for &ldquo;baby&rdquo;, a term of endearment
                often used to refer to someone affectionately.
              </p>
            </div>
            <div className="hard-shadow border-2 border-ink bg-forest p-6 text-primary-foreground">
              <p className="font-display text-4xl">Brasse</p>
              <p className="mt-3 text-base leading-relaxed">
                &ldquo;Brasse&rdquo; is a colloquial word for brother, friend, or close companion.
                Both terms are gender-neutral and can be used to warmly describe another.
              </p>
            </div>
            <div className="border-2 border-ink bg-background p-6 sm:col-span-2">
              <p className="text-base leading-relaxed">
                Creative Director and Editor-in-Chief, Zubayr Charles, purposefully chose this
                localised name to align with the platform and collective&rsquo;s brand and vision.
                Through the name Babas and Brasse, the team aims to capture the spirit of being a
                local platform and collective that promotes pride in South African art, fashion,
                literature, and language through community, inclusivity, and belonging. Babas and
                Brasse is, of course, a platform and collective for all.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 border-t-2 border-ink pt-6">
                {[
                  { value: "Rooted In", label: "Multilingualism" },
                  { value: "All Cultures", label: "Wanted & Accepted" },
                  { value: "South African", label: "Home-grown Stores" },
                  
                ].map((item) => (
                  <div key={item.label} className="min-w-0">
                    <p className="font-display text-2xl text-forest-deep sm:text-3xl">
                      {item.value}
                    </p>
                    <p className="label-xs mt-2 opacity-70">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            title="Meet the creative team"
            description="Tap a face to read their full bio and find them online."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((person) => (
              <Link
                key={person.id}
                to="/contributors/$slug"
                params={{ slug: person.slug }}
                className="group border-2 border-ink bg-background transition-transform hover:-translate-y-1"
              >
                <div className="aspect-4/5 border-b-2 border-ink">
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
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{person.bio}</p>
                  <span className="label-xs mt-4 inline-block underline-offset-4 group-hover:underline">
                    Read bio →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
