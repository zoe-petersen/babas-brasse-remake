import { createFileRoute } from "@tanstack/react-router";

function encodeStoragePath(path: string) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..") || path.includes("\\")) {
          return new Response("Not found", { status: 404 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];

        if (!supabaseUrl || !publishableKey) {
          console.error(
            "[Supabase] Public media proxy is missing its server environment variables.",
          );
          return new Response("Media service unavailable", { status: 503 });
        }

        const response = await fetch(
          `${supabaseUrl}/storage/v1/object/authenticated/media/${encodeStoragePath(path)}`,
          {
            headers: {
              apikey: publishableKey,
              Authorization: `Bearer ${publishableKey}`,
              ...(request.headers.get("if-none-match")
                ? { "If-None-Match": request.headers.get("if-none-match")! }
                : {}),
              ...(request.headers.get("if-modified-since")
                ? { "If-Modified-Since": request.headers.get("if-modified-since")! }
                : {}),
            },
          },
        );

        if (response.status === 304) {
          return new Response(null, {
            status: 304,
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
              "CDN-Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }

        if (!response.ok || !response.body) {
          return new Response("Not found", { status: response.status === 404 ? 404 : 502 });
        }

        const headers = new Headers({
          "Content-Type": response.headers.get("content-type") || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
          "CDN-Cache-Control": "public, max-age=31536000, immutable",
        });
        for (const name of ["etag", "last-modified", "content-length", "accept-ranges"]) {
          const value = response.headers.get(name);
          if (value) headers.set(name, value);
        }

        return new Response(response.body, {
          headers,
        });
      },
    },
  },
});
