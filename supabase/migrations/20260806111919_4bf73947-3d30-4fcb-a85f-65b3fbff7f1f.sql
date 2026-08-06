
revoke execute on function public.has_role(uuid, app_role) from anon, authenticated, public;
revoke execute on function public.is_admin() from anon, authenticated, public;
grant execute on function public.has_role(uuid, app_role) to service_role;
grant execute on function public.is_admin() to service_role;
