import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Article, Category, Contributor } from "@/lib/magazine";

export type AdminArticle = Article & {
  is_published: boolean;
  created_at: string;
  category_id: string | null;
  contributor_id: string | null;
};

export type AdminComment = {
  id: string;
  article_id: string;
  author_name: string;
  author_surname: string | null;
  author_email: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  articles: {
    title: string;
    slug: string;
    categories: { slug: string } | null;
  } | null;
};

export type Submission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_handled: boolean;
  created_at: string;
};

export type AdminPhotograph = {
  id: string;
  image_url: string;
  title: string | null;
  caption: string | null;
  credit: string | null;
  taken_on: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
};

const ADMIN_ARTICLE_SELECT = `
  id, title, slug, excerpt, body, cover_image_url, image_credit, read_minutes,
  published_at, is_editors_pick, is_featured, is_published, created_at, author_name,
  category_id, contributor_id,
  categories:category_id ( id, name, slug ),
  contributors:contributor_id ( id, name, slug, role_title, bio )
`;

export async function fetchAdminArticles() {
  const { data, error } = await supabase
    .from("articles")
    .select(ADMIN_ARTICLE_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminArticle[];
}

export async function fetchAdminComments() {
  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, article_id, author_name, author_surname, author_email, body, status, created_at, articles:article_id ( title, slug, categories:category_id ( slug ) )",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminComment[];
}

export async function fetchArticleViewCounts() {
  const { data, error } = await supabase.from("article_views").select("article_id, views");
  if (error) throw new Error(error.message);
  const map: Record<string, number> = {};
  for (const row of (data ?? []) as { article_id: string; views: number }[]) {
    map[row.article_id] = Number(row.views ?? 0);
  }
  return map;
}

export async function fetchAdminContributors() {
  const { data, error } = await supabase
    .from("contributors")
    .select("*")
    .order("is_team", { ascending: false })
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Contributor[];
}

export async function fetchAdminPhotographs() {
  const { data, error } = await supabase
    .from("photographs")
    .select("id, image_url, title, caption, credit, taken_on, is_published, sort_order, created_at")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminPhotograph[];
}

export async function fetchSubmissions() {
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Submission[];
}

export const adminArticlesQuery = () =>
  queryOptions({ queryKey: ["admin", "articles"], queryFn: fetchAdminArticles });

export const adminCommentsQuery = () =>
  queryOptions({ queryKey: ["admin", "comments"], queryFn: fetchAdminComments });

export const submissionsQuery = () =>
  queryOptions({ queryKey: ["admin", "submissions"], queryFn: fetchSubmissions });

export const articleViewCountsQuery = () =>
  queryOptions({ queryKey: ["admin", "article-views"], queryFn: fetchArticleViewCounts });

export const adminContributorsQuery = () =>
  queryOptions({ queryKey: ["admin", "contributors"], queryFn: fetchAdminContributors });

export const adminPhotographsQuery = () =>
  queryOptions({ queryKey: ["admin", "photographs"], queryFn: fetchAdminPhotographs });

export type ArticleFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  image_credit: string;
  category_id: string | null;
  contributor_id: string | null;
  author_name: string;
  read_minutes: number;
  published_on: string;
  is_published: boolean;
  is_editors_pick: boolean;
};

export function emptyArticle(): ArticleFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    cover_image_url: "",
    image_credit: "",
    category_id: null,
    contributor_id: null,
    author_name: "",
    read_minutes: 4,
    published_on: new Date().toISOString().slice(0, 10),
    is_published: false,
    is_editors_pick: false,
  };
}

export function toFormValues(article: AdminArticle): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    body: article.body ?? "",
    cover_image_url: article.cover_image_url ?? "",
    image_credit: article.image_credit ?? "",
    category_id: article.category_id,
    contributor_id: article.contributor_id,
    author_name: article.author_name ?? article.contributors?.name ?? "",
    read_minutes: article.read_minutes,
    published_on: (article.published_at ?? article.created_at).slice(0, 10),
    is_published: article.is_published,
    is_editors_pick: article.is_editors_pick,
  };
}

function toRow(values: ArticleFormValues) {
  return {
    title: values.title.trim(),
    slug: slugify(values.slug || values.title),
    excerpt: values.excerpt.trim() || null,
    body: values.body.trim() || null,
    cover_image_url: values.cover_image_url.trim() || null,
    image_credit: values.image_credit.trim() || null,
    category_id: values.category_id,
    contributor_id: values.contributor_id,
    author_name: values.author_name.trim() || null,
    read_minutes: Number(values.read_minutes) || 1,
    is_published: values.is_published,
    is_editors_pick: values.is_editors_pick,
    published_at: values.published_on
      ? new Date(`${values.published_on}T09:00:00Z`).toISOString()
      : new Date().toISOString(),
  };
}

