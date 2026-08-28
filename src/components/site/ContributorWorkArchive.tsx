import type { Article } from "@/lib/magazine";
import { ArticleCard } from "@/components/site/ArticleCard";
import { EmptyState } from "@/components/site/EmptyState";

export function ContributorWorkArchive({
  contributorName,
  articles,
}: {
  contributorName: string;
  articles: Article[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-4 border-b-2 border-ink pb-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="label-xs text-magenta">Contributor archive</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Work by {contributorName}</h2>
        </div>
        <span className="label-xs opacity-60">
          {articles.length} {articles.length === 1 ? "piece" : "pieces"} published
        </span>
      </div>

      {articles.length === 0 ? (
        <div className="mt-10">
          <EmptyState message="No published work from this contributor yet." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              accent={index % 3 === 1 ? "forest" : "magenta"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
