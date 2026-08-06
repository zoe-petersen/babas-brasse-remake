import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminArticlesQuery, adminCommentsQuery, submissionsQuery } from "@/lib/admin";
import { formatDate } from "@/lib/magazine";
import { AdminCard, AdminEmpty, AdminHeading, Pill, StatCard } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const articles = useQuery(adminArticlesQuery());
  const comments = useQuery(adminCommentsQuery());
  const submissions = useQuery(submissionsQuery());

  const all = articles.data ?? [];
  const published = all.filter((a) => a.is_published);
  const drafts = all.filter((a) => !a.is_published);
  const pending = (comments.data ?? []).filter((c) => c.status === "pending");
  const openSubmissions = (submissions.data ?? []).filter((s) => !s.is_handled);

  return (
    <div className="space-y-8">
      <AdminHeading title="Dashboard" description="A quick read on the newsroom right now." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Published" value={published.length} hint="Live on the public site" />
        <StatCard label="Drafts" value={drafts.length} hint="Not yet visible" />
        <StatCard label="Pending comments" value={pending.length} hint="Awaiting moderation" />
        <StatCard label="Open messages" value={openSubmissions.length} hint="Contact submissions" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <h2 className="text-xl">Recent articles</h2>
            <Link to="/admin/articles" className="label-xs border-b-2 border-ink pb-0.5">
              Manage
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {all.slice(0, 5).map((article) => (
              <li key={article.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
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
          {all.length === 0 && <AdminEmpty message="No articles yet." />}
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink pb-3">
            <h2 className="text-xl">Awaiting moderation</h2>
            <Link to="/admin/moderation" className="label-xs border-b-2 border-ink pb-0.5">
              Review
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-border">
            {pending.slice(0, 5).map((comment) => (
              <li key={comment.id} className="py-3">
                <p className="label-xs text-forest-deep">{comment.author_name}</p>
                <p className="mt-1 line-clamp-2 text-sm">{comment.body}</p>
              </li>
            ))}
          </ul>
          {pending.length === 0 && <AdminEmpty message="Nothing waiting. Inbox zero." />}
        </AdminCard>
      </div>
    </div>
  );
}