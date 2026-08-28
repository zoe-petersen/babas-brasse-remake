-- Optional editorial SEO fields. Existing articles continue to work without values.
alter table public.articles
  add column seo_title text,
  add column seo_description text;

comment on column public.articles.seo_title is
  'Optional search title. Falls back to the public article title.';
comment on column public.articles.seo_description is
  'Optional search description. Falls back to the public article excerpt.';

-- A place can be attached to many pieces and a piece can cover many places.
create table public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint places_name_not_blank check (btrim(name) <> ''),
  constraint places_slug_not_blank check (btrim(slug) <> '')
);

grant select on public.places to anon;
grant select, insert, update, delete on public.places to authenticated;
grant all on public.places to service_role;

alter table public.places enable row level security;

create policy "places public read"
  on public.places for select
  using (true);

create policy "places admin write"
  on public.places for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create trigger places_updated
  before update on public.places
  for each row execute function public.update_updated_at_column();

create table public.article_places (
  article_id uuid not null references public.articles(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, place_id)
);

create index article_places_place_idx on public.article_places (place_id, article_id);

grant select on public.article_places to anon;
grant select, insert, update, delete on public.article_places to authenticated;
grant all on public.article_places to service_role;

alter table public.article_places enable row level security;

create policy "article places public read published"
  on public.article_places for select
  using (
    exists (
      select 1
      from public.articles
      where articles.id = article_places.article_id
        and articles.is_published = true
    )
  );

create policy "article places admin write"
  on public.article_places for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
