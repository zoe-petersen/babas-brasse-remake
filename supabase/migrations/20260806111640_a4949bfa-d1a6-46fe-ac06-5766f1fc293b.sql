
-- ROLES
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger categories_updated before update on public.categories for each row execute function public.update_updated_at_column();

-- CONTRIBUTORS
create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  role_title text,
  bio text,
  image_url text,
  facebook_url text,
  instagram_url text,
  tiktok_url text,
  is_team boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.contributors to anon;
grant select, insert, update, delete on public.contributors to authenticated;
grant all on public.contributors to service_role;
alter table public.contributors enable row level security;
create policy "contributors public read" on public.contributors for select using (true);
create policy "contributors admin write" on public.contributors for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger contributors_updated before update on public.contributors for each row execute function public.update_updated_at_column();

-- ARTICLES
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_image_url text,
  image_credit text,
  category_id uuid references public.categories(id) on delete set null,
  contributor_id uuid references public.contributors(id) on delete set null,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_editors_pick boolean not null default false,
  read_minutes int not null default 1,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.articles to anon;
grant select, insert, update, delete on public.articles to authenticated;
grant all on public.articles to service_role;
alter table public.articles enable row level security;
create policy "articles public read published" on public.articles for select using (is_published = true);
create policy "articles admin read all" on public.articles for select to authenticated using (public.is_admin());
create policy "articles admin write" on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger articles_updated before update on public.articles for each row execute function public.update_updated_at_column();
create index articles_published_idx on public.articles (is_published, published_at desc);

