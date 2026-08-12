import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  adminArticlesQuery,
  adminCommentsQuery,
  articleViewCountsQuery,
  submissionsQuery,
} from "@/lib/admin";
import { formatDate } from "@/lib/magazine";
import { AdminCard, AdminEmpty, AdminHeading, Pill, StatCard } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const articles = useQuery(adminArticlesQuery());
  const comments = useQuery(adminCommentsQuery());
  const submissions = useQuery(submissionsQuery());
  const views = useQuery(articleViewCountsQuery());

  const all = articles.data ?? [];
  const published = all.filter((a) => a.is_published);
  const drafts = all.filter((a) => !a.is_published);
  const recentComments = comments.data ?? [];
  const pending = recentComments.filter((c) => c.status === "pending");
  const recentSubmissions = submissions.data ?? [];
  const openSubmissions = recentSubmissions.filter((s) => !s.is_handled);
  const totalReads = Object.values(views.data ?? {}).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-8">
      <AdminHeading title="Dashboard" description="A quick read on the newsroom right now." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Published" value={published.length} hint="Live on the public site" />
        <StatCard label="Drafts" value={drafts.length} hint="Not yet visible" />
        <StatCard label="Total reads" value={totalReads} hint="Across every piece" />
        <StatCard label="Pending comments" value={pending.length} hint="Awaiting moderation" />
        <StatCard label="Open messages" value={openSubmissions.length} hint="Contact submissions" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <h2 className="text-xl">Recent pieces</h2>
            <Link to="/admin/content" className="label-xs border-b-2 border-ink pb-0.5">
              Manage
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {all.slice(0, 5).map((article) => (
              <li
                key={article.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{article.title}</p>
                  <p className="label-xs mt-1 text-muted-foreground">
                    {article.categories?.name ?? "Uncategorised"} ·{" "}
                    {formatDate(article.published_at ?? article.created_at)}
                  </p>
                </div>
                <Pill tone={article.is_published ? "green" : "grey"}>
                  {article.is_published ? "Live" : "Draft"}
                </Pill>
              </li>
            ))}
          </ul>
          {all.length === 0 && <AdminEmpty message="No pieces yet." />}
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <h2 className="text-xl">Recent comments</h2>
            <Link to="/admin/moderation" className="label-xs border-b-2 border-ink pb-0.5">
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {recentComments.slice(0, 5).map((comment) => (
              <li
                key={comment.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="label-xs truncate text-forest-deep">
                    {[comment.author_name, comment.author_surname].filter(Boolean).join(" ")}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm">{comment.body}</p>
                  <p className="label-xs mt-2 truncate text-muted-foreground">
                    {comment.articles?.title ?? "Unknown piece"} · {formatDate(comment.created_at)}
                  </p>
                </div>
                <Pill
                  tone={
                    comment.status === "approved"
                      ? "green"
                      : comment.status === "pending"
                        ? "amber"
                        : "red"
                  }
                >
                  {comment.status}
                </Pill>
              </li>
            ))}
          </ul>
          {recentComments.length === 0 && <AdminEmpty message="No comments yet." />}
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <div>
              <h2 className="text-xl">Recent submissions</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                The latest messages sent through the contact form.
              </p>
            </div>
            <Link
              to="/admin/submissions"
              className="label-xs shrink-0 border-b-2 border-ink pb-0.5"
            >
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {recentSubmissions.slice(0, 5).map((submission) => (
              <li
                key={submission.id}
                className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-display text-lg leading-tight">{submission.subject}</p>
                    <p className="label-xs text-forest-deep">{submission.name}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 max-w-4xl text-sm text-muted-foreground">
                    {submission.message}
                  </p>
                  <p className="label-xs mt-2 text-muted-foreground">
                    {submission.email} · {formatDate(submission.created_at)}
                  </p>
                </div>
                <Pill tone={submission.is_handled ? "green" : "amber"}>
                  {submission.is_handled ? "Handled" : "Open"}
                </Pill>
              </li>
            ))}
          </ul>
          {recentSubmissions.length === 0 && <AdminEmpty message="No submissions yet." />}
        </AdminCard>
      </div>
    </div>
  );
}
