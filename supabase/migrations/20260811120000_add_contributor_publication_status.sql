alter table public.contributors
  add column if not exists is_published boolean not null default true;

create index if not exists contributors_published_idx
  on public.contributors (is_published, is_team, sort_order);

drop policy if exists "contributors public read" on public.contributors;
drop policy if exists "contributors public read published" on public.contributors;

create policy "contributors public read published"
  on public.contributors
  for select
  to anon, authenticated
  using (is_published = true);

-- The existing "contributors admin write" ALL policy continues to grant
-- administrators access to both live contributors and drafts.
