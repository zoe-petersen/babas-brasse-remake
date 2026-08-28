import logoAsset from "@/assets/logo.png";
import type { Article } from "@/lib/magazine";

export const SITE_NAME = "Babas & Brasse";
export const SITE_URL = "https://babasandbrasse.co.za";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export function absoluteSiteUrl(value: string) {
  return new URL(value, `${SITE_URL}/`).toString();
}

export function articlePath(article: Pick<Article, "categories" | "slug">) {
  return `/content/${article.categories?.slug ?? "uncategorised"}/${article.slug}`;
}

export function articleCanonicalUrl(article: Pick<Article, "categories" | "slug">) {
  return absoluteSiteUrl(articlePath(article));
}

export function articleSeoTitle(article: Pick<Article, "seo_title" | "title">) {
  return article.seo_title?.trim() || article.title;
}

export function articleSeoDescription(article: Pick<Article, "seo_description" | "excerpt">) {
  return (
    article.seo_description?.trim() ||
    article.excerpt?.trim() ||
    "A story from Babas & Brasse, an independent South African arts and culture magazine."
  );
}

export function publisherJsonLd() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    alternateName: "Babas and Brasse",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteSiteUrl(logoAsset),
    },
    email: "submissions@babasandbrasse.co.za",
    description:
      "An independent South African arts and culture magazine showcasing local creative work and cultural expression.",
  };
}
