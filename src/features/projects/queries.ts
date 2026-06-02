import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { toast } from "sonner"

const supabase = createClient()

export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("name")

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!projectId,
  })
}

export function useCreateProject(workspaceId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (project: Database["public"]["Tables"]["projects"]["Insert"]) => {
      const { data, error } = await supabase.rpc("create_project", {
        project_name: project.name as string,
        project_workspace_id: project.workspace_id as string,
      })

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      toast.success("Project created!")
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceId] })
    },
    onError: (err) => {
      toast.error(`Failed to create project: ${err.message}`)
    },
  })
}
