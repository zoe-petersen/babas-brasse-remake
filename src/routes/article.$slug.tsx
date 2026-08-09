import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarDays, Clock, Eye, MessageCircle, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  articleQuery,
  articlesQuery,
  articleViewsQuery,
  commentsQuery,
  formatDate,
  formatLongDate,
  initials,
  registerArticleView,
} from "@/lib/magazine";
import { supabase } from "@/integrations/supabase/client";
import { ActionLink } from "@/components/site/ActionLink";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    await context.queryClient.ensureQueryData(articlesQuery());
    return { title: article.title, excerpt: article.excerpt };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Story unavailable" }, { name: "robots", content: "noindex" }] };
    }
    const description = loaderData.excerpt ?? "A story from Babas & Brasse.";
    return {
      meta: [
        { title: `${loaderData.title} | Babas & Brasse` },
        { name: "description", content: description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Story not found</h1>
      <div className="mt-8">
        <ActionLink to="/content" label="Back to the magazine" />
      </div>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(articleQuery(slug));
  const { data: allArticles } = useSuspenseQuery(articlesQuery());
  const queryClient = useQueryClient();

  if (!article) return null;

  const keepReading = allArticles.filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <div className="label-xs flex items-center gap-3 opacity-70">
          <Link to="/content" className="hover:underline">
            ← Go Back
          </Link>
          <span>/</span>
          <span>{article.categories?.name}</span>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl">{article.title}</h1>
            {article.excerpt && (
              <p className="mt-5 text-base text-muted-foreground">{article.excerpt}</p>
            )}
          </div>
          <aside className="lg:border-l-2 lg:border-ink lg:pl-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest text-sm font-semibold text-primary-foreground">
                {initials(article.contributors?.name ?? "BB")}
              </span>
              <div className="min-w-0">
                <p className="label-xs opacity-60">Written by</p>
                <p className="truncate font-semibold">{article.contributors?.name}</p>
              </div>
            </div>
            <dl className="mt-6 space-y-3 border-t border-border pt-4">
              <Meta icon={<Tag className="h-3.5 w-3.5" />} value={article.categories?.name ?? ""} />
              <Meta
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                value={formatLongDate(article.published_at)}
              />
              <Meta
                icon={<Clock className="h-3.5 w-3.5" />}
                value={`${article.read_minutes} min read`}
              />
              <CommentCount articleId={article.id} />
              <ViewCount articleId={article.id} />
            </dl>
          </aside>
        </div>

        {article.cover_image_url && (
          <figure className="relative mt-12 border-2 border-ink">
            <img
              src={article.cover_image_url}
              alt={article.title}
              width={1200}
              height={800}
              className="w-full object-cover"
            />
            {article.image_credit && (
              <figcaption className="label-xs absolute bottom-0 left-0 bg-ink px-3 py-2 text-cream">
                {article.image_credit}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mx-auto mt-12 max-w-2xl space-y-6 text-center text-lg leading-relaxed">
          {(article.body ?? "").split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className={
                index === 0 ? "text-2xl leading-snug" : "border-t border-border pt-6 text-base"
              }
            >
              {paragraph}
            </p>
          ))}
        </div>

        {article.contributors && (
          <div className="mt-14 grid border-2 border-ink md:grid-cols-[1fr_1.2fr]">
            <div className="flex items-center gap-4 bg-forest p-6 text-primary-foreground">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-magenta font-semibold text-ink">
                {initials(article.contributors.name)}
              </span>
              <div className="min-w-0">
                <p className="label-xs text-magenta">About the author</p>
                <p className="truncate font-display text-2xl">{article.contributors.name}</p>
                <p className="label-xs mt-1 opacity-80">{article.contributors.role_title}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 p-6">
              <p className="text-sm text-muted-foreground">{article.contributors.bio}</p>
              <ActionLink
                to="/contributors/$slug"
                params={{ slug: article.contributors.slug }}
                variant="underline"
                label="View contributor profile"
              />
            </div>
          </div>
        )}
      </article>

      <Comments
        articleId={article.id}
        onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["comments", article.id] })}
      />

      <section className="border-y-2 border-ink bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            title="Keep reading"
            description="More pieces from across the magazine."
            action={<ActionLink to="/content" variant="underline" label="All pieces" />}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {keepReading.map((item) => (
              <Link
                key={item.id}
                to="/article/$slug"
                params={{ slug: item.slug }}
                className="flex flex-col border-2 border-ink bg-background transition-transform hover:-translate-y-1"
              >
                {item.cover_image_url && (
                  <img
                    src={item.cover_image_url}
                    alt={item.title}
                    loading="lazy"
                    width={1200}
                    height={800}
                    className="aspect-16/10 w-full border-b-2 border-ink object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="label-xs text-forest-deep">{item.categories?.name}</p>
                  <h3 className="mt-2 text-xl leading-tight">{item.title}</h3>
                  <p className="label-xs mt-3 opacity-60">
                    {item.contributors?.name} &middot; {formatDate(item.published_at)}
                  </p>
                  <span className="label-xs mt-auto pt-6">Read piece →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Meta({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="label-xs flex items-center gap-2">
      <span className="opacity-60">{icon}</span>
      {value}
    </div>
  );
}

function CommentCount({ articleId }: { articleId: string }) {
  const { data = [] } = useQuery(commentsQuery(articleId));
  return (
    <Meta
      icon={<MessageCircle className="h-3.5 w-3.5" />}
      value={`${data.length} ${data.length === 1 ? "comment" : "comments"}`}
    />
  );
}

function ViewCount({ articleId }: { articleId: string }) {
  const queryClient = useQueryClient();
  const { data = 0 } = useQuery(articleViewsQuery(articleId));

  useEffect(() => {
    const key = `viewed:${articleId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    registerArticleView(articleId)
      .then((views) => queryClient.setQueryData(["article-views", articleId], views))
      .catch(() => undefined);
  }, [articleId, queryClient]);

  return (
    <Meta
      icon={<Eye className="h-3.5 w-3.5" />}
      value={`${data} ${data === 1 ? "view" : "views"}`}
    />
  );
}

function Comments({ articleId, onSubmitted }: { articleId: string; onSubmitted: () => void }) {
  const { data: comments = [] } = useQuery(commentsQuery(articleId));
  const [form, setForm] = useState({ author_name: "", author_email: "", body: "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`comments-${articleId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `article_id=eq.${articleId}` },
        () => queryClient.invalidateQueries({ queryKey: ["comments", articleId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [articleId, queryClient]);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("comments").insert({
        article_id: articleId,
        author_name: form.author_name,
        author_email: form.author_email,
        body: form.body,
        status: "pending",
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Thanks! Your comment is with our editors for review.");
      setForm({ author_name: "", author_email: "", body: "" });
      onSubmitted();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="label-xs text-forest-deep">Reader conversation</p>
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b-2 border-magenta pb-3">
        <h2 className="text-3xl sm:text-4xl">Comments</h2>
        <span className="label-xs opacity-60">{comments.length} approved</span>
      </div>

      <div className="mt-10 space-y-8">
        <div
          className="max-h-[26rem] space-y-4 overflow-y-auto border-2 border-ink bg-background p-4 pr-3 sm:p-6 sm:pr-4"
          aria-label="Approved comments"
        >
          {comments.length === 0 ? (
            <div className="border-2 border-ink bg-forest p-6 text-primary-foreground">
              <MessageCircle className="h-5 w-5 text-magenta" />
              <h3 className="mt-4 font-display text-2xl">Start the conversation</h3>
              <p className="mt-2 text-sm opacity-85">
                No approved comments yet. Share the first thoughtful response.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-2 border-ink bg-cream p-5">
                <p className="label-xs">{comment.author_name}</p>
                <p className="label-xs mt-1 opacity-60">{formatDate(comment.created_at)}</p>
                <p className="mt-3 text-sm">{comment.body}</p>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
          className="border-2 border-ink bg-cream p-6 sm:p-8"
        >
          <h3 className="font-display text-2xl">Join the conversation</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Responses are reviewed before appearing publicly.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              value={form.author_name}
              onChange={(value) => setForm((prev) => ({ ...prev, author_name: value }))}
            />
            <Field
              label="Email"
              type="email"
              value={form.author_email}
              onChange={(value) => setForm((prev) => ({ ...prev, author_email: value }))}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Your email will never be displayed publicly.
          </p>
          <label className="label-xs mt-6 block">
            Comment
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              placeholder="Share a thoughtful response..."
              className="mt-2 w-full border-2 border-ink bg-background p-3 font-body text-sm font-normal tracking-normal normal-case outline-none focus:border-magenta"
            />
          </label>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="label-xs mt-4 border-2 border-ink bg-forest px-6 py-3 text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {mutation.isPending ? "Sending..." : "Submit for review"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="label-xs block">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border-2 border-ink bg-background p-3 font-body text-sm font-normal normal-case tracking-normal outline-none focus:border-magenta"
      />
    </label>
  );
}
