import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Babas & Brasse" },
      {
        name: "description",
        content:
          "Pitch a story, submit photography, or send a letter to the editors of Babas & Brasse.",
      },
      { property: "og:title", content: "Contact Us — Babas & Brasse" },
      { property: "og:description", content: "Send your submission or pitch to the editors." },
    ],
  }),
  component: ContactPage,
});

const EMPTY = { name: "", email: "", subject: "", message: "" };

const GUIDELINES = [
  "Pitches should be a short paragraph — the idea, why now, and why you.",
  "Reviews run 600–1200 words. Essays can stretch further if the argument earns it.",
  "Photography submissions: 5–10 images, high resolution, with captions and credits.",
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
      toast.success("Thanks — your submission is with the editors.");
      setForm(EMPTY);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div>
      <section className="border-b-2 border-ink bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="label-xs text-forest">Get in touch</p>
          <h1 className="mt-3 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">Contact us</h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Have a pitch, a photo essay, a correction or a strong opinion? Send it through.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate();
            }}
            className="border-2 border-ink bg-background p-6 sm:p-8"
          >
            <h2 className="text-3xl">Send your submission</h2>
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
              <Field
                label="Subject"
                value={form.subject}
                onChange={(value) => setForm((prev) => ({ ...prev, subject: value }))}
              />
            </div>
            <label className="label-xs mt-5 block">
              Message
              <textarea
                required
                rows={7}
                value={form.message}
                onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                className="mt-2 w-full border-2 border-ink bg-cream p-3 font-body text-sm font-normal normal-case tracking-normal outline-none focus:border-magenta"
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

          <aside className="border-2 border-ink bg-forest p-8 text-primary-foreground">
            <h2 className="font-display text-3xl">Submission guidelines</h2>
            <ul className="mt-6 space-y-4">
              {GUIDELINES.map((item, index) => (
                <li key={item} className="flex gap-3 border-t border-primary-foreground/20 pt-4 text-sm opacity-90">
                  <span className="label-xs text-magenta">{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="label-xs mt-8 text-magenta">hello@babasenbrasse.co.za</p>
          </aside>
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
    <label className="label-xs block">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border-2 border-ink bg-cream p-3 font-body text-sm font-normal normal-case tracking-normal outline-none focus:border-magenta"
      />
    </label>
  );
}
