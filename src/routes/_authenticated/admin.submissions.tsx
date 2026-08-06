import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Mail, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { setSubmissionHandled, submissionsQuery } from "@/lib/admin";
import { formatDate } from "@/lib/magazine";
import { AdminCard, AdminEmpty, AdminHeading, Pill } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: SubmissionsPage,
});

const FILTERS = ["open", "handled", "all"] as const;
type Filter = (typeof FILTERS)[number];

function SubmissionsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("open");
  const { data: submissions = [] } = useQuery(submissionsQuery());

  const visible = submissions.filter((s) =>
    filter === "all" ? true : filter === "open" ? !s.is_handled : s.is_handled,
  );

  const toggle = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      setSubmissionHandled(id, handled),
    onSuccess: () => {
      toast.success("Submission updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <AdminHeading title="Submissions" description="Messages sent through the contact form." />

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
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((submission) => (
          <AdminCard key={submission.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{submission.subject}</p>
                <p className="label-xs mt-1 text-muted-foreground">
                  {submission.name} · {formatDate(submission.created_at)}
                </p>
                <a
                  href={`mailto:${submission.email}`}
                  className="label-xs mt-1 inline-flex items-center gap-2 text-forest"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {submission.email}
                </a>
              </div>
              <Pill tone={submission.is_handled ? "green" : "amber"}>
                {submission.is_handled ? "Handled" : "Open"}
              </Pill>
            </div>

            <p className="mt-4 whitespace-pre-line border-l-2 border-ink pl-4 text-sm">
              {submission.message}
            </p>

            <button
              type="button"
              onClick={() => toggle.mutate({ id: submission.id, handled: !submission.is_handled })}
              className="label-xs mt-4 inline-flex items-center gap-2 border-2 border-ink px-4 py-2 hover:bg-cream"
            >
              {submission.is_handled ? (
                <>
                  <Undo2 className="h-3.5 w-3.5" /> Reopen
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" /> Mark handled
                </>
              )}
            </button>
          </AdminCard>
        ))}
        {visible.length === 0 && <AdminEmpty message={`No ${filter} submissions.`} />}
      </div>
    </div>
  );
}