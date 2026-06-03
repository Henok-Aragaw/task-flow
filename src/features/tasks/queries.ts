import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

const supabase = createClient();

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"] & {
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export function useTasks(
  projectId: string | null,
  filters: {
    search?: string;
    status?: Database["public"]["Tables"]["tasks"]["Row"]["status"];
    assignee?: string;
  } = {},
) {
  return useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: async () => {
      if (!projectId) return [];

      let query = supabase
        .from("tasks")
        .select(`
          id,
          project_id,
          title,
          description,
          status,
          assignee_id,
          due_date,
          created_at,
          profiles:profiles!tasks_assignee_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("project_id", projectId);

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.assignee) {
        if (filters.assignee === "unassigned") {
          query = query.is("assignee_id", null);
        } else {
          query = query.eq("assignee_id", filters.assignee);
        }
      }

      if (filters.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      // Map to correct properties to satisfy strict type assertions
      return (data || []) as unknown as TaskRow[];
    },
    enabled: !!projectId,
  });
}

export function useTask(taskId: string | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          project_id,
          title,
          description,
          status,
          assignee_id,
          due_date,
          created_at,
          profiles:profiles!tasks_assignee_id_fkey (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("id", taskId)
        .single();

      if (error) throw new Error(error.message);
      return data as unknown as TaskRow;
    },
    enabled: !!taskId,
  });
}

export function useUpdateTaskStatus(
  projectId: string,
  filters: {
    search?: string;
    status?: Database["public"]["Tables"]["tasks"]["Row"]["status"];
    assignee?: string;
  } = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: "todo" | "in_progress" | "done";
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async ({ taskId, status }) => {
      const queryKey = ["tasks", projectId, filters];
      await queryClient.cancelQueries({ queryKey });

      const previousTasks = queryClient.getQueryData<TaskRow[]>(queryKey);

      queryClient.setQueryData<TaskRow[]>(queryKey, (old) => {
        if (!old) return [];
        return old.map((t) =>
          t.id === taskId
            ? ({
                ...t,
                status,
              } as TaskRow)
            : t,
        );
      });

      return { previousTasks, queryKey };
    },
    onError: (err, _variables, context) => {
      if (context?.previousTasks && context.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousTasks);
      }
      toast.error(`Failed to update status: ${err.message}`);
    },
    onSuccess: () => {
      toast.success("Task status updated!");
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
      queryClient.invalidateQueries({ queryKey: ["task"] });
    },
  });
}

export function useUpdateTaskDetails(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<
        Omit<
          Database["public"]["Tables"]["tasks"]["Row"],
          "id" | "project_id" | "created_at"
        >
      >;
    }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Task updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.taskId] });
    },
    onError: (err) => {
      toast.error(`Failed to update task: ${err.message}`);
    },
  });
}

export function useCreateTask(projectId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      task: Database["public"]["Tables"]["tasks"]["Insert"],
    ) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert(task)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Task created!");
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: (err) => {
      toast.error(`Failed to create task: ${err.message}`);
    },
  });
}

export function useWorkspaceTasks(workspaceId: string | null) {
  return useQuery({
    queryKey: ["tasks-workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          project_id,
          title,
          description,
          status,
          assignee_id,
          due_date,
          created_at,
          projects!inner (
            id,
            workspace_id,
            name
          )
        `)
        .eq("projects.workspace_id", workspaceId);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!workspaceId,
  });
}

export function useOverdueTasks(projectId: string | null) {
  return useQuery({
    queryKey: ["overdue-tasks", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      try {
        const { data, error } = await supabase.functions.invoke(
          "overdue-tasks",
          {
            body: JSON.stringify({ project_id: projectId }),
            headers: { "Content-Type": "application/json" },
          },
        );
        if (error) {
          console.warn(
            "Edge function overdue-tasks returned error, falling back:",
            error,
          );
          return [];
        }
        return (data || []) as { task_title: string; assignee_name: string }[];
      } catch (err) {
        console.warn(
          "Could not query Edge function overdue-tasks, falling back:",
          err,
        );
        return [];
      }
    },
    enabled: !!projectId,
    refetchInterval: 10000, // Refresh every 10 seconds to detect new overdues
  });
}
