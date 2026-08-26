import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

const SITE_URL = "https://babasandbrasse.co.za";

type SitemapEntry = {
  path: string;
  lastmod?: string | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSitemap(entries: SitemapEntry[]) {
  const urls = entries
    .map(
      ({ path, lastmod }) => `
  <url>
    <loc>${SITE_URL}${escapeXml(path)}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
        const publishableKey =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

        const staticEntries: SitemapEntry[] = [
          { path: "/" },
          { path: "/about" },
          { path: "/contact" },
          { path: "/content" },
          { path: "/contributors" },
          { path: "/photography" },
        ];

        if (!supabaseUrl || !publishableKey) {
          return new Response(createSitemap(staticEntries), {
            headers: {
              "Cache-Control": "public, max-age=300",
              "Content-Type": "application/xml; charset=utf-8",
            },
          });
        }

        const supabase = createClient<Database>(supabaseUrl, publishableKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const [{ data: articles }, { data: contributors }, { data: photographs }] = await Promise.all([
          supabase
            .from("articles")
            .select("slug, published_at, categories:category_id(slug)")
            .eq("is_published", true),
          supabase
            .from("contributors")
            .select("slug, updated_at")
            .eq("is_published", true),
          supabase
            .from("photographs")
            .select("id, updated_at")
            .eq("is_published", true),
        ]);

        const dynamicEntries: SitemapEntry[] = [
          ...((articles ?? []) as Array<{
            slug: string;
            published_at: string | null;
            categories: { slug: string } | null;
          }>).map((article) => ({
            path: `/content/${article.categories?.slug ?? "uncategorised"}/${article.slug}`,
            lastmod: article.published_at,
          })),
          ...((contributors ?? []) as Array<{ slug: string; updated_at: string | null }>).map(
            (contributor) => ({
              path: `/contributors/${contributor.slug}`,
              lastmod: contributor.updated_at,
            }),
          ),
          ...((photographs ?? []) as Array<{ id: string; updated_at: string | null }>).map(
            (photograph) => ({
              path: `/photography/${photograph.id}`,
              lastmod: photograph.updated_at,
            }),
          ),
        ];

        return new Response(createSitemap([...staticEntries, ...dynamicEntries]), {
          headers: {
            "Cache-Control": "public, max-age=300",
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});
