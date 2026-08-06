import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { articlesQuery, categoriesQuery, formatDate } from "@/lib/magazine";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ActionLink } from "@/components/site/ActionLink";
import { EmptyState } from "@/components/site/EmptyState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Babas & Brasse — Independent Arts & Culture Magazine" },
      {
        name: "description",
        content:
          "Reviews, essays, interviews, photography and art from South African writers, critics and creatives.",
      },
      { property: "og:title", content: "Babas & Brasse — Independent Arts & Culture Magazine" },
      {
        property: "og:description",
        content: "Culture, criticism, and creative work made with nerve, care, and a point of view.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery()),
      context.queryClient.ensureQueryData(categoriesQuery()),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  const { data: articles } = useSuspenseQuery(articlesQuery());
  const { data: categories } = useSuspenseQuery(categoriesQuery());

  const latest = articles.slice(0, 3);
  const editorsPick = articles.find((article) => article.is_editors_pick) ?? articles[0];

  return (
    <div>
      <section className="border-b-2 border-ink">
        <img
          src={heroBanner}
          alt="Babas and Brasse — South African arts and culture"
          width={1920}
          height={912}
          className="h-[38vw] max-h-[520px] min-h-[220px] w-full object-cover"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          title="Latest Content"
          action={<ActionLink to="/content" label="View more" />}
        />
        {latest.length === 0 ? (
          <div className="mt-10">
            <EmptyState message="No stories published yet." />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                accent={index === 1 ? "forest" : "magenta"}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y-2 border-ink bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Find your way in"
            title="Explore by Section"
            action={<ActionLink to="/content" label="All content" />}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to="/content/$slug"
                params={{ slug: category.slug }}
                className="group border-2 border-ink bg-background p-5 transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <span className="label-xs text-magenta">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2 text-xl">{category.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {editorsPick && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Selected by the editorial team"
            title="Editor's Pick"
            action={
              <ActionLink
                to="/article/$slug"
                params={{ slug: editorsPick.slug }}
                label="Read the story"
              />
            }
          />
          <Link
            to="/article/$slug"
            params={{ slug: editorsPick.slug }}
            className="mt-10 grid border-2 border-ink md:grid-cols-2"
          >
            {editorsPick.cover_image_url && (
              <img
                src={editorsPick.cover_image_url}
                alt={editorsPick.title}
                loading="lazy"
                width={1200}
                height={800}
                className="h-full max-h-[420px] w-full object-cover"
              />
            )}
            <div className="flex flex-col justify-center border-t-2 border-ink p-8 md:border-l-2 md:border-t-0">
              <p className="label-xs text-forest">{editorsPick.categories?.name}</p>
              <h3 className="mt-4 text-3xl leading-tight lg:text-4xl">{editorsPick.title}</h3>
              <p className="mt-4 text-sm text-muted-foreground">{editorsPick.excerpt}</p>
              <p className="label-xs mt-8">
                {editorsPick.contributors?.name}
                <span className="mx-2 opacity-40">/</span>
                <span className="opacity-70">{formatDate(editorsPick.published_at)}</span>
              </p>
            </div>
          </Link>
        </section>
      )}

      <section className="relative overflow-hidden border-y-2 border-ink bg-forest text-primary-foreground">
        <div className="absolute -right-16 -top-10 hidden h-80 w-80 rounded-full bg-magenta lg:block" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="label-xs text-magenta">Think your work belongs in the conversation?</p>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl">Have something to say?</h2>
            <p className="mt-4 max-w-lg text-sm opacity-90">
              Send us your writing, visual work, pitch, or big idea. We are always looking for
              original South African voices.
            </p>
          </div>
          <ActionLink to="/contact" variant="outline" label="Submit your work" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-forest" />
        </div>
      </section>
    </div>
  );
}
