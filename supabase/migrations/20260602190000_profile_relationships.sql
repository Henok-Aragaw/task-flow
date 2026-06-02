-- Expose profile relationships to PostgREST without resetting app data.
-- Run this on existing databases instead of rerunning the destructive schema.sql.

insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  coalesce(u.email, u.id::text || '@missing.local'),
  coalesce(u.raw_user_meta_data->>'full_name', split_part(coalesce(u.email, u.id::text), '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;

-- If old seed/demo data left memberships for auth users that do not exist in
-- this Supabase project, those rows can never satisfy the new public FK.
delete from public.workspace_members wm
where not exists (
  select 1 from public.profiles p where p.id = wm.user_id
);

-- Keep the tasks, but clear impossible assignees before changing the FK.
update public.tasks t
set assignee_id = null
where assignee_id is not null
  and not exists (
    select 1 from public.profiles p where p.id = t.assignee_id
  );

alter table public.workspace_members
  drop constraint if exists workspace_members_user_id_fkey;

alter table public.workspace_members
  add constraint workspace_members_user_id_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;

alter table public.tasks
  drop constraint if exists tasks_assignee_id_fkey;

alter table public.tasks
  add constraint tasks_assignee_id_fkey
  foreign key (assignee_id)
  references public.profiles(id)
  on delete set null;

notify pgrst, 'reload schema';
