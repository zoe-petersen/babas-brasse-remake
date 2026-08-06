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
  author_email: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  articles: { title: string; slug: string } | null;
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

const ADMIN_ARTICLE_SELECT = `
  id, title, slug, excerpt, body, cover_image_url, image_credit, read_minutes,
  published_at, is_editors_pick, is_featured, is_published, created_at,
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
    .select("id, article_id, author_name, author_email, body, status, created_at, articles:article_id ( title, slug )")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdminComment[];
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

export type ArticleFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image_url: string;
  image_credit: string;
  category_id: string | null;
  contributor_id: string | null;
  read_minutes: number;
  is_published: boolean;
  is_featured: boolean;
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
    read_minutes: 4,
    is_published: false,
    is_featured: false,
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
    read_minutes: article.read_minutes,
    is_published: article.is_published,
    is_featured: article.is_featured,
    is_editors_pick: article.is_editors_pick,
  };
}

function toRow(values: ArticleFormValues, wasPublished: boolean, publishedAt: string | null) {
  return {
    title: values.title.trim(),
    slug: slugify(values.slug || values.title),
    excerpt: values.excerpt.trim() || null,
    body: values.body.trim() || null,
    cover_image_url: values.cover_image_url.trim() || null,
    image_credit: values.image_credit.trim() || null,
    category_id: values.category_id,
    contributor_id: values.contributor_id,
    read_minutes: Number(values.read_minutes) || 1,
    is_published: values.is_published,
    is_featured: values.is_featured,
    is_editors_pick: values.is_editors_pick,
    published_at: values.is_published ? (wasPublished ? publishedAt : new Date().toISOString()) : null,
  };
}

export async function createArticle(values: ArticleFormValues) {
  const { error } = await supabase.from("articles").insert(toRow(values, false, null));
  if (error) throw new Error(error.message);
}

export async function updateArticle(article: AdminArticle, values: ArticleFormValues) {
  const { error } = await supabase
    .from("articles")
    .update(toRow(values, article.is_published, article.published_at))
    .eq("id", article.id);
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
  const { error } = await supabase
    .from("contact_submissions")
    .update({ is_handled })
    .eq("id", id);
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