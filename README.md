# Premium SaaS Task Management Application

A production-ready SaaS task and project collaboration platform built with Next.js 16, React 19, Supabase, and strict TypeScript.

## 🚀 What this app delivers

- Tenant-aware workspace isolation with per-user access control.
- Workspace/project/task visibility enforced by Supabase Row Level Security (RLS).
- Real-time task synchronization via Supabase subscriptions and client-side invalidation.
- Optimistic UI updates, inline task editing, and smooth task status transitions.
- An edge-compatible Supabase function for overdue task reporting.

---

## 📂 Repository structure

```text
src/
├── app/                      # Next.js App Router entrypoints
│   ├── (auth)/               # Auth pages: sign-in, sign-up
│   ├── dashboard/            # Workspace and project dashboard overview
│   ├── projects/             # Project-level views and task clients
│   ├── workspace/            # Workspace detail and membership UI
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout, providers, and metadata
├── components/               # Reusable UI components
│   ├── ui/                   # Design primitives and shadcn-based controls
│   ├── workspace/            # Workspace selection and tabs
│   ├── dashboard/            # Summary cards and dashboard widgets
│   ├── task/                 # Task detail drawer and task UI components
│   └── shared/               # Layout shell, sidebar, and shared UI patterns
├── features/                 # Feature slices and data fetching logic
│   ├── auth/                 # Auth actions and server-side logic
│   ├── projects/             # Project queries and project page components
│   ├── tasks/                # Task queries, task UI fields, and detail panel hooks
│   └── workspaces/           # Workspace queries and page components
├── hooks/                    # App-wide hook abstractions and query provider
├── lib/                      # Shared utilities and Supabase client wrappers
│   ├── supabase/             # Browser/server Supabase client setup
│   └── utils.ts              # Shared helper utilities
├── stores/                   # Zustand UI store for client-side state
├── types/                    # Generated database typings
supabase/                     # Supabase config, migrations, and edge function
├── config.toml
├── functions/                # Supabase edge functions
│   ├── deno.json
│   ├── import_map.json
│   └── overdue-tasks/        # Overdue task reporting function
└── migrations/               # Database migration files
```

---

## 🛠 Key technologies

- Next.js 16
- React 19
- TypeScript with `strict` mode enabled
- Supabase auth, database, and edge functions
- @supabase/ssr client-side/server-side Supabase helpers
- TanStack Query v5 for server-state caching and optimistic updates
- Zustand for UI state management only
- Zod for validation and React Hook Form for form handling
- Tailwind CSS v4 with Base UI / shadcn design primitives
- Sonner for toast notifications

---

## 🗄️ Database and Supabase logic

The database schema is defined in `schema.sql` and includes:

- `profiles`: public user profile data synced from `auth.users`
- `workspaces`: tenant groups for collaborative teams
- `workspace_members`: membership and role (`owner` | `member`)
- `projects`: project containers scoped to a workspace
- `tasks`: task items with status, due date, assignee, and content

### Supabase security model

- Row Level Security (RLS) is enabled on all public tables.
- Workspace membership is verified with `public.is_workspace_member(workspace_id)`.
- Project membership is verified with `public.is_project_member(project_id)`.
- Ownership checks are enforced with `public.is_workspace_owner(workspace_id)`.
- Auth-triggered onboarding uses `public.handle_new_user()` to create:
  - a default workspace,
  - owner membership,
  - a Getting Started project,
  - and seeded welcome tasks.

### Seed and demo data

The schema seeds:

- 2 demo workspaces (`Acme Corp Workspace`, `Stark Industries Workspace`)
- 2 demo users (`alice@example.com`, `bob@example.com`)
- 4 demo projects
- 15 demo tasks with mixed completed, in-progress, and overdue statuses

---

## 🚧 Supabase edge function

The overdue tasks notifier is implemented at `supabase/functions/overdue-tasks/index.ts`.
It accepts `project_id` and returns overdue tasks with assignee metadata.

---

## 🧪 Local development

Create `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Install and launch locally:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## ✅ Build and lint

- `npm run build` — build the Next.js app
- `npm run lint` — run Biome checks
- `npm run format` — format code with Biome

---

## 📦 Production deployment notes

- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured in production.
- Run `npx tsc --noEmit` to validate strict TypeScript before deployment.
- Confirm Supabase RLS policies and edge function secrets are deployed correctly.
- Verify middleware/access control for authenticated dashboard and workspace routes.
