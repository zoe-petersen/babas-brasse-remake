import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminArticlesQuery,
  adminContributorsQuery,
  articleViewCountsQuery,
  createArticle,
  deleteArticle,
  emptyArticle,
  slugify,
  toFormValues,
  updateArticle,
  type AdminArticle,
  type ArticleFormValues,
} from "@/lib/admin";
import { categoriesQuery, formatDate } from "@/lib/magazine";
import {
  AdminCard,
  AdminEmpty,
  AdminFilterToolbar,
  AdminHeading,
  AdminModal,
  AdminPublicationFilter,
  Pill,
  adminFilterSelectClass,
  adminInputClass as inputClass,
  type PublicationFilter,
} from "@/components/admin/AdminUI";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentPage,
});

function ContentPage() {
  const queryClient = useQueryClient();
  const { data: articles = [], isLoading } = useQuery(adminArticlesQuery());
  const { data: views = {} } = useQuery(articleViewCountsQuery());
  const { data: categories = [] } = useQuery(categoriesQuery());
  const { data: people = [] } = useQuery(adminContributorsQuery());

  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [values, setValues] = useState<ArticleFormValues | null>(null);
  const [filter, setFilter] = useState<PublicationFilter>("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [contributorFilter, setContributorFilter] = useState("all");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleArticles = articles.filter((article) => {
    const matchesPublication =
      filter === "all" ? true : filter === "live" ? article.is_published : !article.is_published;
    const matchesCategory = categoryFilter === "all" || article.category_id === categoryFilter;
    const matchesContributor =
      contributorFilter === "all" || article.contributor_id === contributorFilter;
    const matchesSearch =
      !normalizedSearch ||
      [article.title, article.excerpt, article.categories?.name, article.contributors?.name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch));
    return matchesPublication && matchesCategory && matchesContributor && matchesSearch;
  });

  function close() {
    setValues(null);
    setEditing(null);
  }

  const save = useMutation({
    mutationFn: async (form: ArticleFormValues) => {
      if (editing) await updateArticle(editing, form);
      else await createArticle(form);
    },
    onSuccess: () => {
      toast.success(editing ? "Piece updated" : "Piece created");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      close();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      toast.success("Piece deleted");
      queryClient.invalidateQueries({ queryKey: ["admin"] });
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
        title="Content"
        description="Create, edit and publish pieces across every section."
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setValues(emptyArticle());
            }}
            className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-magenta px-4 py-3 text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        }
      />

      {values && (
        <AdminModal wide title={editing ? "Edit piece" : "New piece"} onClose={close}>
          <form
            className="grid gap-4 lg:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(values);
            }}
          >
            <div className="lg:col-span-2">
              <label className="label-xs" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                required
                className={inputClass}
                value={values.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setValues((prev) =>
                    prev ? { ...prev, title, slug: editing ? prev.slug : slugify(title) } : prev,
                  );
                }}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                required
                className={inputClass}
                value={values.slug}
                onChange={(e) => update("slug", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="read">
                Read minutes
              </label>
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
              <label className="label-xs" htmlFor="category">
                Section
              </label>
              <select
                id="category"
                className={inputClass}
                value={values.category_id ?? ""}
                onChange={(e) => update("category_id", e.target.value || null)}
              >
                <option value="">- none -</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-xs" htmlFor="contributor">
                Contributor
              </label>
              <select
                id="contributor"
                className={inputClass}
                value={values.contributor_id ?? ""}
                onChange={(e) => update("contributor_id", e.target.value || null)}
              >
                <option value="">- none -</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                    {person.is_published ? "" : " (Draft)"}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Add or edit names from the Contributors page before assigning them here.
              </p>
            </div>

            <div>
              <label className="label-xs" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                className={inputClass}
                value={values.published_on}
                onChange={(e) => update("published_on", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="credit">
                Image credit (optional)
              </label>
              <input
                id="credit"
                className={inputClass}
                value={values.image_credit}
                onChange={(e) => update("image_credit", e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <ImageUpload
                label="Cover image"
                folder="articles"
                value={values.cover_image_url}
                onChange={(url) => update("cover_image_url", url)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label-xs" htmlFor="excerpt">
                Description
              </label>
              <textarea
                id="excerpt"
                rows={2}
                className={inputClass}
                value={values.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <p className="label-xs">Body</p>
              <RichTextEditor value={values.body} onChange={(html) => update("body", html)} />
            </div>

            <div className="flex flex-wrap gap-5 lg:col-span-2">
              {(
                [
                  ["is_published", "Published"],
                  ["is_editors_pick", "Editor's pick"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="label-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-forest"
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
                onClick={close}
                className="label-xs border-2 border-ink px-5 py-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      <AdminPublicationFilter value={filter} onChange={setFilter} records={articles} />

      <AdminFilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search title, description or author..."
        hasActiveFilters={
          Boolean(search) ||
          filter !== "all" ||
          categoryFilter !== "all" ||
          contributorFilter !== "all"
        }
        onClear={() => {
          setSearch("");
          setFilter("all");
          setCategoryFilter("all");
          setContributorFilter("all");
        }}
      >
        <label>
          <span className="sr-only">Filter by section</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className={adminFilterSelectClass}
          >
            <option value="all">All sections</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by contributor</span>
          <select
            value={contributorFilter}
            onChange={(event) => setContributorFilter(event.target.value)}
            className={adminFilterSelectClass}
          >
            <option value="all">All contributors</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      </AdminFilterToolbar>

      <AdminCard className="p-0 sm:p-0">
        <ul className="divide-y divide-border md:hidden">
          {visibleArticles.map((article) => (
            <li key={article.id} className="min-w-0 p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <p className="min-w-0 flex-1 text-sm font-semibold wrap-break-word">{article.title}</p>
                <Pill tone={article.is_published ? "green" : "grey"}>
                  {article.is_published ? "Live" : "Draft"}
                </Pill>
              </div>
              <p className="mt-2 text-xs wrap-break-word text-muted-foreground">
                {article.categories?.name ?? "-"} · {article.contributors?.name ?? "-"}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatDate(article.published_at ?? article.created_at)} ·{" "}
                  <span className="tabular-nums">{views[article.id] ?? 0}</span> reads
                </span>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${article.title}`}
                    onClick={() => {
                      setEditing(article);
                      setValues(toFormValues(article));
                    }}
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
              </div>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="border-b-2 border-ink bg-cream">
              <tr>
                <th className="label-xs px-4 py-3">Title</th>
                <th className="label-xs px-4 py-3">Section</th>
                <th className="label-xs px-4 py-3">Author</th>
                <th className="label-xs px-4 py-3">Date</th>
                <th className="label-xs px-4 py-3">
                  <span className="sr-only">Reads</span>
                  <Eye className="h-4 w-4" aria-label="Reads" />
                </th>
                <th className="label-xs px-4 py-3">Status</th>
                <th className="label-xs px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleArticles.map((article) => (
                <tr key={article.id}>
                  <td className="max-w-xs truncate px-4 py-3 font-semibold">{article.title}</td>
                  <td className="px-4 py-3">{article.categories?.name ?? "-"}</td>
                  <td className="px-4 py-3">{article.contributors?.name ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(article.published_at ?? article.created_at)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{views[article.id] ?? 0}</td>
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
                        onClick={() => {
                          setEditing(article);
                          setValues(toFormValues(article));
                        }}
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
        {!isLoading && visibleArticles.length === 0 && (
          <AdminEmpty message="No content matches these filters." />
        )}
      </AdminCard>

    </div>
  );
}
