alter table public.comments add column if not exists author_surname text;

create policy "media admin all"
on storage.objects for all
to authenticated
using (bucket_id = 'media' and public.is_admin())
with check (bucket_id = 'media' and public.is_admin());
