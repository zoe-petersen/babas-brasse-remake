import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
};

export type Contributor = {
  id: string;
  name: string;
  slug: string;
  role_title: string | null;
  bio: string | null;
  image_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
  is_team: boolean;
  sort_order: number;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  image_credit: string | null;
  read_minutes: number;
  published_at: string | null;
  is_editors_pick: boolean;
  is_featured: boolean;
  categories: Pick<Category, "id" | "name" | "slug"> | null;
  contributors: Pick<Contributor, "id" | "name" | "slug" | "role_title" | "bio"> | null;
};

export type Photograph = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  credit: string | null;
  taken_on: string | null;
  created_at?: string | null;
};

export type ApprovedComment = {
  id: string;
  author_name: string;
  author_surname: string | null;
  body: string;
  created_at: string;
};

const ARTICLE_SELECT = `
  id, title, slug, excerpt, body, cover_image_url, image_credit, read_minutes,
  published_at, is_editors_pick, is_featured,
  categories:category_id ( id, name, slug ),
  contributors:contributor_id ( id, name, slug, role_title, bio )
`;

export async function fetchArticles(options?: { categorySlug?: string; limit?: number }) {
  let query = supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Article[];
  if (!options?.categorySlug) return rows;
  return rows.filter((a) => a.categories?.slug === options.categorySlug);
}

export async function fetchArticle(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as Article | null) ?? null;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function fetchContributors(team: boolean) {
  const { data, error } = await supabase
    .from("contributors")
    .select("*")
    .eq("is_team", team)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Contributor[];
}

export async function fetchContributor(slug: string) {
  const { data, error } = await supabase
    .from("contributors")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Contributor | null) ?? null;
}

export async function fetchPhotographs() {
  const { data, error } = await supabase
    .from("photographs")
    .select("id, image_url, title, caption, credit, taken_on, created_at")
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Photograph[];
}

export async function fetchPhotograph(id: string) {
  const { data, error } = await supabase
    .from("photographs")
    .select("id, image_url, title, caption, credit, taken_on, created_at")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Photograph | null) ?? null;
}

export async function fetchArticleViews(articleId: string) {
  const { data, error } = await supabase
    .from("article_views")
    .select("views")
    .eq("article_id", articleId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Number((data as { views: number } | null)?.views ?? 0);
}

export async function registerArticleView(articleId: string) {
  const { data, error } = await supabase.rpc("increment_article_view", {
    _article_id: articleId,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}

export async function fetchApprovedComments(articleId: string) {
  const { data, error } = await supabase
    .from("approved_comments")
    .select("id, author_name, author_surname, body, created_at")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ApprovedComment[];
}

export const articlesQuery = (options?: { categorySlug?: string; limit?: number }) =>
  queryOptions({
    queryKey: ["articles", options?.categorySlug ?? "all", options?.limit ?? 0],
    queryFn: () => fetchArticles(options),
  });

export const articleQuery = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => fetchArticle(slug) });

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: fetchCategories });

export const contributorsQuery = (team: boolean) =>
  queryOptions({ queryKey: ["contributors", team], queryFn: () => fetchContributors(team) });

export const contributorQuery = (slug: string) =>
  queryOptions({ queryKey: ["contributor", slug], queryFn: () => fetchContributor(slug) });

export const photographsQuery = () =>
  queryOptions({ queryKey: ["photographs"], queryFn: fetchPhotographs });

export const photographQuery = (id: string) =>
  queryOptions({ queryKey: ["photograph", id], queryFn: () => fetchPhotograph(id) });

export const articleViewsQuery = (articleId: string) =>
  queryOptions({
    queryKey: ["article-views", articleId],
    queryFn: () => fetchArticleViews(articleId),
  });

export const commentsQuery = (articleId: string) =>
  queryOptions({
    queryKey: ["comments", articleId],
    queryFn: () => fetchApprovedComments(articleId),
  });

export function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value)
    .toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    .toUpperCase();
}

export function formatLongDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