-- PHOTOGRAPHY
create table public.photographs (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  credit text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.photographs to anon;
grant select, insert, update, delete on public.photographs to authenticated;
grant all on public.photographs to service_role;
alter table public.photographs enable row level security;
create policy "photographs public read" on public.photographs for select using (is_published = true);
create policy "photographs admin all" on public.photographs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger photographs_updated before update on public.photographs for each row execute function public.update_updated_at_column();

-- COMMENTS
create type public.comment_status as enum ('pending', 'approved', 'rejected');

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  status comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert on public.comments to anon;
grant select, insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments admin read" on public.comments for select to authenticated using (public.is_admin());
create policy "comments anyone insert pending" on public.comments for insert with check (status = 'pending');
create policy "comments admin update" on public.comments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "comments admin delete" on public.comments for delete to authenticated using (public.is_admin());
create trigger comments_updated before update on public.comments for each row execute function public.update_updated_at_column();

-- Public view exposing only approved comments without emails
create view public.approved_comments with (security_invoker = on) as
  select id, article_id, author_name, body, created_at
  from public.comments where status = 'approved';
grant select on public.approved_comments to anon, authenticated;
create policy "comments public read approved" on public.comments for select using (status = 'approved');

-- CONTACT SUBMISSIONS
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_submissions to anon;
grant select, insert, update, delete on public.contact_submissions to authenticated;
grant all on public.contact_submissions to service_role;
alter table public.contact_submissions enable row level security;
create policy "contact anyone insert" on public.contact_submissions for insert with check (true);
create policy "contact admin read" on public.contact_submissions for select to authenticated using (public.is_admin());
create policy "contact admin manage" on public.contact_submissions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- REALTIME
alter publication supabase_realtime add table public.articles;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.photographs;
alter publication supabase_realtime add table public.contributors;

-- STORAGE POLICIES (bucket created separately)
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- SEED
insert into public.categories (name, slug, description, sort_order) values
  ('Opinion','opinion','Personal essays, arguments, reflections, and first-person cultural commentary.',1),
  ('Reviews','reviews','Books, culture, and media reviews.',2),
  ('Interviews','interviews','Conversations with artists and cultural voices.',3),
  ('Artwork','artwork','Photography, visual art, and media features.',4),
  ('Literature','literature','Books, poetry, and the written word.',5),
  ('Theatre','theatre','Stages, performances, and rehearsal rooms.',6),
  ('Short Stories','short-stories','Original fiction and literary experiments.',7),
  ('Fashion','fashion','Style, identity, and the people shaping both.',8),
  ('Music','music','Sound, scenes, and artists worth hearing.',9);

insert into public.contributors (name, slug, role_title, bio, is_team, sort_order) values
  ('Lerato Mokoena','lerato-mokoena','Culture Essayist','Writes intimate cultural essays about hospitality, daily rituals, and the changing shape of community.',false,1),
  ('Mia van Wyk','mia-van-wyk','Books Editor','Reviews fiction and criticism with particular attention to translation and multilingual craft.',false,2),
  ('Sihle Ndlovu','sihle-ndlovu','Theatre Critic','Covers rehearsal processes, performance, and the designers building South African stages.',false,3),
  ('Thando Jacobs','thando-jacobs','Essayist & Interviewer','Writes about belonging, language, and the creative communities making culture across the Cape.',false,4),
  ('Ayesha Daniels','ayesha-daniels','Visual Editor','Shapes the visual language of the magazine, from photo essays to cover art direction.',true,1),
  ('Naledi Maseko','naledi-maseko','Managing Editor','Keeps the editorial calendar, the commissioning, and the copy desk running.',true,2),
  ('Zoe Petersen','zoe-petersen','Web Developer','Builds and maintains the digital home of Babas & Brasse.',true,3),
  ('Zubayr Charles','zubayr-charles','Publisher & Product Owner','Creative Director and Editor-in-Chief, multidisciplinary writer, theatre maker, and published author.',true,4);

insert into public.articles (title, slug, excerpt, body, category_id, contributor_id, is_published, is_featured, is_editors_pick, read_minutes, published_at) values
  ('Inside the Rehearsal Room','inside-the-rehearsal-room','Five theatre-makers talk about trust, process, and the difficult work of building an ensemble.','Young theatre-makers are bringing fresh perspectives to familiar forms.

Their work joins tradition and experimentation without treating either as decoration. Over three weeks in a Woodstock rehearsal room, the ensemble built a shared vocabulary before a single line was blocked.

What emerged was less a production than a practice: a way of working that treats disagreement as material rather than obstacle.',(select id from public.categories where slug='interviews'),(select id from public.contributors where slug='sihle-ndlovu'),true,true,false,4,'2026-07-02'),
  ('Send A Text Before You Knock','send-a-text-before-you-knock','On privacy, hospitality, and why arriving at someone''s door now begins with a message.','The unannounced visit used to be a form of intimacy. Now it reads as intrusion.

This is not about rudeness. It is about a slow renegotiation of what we owe each other''s time and attention.',(select id from public.categories where slug='opinion'),(select id from public.contributors where slug='lerato-mokoena'),true,false,false,3,'2026-07-01'),
  ('The Revival of Afrikaans Theatre','the-revival-of-afrikaans-theatre','A new generation of playwrights is reimagining traditional narratives for contemporary South African stages.','Young theatre-makers are bringing fresh perspectives to familiar forms.

Their work joins tradition and experimentation without treating either as decoration.',(select id from public.categories where slug='reviews'),(select id from public.contributors where slug='sihle-ndlovu'),true,false,false,1,'2026-06-28'),
  ('Between Languages: The Craft of a South African Novel','between-languages','On literary craftsmanship, translation, and the playful possibilities of language.','A novel written across three languages asks its reader to move between them without a map.

The result is a book that trusts its audience completely.',(select id from public.categories where slug='reviews'),(select id from public.contributors where slug='mia-van-wyk'),true,false,false,5,'2026-06-24'),
  ('On Belonging: Reflections from the Cape Flats','on-belonging','A personal essay about identity, community, memory, and the meaning of home.','Home is not a place you arrive at. It is a place that keeps arriving in you.

These streets taught me a grammar of care that no institution has managed to teach since.',(select id from public.categories where slug='opinion'),(select id from public.contributors where slug='thando-jacobs'),true,false,true,6,'2026-06-20'),
  ('Why Multilingualism Matters','why-multilingualism-matters','An argument for cultural spaces that reflect the languages South Africans actually live in.','We speak more languages in a taxi ride than most cultural institutions programme in a year.

Multilingualism is not a diversity gesture. It is an accuracy requirement.',(select id from public.categories where slug='opinion'),(select id from public.contributors where slug='thando-jacobs'),true,false,false,4,'2026-06-16'),
  ('Stagecraft and Storytelling','stagecraft-and-storytelling','How set design shapes the emotional and physical world of a performance.','Before an actor speaks, the room has already made an argument.

Set design is the first line of a play.',(select id from public.categories where slug='reviews'),(select id from public.contributors where slug='sihle-ndlovu'),true,false,false,3,'2026-06-12');
