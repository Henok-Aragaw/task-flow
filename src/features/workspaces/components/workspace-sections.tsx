"use client";

import { ArrowRight, Folder, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";
import type { useWorkspacePage } from "../hooks/use-workspace-page";

type WorkspacePageModel = ReturnType<typeof useWorkspacePage>;
type Project = Database["public"]["Tables"]["projects"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ProjectsSection({
  projects,
  isLoading,
  onCreateClick,
}: {
  projects: Project[] | null | undefined;
  isLoading: boolean;
  onCreateClick: () => void;
}) {
  const router = useRouter();

  return (
    <div className="lg:col-span-2 space-y-4">
      <SectionTitle
        icon={<Folder className="h-5 w-5 text-zinc-400" />}
        title="Projects"
      />
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
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/projects/${project.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MembersSection({
  members,
  isLoading,
}: {
  members:
    | { role: "owner" | "member"; user_id: string; profiles: unknown }[]
    | null
    | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle
        icon={<Users className="h-5 w-5 text-zinc-400" />}
        title="Workspace Members"
      />
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
        <CardContent className="p-4 space-y-4">
          {isLoading ? (
            <MemberSkeletons />
          ) : (
            members?.map((member) => (
              <MemberRow key={member.user_id} member={member} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
        {title}
      </h2>
    </div>
  );
}

export function ProjectSkeletons() {
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
  );
}

export function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  return (
    <Card
      className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 transition-colors shadow-sm cursor-pointer relative group"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold text-zinc-900 dark:text-white truncate">
              {project.name}
            </CardTitle>
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
  );
}

export function MemberSkeletons() {
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
  );
}

export function MemberRow({
  member,
}: {
  member: { role: "owner" | "member"; profiles: unknown };
}) {
  const profile = member.profiles as Profile;
  const initial = (profile.full_name || profile.email).charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800/80 pb-3 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-8 w-8 bg-zinc-100 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
          <AvatarFallback className="text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {profile.full_name || "User"}
          </span>
          <span className="text-xs text-zinc-500 truncate">
            {profile.email}
          </span>
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
  );
}
