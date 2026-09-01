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
  youtube_url: string | null;
  email: string | null;
  is_team: boolean;
  is_published: boolean;
  sort_order: number;
};

export type Place = {
  id: string;
  name: string;
  slug: string;
  updated_at: string;
};

export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  read_minutes: number;
  published_at: string | null;
  updated_at: string;
  is_editors_pick: boolean;
  is_featured: boolean;
  categories: Pick<Category, "id" | "name" | "slug"> | null;
  contributors: Pick<Contributor, "id" | "name" | "slug" | "image_url"> | null;
  author_name: string | null;
  article_places: Array<{ places: Place | null }>;
};

export type Article = ArticleSummary & {
  body: string | null;
  image_credit: string | null;
  seo_title: string | null;
  seo_description: string | null;
  contributors: Pick<
    Contributor,
    "id" | "name" | "slug" | "role_title" | "bio" | "image_url" | "email"
  > | null;
};

/** Prefers a linked contributor's name, falling back to the free-text author name. */
export function byline(article: {
  contributors?: { name: string } | null;
  author_name?: string | null;
}) {
  return article.contributors?.name ?? article.author_name ?? null;
}

/** Returns the distinct public places attached to a piece. */
export function placesForArticle(article: Pick<ArticleSummary, "article_places">) {
  const seen = new Set<string>();
  return article.article_places
    .map((relation) => relation.places)
    .filter((place): place is Place => {
      if (!place || seen.has(place.id)) return false;
      seen.add(place.id);
      return true;
    });
}

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

const ARTICLE_SUMMARY_SELECT = `
  id, title, slug, excerpt, cover_image_url, read_minutes,
  published_at, updated_at, is_editors_pick, is_featured, author_name,
  categories:category_id ( id, name, slug ),
  contributors:contributor_id ( id, name, slug, image_url ),
  article_places ( places:place_id ( id, name, slug, updated_at ) )
`;

const PLACE_ARTICLE_SUMMARY_SELECT = `
  id, title, slug, excerpt, cover_image_url, read_minutes,
  published_at, updated_at, is_editors_pick, is_featured, author_name,
  categories:category_id ( id, name, slug ),
  contributors:contributor_id ( id, name, slug, image_url ),
  article_places!inner ( place_id, places:place_id ( id, name, slug, updated_at ) )
`;

const ARTICLE_DETAIL_SELECT = `
  id, title, slug, excerpt, body, cover_image_url, image_credit, read_minutes,
  published_at, updated_at, seo_title, seo_description,
  is_editors_pick, is_featured, author_name,
  categories:category_id ( id, name, slug ),
  contributors:contributor_id ( id, name, slug, role_title, bio, image_url, email ),
  article_places ( places:place_id ( id, name, slug, updated_at ) )
`;

const PUBLIC_LIST_LIMIT = 1000;

export async function fetchArticles(options?: { categoryId?: string; limit?: number }) {
  let query = supabase
    .from("articles")
    .select(ARTICLE_SUMMARY_SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(options?.limit ?? PUBLIC_LIST_LIMIT);

  if (options?.categoryId) query = query.eq("category_id", options.categoryId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ArticleSummary[];
}

export async function fetchArticle(slug: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_DETAIL_SELECT)
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
    .select(
      "id, name, slug, role_title, bio, image_url, facebook_url, instagram_url, tiktok_url, linkedin_url, youtube_url, email, is_team, is_published, sort_order",
    )
    .eq("is_team", team)
    .eq("is_published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Contributor[];
}

export async function fetchContributor(slug: string) {
  const { data, error } = await supabase
    .from("contributors")
    .select(
      "id, name, slug, role_title, bio, image_url, facebook_url, instagram_url, tiktok_url, linkedin_url, youtube_url, email, is_team, is_published, sort_order",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Contributor | null) ?? null;
}

export async function fetchContributorArticles(contributorId: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(ARTICLE_SUMMARY_SELECT)
    .eq("is_published", true)
    .eq("contributor_id", contributorId)
    .order("published_at", { ascending: false })
    .limit(PUBLIC_LIST_LIMIT);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ArticleSummary[];
}

export async function fetchPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("id, name, slug, updated_at")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as Place[];
}

export async function fetchPlace(slug: string) {
  const { data, error } = await supabase
    .from("places")
    .select("id, name, slug, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Place | null) ?? null;
}

export async function fetchPlaceArticles(placeId: string) {
  const { data, error } = await supabase
    .from("articles")
    .select(PLACE_ARTICLE_SUMMARY_SELECT)
    .eq("is_published", true)
    .eq("article_places.place_id", placeId)
    .order("published_at", { ascending: false })
    .limit(PUBLIC_LIST_LIMIT);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ArticleSummary[];
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

export async function fetchApprovedComments(articleId: string) {
  const { data, error } = await supabase
    .from("approved_comments")
    .select("id, author_name, author_surname, body, created_at")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as ApprovedComment[];
}

export const articlesQuery = (options?: { categoryId?: string; limit?: number }) =>
  queryOptions({
    queryKey: ["articles", options?.categoryId ?? "all", options?.limit ?? 0],
    queryFn: () => fetchArticles(options),
    staleTime: 2 * 60 * 1000,
  });

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => fetchArticle(slug),
    staleTime: 5 * 60 * 1000,
  });

export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 10 * 60 * 1000 });

export const contributorsQuery = (team: boolean) =>
  queryOptions({
    queryKey: ["contributors", team],
    queryFn: () => fetchContributors(team),
    staleTime: 10 * 60 * 1000,
  });

export const contributorQuery = (slug: string) =>
  queryOptions({
    queryKey: ["contributor", slug],
    queryFn: () => fetchContributor(slug),
    staleTime: 10 * 60 * 1000,
  });

export const contributorArticlesQuery = (contributorId: string) =>
  queryOptions({
    queryKey: ["contributor-articles", contributorId],
    queryFn: () => fetchContributorArticles(contributorId),
    staleTime: 2 * 60 * 1000,
  });

export const placesQuery = () =>
  queryOptions({ queryKey: ["places"], queryFn: fetchPlaces, staleTime: 10 * 60 * 1000 });

export const placeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["place", slug],
    queryFn: () => fetchPlace(slug),
    staleTime: 10 * 60 * 1000,
  });

export const placeArticlesQuery = (placeId: string) =>
  queryOptions({
    queryKey: ["place-articles", placeId],
    queryFn: () => fetchPlaceArticles(placeId),
    staleTime: 2 * 60 * 1000,
  });

export const photographsQuery = () =>
  queryOptions({
    queryKey: ["photographs"],
    queryFn: fetchPhotographs,
    staleTime: 5 * 60 * 1000,
  });

export const photographQuery = (id: string) =>
  queryOptions({
    queryKey: ["photograph", id],
    queryFn: () => fetchPhotograph(id),
    staleTime: 5 * 60 * 1000,
  });

export const articleViewsQuery = (articleId: string) =>
  queryOptions({
    queryKey: ["article-views", articleId],
    queryFn: () => fetchArticleViews(articleId),
    staleTime: 30 * 1000,
  });

export const commentsQuery = (articleId: string) =>
  queryOptions({
    queryKey: ["comments", articleId],
    queryFn: () => fetchApprovedComments(articleId),
    staleTime: 60 * 1000,
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
