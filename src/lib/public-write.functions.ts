import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicRequestKey } from "@/lib/request-protection.server";

const honeypot = z.string().max(200).optional().default("");

const commentSchema = z.object({
  articleId: z.string().uuid(),
  authorName: z.string().trim().min(1).max(120),
  authorSurname: z.string().trim().max(120),
  authorEmail: z.string().trim().email().max(200),
  body: z.string().trim().min(1).max(5000),
  website: honeypot,
});

const viewSchema = z.object({ articleId: z.string().uuid() });

function publicWriteError(message: string) {
  if (/too many/i.test(message)) return new Error(message);
  return new Error("We could not process that request. Please try again shortly.");
}

export const submitPublicComment = createServerFn({ method: "POST" })
  .validator((data: unknown) => commentSchema.parse(data))
  .handler(async ({ data }) => {
    // Silently accept bot-filled honeypots without creating rows or revealing the trap.
    if (data.website) return { ok: true };

    const [{ supabaseAdmin }, requestKey] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      publicRequestKey(),
    ]);
    const { error } = await supabaseAdmin.rpc("submit_public_comment", {
      _article_id: data.articleId,
      _author_name: data.authorName,
      _author_surname: data.authorSurname,
      _author_email: data.authorEmail,
      _body: data.body,
      _request_key: requestKey,
    });
    if (error) throw publicWriteError(error.message);
    return { ok: true };
  });

export const registerPublicArticleView = createServerFn({ method: "POST" })
  .validator((data: unknown) => viewSchema.parse(data))
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, viewerKey] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      publicRequestKey(),
    ]);
    const { data: views, error } = await supabaseAdmin.rpc("register_public_article_view", {
      _article_id: data.articleId,
      _viewer_key: viewerKey,
    });
    if (error) throw publicWriteError(error.message);
    return Number(views ?? 0);
  });
