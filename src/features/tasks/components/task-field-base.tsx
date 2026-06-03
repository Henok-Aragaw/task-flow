"use client";

import { AlertCircle, Check, Edit2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateForm } from "@/lib/schemas";
import type { TaskStatus } from "../hooks/use-task-detail-panel";

export function InlineField({
  label,
  editing,
  displayContent,
  editContent,
  onEdit,
}: {
  label: string;
  editing: boolean;
  displayContent: ReactNode;
  editContent: ReactNode;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      {editing ? (
        editContent
      ) : (
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-transparent hover:border-border hover:bg-muted/40 transition-all">
          {displayContent}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={onEdit}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function EditActions({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="text-green-500 hover:bg-green-500/10"
        onClick={onSave}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="text-red-500 hover:bg-red-500/10"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </>
  );
}

export function TextInputEditor({
  value,
  onChange,
  placeholder,
  onSave,
  onCancel,
  validationSchema,
  fieldName = "value",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onSave: () => void;
  onCancel: () => void;
  validationSchema?: z.ZodSchema<Record<string, string>>;
  fieldName?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);

    if (validationSchema) {
      const validation = validateForm(validationSchema, { [fieldName]: value });
      if (!validation.success) {
        setError(validation.errors?.[fieldName] || "Validation failed");
        return;
      }
    }

    onSave();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (error) setError(null);
          }}
          className={`bg-background border-border text-foreground flex-1 focus-visible:ring-primary/25 ${error ? "border-red-500 focus-visible:border-red-500" : ""}`}
          placeholder={placeholder}
        />
        <EditActions onSave={handleSave} onCancel={onCancel} />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-red-500 px-2">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}

export function isTaskStatus(value: string | null): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "done";
}
