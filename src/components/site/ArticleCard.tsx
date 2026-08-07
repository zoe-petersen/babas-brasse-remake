import { Link } from "@tanstack/react-router";
import { type Article, formatDate } from "@/lib/magazine";
import { cn } from "@/lib/utils";

export function ArticleCard({
  article,
  accent = "magenta",
  className,
}: {
  article: Article;
  accent?: "magenta" | "forest";
  className?: string;
}) {
  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className={cn(
        "group flex flex-col border-2 border-ink bg-background transition-transform hover:-translate-y-1",
        className,
      )}
    >
      <div
        className={cn("h-1.5 w-full", accent === "magenta" ? "bg-magenta" : "bg-forest")}
        aria-hidden
      />
      {article.cover_image_url && (
        <div className="aspect-16/10 overflow-hidden border-b-2 border-ink">
          <img
            src={article.cover_image_url}
            alt={article.title}
            loading="lazy"
            width={1200}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="label-xs text-forest-deep">{article.categories?.name}</p>
        <h3 className="mt-3 text-xl leading-tight sm:text-2xl">{article.title}</h3>
        {article.excerpt && (
          <p className="mt-3 text-sm text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 text-[11px]">
          <span className="label-xs">{article.contributors?.name}</span>
          <span className="opacity-40">/</span>
          <span className="label-xs opacity-70">{formatDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  );
}