# Premium SaaS Task Management Application

A production-grade, highly-responsive SaaS Task Management application designed to operate with tenant isolation, PostgreSQL row-level security, optimistic UI status transitions, real-time collaboration updates, and an edge computing notification model.

## 🚀 Key Architectural Choices

This application represents a clean, modern Next.js 16 and React 19 architecture crafted with strict state isolation boundaries.

### State Management Separation
* **Zustand (Global Visual UI State only):** In strict accordance with clean-architecture principles, Zustand is utilized *exclusively* for managing global visual interface parameters, specifically:
  * Active Workspace selection & context switcher.
  * Collapsed/Expanded states of the layout sidebars.
  * Opening/closing/context values of the task detail sheet.
  * High-level client preference states.
* **TanStack Query (Server State Synchronization):** Exclusively holds and manages all server-originated resources. It is used to drive client-side caching, data fetching, background synchronization, and robust **Optimistic UI updates** for task mutations. When a user changes a task status, the client UI is instantaneously updated, a Postgres update request is sent in the background, and standard transactional consistency is guaranteed by query rollbacks on network failure alongside beautiful Sonner notifications.

---

## 📂 Project Structure

The project conforms to a clean, scalable folder architecture:

```text
src/
├── app/                      # Next.js 16 App Router pages
│   ├── (auth)/               # Unified authentication routes (sign-in, sign-up)
│   ├── dashboard/            # High-level workspace aggregate dashboard
│   ├── projects/             # Direct interactive filtered project views
│   ├── workspace/            # Workspace management & invitation control
│   ├── globals.css           # Global theme variables & styles
│   └── layout.tsx            # Root layout mapping Google Fonts & ThemeProvider
├── components/               # Visual UI Components
│   ├── ui/                   # Primitive design tokens powered by base-ui/shadcn
│   ├── workspace/            # Workspace specific layouts & selectors
│   ├── dashboard/            # Dashboard widgets & metric cards
│   ├── task/                 # Interactive task tables & inline detail drawer
│   └── shared/               # Universal sidebar layouts & navigation shell
├── features/                 # Modular domain slices
│   ├── auth/                 # Auth hooks & server actions
│   ├── projects/             # Project creation and detail fetching
│   ├── tasks/                # React Query hooks for task lists, updates & inline saves
│   └── workspaces/           # Workspace membership & detail fetching
├── hooks/                    # Dynamic hook abstractions (QueryProvider)
├── lib/                      # Base configurations & helpers
│   ├── supabase/             # Server/client SSR client generation & middleware
│   └── utils.ts              # Shared visual class-mergers
├── types/                    # DB TypeScript typings automatically mapped
├── middleware.ts             # Auth session refresh middleware
└── stores/                   # Zustand global UI store
```

---

## 🗄️ Database Design & Row Level Security

The backend is fully powered by **Supabase PostgreSQL** with comprehensive **Row-Level Security (RLS)** active across every table to guarantee robust workspace isolation.

### Key Schema Tables
1. **`profiles`:** Secure public profiles synchronized with `auth.users` through a PostgreSQL trigger (`on_auth_user_created`).
2. **`workspaces`:** Top-level SaaS accounts representing custom corporate or team divisions.
3. **`workspace_members`:** A junction table defining workspace user access and roles (`owner` | `member`).
4. **`projects`:** Collaborative folders nested under specific workspaces.
5. **`tasks`:** Individual assignments belonging to projects, tracking titles, descriptions, due dates, assignee user IDs, and statuses (`todo`, `in_progress`, `done`).