export async function createArticle(values: ArticleFormValues) {
  const { error } = await supabase.from("articles").insert(toRow(values));
  if (error) throw new Error(error.message);
}

export async function updateArticle(article: AdminArticle, values: ArticleFormValues) {
  const { error } = await supabase.from("articles").update(toRow(values)).eq("id", article.id);
  if (error) throw new Error(error.message);
}

export async function deleteArticle(id: string) {
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setCommentStatus(id: string, status: AdminComment["status"]) {
  const { error } = await supabase.from("comments").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setSubmissionHandled(id: string, is_handled: boolean) {
  const { error } = await supabase.from("contact_submissions").update({ is_handled }).eq("id", id);
  if (error) throw new Error(error.message);
}

export type ContributorFormValues = {
  name: string;
  slug: string;
  role_title: string;
  bio: string;
  image_url: string;
  email: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
  is_team: boolean;
  is_published: boolean;
  sort_order: number;
};

export function emptyContributor(): ContributorFormValues {
  return {
    name: "",
    slug: "",
    role_title: "",
    bio: "",
    image_url: "",
    email: "",
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    tiktok_url: "",
    linkedin_url: "",
    is_team: false,
    is_published: false,
    sort_order: 0,
  };
}

export function toContributorForm(person: Contributor): ContributorFormValues {
  return {
    name: person.name,
    slug: person.slug,
    role_title: person.role_title ?? "",
    bio: person.bio ?? "",
    image_url: person.image_url ?? "",
    email: person.email ?? "",
    instagram_url: person.instagram_url ?? "",
    facebook_url: person.facebook_url ?? "",
    youtube_url: person.youtube_url ?? "",
    tiktok_url: person.tiktok_url ?? "",
    linkedin_url: person.linkedin_url ?? "",
    is_team: person.is_team,
    is_published: person.is_published,
    sort_order: person.sort_order,
  };
}

function toContributorRow(values: ContributorFormValues) {
  const clean = (value: string) => value.trim() || null;
  return {
    name: values.name.trim(),
    slug: slugify(values.slug || values.name),
    role_title: clean(values.role_title),
    bio: clean(values.bio),
    image_url: clean(values.image_url),
    email: clean(values.email),
    instagram_url: clean(values.instagram_url),
    facebook_url: clean(values.facebook_url),
    youtube_url: clean(values.youtube_url),
    tiktok_url: clean(values.tiktok_url),
    linkedin_url: clean(values.linkedin_url),
    is_team: values.is_team,
    is_published: values.is_published,
    sort_order: Number(values.sort_order) || 0,
  };
}

export async function createContributor(values: ContributorFormValues) {
  const { error } = await supabase.from("contributors").insert(toContributorRow(values));
  if (error) throw new Error(error.message);
}

export async function updateContributor(id: string, values: ContributorFormValues) {
  const { error } = await supabase
    .from("contributors")
    .update(toContributorRow(values))
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteContributor(id: string) {
  const { error } = await supabase.from("contributors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export type PhotographFormValues = {
  image_url: string;
  title: string;
  caption: string;
  credit: string;
  taken_on: string;
  is_published: boolean;
  sort_order: number;
};

export function emptyPhotograph(): PhotographFormValues {
  return {
    image_url: "",
    title: "",
    caption: "",
    credit: "",
    taken_on: new Date().toISOString().slice(0, 10),
    is_published: true,
    sort_order: 0,
  };
}

export function toPhotographForm(photo: AdminPhotograph): PhotographFormValues {
  return {
    image_url: photo.image_url,
    title: photo.title ?? "",
    caption: photo.caption ?? "",
    credit: photo.credit ?? "",
    taken_on: photo.taken_on ?? "",
    is_published: photo.is_published,
    sort_order: photo.sort_order,
  };
}

function toPhotographRow(values: PhotographFormValues) {
  return {
    image_url: values.image_url.trim(),
    title: values.title.trim() || null,
    caption: values.caption.trim() || null,
    credit: values.credit.trim() || null,
    taken_on: values.taken_on || null,
    is_published: values.is_published,
    sort_order: Number(values.sort_order) || 0,
  };
}

export async function createPhotograph(values: PhotographFormValues) {
  if (!values.image_url) throw new Error("Please upload an image first.");
  const { error } = await supabase.from("photographs").insert(toPhotographRow(values));
  if (error) throw new Error(error.message);
}

export async function updatePhotograph(id: string, values: PhotographFormValues) {
  if (!values.image_url) throw new Error("Please upload an image first.");
  const { error } = await supabase.from("photographs").update(toPhotographRow(values)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePhotograph(id: string) {
  const { error } = await supabase.from("photographs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type { Category, Contributor };
