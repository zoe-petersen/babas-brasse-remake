import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Babas & Brasse" },
      {
        name: "description",
        content:
          "Pitch a story, submit photography, or send a letter to the editors of Babas & Brasse.",
      },
      { property: "og:title", content: "Contact Us | Babas & Brasse" },
      { property: "og:description", content: "Send your submission or pitch to the editors." },
    ],
  }),
  component: ContactPage,
});

const EMPTY = { name: "", email: "", subject: "", message: "" };

const SUBJECTS = [
  "Article Submission",
  "Photography Submission",
  "Poetry Submission",
  "Short Story Submission",
  "Collaboration",
  "General Enquiry",
  "Other",
];

const GUIDELINES = [
  "Pitches should be a short paragraph - the idea, why now, and why you.",
  "Reviews run 600-1200 words. Essays can stretch further if the argument earns it.",
  "Photography submissions: 5-10 images, high resolution, with captions and credits.",
  "We respond to everything we can within two weeks.",
];

function ContactPage() {
  const [form, setForm] = useState(EMPTY);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contact_submissions").insert(form);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Thanks - your submission is with the editors.");
      setForm(EMPTY);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <aside className="border-2 border-ink bg-forest p-8 text-primary-foreground">
            <p className="label-xs text-magenta">Get in touch</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl">Contact us</h1>
            <p className="mt-5 font-body text-base opacity-90">
              Have a pitch, a photo essay, a correction or a strong opinion? Send it through.
            </p>
            <h2 className="mt-10 font-display text-2xl">Submission guidelines</h2>
            <ul className="mt-6 space-y-4">
              {GUIDELINES.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 border-t border-primary-foreground/20 pt-4 font-body text-base opacity-90"
                >
                  <span className="label-xs text-magenta">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="label-xs mt-8 text-magenta">hello@babasenbrasse.co.za</p>
          </aside>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
            className="border-2 border-ink bg-background p-6 sm:p-8"
          >
            <h2 className="font-display text-3xl sm:text-4xl">Send your submission</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field
                label="Name"
                value={form.name}
                onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
              />
            </div>
            <div className="mt-5">
              <label className="block font-body text-base font-semibold">
                Subject
                <select
                  required
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  className="mt-2 w-full border-2 border-ink bg-cream p-3 font-body text-base outline-none focus:border-magenta"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-5 block font-body text-base font-semibold">
              Message
              <textarea
                required
                rows={7}
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className="mt-2 w-full border-2 border-ink bg-cream p-3 font-body text-base font-normal outline-none focus:border-magenta"
              />
            </label>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="label-xs mt-6 border-2 border-ink bg-magenta px-6 py-3 text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {mutation.isPending ? "Sending..." : "Send submission"}
            </button>
          </form>
        </div>
      </section>
    </div>
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
    <label className="block font-body text-base font-semibold">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border-2 border-ink bg-cream p-3 font-body text-base font-normal outline-none focus:border-magenta"
      />
    </label>
  );
}
