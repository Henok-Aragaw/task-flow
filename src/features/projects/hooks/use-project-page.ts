"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useProject, useUpdateProject, useDeleteProject } from "@/features/projects/queries"
import { useCreateTask, useOverdueTasks, useTasks, useUpdateTaskStatus } from "@/features/tasks/queries"
import { useWorkspaceMembers } from "@/features/workspaces/queries"
import { createClient } from "@/lib/supabase/client"
import { useUIStore } from "@/stores/ui-store"
import type { Database } from "@/types/database.types"

export type TaskStatus = "todo" | "in_progress" | "done"

export interface CreateTaskInput {
  title: string
  description: string
  status: TaskStatus
  assignee: string
  dueDate: Date | undefined
}

export function useProjectPage(projectId: string) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const supabase = createClient()
  const { openTaskDetailPanel, taskDetailPanelTaskId } = useUIStore()

  const searchFilter = searchParams.get("search") || ""
  const statusFilter = (searchParams.get("status") || undefined) as TaskStatus | undefined
  const assigneeFilter = searchParams.get("assignee") || ""

  const filters = useMemo(
    () => ({ search: searchFilter, status: statusFilter, assignee: assigneeFilter }),
    [searchFilter, statusFilter, assigneeFilter],
  )

  const projectQuery = useProject(projectId)
  const workspaceId = projectQuery.data?.workspace_id || null
  const membersQuery = useWorkspaceMembers(workspaceId)
  const tasksQuery = useTasks(projectId, filters)
  const overdueTasksQuery = useOverdueTasks(projectId)
  const updateStatusMutation = useUpdateTaskStatus(projectId, filters)
  const createTaskMutation = useCreateTask(projectId)
  
  const updateProjectMutation = useUpdateProject(workspaceId)
  const deleteProjectMutation = useDeleteProject(workspaceId)

  const [createOpen, setCreateOpen] = useState(false)
  const [projectEditOpen, setProjectEditOpen] = useState(false)
  const [projectEditName, setProjectEditName] = useState("")
  const [projectDeleteOpen, setProjectDeleteOpen] = useState(false)

  useEffect(() => {
    if (projectQuery.data?.name) {
      setProjectEditName(projectQuery.data.name)
    }
  }, [projectQuery.data?.name])

  useEffect(() => {
    const channel = supabase
      .channel(`project-tasks-realtime-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `project_id=eq.${projectId}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
          queryClient.invalidateQueries({ queryKey: ["tasks-workspace"] })
          queryClient.invalidateQueries({ queryKey: ["overdue-tasks", projectId] })

          const newRow = payload.new as Database["public"]["Tables"]["tasks"]["Row"]
          if (newRow?.id === taskDetailPanelTaskId) {
            queryClient.invalidateQueries({ queryKey: ["task", newRow.id] })
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [projectId, queryClient, supabase, taskDetailPanelTaskId])

  const updateUrlParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(name, value)
    } else {
      params.delete(name)
    }

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const updateStatus = (taskId: string, status: TaskStatus) => {
    updateStatusMutation.mutate({ taskId, status })
  }

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId)
    if (error) {
      toast.error(`Failed to delete task: ${error.message}`)
      return
    }

    toast.success("Task deleted!")
    queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
  }

  const createTask = (data: CreateTaskInput) => {
    createTaskMutation.mutate(
      {
        project_id: projectId,
        title: data.title.trim(),
        description: data.description.trim() || null,
        status: data.status,
        assignee_id: data.assignee === "unassigned" ? null : data.assignee,
        due_date: data.dueDate ? data.dueDate.toISOString() : null,
      },
      { onSuccess: () => setCreateOpen(false) },
    )
  }

  const updateProject = (event: FormEvent) => {
    event.preventDefault()
    const name = projectEditName.trim()
    if (!name) return

    updateProjectMutation.mutate(
      { projectId, name },
      {
        onSuccess: () => {
          setProjectEditOpen(false)
        },
      },
    )
  }

  const deleteProject = () => {
    deleteProjectMutation.mutate(projectId, {
      onSuccess: () => {
        setProjectDeleteOpen(false)
        if (workspaceId) {
          router.push(`/workspace/${workspaceId}`)
        } else {
          router.push("/dashboard")
        }
      },
    })
  }

  return {
    project: projectQuery.data,
    members: membersQuery.data,
    tasks: tasksQuery.data,
    overdueTasks: overdueTasksQuery.data ?? [],
    isLoading: projectQuery.isLoading || tasksQuery.isLoading,
    isProjectLoading: projectQuery.isLoading,
    createTaskMutation,
    filters: {
      search: searchFilter,
      status: statusFilter,
      assignee: assigneeFilter,
      setSearch: (value: string) => updateUrlParam("search", value),
      setStatus: (value: string) => updateUrlParam("status", value),
      setAssignee: (value: string) => updateUrlParam("assignee", value),
    },
    createDialog: {
      open: createOpen,
      setOpen: setCreateOpen,
      submit: createTask,
    },
    editDialog: {
      open: projectEditOpen,
      setOpen: setProjectEditOpen,
      name: projectEditName,
      setName: setProjectEditName,
      submit: updateProject,
      isPending: updateProjectMutation.isPending,
    },
    deleteDialog: {
      open: projectDeleteOpen,
      setOpen: setProjectDeleteOpen,
      submit: deleteProject,
      isPending: deleteProjectMutation.isPending,
    },
    actions: {
      updateStatus,
      deleteTask,
      openTaskDetail: openTaskDetailPanel,
    },
  }
}