### Workspace Tenant Isolation Policies
* Strict policies ensure a user is **completely isolated** inside the workspaces they belong to.
* A user **cannot read, write, update, or delete** projects, members, or tasks associated with a workspace in which they do not have active membership in the `workspace_members` table.
* To prevent recursive infinite-loop RLS evaluations and RLS insertion policy locks during new workspace creation, we implement custom database helper functions with `SECURITY DEFINER` privileges:
  1. **`is_workspace_member(workspace_id)`**: Checks if the active user belongs to a workspace.
  2. **`create_workspace(workspace_name)`**: Atomically inserts the workspace and adds the calling user as the workspace `owner` within a single transaction, avoiding post-insert SELECT policy check race conditions.
  3. **`handle_new_user()`**: Trigger function executed automatically on signup. It syncs the profile, creates a default workspace (`My Workspace`) for the user, sets them as the owner, creates a `Getting Started 🚀` project, and seeds three interactive getting-started tasks. This ensures newly signed-up users are immediately greeted with live interactive data.

```sql
-- Member validation helper
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
```

---

## 🛠️ Supabase Configuration & Setup Instructions

### 1. Database Schema Deployment
Execute the SQL statements inside [schema.sql](file:///c:/Users/asus/task/schema.sql) in your Supabase SQL editor:
* This command will initialize all core tables (`profiles`, `workspaces`, `workspace_members`, `projects`, `tasks`).
* Enables RLS across all tables and mounts the custom workspace isolation policies.
* Declares the automated profile synchronization triggers.
* Seeds the database with **2 workspaces, 4 projects, and 15 highly-differentiated tasks** mapped between two seed users (`alice@example.com` and `bob@example.com`).

> [!TIP]
> **To see pre-seeded mock workspaces/projects/tasks on your newly registered account:**
> Paste and run this SQL query in your **Supabase SQL Editor** to immediately link your existing auth user(s) to the mock workspaces:
> ```sql
> insert into public.workspace_members (workspace_id, user_id, role)
> select w.id, u.id, 'member'
> from public.workspaces w
> cross join auth.users u
> on conflict (workspace_id, user_id) do nothing;
> ```
> New registrations will automatically be joined via the updated trigger!


### 2. Live Database Synchronization & Realtime Setup
To enable Postgres Realtime subscription channels:
1. Navigate to the **Supabase Dashboard** -> **Database** -> **Replication**.
2. Select your `supabase_realtime` publication slot.
3. Enable replication tables for **`tasks`** (and optionally `projects` and `workspace_members`).
4. This empowers the UI client's `supabase.channel()` listeners inside `project-client.tsx` to automatically receive server inserts/updates/deletes and seamlessly invalidate the TanStack Query cache.

### 3. Deploying the Overdue Tasks Edge Function
This application includes a serverless Deno Edge Function located at `supabase/functions/overdue-tasks/index.ts` which securely resolves overdue tasks under active RLS contexts:
1. Install the Supabase CLI.
2. Login and link your project:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
3. Deploy the function:
   ```bash
   supabase functions deploy overdue-tasks
   ```
4. Define the `SUPABASE_URL` and `SUPABASE_ANON_KEY` secrets within your Supabase edge environment if they aren't pre-configured.

---

## 🖥️ Local Development Setup

To spin up the modern client environment locally:

### 1. Configure Local Environment Variables
Create a `.env.local` file inside the root directory with your Supabase coordinates:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies & Launch Application
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive platform.

---

## 🚀 Production Deployment Checklist (Vercel)

When deploying to Vercel, ensure you carry out the following checks to maintain production-grade durability:

- [ ] **TypeScript Strict Compilation:** Run `npx tsc --noEmit` locally to confirm all strict type definitions pass compile loops.
- [ ] **Configure Environment Variables:** Map `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` within the Vercel project configuration dashboard.
- [ ] **Next.js SSR Cookielink & Middleware:** Ensure Next.js middleware is actively executing to block unauthorized access to dashboard/workspace pages without a Supabase session.
- [ ] **Row-Level Security Audit:** Verify that RLS remains active for all public tables in production, preventing direct API client overrides.
- [ ] **Supabase Edge Function Secrets:** Verify that the edge function can securely access client API endpoints.
- [ ] **CDN Optimization:** Verify Vercel edge caching and serverless bundle execution boundaries.
