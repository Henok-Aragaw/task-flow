-- Migration to ensure update/delete policies are enabled for workspaces and projects

-- Workspaces
drop policy if exists "Members can update workspace" on public.workspaces;
create policy "Members can update workspace"
  on public.workspaces for update
  using (public.is_workspace_member(id));

drop policy if exists "Owners can delete workspace" on public.workspaces;
create policy "Owners can delete workspace"
  on public.workspaces for delete
  using (public.is_workspace_owner(id));

-- Projects
drop policy if exists "Members can update projects" on public.projects;
create policy "Members can update projects"
  on public.projects for update
  using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can delete projects" on public.projects;
create policy "Members can delete projects"
  on public.projects for delete
  using (public.is_workspace_member(workspace_id));

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';
