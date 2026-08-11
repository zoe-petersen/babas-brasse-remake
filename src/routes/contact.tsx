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
  "General Enquiry",
  "Literature",
  "Opinion",
  "Interviews",
  "Short Stories",
  "Theatre",
  "Fashion",
  "Music",
  "Art",
  "Articles",
];

const SUBMISSION_PROMPTS = [
  "Do you have a burning desire to tell a story?",
  "Do you have an opinion on a topic that you would like to share?",
  "Is there a piece of art, fashion, or literature that you would like to have archived? Or would you like one of our resident writers to interview you, cover your next project, or review your work?",
];

const GUIDELINES = [
  "Fill in the below with a clear subject line.",
  "Please clearly indicate the nature of your submission, for example: press release, theatre review, interview request, book review, photography submission, artwork submission, literary submission, or event coverage request.",
  "Due to the high volume of submissions, we encourage you to keep your submission concise, with a minimum of 100 words.",
  "Thereafter, one of our editors will contact you. Thank you for choosing Babas and Brasse.",
];

const MINIMUM_WORDS = 100;

function countWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const wordCount = countWords(form.message);

  const mutation = useMutation({
    mutationFn: async () => {
      if (wordCount < MINIMUM_WORDS) {
        throw new Error(`Please enter at least ${MINIMUM_WORDS} words.`);
      }
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
            <div className="mt-6 space-y-4">
              {SUBMISSION_PROMPTS.map((prompt) => (
                <p
                  key={prompt}
                  className="border-t border-primary-foreground/20 pt-4 font-body text-base opacity-90"
                >
                  {prompt}
                </p>
              ))}
            </div>
            <ul className="mt-6 space-y-4">
              {GUIDELINES.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 border-t border-primary-foreground/20 pt-4 font-body text-base opacity-90"
                >
                  <span className="label-xs text-magenta">
                    {String(index + 1).padStart(2, "0")}
                  </span>
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
            className="self-start border-2 border-ink bg-background p-6 sm:p-8"
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
              <label className="font-sabon block text-[17px] font-semibold">
                Subject
                <select
                  required
                  value={form.subject}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  className="font-sabon mt-2 w-full border-2 border-ink bg-cream p-3 text-[17px] font-normal outline-none focus:border-magenta"
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
            <label className="font-sabon mt-5 block text-[17px] font-semibold">
              Message
              <textarea
                required
                rows={7}
                aria-describedby="message-word-count"
                aria-invalid={wordCount > 0 && wordCount < MINIMUM_WORDS}
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className="font-sabon mt-2 w-full border-2 border-ink bg-cream p-3 text-[17px] font-normal outline-none focus:border-magenta"
              />
              <span
                id="message-word-count"
                className={`mt-2 block text-sm font-normal ${
                  wordCount >= MINIMUM_WORDS ? "text-forest-deep" : "text-muted-foreground"
                }`}
              >
                {wordCount} / {MINIMUM_WORDS} words minimum
              </span>
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
    <label className="font-sabon block text-[17px] font-semibold">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="font-sabon mt-2 w-full border-2 border-ink bg-cream p-3 text-[17px] font-normal outline-none focus:border-magenta"
      />
    </label>
  );
}
