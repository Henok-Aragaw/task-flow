import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("name")

      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!workspaceId,
  })
}

export function useWorkspaceMembers(workspaceId: string | null) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return []
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          role,
          user_id,
          profiles:profiles!workspace_members_user_id_fkey(id, email, full_name, avatar_url)
        `)
        .eq("workspace_id", workspaceId)

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!workspaceId,
  })
}
