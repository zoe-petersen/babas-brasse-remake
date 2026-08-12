import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Mail, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { setSubmissionHandled, submissionsQuery } from "@/lib/admin";
import { formatDate } from "@/lib/magazine";
import {
  AdminCard,
  AdminEmpty,
  AdminFilterToolbar,
  AdminHeading,
  Pill,
  adminFilterSelectClass,
} from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: SubmissionsPage,
});

const FILTERS = ["open", "handled", "all"] as const;
type Filter = (typeof FILTERS)[number];

function SubmissionsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const { data: submissions = [] } = useQuery(submissionsQuery());

  const subjects = [...new Set(submissions.map((submission) => submission.subject))].sort();
  const normalizedSearch = search.trim().toLowerCase();
  const visible = submissions.filter((submission) => {
    const matchesStatus =
      filter === "all" ? true : filter === "open" ? !submission.is_handled : submission.is_handled;
    const matchesSubject = subjectFilter === "all" || submission.subject === subjectFilter;
    const matchesSearch =
      !normalizedSearch ||
      [submission.name, submission.email, submission.subject, submission.message].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    return matchesStatus && matchesSubject && matchesSearch;
  });

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
            <span className="ml-2 opacity-70">
              {
                submissions.filter((submission) =>
                  option === "all"
                    ? true
                    : option === "open"
                      ? !submission.is_handled
                      : submission.is_handled,
                ).length
              }
            </span>
          </button>
        ))}
      </div>

      <AdminFilterToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, subject or message..."
        hasActiveFilters={Boolean(search) || filter !== "all" || subjectFilter !== "all"}
        onClear={() => {
          setSearch("");
          setFilter("all");
          setSubjectFilter("all");
        }}
      >
        <label>
          <span className="sr-only">Filter submissions by subject</span>
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className={adminFilterSelectClass}
          >
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
      </AdminFilterToolbar>

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
                  className="label-xs mt-1 inline-flex items-center gap-2 text-forest-deep"
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
        {visible.length === 0 && <AdminEmpty message="No submissions match these filters." />}
      </div>
    </div>
  );
}
