import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Linkedin, Mail, Music2, Youtube } from "lucide-react";
import {
  contributorArticlesQuery,
  contributorQuery,
  initials,
  type Contributor,
} from "@/lib/magazine";
import { ActionLink } from "@/components/site/ActionLink";
import { ContributorWorkArchive } from "@/components/site/ContributorWorkArchive";

export const Route = createFileRoute("/contributors/$slug")({
  loader: async ({ context, params }) => {
    const contributor = await context.queryClient.ensureQueryData(contributorQuery(params.slug));
    if (!contributor) throw notFound();
    await context.queryClient.ensureQueryData(contributorArticlesQuery(contributor.id));
    return {
      name: contributor.name,
      role: contributor.role_title,
      bio: contributor.bio,
      image: contributor.image_url,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Profile unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.name} | Babas & Brasse`;
    const description =
      loaderData.bio ?? `${loaderData.name}, ${loaderData.role ?? "contributor"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        ...(loaderData.image ? [{ property: "og:image", content: loaderData.image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Contributor not found</h1>
      <div className="mt-8">
        <ActionLink to="/contributors" label="All contributors" />
      </div>
    </div>
  ),
  component: ContributorPage,
});

function ContributorPage() {
  const { slug } = Route.useParams();
  const { data: person } = useSuspenseQuery(contributorQuery(slug));

  if (!person) return null;
  return <LoadedContributorPage person={person} />;
}

function LoadedContributorPage({ person }: { person: Contributor }) {
  const { data: articles } = useSuspenseQuery(contributorArticlesQuery(person.id));

  const socials = [
    { href: person.instagram_url, Icon: Instagram, label: "Instagram" },
    { href: person.facebook_url, Icon: Facebook, label: "Facebook" },
    { href: person.youtube_url, Icon: Youtube, label: "YouTube" },
    { href: person.tiktok_url, Icon: Music2, label: "TikTok" },
    { href: person.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
    { href: person.email ? `mailto:${person.email}` : null, Icon: Mail, label: "Email" },
  ].filter((item) => item.href);

  return (
    <div>
      <section className="border-b-2 border-ink">
        <div className="mx-auto grid max-w-7xl gap-0 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="border-2 border-ink bg-cream">
            {person.image_url ? (
              <img
                src={person.image_url}
                alt={person.name}
                width={900}
                height={1100}
                className="aspect-4/5 w-full object-cover"
              />
            ) : (
              <div className="grid aspect-4/5 place-items-center font-display text-6xl text-forest-deep">
                {initials(person.name)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center justify-center border-2 border-t-0 border-ink bg-forest p-8 text-center text-primary-foreground lg:border-l-0 lg:border-t-2">
            <p className="label-xs text-magenta">{person.role_title}</p>
            <h1 className="mt-3 text-3xl sm:text-4xl">{person.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed opacity-90">{person.bio}</p>

            <div className="mt-8 flex w-full max-w-md items-center gap-3">
              <span className="h-px flex-1 bg-primary-foreground/25" />
              <span className="h-2 w-2 rotate-45 bg-magenta" />
              <span className="h-px flex-1 bg-primary-foreground/25" />
            </div>

            <div className="mt-8 flex flex-col items-center gap-5">
              {socials.length > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <p className="label-xs text-magenta">Follow</p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {socials.map(({ href, Icon, label }) => (
                      <a
                        key={label}
                        href={href!}
                        target={href!.startsWith("mailto:") ? undefined : "_blank"}
                        rel="noreferrer"
                        aria-label={`${person.name} on ${label}`}
                        className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/50 transition-colors hover:bg-magenta hover:text-ink"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ActionLink
                  to="/contributors"
                  variant="outline"
                  label="All contributors"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-forest-deep"
                />
                <ActionLink
                  to="/contact"
                  variant="outline"
                  showArrow={false}
                  label="Submit your work"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-forest-deep"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ContributorWorkArchive contributorName={person.name} articles={articles} />
    </div>
  );
}
