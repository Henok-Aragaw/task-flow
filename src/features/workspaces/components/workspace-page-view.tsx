"use client";

import { ChevronDown, Edit2, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { useWorkspacePage } from "../hooks/use-workspace-page";
import {
  ConfirmDeleteWorkspaceDialog,
  CreateProjectDialog,
  InviteMemberDialog,
  RenameWorkspaceDialog,
} from "./workspace-dialogs";
import { MembersSection, ProjectsSection } from "./workspace-sections";

type WorkspacePageModel = ReturnType<typeof useWorkspacePage>;

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
        <MembersSection
          members={model.members}
          isLoading={model.isMembersLoading}
        />
      </div>
      <CreateProjectDialog model={model} />
      <InviteMemberDialog model={model} />
      <RenameWorkspaceDialog model={model} />
      <ConfirmDeleteWorkspaceDialog model={model} />
    </div>
  );
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
          Manage your workspace projects, add team members, and view dashboard
          progress.
        </p>
      </div>

      {/* Desktop view actions */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        {model.isOwner && (
          <Button
            variant="destructive"
            onClick={() => model.deleteDialog.setOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Workspace
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => model.editDialog.setOpen(true)}
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Rename Workspace
        </Button>
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

      {/* Mobile view actions */}
      <div className="flex sm:hidden items-center shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="border-zinc-300 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
              />
            }
          >
            Actions <ChevronDown className="ml-2 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-48 bg-popover border-border text-popover-foreground"
            align="end"
          >
            <DropdownMenuItem
              onClick={() => model.projectDialog.setOpen(true)}
              className="hover:bg-accent focus:bg-accent cursor-pointer flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => model.inviteDialog.setOpen(true)}
              className="hover:bg-accent focus:bg-accent cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => model.editDialog.setOpen(true)}
              className="hover:bg-accent focus:bg-accent cursor-pointer flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Rename Workspace
            </DropdownMenuItem>
            {model.isOwner && (
              <>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => model.deleteDialog.setOpen(true)}
                  className="hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Workspace
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
