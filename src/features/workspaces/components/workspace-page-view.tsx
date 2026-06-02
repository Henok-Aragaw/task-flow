"use client"

import { ArrowRight, Folder, Loader2, Mail, Plus, UserPlus, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database.types"
import type { useWorkspacePage } from "../hooks/use-workspace-page"

type WorkspacePageModel = ReturnType<typeof useWorkspacePage>
type Project = Database["public"]["Tables"]["projects"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function WorkspacePageView({ model }: { model: WorkspacePageModel }) {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <WorkspaceHeader model={model} />
      <div className="grid gap-8 lg:grid-cols-3">
        <ProjectsSection
          projects={model.projects}
          isLoading={model.isProjectsLoading}
          onCreateClick={() => model.projectDialog.setOpen(true)}
        />
        <MembersSection members={model.members} isLoading={model.isMembersLoading} />
      </div>
      <CreateProjectDialog model={model} />
      <InviteMemberDialog model={model} />
    </div>
  )
}

function WorkspaceHeader({ model }: { model: WorkspacePageModel }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
      <div>
        {model.isLoading ? (
          <Skeleton className="h-9 w-64" />
        ) : (
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {model.workspace?.name || "Workspace Settings"}
          </h1>
        )}
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your workspace projects, add team members, and view dashboard progress.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          onClick={() => model.inviteDialog.setOpen(true)}
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
        <Button
          onClick={() => model.projectDialog.setOpen(true)}
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}

function ProjectsSection({
  projects,
  isLoading,
  onCreateClick,
}: {
  projects: Project[] | null | undefined
  isLoading: boolean
  onCreateClick: () => void
}) {
  const router = useRouter()

  return (
    <div className="lg:col-span-2 space-y-4">
      <SectionTitle icon={<Folder className="h-5 w-5 text-zinc-400" />} title="Projects" />
      {isLoading ? (
        <ProjectSkeletons />
      ) : !projects || projects.length === 0 ? (
        <Card className="border-dashed border-zinc-300 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center p-8 text-center">
          <CardDescription className="text-zinc-500 mb-4">
            No projects found. Create a project to start organizing tasks.
          </CardDescription>
          <Button
            size="sm"
            onClick={onCreateClick}
            className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create a Project
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onClick={() => router.push(`/projects/${project.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function MembersSection({
  members,
  isLoading,
}: {
  members: { role: "owner" | "member"; user_id: string; profiles: unknown }[] | null | undefined
  isLoading: boolean
}) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={<Users className="h-5 w-5 text-zinc-400" />} title="Workspace Members" />
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <MemberSkeletons />
          ) : (
            members?.map((member) => <MemberRow key={member.user_id} member={member} />)
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">{title}</h2>
    </div>
  )
}

function ProjectSkeletons() {
  return (
    <div className="space-y-4">
      {[1, 2].map((item) => (
        <Card key={item} className="border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-2 w-2/3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <Card
      className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors shadow-sm cursor-pointer relative group"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white truncate">{project.name}</CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Created {new Date(project.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="h-7 w-7 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

function MemberSkeletons() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberRow({ member }: { member: { role: "owner" | "member"; profiles: unknown } }) {
  const profile = member.profiles as Profile
  const initial = (profile.full_name || profile.email).charAt(0).toUpperCase()

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 bg-zinc-100 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
          <AvatarFallback className="text-zinc-700 dark:text-zinc-300 text-xs font-semibold">{initial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {profile.full_name || "User"}
          </span>
          <span className="text-xs text-zinc-500 truncate">{profile.email}</span>
        </div>
      </div>
      <Badge
        variant="secondary"
        className={cn(
          "text-xs capitalize font-medium shrink-0",
          member.role === "owner"
            ? "bg-primary/10 text-primary border border-primary/20"
            : "bg-muted text-muted-foreground border border-border",
        )}
      >
        {member.role}
      </Badge>
    </div>
  )
}

function CreateProjectDialog({ model }: { model: WorkspacePageModel }) {
  return (
    <Dialog open={model.projectDialog.open} onOpenChange={model.projectDialog.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={model.projectDialog.submit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Project Name</label>
              <Input
                className="bg-background border-border text-foreground focus-visible:ring-primary/25"
                placeholder="e.g. Website Overhaul"
                value={model.projectDialog.name}
                onChange={(event) => model.projectDialog.setName(event.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.projectDialog.setOpen(false)}
              disabled={model.createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.createProjectMutation.isPending}
            >
              {model.createProjectMutation.isPending ? (
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
  )
}

function InviteMemberDialog({ model }: { model: WorkspacePageModel }) {
  return (
    <Dialog open={model.inviteDialog.open} onOpenChange={model.inviteDialog.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Workspace Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={model.inviteDialog.submit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">User Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary/25"
                  placeholder="name@example.com"
                  type="email"
                  value={model.inviteDialog.email}
                  onChange={(event) => model.inviteDialog.setEmail(event.target.value)}
                  required
                  disabled={model.inviteDialog.isSubmitting}
                />
              </div>
              <span className="text-xs text-muted-foreground block leading-normal mt-1">
                Note: The user must have already signed up for an account in TaskFlow to be added to this workspace.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.inviteDialog.setOpen(false)}
              disabled={model.inviteDialog.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.inviteDialog.isSubmitting}
            >
              {model.inviteDialog.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Member...
                </>
              ) : (
                "Invite Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
