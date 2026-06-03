import { z } from "zod";

/**
 * Auth Validation Schemas
 */
export const signInSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be less than 100 characters"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .min(1, "Password is required"),
});

/**
 * Workspace Validation Schemas
 */
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .min(3, "Workspace name must be at least 3 characters")
    .max(100, "Workspace name must be less than 100 characters")
    .trim(),
});

/**
 * Task Validation Schemas
 */
export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .min(3, "Task title must be at least 3 characters")
    .max(255, "Task title must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .default(""),
  status: taskStatusSchema.default("todo"),
  assignee: z.string().default("unassigned"),
  dueDate: z
    .date()
    .optional()
    .nullable()
    .transform((v) => v || undefined),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .min(3, "Task title must be at least 3 characters")
    .max(255, "Task title must be less than 255 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .or(z.literal("")),
  status: taskStatusSchema.optional(),
  assignee_id: z.string().optional().or(z.literal("unassigned")),
  due_date: z.date().optional(),
});

export const updateTaskTitleSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .min(3, "Task title must be at least 3 characters")
    .max(255, "Task title must be less than 255 characters")
    .trim(),
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
});

export const updateTaskAssigneeSchema = z.object({
  assignee_id: z.string().optional().or(z.literal("unassigned")),
});

export const updateTaskDueDateSchema = z.object({
  due_date: z.date().optional(),
});

export const updateTaskDescriptionSchema = z.object({
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .or(z.literal("")),
});

/**
 * Type exports for TypeScript
 */
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskTitleInput = z.infer<typeof updateTaskTitleSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type UpdateTaskAssigneeInput = z.infer<typeof updateTaskAssigneeSchema>;
export type UpdateTaskDueDateInput = z.infer<typeof updateTaskDueDateSchema>;
export type UpdateTaskDescriptionInput = z.infer<
  typeof updateTaskDescriptionSchema
>;

/**
 * Validation helper function
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: boolean; data?: T; errors?: Record<string, string> } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _error: "Validation failed" } };
  }
}
