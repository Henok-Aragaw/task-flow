import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  ListTodo,
  Plus,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProjectCard from "@/components/dashboard/project-card";
import StatCard from "@/components/dashboard/stat-card";
import WorkspaceTabs from "@/components/dashboard/workspace-tabs";
import AppShell from "@/components/shared/app-shell";
import SyncWorkspaceState from "@/components/shared/sync-workspace-state";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import CreateWorkspaceTrigger from "@/components/workspace/create-workspace-trigger";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

// ── Server-side data fetching ──────────────────────────────────────

async function getDashboardData(workspaceIdParam?: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  // Fetch workspaces the user belongs to directly (RLS filters only workspaces they are member of)
  const { data: workspaces, error: wsErr } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .order("name");

  if (wsErr) {
    console.error("Dashboard workspaces query error:", wsErr);
    throw new Error(wsErr.message);
  }

  const activeId = workspaceIdParam || workspaces?.[0]?.id || null;
  const activeWorkspace = workspaces?.find((w) => w.id === activeId) ?? null;

  if (!activeId) {
    return {
      workspaces: workspaces ?? [],
      activeId,
      activeWorkspace,
      projects: [],
      tasks: [],
    };
  }

  // Parallel fetch projects + tasks with error handling
  const [projResult, tasksResult] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("workspace_id", activeId)
      .order("name"),
    supabase
      .from("tasks")
      .select(
        "id, project_id, title, status, created_at, projects!inner ( id, workspace_id )",
      )
      .eq("projects.workspace_id", activeId),
  ]);

  if (projResult.error) {
    console.error("Dashboard projects query error:", projResult.error);
    throw new Error(projResult.error.message);
  }
  if (tasksResult.error) {
    console.error("Dashboard tasks query error:", tasksResult.error);
    throw new Error(tasksResult.error.message);
  }

  return {
    workspaces: workspaces ?? [],
    activeId,
    activeWorkspace,
    projects:
      projResult.data as Database["public"]["Tables"]["projects"]["Row"][],
    tasks: tasksResult.data as unknown as Pick<
      Database["public"]["Tables"]["tasks"]["Row"],
      "id" | "project_id" | "status"
    >[],
  };
}

// ── Page Component ─────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ workspaceId?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { workspaceId } = await searchParams;
  const { workspaces, activeId, activeWorkspace, projects, tasks } =
    await getDashboardData(workspaceId);

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;

  return (
    <AppShell>
      <SyncWorkspaceState workspaceId={activeId} />

      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Overview of your active workspace projects and task metrics.
            </p>
          </div>
          <CreateWorkspaceTrigger />
        </div>

        {workspaces.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-10">
            <WorkspaceTabs workspaces={workspaces} activeId={activeId} />

            {/* Workspace heading */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-zinc-400" />
                <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
                  {activeWorkspace?.name ?? "Active Workspace"} Overview
                </h2>
              </div>

              {/* Stat cards */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="To Do"
                  value={todoCount}
                  description="Tasks pending assignment or start"
                  icon={ListTodo}
                  accentColor="amber"
                />
                <StatCard
                  label="In Progress"
                  value={inProgressCount}
                  description="Tasks currently being worked on"
                  icon={TrendingUp}
                  accentColor="blue"
                />
                <StatCard
                  label="Completed"
                  value={doneCount}
                  description={`Successfully resolved (${totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0}% completion)`}
                  icon={CheckCircle2}
                  accentColor="emerald"
                />
              </div>
            </div>

            {/* Projects */}
            <ProjectsSection
              projects={projects}
              tasks={tasks}
              activeId={activeId}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ── Sub-sections (co-located, not exported) ────────────────────────

function EmptyState() {
  return (
    <Card className="border-dashed border-zinc-300 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center p-12 text-center max-w-xl mx-auto mt-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 mb-6">
        <Briefcase className="h-8 w-8" />
      </div>
      <CardTitle className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">
        No Workspace Found
      </CardTitle>
      <CardDescription className="text-zinc-500 max-w-sm mb-6 dark:text-zinc-400">
        You aren&apos;t a member of any workspaces yet. Create your first
        workspace to start collaborating.
      </CardDescription>
      <CreateWorkspaceTrigger />
    </Card>
  );
}

function ProjectsSection({
  projects,
  tasks,
  activeId,
}: {
  projects: Database["public"]["Tables"]["projects"]["Row"][];
  tasks: Pick<
    Database["public"]["Tables"]["tasks"]["Row"],
    "id" | "project_id" | "status"
  >[];
  activeId: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-zinc-400" />
          <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
            Active Projects
          </h2>
        </div>
        {activeId && (
          <Link
            href={`/workspace/${activeId}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
            )}
          >
            Manage Projects
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-zinc-300 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center p-8 text-center">
          <CardDescription className="text-zinc-500 mb-4 dark:text-zinc-400">
            No projects found in this workspace. Create a project to start
            organizing tasks.
          </CardDescription>
          <Link
            href={`/workspace/${activeId}`}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create a Project
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((proj) => {
            const pt = tasks.filter((t) => t.project_id === proj.id);
            return (
              <ProjectCard
                key={proj.id}
                project={proj}
                doneCount={pt.filter((t) => t.status === "done").length}
                totalCount={pt.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
