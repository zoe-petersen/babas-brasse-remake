import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminArticlesQuery,
  createArticle,
  deleteArticle,
  emptyArticle,
  slugify,
  toFormValues,
  updateArticle,
  type AdminArticle,
  type ArticleFormValues,
} from "@/lib/admin";
import { categoriesQuery, contributorsQuery, formatDate } from "@/lib/magazine";
import { AdminCard, AdminEmpty, AdminHeading, Pill } from "@/components/admin/AdminUI";

export const Route = createFileRoute("/_authenticated/admin/articles")({
  component: ArticlesPage,
});

const inputClass =
  "mt-2 w-full border-2 border-ink bg-background px-3 py-2 text-sm outline-none focus:border-forest";

function ArticlesPage() {
  const queryClient = useQueryClient();
  const { data: articles = [], isLoading } = useQuery(adminArticlesQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: writers = [] } = useQuery(contributorsQuery(false));
  const { data: team = [] } = useQuery(contributorsQuery(true));
  const people = [...writers, ...team];

  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [values, setValues] = useState<ArticleFormValues | null>(null);

  function openNew() {
    setEditing(null);
    setValues(emptyArticle());
  }

  function openEdit(article: AdminArticle) {
    setEditing(article);
    setValues(toFormValues(article));
  }

  const save = useMutation({
    mutationFn: async (form: ArticleFormValues) => {
      if (editing) await updateArticle(editing, form);
      else await createArticle(form);
    },
    onSuccess: () => {
      toast.success(editing ? "Article updated" : "Article created");
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setValues(null);
      setEditing(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function update<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <div className="space-y-8">
      <AdminHeading
        title="Articles"
        description="Create, edit and publish work across every section."
        action={
          <button
            type="button"
            onClick={openNew}
            className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-magenta px-4 py-3 text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        }
      />

      {values && (
        <AdminCard>
          <h2 className="border-b-2 border-ink pb-3 text-xl">
            {editing ? "Edit article" : "New article"}
          </h2>
          <form
            className="mt-4 grid gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(values);
            }}
          >
            <div className="lg:col-span-2">
              <label className="label-xs" htmlFor="title">Title</label>
              <input
                id="title"
                required
                className={inputClass}
                value={values.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          title,
                          slug: editing ? prev.slug : slugify(title),
                        }
                      : prev,
                  );
                }}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="slug">Slug</label>
              <input
                id="slug"
                required
                className={inputClass}
                value={values.slug}
                onChange={(e) => update("slug", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="read">Read minutes</label>
              <input
                id="read"
                type="number"
                min={1}
                className={inputClass}
                value={values.read_minutes}
                onChange={(e) => update("read_minutes", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="category">Section</label>
              <select
                id="category"
                className={inputClass}
                value={values.category_id ?? ""}
                onChange={(e) => update("category_id", e.target.value || null)}
              >
                <option value="">— none —</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-xs" htmlFor="contributor">Contributor</label>
              <select
                id="contributor"
                className={inputClass}
                value={values.contributor_id ?? ""}
                onChange={(e) => update("contributor_id", e.target.value || null)}
              >
                <option value="">— none —</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-xs" htmlFor="cover">Cover image URL</label>
              <input
                id="cover"
                className={inputClass}
                placeholder="https://… or /media/example.jpg"
                value={values.cover_image_url}
                onChange={(e) => update("cover_image_url", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="credit">Image credit</label>
              <input
                id="credit"
                className={inputClass}
                value={values.image_credit}
                onChange={(e) => update("image_credit", e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label-xs" htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                rows={2}
                className={inputClass}
                value={values.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label-xs" htmlFor="body">Body</label>
              <textarea
                id="body"
                rows={12}
                className={inputClass}
                value={values.body}
                onChange={(e) => update("body", e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-5 lg:col-span-2">
              {([
                ["is_published", "Published"],
                ["is_featured", "Featured"],
                ["is_editors_pick", "Editor's pick"],
              ] as const).map(([key, label]) => (
                <label key={key} className="label-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--forest)]"
                    checked={values[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 lg:col-span-2">
              <button
                type="submit"
                disabled={save.isPending}
                className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-forest px-5 py-3 text-primary-foreground disabled:opacity-60"
              >
                {save.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setValues(null);
                  setEditing(null);
                }}
                className="label-xs border-2 border-ink px-5 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard className="p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b-2 border-ink bg-cream">
              <tr>
                <th className="label-xs px-4 py-3">Title</th>
                <th className="label-xs px-4 py-3">Section</th>
                <th className="label-xs px-4 py-3">Author</th>
                <th className="label-xs px-4 py-3">Date</th>
                <th className="label-xs px-4 py-3">Status</th>
                <th className="label-xs px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="max-w-xs truncate px-4 py-3 font-semibold">{article.title}</td>
                  <td className="px-4 py-3">{article.categories?.name ?? "—"}</td>
                  <td className="px-4 py-3">{article.contributors?.name ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(article.published_at ?? article.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={article.is_published ? "green" : "grey"}>
                      {article.is_published ? "Live" : "Draft"}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={`Edit ${article.title}`}
                        onClick={() => openEdit(article)}
                        className="border-2 border-ink p-2 hover:bg-cream"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${article.title}`}
                        onClick={() => {
                          if (confirm(`Delete “${article.title}”?`)) remove.mutate(article.id);
                        }}
                        className="border-2 border-destructive p-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && articles.length === 0 && <AdminEmpty message="No articles yet." />}
      </AdminCard>
    </div>
  );
}