import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicRequestKey } from "@/lib/request-protection.server";

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(1).max(120),
  message: z.string().trim().min(1).max(20000),
  website: z.string().max(200).optional().default(""),
});

const ADMIN_EMAIL = "submissions@babasandbrasse.co.za";
const FROM_ADDRESS = "Babas & Brasse <submissions@babasandbrasse.co.za>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(payload: {
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
}) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from: FROM_ADDRESS, ...payload }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[contact] Resend request failed [${response.status}]: ${body}`);
  }
}

const shell = (inner: string) => `
  <div style="font-family:Georgia,'Times New Roman',serif;background:#f6f1e7;padding:32px;">
    <div style="max-width:600px;margin:0 auto;background:#fffdf8;border:2px solid #14110f;padding:32px;">
      <p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#1f3d2b;">Babas &amp; Brasse</p>
      ${inner}
    </div>
  </div>`;

export const submitContactForm = createServerFn({ method: "POST" })
  .validator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const requestKey = await publicRequestKey();
    const { error } = await supabaseAdmin.rpc("submit_public_contact", {
      _name: data.name,
      _email: data.email,
      _subject: data.subject,
      _message: data.message,
      _request_key: requestKey,
    });
    if (error) {
      if (/too many/i.test(error.message)) throw new Error(error.message);
      throw new Error("We could not send that submission. Please try again shortly.");
    }

    const safe = {
      name: escapeHtml(data.name),
      email: escapeHtml(data.email),
      subject: escapeHtml(data.subject),
      message: escapeHtml(data.message).replace(/\n/g, "<br />"),
    };

    await Promise.all([
      sendEmail({
        to: [ADMIN_EMAIL],
        reply_to: data.email,
        subject: `New submission: ${data.subject} — ${data.name}`,
        html: shell(`
          <h1 style="margin:0 0 8px;font-size:26px;color:#14110f;">New submission</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#4b4740;">${safe.subject}</p>
          <p style="margin:0 0 4px;font-size:15px;color:#14110f;"><strong>${safe.name}</strong></p>
          <p style="margin:0 0 24px;font-size:15px;"><a href="mailto:${safe.email}" style="color:#1f3d2b;">${safe.email}</a></p>
          <div style="border-left:3px solid #14110f;padding-left:16px;font-size:16px;line-height:1.6;color:#14110f;">${safe.message}</div>
        `),
      }),
      sendEmail({
        to: [data.email],
        reply_to: ADMIN_EMAIL,
        subject: "Submission sent successfully — Babas & Brasse",
        html: shell(`
          <h1 style="margin:0 0 16px;font-size:26px;color:#14110f;">Thanks, ${safe.name}</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#14110f;">Your submission has been received and is now with our editors for review. We read everything that comes through, and one of our editors will be in touch if it's a fit.</p>
          <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#1f3d2b;">Your subject</p>
          <p style="margin:0 0 24px;font-size:16px;color:#14110f;">${safe.subject}</p>
          <div style="border-left:3px solid #14110f;padding-left:16px;font-size:15px;line-height:1.6;color:#4b4740;">${safe.message}</div>
          <p style="margin:24px 0 0;font-size:15px;color:#4b4740;">— The Babas &amp; Brasse editors</p>
        `),
      }),
    ]);

    return { ok: true };
  });
