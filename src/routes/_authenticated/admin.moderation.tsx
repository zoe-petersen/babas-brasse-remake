import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  adminCommentsQuery,
  deleteComment,
  setCommentStatus,
  type AdminComment,
} from "@/lib/admin";
import { formatDate } from "@/lib/magazine";
import { AdminCard, AdminEmpty, AdminHeading, Pill } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/moderation")({
  component: ModerationPage,
});

const FILTERS = ["pending", "approved", "rejected", "all"] as const;
type Filter = (typeof FILTERS)[number];

function ModerationPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("pending");
  const { data: comments = [] } = useQuery(adminCommentsQuery());

  const visible = comments.filter((c) => (filter === "all" ? true : c.status === filter));

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    queryClient.invalidateQueries({ queryKey: ["comments"] });
  };

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AdminComment["status"] }) =>
      setCommentStatus(id, status),
    onSuccess: (_data, vars) => {
      toast.success(vars.status === "approved" ? "Comment approved" : "Comment rejected");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast.success("Comment deleted");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <AdminHeading
        title="Moderation"
        description="Comments only reach the public site once you approve them."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={cn(
              "label-xs border-2 border-ink px-4 py-2 capitalize",
              filter === option ? "bg-ink text-background" : "bg-background hover:bg-cream",
            )}
          >
            {option}
            {option !== "all" && (
              <span className="ml-2 opacity-70">
                {comments.filter((c) => c.status === option).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((comment) => (
          <AdminCard key={comment.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{comment.author_name}</p>
                <p className="label-xs mt-1 text-muted-foreground">
                  {comment.author_email} · {formatDate(comment.created_at)}
                </p>
                <p className="label-xs mt-1 text-forest-deep">
                  On: {comment.articles?.title ?? "Unknown article"}
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
            </div>

            <p className="mt-4 whitespace-pre-line border-l-2 border-ink pl-4 text-sm">
              {comment.body}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {comment.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => setStatus.mutate({ id: comment.id, status: "approved" })}
                  className="label-xs inline-flex items-center gap-2 border-2 border-ink bg-forest px-4 py-2 text-primary-foreground"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
              )}
              {comment.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => setStatus.mutate({ id: comment.id, status: "rejected" })}
                  className="label-xs inline-flex items-center gap-2 border-2 border-ink px-4 py-2"
                >
                  <X className="h-3.5 w-3.5" />
                  Reject
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this comment permanently?")) remove.mutate(comment.id);
                }}
                className="label-xs inline-flex items-center gap-2 border-2 border-destructive px-4 py-2 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </AdminCard>
        ))}
        {visible.length === 0 && <AdminEmpty message={`No ${filter} comments.`} />}
      </div>
    </div>
  );
}