import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminContributorsQuery,
  createContributor,
  deleteContributor,
  emptyContributor,
  slugify,
  toContributorForm,
  updateContributor,
  type ContributorFormValues,
} from "@/lib/admin";
import { initials, type Contributor } from "@/lib/magazine";
import {
  AdminCard,
  AdminEmpty,
  AdminHeading,
  AdminModal,
  AdminPublicationFilter,
  Pill,
  adminInputClass as inputClass,
  type PublicationFilter,
} from "@/components/admin/AdminUI";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/contributors")({
  component: ContributorsAdminPage,
});

const SOCIALS = [
  ["instagram_url", "Instagram URL"],
  ["facebook_url", "Facebook URL"],
  ["twitter_url", "Twitter / X URL"],
  ["tiktok_url", "TikTok URL"],
  ["linkedin_url", "LinkedIn URL"],
] as const;

function ContributorsAdminPage() {
  const queryClient = useQueryClient();
  const { data: people = [], isLoading } = useQuery(adminContributorsQuery());
  const [editing, setEditing] = useState<Contributor | null>(null);
  const [values, setValues] = useState<ContributorFormValues | null>(null);
  const [filter, setFilter] = useState<PublicationFilter>("all");
  const visiblePeople = people.filter((person) =>
    filter === "all" ? true : filter === "live" ? person.is_published : !person.is_published,
  );

  function close() {
    setValues(null);
    setEditing(null);
  }

  function update<K extends keyof ContributorFormValues>(key: K, value: ContributorFormValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "contributors"] });
    queryClient.invalidateQueries({ queryKey: ["contributors"] });
    queryClient.invalidateQueries({ queryKey: ["contributor"] });
  };

  const save = useMutation({
    mutationFn: async (form: ContributorFormValues) => {
      if (editing) await updateContributor(editing.id, form);
      else await createContributor(form);
    },
    onSuccess: () => {
      toast.success(editing ? "Contributor updated" : "Contributor added");
      invalidate();
      close();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deleteContributor,
    onSuccess: () => {
      toast.success("Contributor deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-8">
      <AdminHeading
        title="Contributors"
        description="Manage writers, photographers and the creative team."
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setValues(emptyContributor());
            }}
            className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-magenta px-4 py-3 text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        }
      />

      {values && (
        <AdminModal wide title={editing ? "Edit contributor" : "New contributor"} onClose={close}>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(values);
            }}
          >
            <div className="sm:col-span-2">
              <ImageUpload
                label="Profile image (initials shown when empty)"
                folder="contributors"
                value={values.image_url}
                onChange={(url) => update("image_url", url)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                required
                className={inputClass}
                value={values.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setValues((prev) =>
                    prev ? { ...prev, name, slug: editing ? prev.slug : slugify(name) } : prev,
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
              <label className="label-xs" htmlFor="role">
                Role title
              </label>
              <input
                id="role"
                className={inputClass}
                value={values.role_title}
                onChange={(e) => update("role_title", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                rows={5}
                className={inputClass}
                value={values.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </div>

            {SOCIALS.map(([key, label]) => (
              <div key={key}>
                <label className="label-xs" htmlFor={key}>
                  {label}
                </label>
                <input
                  id={key}
                  className={inputClass}
                  placeholder="https://…"
                  value={values[key]}
                  onChange={(e) => update(key, e.target.value)}
                />
              </div>
            ))}

            <div>
              <label className="label-xs" htmlFor="order">
                Sort order
              </label>
              <input
                id="order"
                type="number"
                className={inputClass}
                value={values.sort_order}
                onChange={(e) => update("sort_order", Number(e.target.value))}
              />
            </div>

            <label className="label-xs flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-forest"
                checked={values.is_team}
                onChange={(e) => update("is_team", e.target.checked)}
              />
              Part of the creative team
            </label>

            <label className="label-xs flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-forest"
                checked={values.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
              />
              Live on the public site
            </label>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
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

      <AdminPublicationFilter value={filter} onChange={setFilter} records={people} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePeople.map((person) => (
          <AdminCard key={person.id}>
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border-2 border-ink bg-cream font-display text-lg">
                {person.image_url ? (
                  <img
                    src={person.image_url}
                    alt={person.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials(person.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{person.name}</p>
                <p className="label-xs mt-1 text-muted-foreground">{person.role_title ?? "-"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill tone={person.is_published ? "green" : "grey"}>
                    {person.is_published ? "Live" : "Draft"}
                  </Pill>
                  <Pill tone={person.is_team ? "green" : "grey"}>
                    {person.is_team ? "Team" : "Contributor"}
                  </Pill>
                </div>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{person.bio}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                aria-label={`Edit ${person.name}`}
                onClick={() => {
                  setEditing(person);
                  setValues(toContributorForm(person));
                }}
                className="border-2 border-ink p-2 hover:bg-cream"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${person.name}`}
                onClick={() => {
                  if (confirm(`Delete ${person.name}?`)) remove.mutate(person.id);
                }}
                className="border-2 border-destructive p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </AdminCard>
        ))}
      </div>
      {!isLoading && visiblePeople.length === 0 && (
        <AdminEmpty message={`No ${filter === "all" ? "" : `${filter} `}contributors.`} />
      )}
    </div>
  );
}
