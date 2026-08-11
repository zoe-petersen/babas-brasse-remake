drop view if exists public.approved_comments;
create view public.approved_comments as
select id, article_id, author_name, author_surname, body, created_at
from public.comments
where status = 'approved'::comment_status;

grant select on public.approved_comments to anon, authenticated;