"use client";

import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AssigneeField,
  DescriptionField,
  DueDateField,
  StatusField,
  TitleField,
} from "@/features/tasks/components/task-detail-fields";
import { useTaskDetailPanel } from "@/features/tasks/hooks/use-task-detail-panel";

export default function TaskDetailPanel() {
  const model = useTaskDetailPanel();

  return (
    <Sheet open={model.open} onOpenChange={(open) => !open && model.close()}>
      <SheetContent className="w-full sm:max-w-md bg-card border-l border-border text-foreground p-6 overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border">
          <SheetTitle className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Task details
          </SheetTitle>
          <SheetDescription className="text-muted-foreground/80 text-xs">
            Edit fields inline. Press save to lock updates.
          </SheetDescription>
        </SheetHeader>

        {model.isLoading ? (
          <TaskDetailLoading />
        ) : !model.task ? (
          <div className="text-center py-20 text-muted-foreground">
            Task details not found.
          </div>
        ) : (
          <div className="space-y-6 pt-6">
            <TitleField model={model} />
            <StatusField model={model} />
            <AssigneeField model={model} />
            <DueDateField model={model} />
            <DescriptionField model={model} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function TaskDetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Loading task details...
      </span>
    </div>
  );
}
