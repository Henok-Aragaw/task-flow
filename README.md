# TaskFlow — SaaS Task Management Platform

A production-ready SaaS task and project collaboration platform built with Next.js 16, React 19, Supabase, and strict TypeScript.

## 🚀 What this app delivers

- Public landing page with animated hero section and auth-aware header.
- Tenant-aware workspace isolation with per-user access control.
- Workspace/project/task visibility enforced by Supabase Row Level Security (RLS).
- Real-time task synchronization via Supabase subscriptions and client-side invalidation.
- Optimistic UI updates, inline task editing, and smooth task status transitions.
- An edge-compatible Supabase function for overdue task reporting.

---

## 📂 Repository structure

```text
src/
├── app/                          # Next.js App Router entrypoints
│   ├── page.tsx                  # Public landing page (server component)
│   ├── layout.tsx                # Root layout, providers, and metadata
│   ├── globals.css               # Global styles and theme tokens
│   ├── (auth)/                   # Auth pages
│   │   ├── sign-in/page.tsx      # Sign-in route
│   │   └── sign-up/page.tsx      # Sign-up route
│   ├── dashboard/                # Workspace and project dashboard overview
│   ├── projects/                 # Project-level views and task clients
│   └── workspace/                # Workspace detail and membership UI
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Design primitives (shadcn/base-ui)
│   │   ├── button.tsx            # Button with CVA variants
│   │   ├── infinite-slider.tsx   # Framer Motion infinite slider
│   │   ├── logo-cloud.tsx        # Logo cloud with infinite slider
│   │   ├── dialog.tsx, drawer.tsx, sheet.tsx ...
│   │   └── ... (22 components)
│   ├── landing/                  # Landing page components
│   │   ├── hero-section.tsx      # Hero section with animated entry
│   │   └── landing-header.tsx    # Auth-aware minimal header
│   ├── auth/                     # Auth forms and layout
│   │   ├── auth-layout.tsx       # Shared auth page layout
│   │   ├── sign-in-form.tsx      # Sign-in form (client component)
│   │   └── sign-up-form.tsx      # Sign-up form (client component)
│   ├── dashboard/                # Dashboard widgets
│   │   ├── project-card.tsx      # Project summary card
│   │   ├── stat-card.tsx         # Statistics card
│   │   └── workspace-tabs.tsx    # Workspace tab switcher
│   ├── task/                     # Task UI components
│   │   └── task-detail-panel.tsx  # Task detail drawer
│   ├── workspace/                # Workspace components
│   │   └── create-workspace-trigger.tsx
│   └── shared/                   # Layout shell and shared patterns
│       ├── app-shell.tsx         # Authenticated app layout shell
│       ├── sidebar.tsx           # Navigation sidebar
│       ├── sync-workspace-state.tsx
│       └── theme-provider.tsx    # Dark/light theme provider
│
├── features/                     # Feature slices (queries, components, hooks)
│   ├── auth/
│   │   └── actions.ts            # Server-side auth actions
│   ├── projects/
│   │   ├── queries.ts            # Project data queries
│   │   ├── components/
│   │   │   ├── project-page-view.tsx
│   │   │   ├── project-tasks-table.tsx
│   │   │   ├── project-dialogs.tsx
│   │   │   └── project-filters.tsx
│   │   └── hooks/
│   │       └── use-project-page.ts
│   ├── tasks/
│   │   ├── queries.ts            # Task data queries and mutations
│   │   ├── components/
│   │   │   ├── task-detail-fields.tsx
│   │   │   └── task-field-base.tsx
│   │   └── hooks/
│   │       └── use-task-detail-panel.ts
│   └── workspaces/
│       ├── queries.ts            # Workspace data queries
│       ├── components/
│       │   ├── workspace-page-view.tsx
│       │   ├── workspace-sections.tsx
│       │   └── workspace-dialogs.tsx
│       └── hooks/
│           └── use-workspace-page.ts
│
├── hooks/
│   └── query-provider.tsx        # TanStack Query provider wrapper
│
├── lib/                          # Shared utilities
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   ├── schemas.ts                # Zod validation schemas
│   └── supabase/                 # Supabase client wrappers
│       ├── client.ts             # Browser-side Supabase client
│       ├── server.ts             # Server-side Supabase client
│       └── middleware.ts         # Session refresh and route protection
│
├── stores/
│   └── ui-store.ts               # Zustand store for UI state
│
├── types/
│   └── database.types.ts         # Generated Supabase database typings
│
├── middleware.ts                  # Next.js middleware entry point
│
supabase/                         # Supabase config, migrations, and edge functions
├── config.toml
├── functions/
│   ├── deno.json
│   ├── import_map.json
│   └── overdue-tasks/            # Overdue task reporting function
└── migrations/
    ├── 20260602190000_profile_relationships.sql
    └── 20260603093000_workspace_project_policies.sql
```

### Landing Page

- **`src/app/page.tsx`** is a **server component** that checks Supabase auth and renders the landing page.
- **`src/components/landing/landing-header.tsx`** shows the company wordmark and a contextual button: "Sign In" for guests, "Dashboard" for authenticated users.
- **`src/components/landing/hero-section.tsx`** renders the hero with animated entry transitions and a single "Get started" CTA.

### Auth Architecture

- **Page components** (`src/app/(auth)/**/page.tsx`) are **server components** that handle layout composition.
- **Form components** (`src/components/auth/`) are **client components** containing form state, validation, and submission logic.
- **Auth layout** (`src/components/auth/auth-layout.tsx`) provides shared UI (background grid, centering) for both sign-in and sign-up pages.
- **Auth actions** (`src/features/auth/actions.ts`) are server-side functions handling Supabase auth operations.

### Route Protection

The middleware (`src/lib/supabase/middleware.ts`) enforces:
- `/dashboard`, `/workspace/*`, `/projects/*` → redirect to `/sign-in` if unauthenticated.
- `/sign-in`, `/sign-up` → redirect to `/dashboard` if already authenticated.
- `/` (landing page) → accessible to everyone; header adapts based on auth state.

---

## 🛠 Key technologies

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript with `strict` mode enabled
- Supabase auth, database, and edge functions
- @supabase/ssr client-side/server-side Supabase helpers
- TanStack Query v5 for server-state caching and optimistic updates
- Zustand for UI state management only
- Zod for validation and React Hook Form for form handling
- Tailwind CSS v4 with Base UI / shadcn design primitives
- Framer Motion for landing page animations
- Sonner for toast notifications
- Biome for linting and formatting

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

Open `http://localhost:3000` to see the landing page.

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
