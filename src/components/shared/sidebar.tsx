"use client";

import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { signOutAction } from "@/features/auth/actions";
import { useCurrentUser } from "@/features/auth/queries";
import { useProjects } from "@/features/projects/queries";
import { useWorkspace, useWorkspaces } from "@/features/workspaces/queries";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export default function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const { resolvedTheme, setTheme } = useTheme();

  // Zustand Store
  const {
    activeWorkspaceId,
    setActiveWorkspaceId,
    sidebarOpen,
    toggleSidebar,
  } = useUIStore();

  // Queries
  const { data: workspaces, refetch: refetchWorkspaces } = useWorkspaces();
  const { data: projects } = useProjects(activeWorkspaceId);
  const { data: activeWorkspace } = useWorkspace(activeWorkspaceId);
  const { data: userProfile } = useCurrentUser();

  // Local state
  const [createOpen, setCreateOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync route param workspaceId with Zustand activeWorkspaceId
  useEffect(() => {
    if (params?.workspaceId) {
      setActiveWorkspaceId(params.workspaceId as string);
      return;
    }

    if (!workspaces) return;

    if (workspaces.length === 0) {
      if (activeWorkspaceId) setActiveWorkspaceId(null);
      return;
    }

    const canAccessActiveWorkspace = workspaces.some(
      (ws) => ws.id === activeWorkspaceId,
    );
    if (!activeWorkspaceId || !canAccessActiveWorkspace) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [params, workspaces, activeWorkspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    if (loading) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call RPC function to atomically create workspace and membership (bypassing RLS issues)
      const { data: ws, error: wsErr } = await supabase.rpc(
        "create_workspace",
        {
          workspace_name: newWorkspaceName.trim(),
        },
      );

      if (wsErr) throw new Error(wsErr.message);
      if (!ws) throw new Error("Workspace was not returned");

      toast.success("Workspace created successfully!");
      setNewWorkspaceName("");
      setCreateOpen(false);
      refetchWorkspaces();
      setActiveWorkspaceId(ws.id);
      router.push(`/workspace/${ws.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to create workspace: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Workspace Switch
  const handleSwitchWorkspace = (id: string) => {
    setActiveWorkspaceId(id);
    router.push(`/workspace/${id}`);
  };

  // Handle Project Navigation
  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <>
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 relative h-full",
          sidebarOpen ? "w-64" : "w-16",
        )}
      >
        {/* Workspace Selector Area */}
        <div className="flex h-16 items-center px-4 border-b border-sidebar-border justify-between">
          {sidebarOpen ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" />}
                className="flex items-center gap-2 hover:bg-sidebar-accent/50 p-1.5 rounded-lg transition-colors text-left max-w-[200px] outline-none cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded bg-sidebar-primary text-sidebar-primary-foreground font-semibold shrink-0">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {activeWorkspace?.name || "Select Workspace"}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-popover border-border text-popover-foreground"
                align="start"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Workspaces
                </div>
                {workspaces?.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    className="hover:bg-accent focus:bg-accent cursor-pointer"
                    onClick={() => handleSwitchWorkspace(ws.id)}
                  >
                    {ws.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="hover:bg-accent focus:bg-accent cursor-pointer text-foreground flex items-center gap-2"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div
              className="flex h-8 w-8 mx-auto items-center justify-center rounded bg-sidebar-accent text-sidebar-foreground font-semibold cursor-pointer"
              onClick={() => toggleSidebar()}
            >
              <Layers className="h-4 w-4" />
            </div>
          )}

          {/* Collapse/Expand toggle button */}
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent hidden md:flex"
              onClick={() => toggleSidebar()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
          {/* Main Dashboard Link */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground",
                !activeWorkspaceId &&
                  "text-sidebar-accent-foreground bg-sidebar-accent",
              )}
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground shrink-0" />
              {sidebarOpen && <span>Dashboard</span>}
            </button>
            {activeWorkspaceId && (
              <button
                type="button"
                onClick={() => router.push(`/workspace/${activeWorkspaceId}`)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground",
                  params?.workspaceId === activeWorkspaceId &&
                    !params?.projectId &&
                    "text-sidebar-accent-foreground bg-sidebar-accent",
                )}
              >
                <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                {sidebarOpen && <span>Workspace Details</span>}
              </button>
            )}
          </div>

          {/* Projects Section */}
          {activeWorkspaceId && (
            <div className="space-y-2">
              {sidebarOpen ? (
                <div className="flex items-center justify-between px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <span>Projects</span>
                  <button
                    type="button"
                    className="hover:text-foreground transition-colors"
                    onClick={() =>
                      router.push(`/workspace/${activeWorkspaceId}`)
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="border-t border-sidebar-border my-2" />
              )}

              <div className="space-y-1">
                {projects && projects.length > 0
                  ? projects.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        onClick={() => handleProjectClick(proj.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          params?.projectId === proj.id
                            ? "text-sidebar-accent-foreground bg-sidebar-accent font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                        {sidebarOpen && (
                          <span className="truncate">{proj.name}</span>
                        )}
                      </button>
                    ))
                  : sidebarOpen && (
                      <span className="px-3 text-xs text-muted-foreground/60 italic block">
                        No projects created
                      </span>
                    )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-sidebar-border space-y-4">
          {/* Theme Selector & Sidebar Expander (when collapsed) */}
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <span className="text-xs text-muted-foreground font-medium">
                  Theme
                </span>
                <div className="flex bg-sidebar-accent/50 rounded-lg p-0.5 border border-sidebar-border">
                  <button
                    type="button"
                    className={cn(
                      "p-1.5 rounded-md transition-all duration-200",
                      mounted && resolvedTheme === "light"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "p-1.5 rounded-md transition-all duration-200",
                      mounted && resolvedTheme === "dark"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="mx-auto p-2 text-muted-foreground hover:text-foreground"
                onClick={() => toggleSidebar()}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* User Section */}
          {userProfile && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8 border border-sidebar-border bg-sidebar-accent shrink-0">
                  <AvatarFallback className="text-sidebar-foreground text-xs font-semibold">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {userProfile.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {userProfile.email}
                    </span>
                  </div>
                )}
              </div>

              {sidebarOpen && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<button type="button" />}
                    className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-popover border-border text-popover-foreground"
                    align="end"
                  >
                    <DropdownMenuItem
                      className="hover:bg-accent focus:bg-accent cursor-pointer text-red-500 flex items-center gap-2"
                      onClick={() => signOutAction()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Create Workspace Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Create Workspace</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace}>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Workspace Name
                </label>
                <Input
                  className="bg-background border-border text-foreground"
                  placeholder="e.g. Acme Corporation"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setCreateOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
