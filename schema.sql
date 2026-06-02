-- Enable UUID and UUID helper extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Clean up existing objects if recreating
drop trigger if exists on_auth_user_created on auth.users cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_workspace_member(uuid) cascade;
drop function if exists public.is_workspace_owner(uuid) cascade;
drop function if exists public.is_project_member(uuid) cascade;
drop function if exists public.create_workspace(text) cascade;
drop function if exists public.create_project(text, uuid) cascade;
drop table if exists public.tasks cascade;
drop table if exists public.projects cascade;
drop table if exists public.workspace_members cascade;
drop table if exists public.workspaces cascade;
drop table if exists public.profiles cascade;

-- 1. Profiles Table (public profile synced from auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- 2. Workspaces Table
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS for workspaces
alter table public.workspaces enable row level security;

-- 3. Workspace Members Table
create table public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  primary key (workspace_id, user_id)
);

-- Enable RLS for workspace_members
alter table public.workspace_members enable row level security;

-- 4. Projects Table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS for projects
alter table public.projects enable row level security;

-- 5. Tasks Table
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null check (status in ('todo', 'in_progress', 'done')) default 'todo',
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS for tasks
alter table public.tasks enable row level security;


-- ==================================================
-- SECURITY FUNCTIONS (Avoiding recursive RLS policies)
-- ==================================================

-- Security definer function to check workspace membership
create or replace function public.is_workspace_member(workspace_id uuid)
returns boolean security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = is_workspace_member.workspace_id
    and workspace_members.user_id = auth.uid()
  );
end;
$$ language plpgsql;

-- Security definer function to check workspace ownership
create or replace function public.is_workspace_owner(workspace_id uuid)
returns boolean security definer set search_path = public as $$
begin
  return exists (
    select 1 from public.workspace_members
    where workspace_members.workspace_id = is_workspace_owner.workspace_id
    and workspace_members.user_id = auth.uid()
    and workspace_members.role = 'owner'
  );
end;
$$ language plpgsql;

-- Security definer function to check project membership (bypasses RLS internally for clean task checks)
create or replace function public.is_project_member(project_id uuid)
returns boolean security definer set search_path = public as $$
begin
  return exists (
    select 1
    from public.projects p
    join public.workspace_members wm on wm.workspace_id = p.workspace_id
    where p.id = is_project_member.project_id
      and wm.user_id = auth.uid()
  );
end;
$$ language plpgsql;


-- ==================================================
-- ROW LEVEL SECURITY POLICIES
-- ==================================================

-- PROFILES POLICIES
create policy "Users can read profiles in the same workspaces"
  on public.profiles for select
  using (
    id = auth.uid() or
    exists (
      select 1 from public.workspace_members m1
      join public.workspace_members m2 on m1.workspace_id = m2.workspace_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());


-- WORKSPACES POLICIES
create policy "Members can view workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Any authenticated user can insert a workspace"
  on public.workspaces for insert
  with check (auth.uid() is not null);

create policy "Members can update workspace"
  on public.workspaces for update
  using (public.is_workspace_member(id));

-- Atomic workspace creation function (bypasses RLS via SECURITY DEFINER)
-- Creates the workspace row AND owner membership in one transaction.
create or replace function public.create_workspace(workspace_name text)
returns public.workspaces
language plpgsql security definer set search_path = public as $$
declare
  new_workspace public.workspaces;
begin
  -- Ensure caller is authenticated
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.workspaces (name)
  values (workspace_name)
  returning * into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, auth.uid(), 'owner');

  return new_workspace;
end;
$$;

create policy "Owners can delete workspace"
  on public.workspaces for delete
  using (public.is_workspace_owner(id));

