"use client";

import {
  AlertTriangle,
  ChevronDown,
  Edit2,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import TaskDetailPanel from "@/components/task/task-detail-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { useProjectPage } from "../hooks/use-project-page";
import {
  ConfirmDeleteDialog,
  ConfirmDeleteProjectDialog,
  CreateTaskDialog,
  RenameProjectDialog,
} from "./project-dialogs";
import { FilterToolbar } from "./project-filters";
import {
  TasksEmptyState,
  TasksTable,
  TasksTableSkeleton,
} from "./project-tasks-table";

type ProjectPageModel = ReturnType<typeof useProjectPage>;

export function ProjectPageView({ model }: { model: ProjectPageModel }) {
  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRequestDeleteTask = (taskId: string) => {
    setTaskIdToDelete(taskId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteTask = async () => {
    if (!taskIdToDelete) return;

    await model.actions.deleteTask(taskIdToDelete);
    setDeleteDialogOpen(false);
    setTaskIdToDelete(null);
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        <ProjectHeader model={model} />
        <OverdueBanner overdueTasks={model.overdueTasks} />
        <FilterToolbar model={model} />

        {model.isLoading ? (
          <TasksTableSkeleton />
        ) : !model.tasks || model.tasks.length === 0 ? (
          <TasksEmptyState
            onCreateClick={() => model.createDialog.setOpen(true)}
          />
        ) : (
          <TasksTable
            tasks={model.tasks}
            onStatusChange={model.actions.updateStatus}
            onOpenDetail={model.actions.openTaskDetail}
            onRequestDeleteTask={handleRequestDeleteTask}
          />
        )}
      </div>
      <CreateTaskDialog model={model} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDeleteTask}
      />
      <RenameProjectDialog model={model} />
      <ConfirmDeleteProjectDialog model={model} />
      <TaskDetailPanel />
    </>
  );
}

function ProjectHeader({ model }: { model: ProjectPageModel }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
      <div>
        {model.isProjectLoading ? (
          <Skeleton className="h-9 w-60" />
        ) : (
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Folder className="h-7 w-7 text-zinc-400" />
            {model.project?.name || "Project View"}
          </h1>
        )}
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Organize tasks, apply filters, and trace timeline requirements.
        </p>
      </div>

      {/* Desktop view actions */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          onClick={() => model.editDialog.setOpen(true)}
          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Rename Project
        </Button>
        <Button
          variant="destructive"
          onClick={() => model.deleteDialog.setOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Project
        </Button>
        <Button
          onClick={() => model.createDialog.setOpen(true)}
          className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
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
              onClick={() => model.createDialog.setOpen(true)}
              className="hover:bg-accent focus:bg-accent cursor-pointer flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => model.editDialog.setOpen(true)}
              className="hover:bg-accent focus:bg-accent cursor-pointer flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Rename Project
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={() => model.deleteDialog.setOpen(true)}
              className="hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer text-red-600 dark:text-red-400 flex items-center gap-2 font-medium"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function OverdueBanner({
  overdueTasks,
}: {
  overdueTasks: { task_title: string; assignee_name: string | null }[];
}) {
  if (overdueTasks.length === 0) return null;

  return (
    <Card className="border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
      <CardHeader className="flex flex-row items-start gap-3 pb-3 pt-4">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold">
            Overdue Tasks Detected ({overdueTasks.length})
          </CardTitle>
          <CardDescription className="text-xs text-red-600/80 dark:text-red-400/80 leading-normal">
            The following tasks have past due dates and remain incomplete:
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="text-xs space-y-1 pl-8 list-disc font-medium">
          {overdueTasks.map((task) => (
            <li
              key={`${task.task_title}-${task.assignee_name ?? "unassigned"}`}
            >
              <span className="font-semibold text-red-800 dark:text-red-300">
                {task.task_title}
              </span>
              {task.assignee_name
                ? ` (assigned to ${task.assignee_name})`
                : " (unassigned)"}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
