"use client";

import { format } from "date-fns";
import { AlertCircle, CalendarIcon, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskSchema, validateForm } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";
import type {
  CreateTaskInput,
  TaskStatus,
  useProjectPage,
} from "../hooks/use-project-page";
import { getAssigneeLabel } from "./project-filters";

type ProjectPageModel = ReturnType<typeof useProjectPage>;
type MemberProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "full_name"
>;
type WorkspaceMember = { profiles: unknown };

export function CreateTaskDialog({ model }: { model: ProjectPageModel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assignee, setAssignee] = useState("unassigned");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    // Validate with Zod
    const validation = validateForm(createTaskSchema, {
      title,
      description,
      status,
      assignee,
      dueDate,
    });

    if (!validation.success) {
      setFieldErrors(validation.errors || {});
      return;
    }

    const task: CreateTaskInput = validation.data!;
    model.createDialog.submit(task);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setAssignee("unassigned");
    setDueDate(undefined);
    setFieldErrors({});
  };

  return (
    <Dialog
      open={model.createDialog.open}
      onOpenChange={model.createDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Task Title
              </label>
              <Input
                className={`bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary/25 ${fieldErrors.title ? "border-red-500 focus-visible:border-red-500" : ""}`}
                placeholder="e.g. Design user interface"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (fieldErrors.title)
                    setFieldErrors({ ...fieldErrors, title: "" });
                }}
                required
              />
              {fieldErrors.title && (
                <div className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fieldErrors.title}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatusField status={status} setStatus={setStatus} />
              <AssigneeField
                members={model.members}
                assignee={assignee}
                setAssignee={setAssignee}
              />
            </div>
            <DueDateField dueDate={dueDate} setDueDate={setDueDate} />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Description
              </label>
              <Textarea
                className={`bg-background border-border text-foreground min-h-[80px] focus-visible:ring-primary/25 ${fieldErrors.description ? "border-red-500 focus-visible:border-red-500" : ""}`}
                placeholder="Task description details..."
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  if (fieldErrors.description)
                    setFieldErrors({ ...fieldErrors, description: "" });
                }}
              />
              {fieldErrors.description && (
                <div className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fieldErrors.description}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.createDialog.setOpen(false)}
              disabled={model.createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.createTaskMutation.isPending}
            >
              {model.createTaskMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Task...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusField({
  status,
  setStatus,
}: {
  status: TaskStatus;
  setStatus: (status: TaskStatus) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Status</label>
      <Select
        value={status}
        onValueChange={(value) => {
          if (value === "todo" || value === "in_progress" || value === "done")
            setStatus(value);
        }}
      >
        <SelectTrigger className="bg-background border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function AssigneeField({
  members,
  assignee,
  setAssignee,
}: {
  members: WorkspaceMember[] | null | undefined;
  assignee: string;
  setAssignee: (assignee: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Assignee</label>
      <Select
        value={assignee}
        onValueChange={(value) => setAssignee(value || "unassigned")}
      >
        <SelectTrigger className="bg-background border-border text-foreground">
          <SelectValue>
            {getAssigneeLabel(assignee, members, "Unassigned")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {members?.map((member) => {
            const profile = member.profiles as MemberProfile;
            return (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.full_name || profile.email}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently
            delete this task?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DueDateField({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground block">
        Due Date
      </label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "w-full bg-background border-border text-foreground justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
                !dueDate && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover border-border">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={setDueDate}
            className="bg-popover text-foreground"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function RenameProjectDialog({ model }: { model: ProjectPageModel }) {
  return (
    <Dialog
      open={model.editDialog.open}
      onOpenChange={model.editDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={model.editDialog.submit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Project Name
              </label>
              <Input
                className="bg-background border-border text-foreground focus-visible:ring-primary/25"
                placeholder="e.g. Website Overhaul"
                value={model.editDialog.name}
                onChange={(event) =>
                  model.editDialog.setName(event.target.value)
                }
                required
                disabled={model.editDialog.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.editDialog.setOpen(false)}
              disabled={model.editDialog.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.editDialog.isPending}
            >
              {model.editDialog.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDeleteProjectDialog({
  model,
}: {
  model: ProjectPageModel;
}) {
  return (
    <Dialog
      open={model.deleteDialog.open}
      onOpenChange={model.deleteDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project?</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. It will delete all
            tasks associated with this project.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => model.deleteDialog.setOpen(false)}
            disabled={model.deleteDialog.isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={model.deleteDialog.submit}
            disabled={model.deleteDialog.isPending}
          >
            {model.deleteDialog.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
