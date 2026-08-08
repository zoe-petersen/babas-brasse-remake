alter table public.contributors
  add column if not exists linkedin_url text,
  add column if not exists twitter_url text,
  add column if not exists email text;

alter table public.photographs
  add column if not exists title text,
  add column if not exists taken_on date;

create table if not exists public.article_views (
  article_id uuid primary key references public.articles(id) on delete cascade,
  views bigint not null default 0,
  updated_at timestamptz not null default now()
);

grant select on public.article_views to anon;
grant select on public.article_views to authenticated;
grant all on public.article_views to service_role;

alter table public.article_views enable row level security;

create policy "article views public read" on public.article_views
  for select to public using (true);

create or replace function public.increment_article_view(_article_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v bigint;
begin
  insert into public.article_views (article_id, views)
  values (_article_id, 1)
  on conflict (article_id)
  do update set views = public.article_views.views + 1, updated_at = now()
  returning views into v;
  return v;
end;
$$;

grant execute on function public.increment_article_view(uuid) to anon, authenticated;