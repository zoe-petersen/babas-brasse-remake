import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

const SITE_URL = "https://babasandbrasse.co.za";
// Article templates gained structured data, place links and image sitemap entries on this date.
const ARTICLE_TEMPLATE_LASTMOD = "2026-08-28";

type SitemapEntry = {
  path: string;
  lastmod?: string | null;
  image?: string | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, `${SITE_URL}/`).toString();
  } catch {
    return null;
  }
}

function createSitemap(entries: SitemapEntry[]) {
  const urls = entries
    .map(({ path, lastmod, image }) => {
      const imageUrl = image ? absoluteUrl(image) : null;
      return `
  <url>
    <loc>${SITE_URL}${escapeXml(path)}</loc>${
      lastmod
        ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>`
        : ""
    }${
      imageUrl
        ? `
    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
    </image:image>`
        : ""
    }
  </url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}
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
          { path: "/places" },
          { path: "/contributors" },
          { path: "/photography" },
          { path: "/privacy-policy", lastmod: "2026-08-27" },
          { path: "/terms-and-conditions", lastmod: "2026-08-27" },
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

        const [{ data: articles }, { data: contributors }, { data: photographs }] =
          await Promise.all([
            supabase
              .from("articles")
              .select(
                "slug, published_at, updated_at, cover_image_url, categories:category_id(slug), article_places(places:place_id(slug, updated_at))",
              )
              .eq("is_published", true),
            supabase.from("contributors").select("slug, updated_at").eq("is_published", true),
            supabase.from("photographs").select("id, updated_at").eq("is_published", true),
          ]);

        const articleRows = (articles ?? []) as unknown as Array<{
          slug: string;
          published_at: string | null;
          updated_at: string;
          cover_image_url: string | null;
          categories: { slug: string } | null;
          article_places: Array<{
            places: { slug: string; updated_at: string } | null;
          }>;
        }>;
        const placeLastModified = new Map<string, string>();
        for (const article of articleRows) {
          for (const relation of article.article_places) {
            const place = relation.places;
            if (!place) continue;
            const lastmod =
              article.updated_at > place.updated_at ? article.updated_at : place.updated_at;
            const existing = placeLastModified.get(place.slug);
            if (!existing || lastmod > existing) placeLastModified.set(place.slug, lastmod);
          }
        }

        const dynamicEntries: SitemapEntry[] = [
          ...articleRows.map((article) => ({
            path: `/content/${article.categories?.slug ?? "uncategorised"}/${article.slug}`,
            lastmod:
              article.updated_at > ARTICLE_TEMPLATE_LASTMOD
                ? article.updated_at
                : ARTICLE_TEMPLATE_LASTMOD,
            image: article.cover_image_url,
          })),
          ...[...placeLastModified].map(([slug, lastmod]) => ({
            path: `/places/${slug}`,
            lastmod,
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
