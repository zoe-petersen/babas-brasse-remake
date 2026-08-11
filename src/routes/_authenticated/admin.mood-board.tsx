import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  adminPhotographsQuery,
  createPhotograph,
  deletePhotograph,
  emptyPhotograph,
  toPhotographForm,
  updatePhotograph,
  type AdminPhotograph,
  type PhotographFormValues,
} from "@/lib/admin";
import { formatDate } from "@/lib/magazine";
import {
  AdminCard,
  AdminEmpty,
  AdminHeading,
  AdminModal,
  Pill,
  adminInputClass as inputClass,
} from "@/components/admin/AdminUI";
import { ImageUpload } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/_authenticated/admin/mood-board")({
  component: MoodBoardAdminPage,
});

function MoodBoardAdminPage() {
  const queryClient = useQueryClient();
  const { data: photos = [], isLoading } = useQuery(adminPhotographsQuery());
  const [editing, setEditing] = useState<AdminPhotograph | null>(null);
  const [values, setValues] = useState<PhotographFormValues | null>(null);

  function close() {
    setValues(null);
    setEditing(null);
  }

  function update<K extends keyof PhotographFormValues>(key: K, value: PhotographFormValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "photographs"] });
    queryClient.invalidateQueries({ queryKey: ["photographs"] });
    queryClient.invalidateQueries({ queryKey: ["photograph"] });
  };

  const save = useMutation({
    mutationFn: async (form: PhotographFormValues) => {
      if (editing) await updatePhotograph(editing.id, form);
      else await createPhotograph(form);
    },
    onSuccess: () => {
      toast.success(editing ? "Photograph updated" : "Photograph added");
      invalidate();
      close();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deletePhotograph,
    onSuccess: () => {
      toast.success("Photograph deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-8">
      <AdminHeading
        title="Mood board"
        description="Curate the photography board with uploads, titles, dates and credits."
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setValues(emptyPhotograph());
            }}
            className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-magenta px-4 py-3 text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        }
      />

      {values && (
        <AdminModal title={editing ? "Edit photograph" : "New photograph"} onClose={close}>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(values);
            }}
          >
            <div className="sm:col-span-2">
              <ImageUpload
                label="Photograph"
                folder="mood-board"
                value={values.image_url}
                onChange={(url) => update("image_url", url)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="title">Title</label>
              <input
                id="title"
                className={inputClass}
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="taken">Date</label>
              <input
                id="taken"
                type="date"
                className={inputClass}
                value={values.taken_on}
                onChange={(e) => update("taken_on", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="credit">Photographer / credits</label>
              <input
                id="credit"
                className={inputClass}
                value={values.credit}
                onChange={(e) => update("credit", e.target.value)}
              />
            </div>

            <div>
              <label className="label-xs" htmlFor="order">Sort order</label>
              <input
                id="order"
                type="number"
                className={inputClass}
                value={values.sort_order}
                onChange={(e) => update("sort_order", Number(e.target.value))}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label-xs" htmlFor="caption">Caption</label>
              <textarea
                id="caption"
                rows={3}
                className={inputClass}
                value={values.caption}
                onChange={(e) => update("caption", e.target.value)}
              />
            </div>

            <label className="label-xs flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-forest"
                checked={values.is_published}
                onChange={(e) => update("is_published", e.target.checked)}
              />
              Published on the site
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
              <button type="button" onClick={close} className="label-xs border-2 border-ink px-5 py-3">
                Cancel
              </button>
            </div>
          </form>
        </AdminModal>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <AdminCard key={photo.id} className="p-0 sm:p-0">
            <div className="aspect-4/3 border-b-2 border-ink bg-cream">
              <img
                src={photo.image_url}
                alt={photo.title ?? "Photograph"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <p className="truncate font-semibold">{photo.title ?? "Untitled"}</p>
              <p className="label-xs mt-1 text-muted-foreground">
                {photo.credit ?? "—"}
                {photo.taken_on ? ` · ${formatDate(photo.taken_on)}` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Pill tone={photo.is_published ? "green" : "grey"}>
                  {photo.is_published ? "Live" : "Hidden"}
                </Pill>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${photo.title ?? "photograph"}`}
                    onClick={() => {
                      setEditing(photo);
                      setValues(toPhotographForm(photo));
                    }}
                    className="border-2 border-ink p-2 hover:bg-cream"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${photo.title ?? "photograph"}`}
                    onClick={() => {
                      if (confirm("Delete this photograph?")) remove.mutate(photo.id);
                    }}
                    className="border-2 border-destructive p-2 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
      {!isLoading && photos.length === 0 && <AdminEmpty message="No photographs yet." />}
    </div>
  );
}
