"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  AlignLeft,
  CalendarIcon,
  CheckCircle,
  Clock,
  Edit2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  updateTaskDescriptionSchema,
  updateTaskTitleSchema,
  validateForm,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";
import type {
  ProfileRow,
  useTaskDetailPanel,
} from "../hooks/use-task-detail-panel";
import {
  EditActions,
  InlineField,
  isTaskStatus,
  TextInputEditor,
} from "./task-field-base";

type TaskDetailModel = ReturnType<typeof useTaskDetailPanel>;

export function TitleField({ model }: { model: TaskDetailModel }) {
  return (
    <InlineField
      label="Title"
      editing={model.editField === "title"}
      onEdit={() => model.setEditField("title")}
      displayContent={
        <h3 className="text-base font-bold text-foreground leading-tight pr-4 flex-1">
          {model.task?.title || "Untitled Task"}
        </h3>
      }
      editContent={
        <TextInputEditor
          value={model.values.title}
          onChange={model.values.setTitle}
          placeholder="Enter task title"
          onSave={() => model.saveField("title")}
          onCancel={() => model.cancelField("title")}
          validationSchema={updateTaskTitleSchema}
          fieldName="title"
        />
      }
    />
  );
}

export function StatusField({ model }: { model: TaskDetailModel }) {
  return (
    <InlineField
      label="Status"
      editing={model.editField === "status"}
      onEdit={() => model.setEditField("status")}
      displayContent={
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground capitalize font-medium">
            {model.task?.status.replace("_", " ") || "todo"}
          </span>
        </div>
      }
      editContent={
        <div className="flex items-center gap-2">
          <Select
            value={model.values.status}
            onValueChange={(value) => {
              if (isTaskStatus(value)) model.values.setStatus(value);
            }}
          >
            <SelectTrigger className="bg-background border-border text-foreground flex-1">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
            </SelectContent>
          </Select>
          <EditActions
            onSave={() => model.saveField("status")}
            onCancel={() => model.cancelField("status")}
          />
        </div>
      }
    />
  );
}

export function AssigneeField({ model }: { model: TaskDetailModel }) {
  const selectedAssigneeLabel = getSelectedAssigneeLabel(
    model.values.assignee,
    model.members,
  );

  return (
    <InlineField
      label="Assignee"
      editing={model.editField === "assignee_id"}
      onEdit={() => model.setEditField("assignee_id")}
      displayContent={
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground truncate">
            {model.assigneeDisplay}
          </span>
        </div>
      }
      editContent={
        <div className="flex items-center gap-2">
          <Select
            value={model.values.assignee}
            onValueChange={(value) =>
              model.values.setAssignee(value || "unassigned")
            }
          >
            <SelectTrigger className="bg-background border-border text-foreground flex-1">
              <SelectValue>{selectedAssigneeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {model.members?.map((member) => {
                const profile = member.profiles as ProfileRow;
                return (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <EditActions
            onSave={() => model.saveField("assignee_id")}
            onCancel={() => model.cancelField("assignee_id")}
          />
        </div>
      }
    />
  );
}

function getSelectedAssigneeLabel(
  assignee: string,
  members: { profiles: unknown }[] | null | undefined,
) {
  if (!assignee) return "Select Assignee";
  if (assignee === "unassigned") return "Unassigned";

  const member = members?.find((item) => {
    const profile = item.profiles as ProfileRow;
    return profile?.id === assignee;
  });

  const profile = member?.profiles as ProfileRow | undefined;

  return profile?.full_name || profile?.email || assignee;
}

export function DueDateField({ model }: { model: TaskDetailModel }) {
  return (
    <InlineField
      label="Due Date"
      editing={model.editField === "due_date"}
      onEdit={() => model.setEditField("due_date")}
      displayContent={
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {model.task?.due_date
              ? format(new Date(model.task.due_date), "PPP")
              : "No due date"}
          </span>
        </div>
      }
      editContent={
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 bg-background border-border text-foreground justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
                    !model.values.dueDate && "text-muted-foreground",
                  )}
                />
              }
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {model.values.dueDate ? (
                format(model.values.dueDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover border-border">
              <Calendar
                mode="single"
                selected={model.values.dueDate}
                onSelect={model.values.setDueDate}
                className="bg-popover text-foreground"
              />
            </PopoverContent>
          </Popover>
          <EditActions
            onSave={() => model.saveField("due_date")}
            onCancel={() => model.cancelField("due_date")}
          />
        </div>
      }
    />
  );
}

export function DescriptionField({ model }: { model: TaskDetailModel }) {
  const isEditing = model.editField === "description";
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);

    const validation = validateForm(updateTaskDescriptionSchema, {
      description: model.values.description,
    });
    if (!validation.success) {
      setError(validation.errors?.description || "Validation failed");
      return;
    }

    model.saveField("description");
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground">
        Description
      </label>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={model.values.description}
            onChange={(event) => {
              model.values.setDescription(event.target.value);
              if (error) setError(null);
            }}
            className={`bg-background border-border text-foreground min-h-[120px] focus-visible:ring-primary/25 ${error ? "border-red-500 focus-visible:border-red-500" : ""}`}
            placeholder="Enter task description details..."
          />
          {error && (
            <div className="flex items-center gap-1.5 text-sm text-red-500 px-2">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.cancelField("description")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between p-3 rounded-lg bg-muted/20 border border-transparent hover:border-border hover:bg-muted/40 transition-all">
          <div className="flex items-start gap-2 flex-1 min-w-0 pr-4">
            <AlignLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {model.task?.description || "No description provided."}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => model.setEditField("description")}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