-- Atomic project creation function (bypasses RLS via SECURITY DEFINER)
-- Creates the project row only if the caller is a workspace member.
create or replace function public.create_project(project_name text, project_workspace_id uuid)
returns public.projects
language plpgsql security definer set search_path = public as $$
declare
  new_project public.projects;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.workspace_members
    where workspace_id = project_workspace_id
      and user_id = auth.uid()
  ) then
    raise exception 'Not authorized to create a project in this workspace';
  end if;

  insert into public.projects (workspace_id, name)
  values (project_workspace_id, project_name)
  returning * into new_project;

  return new_project;
end;
$$;


-- WORKSPACE MEMBERS POLICIES
create policy "Members can view workspace membership"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "Users can insert their own owner membership"
  on public.workspace_members for insert
  with check (
    -- The user is adding themselves
    auth.uid() = user_id
  );

create policy "Workspace owners can manage membership"
  on public.workspace_members for all
  using (public.is_workspace_owner(workspace_id));


-- PROJECTS POLICIES
create policy "Members can view projects"
  on public.projects for select
  using (public.is_workspace_member(workspace_id));

create policy "Members can insert projects"
  on public.projects for insert
  with check (public.is_workspace_member(workspace_id));

create policy "Members can update projects"
  on public.projects for update
  using (public.is_workspace_member(workspace_id));

create policy "Members can delete projects"
  on public.projects for delete
  using (public.is_workspace_member(workspace_id));


-- TASKS POLICIES
create policy "Members can view tasks"
  on public.tasks for select
  using (public.is_project_member(project_id));

create policy "Members can insert tasks"
  on public.tasks for insert
  with check (auth.uid() is not null and public.is_project_member(project_id));

create policy "Members can update tasks"
  on public.tasks for update
  using (public.is_project_member(project_id));

create policy "Members can delete tasks"
  on public.tasks for delete
  using (public.is_project_member(project_id));


-- ==================================================
-- USER PROFILE TRIGGER SYNC
-- ==================================================

-- Function to handle syncing user on creation and seeding default data
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_workspace_id uuid;
  default_project_id uuid;
begin
  -- 1. Create Profile
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 2. Create Default Workspace
  insert into public.workspaces (name)
  values ('My Workspace')
  returning id into default_workspace_id;

  -- 3. Create Membership as owner
  insert into public.workspace_members (workspace_id, user_id, role)
  values (default_workspace_id, new.id, 'owner');

  -- 4. Create Default Project
  insert into public.projects (workspace_id, name)
  values (default_workspace_id, 'Getting Started 🚀')
  returning id into default_project_id;

  -- 5. Create Default Tasks
  insert into public.tasks (project_id, title, description, status, assignee_id, due_date)
  values
    (default_project_id, 'Welcome to your Workspace!', 'This is a sample task. Explore the board, edit tasks, or add new ones!', 'todo', new.id, now() + interval '3 days'),
    (default_project_id, 'Create a new project', 'Use the plus button in the sidebar to add a new project to this workspace.', 'todo', new.id, now() + interval '5 days'),
    (default_project_id, 'Invite team members', 'Navigate to Workspace settings and invite your teammates to collaborate.', 'todo', null, now() + interval '7 days');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute after user insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==================================================
-- SEED DATA
-- ==================================================

-- A. Create mock users in auth.users
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
values 
  ('00000000-0000-0000-0000-000000000001', 'alice@example.com', now(), '{"full_name":"Alice Smith"}', now(), now(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000002', 'bob@example.com', now(), '{"full_name":"Bob Jones"}', now(), now(), 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- B. Create Workspaces
insert into public.workspaces (id, name, created_at)
values
  ('11111111-1111-1111-1111-111111111111', 'Acme Corp Workspace', now() - interval '30 days'),
  ('22222222-2222-2222-2222-222222222222', 'Stark Industries Workspace', now() - interval '15 days')
on conflict (id) do nothing;

-- C. Create Workspace Members
insert into public.workspace_members (workspace_id, user_id, role)
values
  -- Alice owns Acme Corp, Bob is a member
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'member'),
  -- Bob owns Stark Industries, Alice is a member
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'owner'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'member')
on conflict (workspace_id, user_id) do nothing;

