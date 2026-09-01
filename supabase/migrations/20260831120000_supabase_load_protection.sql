-- Keep public write traffic bounded even when callers bypass the website UI.
create table if not exists public.public_request_limits (
  scope text not null,
  request_key text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  primary key (scope, request_key)
);

alter table public.public_request_limits enable row level security;
revoke all on public.public_request_limits from public, anon, authenticated;
grant all on public.public_request_limits to service_role;

create table if not exists public.article_view_events (
  article_id uuid not null references public.articles(id) on delete cascade,
  viewer_key text not null check (viewer_key ~ '^[a-f0-9]{64}$'),
  viewed_on date not null default current_date,
  created_at timestamptz not null default now(),
  primary key (article_id, viewer_key, viewed_on)
);

alter table public.article_view_events enable row level security;
revoke all on public.article_view_events from public, anon, authenticated;
grant all on public.article_view_events to service_role;
create index if not exists article_view_events_created_idx
  on public.article_view_events (created_at);

create or replace function public.consume_public_request_limit(
  _scope text,
  _request_key text,
  _window_seconds integer,
  _max_requests integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  if _scope not in ('comment-ip', 'comment-email', 'contact-ip', 'contact-email')
     or _request_key !~ '^[a-f0-9]{32,64}$'
     or _window_seconds < 60
     or _window_seconds > 86400
     or _max_requests < 1
     or _max_requests > 20 then
    return false;
  end if;

  insert into public.public_request_limits as limits (
    scope, request_key, window_started_at, request_count
  )
  values (_scope, _request_key, now(), 1)
  on conflict (scope, request_key) do update
  set
    window_started_at = case
      when limits.window_started_at <= now() - make_interval(secs => _window_seconds)
        then now()
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at <= now() - make_interval(secs => _window_seconds)
        then 1
      else limits.request_count + 1
    end
  returning request_count <= _max_requests into allowed;

  -- Cheap probabilistic housekeeping avoids a scheduled job and keeps this table small.
  if random() < 0.01 then
    delete from public.public_request_limits
    where window_started_at < now() - interval '7 days';
  end if;

  return allowed;
end;
$$;

revoke all on function public.consume_public_request_limit(text, text, integer, integer)
  from public, anon, authenticated;

create or replace function public.submit_public_comment(
  _article_id uuid,
  _author_name text,
  _author_surname text,
  _author_email text,
  _body text,
  _request_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  comment_id uuid;
  clean_name text := btrim(_author_name);
  clean_surname text := nullif(btrim(_author_surname), '');
  clean_email text := lower(btrim(_author_email));
  clean_body text := btrim(_body);
begin
  if _request_key !~ '^[a-f0-9]{64}$' then
    raise exception 'Unable to verify this request.';
  end if;
  if length(clean_name) not between 1 and 120
     or length(coalesce(clean_surname, '')) > 120
     or length(clean_email) not between 3 and 200
     or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or length(clean_body) not between 1 and 5000 then
    raise exception 'Please check the comment fields and try again.';
  end if;
  if not exists (
    select 1 from public.articles where id = _article_id and is_published = true
  ) then
    raise exception 'This piece is not available for comments.';
  end if;
  if not public.consume_public_request_limit('comment-ip', _request_key, 3600, 5)
     or not public.consume_public_request_limit('comment-email', md5(clean_email), 3600, 5) then
    raise exception 'Too many comments have been submitted. Please try again later.';
  end if;

  insert into public.comments (
    article_id, author_name, author_surname, author_email, body, status
  ) values (
    _article_id, clean_name, clean_surname, clean_email, clean_body, 'pending'
  ) returning id into comment_id;

  return comment_id;
end;
$$;

create or replace function public.submit_public_contact(
  _name text,
  _email text,
  _subject text,
  _message text,
  _request_key text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  submission_id uuid;
  clean_name text := btrim(_name);
  clean_email text := lower(btrim(_email));
  clean_subject text := btrim(_subject);
  clean_message text := btrim(_message);
begin
  if _request_key !~ '^[a-f0-9]{64}$' then
    raise exception 'Unable to verify this request.';
  end if;
  if length(clean_name) not between 1 and 120
     or length(clean_email) not between 3 and 200
     or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
     or length(clean_subject) not between 1 and 120
     or length(clean_message) not between 1 and 20000 then
    raise exception 'Please check the submission fields and try again.';
  end if;
  if not public.consume_public_request_limit('contact-ip', _request_key, 3600, 3)
     or not public.consume_public_request_limit('contact-email', md5(clean_email), 3600, 3) then
    raise exception 'Too many submissions have been sent. Please try again later.';
  end if;

  insert into public.contact_submissions (name, email, subject, message)
  values (clean_name, clean_email, clean_subject, clean_message)
  returning id into submission_id;

  return submission_id;
end;
$$;

create or replace function public.register_public_article_view(
  _article_id uuid,
  _viewer_key text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer;
  view_count bigint;
begin
  if _viewer_key !~ '^[a-f0-9]{64}$' then
    raise exception 'Unable to verify this request.';
  end if;
  if not exists (
    select 1 from public.articles where id = _article_id and is_published = true
  ) then
    raise exception 'This piece is not available.';
  end if;

  insert into public.article_view_events (article_id, viewer_key, viewed_on)
  values (_article_id, _viewer_key, current_date)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;

  if inserted_count = 1 then
    insert into public.article_views (article_id, views)
    values (_article_id, 1)
    on conflict (article_id) do update
      set views = public.article_views.views + 1, updated_at = now()
    returning views into view_count;
  else
    select views into view_count
    from public.article_views
    where article_id = _article_id;
  end if;

  if random() < 0.005 then
    delete from public.article_view_events
    where created_at < now() - interval '31 days';
  end if;

  return coalesce(view_count, 0);
end;
$$;

-- Public writes must pass through the validated functions above.
revoke insert on public.comments from anon;
revoke insert on public.contact_submissions from anon;
revoke execute on function public.increment_article_view(uuid) from public, anon, authenticated;

grant execute on function public.submit_public_comment(uuid, text, text, text, text, text)
  to anon, authenticated;
grant execute on function public.submit_public_contact(text, text, text, text, text)
  to anon, authenticated;
grant execute on function public.register_public_article_view(uuid, text)
  to anon, authenticated;

-- Query paths used by public archives and the admin queues.
create index if not exists articles_category_published_idx
  on public.articles (category_id, is_published, published_at desc);
create index if not exists articles_contributor_published_idx
  on public.articles (contributor_id, is_published, published_at desc);
create index if not exists articles_editors_pick_idx
  on public.articles (published_at desc)
  where is_published = true and is_editors_pick = true;
create index if not exists comments_article_status_created_idx
  on public.comments (article_id, status, created_at desc);
create index if not exists comments_status_created_idx
  on public.comments (status, created_at desc);
create index if not exists contact_submissions_handled_created_idx
  on public.contact_submissions (is_handled, created_at desc);
create index if not exists photographs_published_sort_idx
  on public.photographs (is_published, sort_order, created_at desc);