-- D. Create Projects
insert into public.projects (id, workspace_id, name, created_at)
values
  -- Acme Corp Projects
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Website Redesign', now() - interval '25 days'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Marketing Campaign', now() - interval '20 days'),
  -- Stark Industries Projects
  ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Arc Reactor Upgrade', now() - interval '12 days'),
  ('66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'Jarvis UI Overhaul', now() - interval '10 days')
on conflict (id) do nothing;

-- E. Create Tasks (15 tasks in total)
insert into public.tasks (id, project_id, title, description, status, assignee_id, due_date, created_at)
values
  -- Website Redesign (Acme Corp) - 4 tasks
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Draft homepage wireframes', 'Create low-fidelity wireframes for desktop and mobile views.', 'done', '00000000-0000-0000-0000-000000000001', now() - interval '5 days', now() - interval '24 days'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Design UI mockups', 'Generate high-fidelity mockups in Figma with modern aesthetics.', 'in_progress', '00000000-0000-0000-0000-000000000001', now() + interval '3 days', now() - interval '20 days'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Develop Next.js frontend scaffolding', 'Initialize Next.js 16 app with Tailwind CSS and base routing.', 'in_progress', '00000000-0000-0000-0000-000000000002', now() + interval '7 days', now() - interval '15 days'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Define brand typography and style guide', 'Finalize fonts and color variables.', 'todo', null, now() - interval '1 day', now() - interval '10 days'), -- Overdue, unassigned

  -- Marketing Campaign (Acme Corp) - 3 tasks
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Write blog post draft', 'Create 800-word draft about task management best practices.', 'done', '00000000-0000-0000-0000-000000000002', now() - interval '2 days', now() - interval '18 days'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Prepare social assets', 'Design promotional images and copy for LinkedIn and Twitter.', 'todo', '00000000-0000-0000-0000-000000000001', now() + interval '5 days', now() - interval '12 days'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Email newsletter outreach', 'Schedule product launch newsletter send-out.', 'todo', null, now() + interval '12 days', now() - interval '8 days'),

  -- Arc Reactor Upgrade (Stark Industries) - 4 tasks
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Test palladium core integrity', 'Measure energy output degradation and radiation levels.', 'done', '00000000-0000-0000-0000-000000000002', now() - interval '3 days', now() - interval '11 days'),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Synthesize new element isotope', 'Utilize particle accelerator to produce element 118.', 'in_progress', '00000000-0000-0000-0000-000000000002', now() + interval '2 days', now() - interval '9 days'),
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Recalibrate magnetic shielding', 'Modify coils for high-energy load tolerance.', 'todo', '00000000-0000-0000-0000-000000000001', now() - interval '2 days', now() - interval '7 days'), -- Overdue, assigned
  (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'Integrate emergency safety vents', 'Install hardware overrides for pressure build-up.', 'todo', null, now() + interval '10 days', now() - interval '4 days'),

  -- Jarvis UI Overhaul (Stark Industries) - 4 tasks
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Migrate holographic projection layer', 'Upgrade shaders for 8K volumetric rendering.', 'done', '00000000-0000-0000-0000-000000000002', now() - interval '1 day', now() - interval '9 days'),
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Optimise natural language response times', 'Tune local LLM inference cache parameters.', 'in_progress', '00000000-0000-0000-0000-000000000001', now() + interval '4 days', now() - interval '8 days'),
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Design retinal scan authorization overlay', 'Build sleek HUD widget for biometric validation.', 'todo', '00000000-0000-0000-0000-000000000002', now() - interval '4 days', now() - interval '6 days'), -- Overdue, assigned
  (gen_random_uuid(), '66666666-6666-6666-6666-666666666666', 'Implement gesture diagnostics widget', 'Introduce drag-and-drop spatial panels.', 'todo', null, now() + interval '8 days', now() - interval '5 days');
