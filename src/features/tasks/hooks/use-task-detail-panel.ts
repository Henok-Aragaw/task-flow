"use client"

import { useCallback, useEffect, useState } from "react"
import { useProject } from "@/features/projects/queries"
import { useTask, useUpdateTaskDetails } from "@/features/tasks/queries"
import { useWorkspaceMembers } from "@/features/workspaces/queries"
import { useUIStore } from "@/stores/ui-store"
import type { Database } from "@/types/database.types"

export type TaskStatus = "todo" | "in_progress" | "done"
export type EditableTaskField = "title" | "description" | "status" | "assignee_id" | "due_date"
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]

export function useTaskDetailPanel() {
  const { taskDetailPanelOpen, taskDetailPanelTaskId, closeTaskDetailPanel } = useUIStore()
  const taskQuery = useTask(taskDetailPanelTaskId)
  const projectQuery = useProject(taskQuery.data?.project_id || null)
  const membersQuery = useWorkspaceMembers(projectQuery.data?.workspace_id || null)
  const updateMutation = useUpdateTaskDetails(projectQuery.data?.id || null)

  const [editField, setEditField] = useState<EditableTaskField | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [assignee, setAssignee] = useState("unassigned")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const task = taskQuery.data
    if (!task) return

    setTitle(task.title || "")
    setDescription(task.description || "")
    setStatus(task.status || "todo")
    setAssignee(task.assignee_id || "unassigned")
    setDueDate(task.due_date ? new Date(task.due_date) : undefined)
  }, [taskQuery.data])

  const saveField = useCallback(
    (fieldName: EditableTaskField) => {
      const task = taskQuery.data
      if (!task) return

      const updates = {
        title: title.trim() || "Untitled Task",
        description: description.trim() || null,
        status,
        assignee_id: assignee === "unassigned" ? null : assignee,
        due_date: dueDate ? dueDate.toISOString() : null,
      }

      updateMutation.mutate(
        { taskId: task.id, updates: { [fieldName]: updates[fieldName] } },
        { onSuccess: () => setEditField(null) },
      )
    },
    [assignee, description, dueDate, status, taskQuery.data, title, updateMutation],
  )

  const cancelField = useCallback(
    (fieldName: EditableTaskField) => {
      const task = taskQuery.data
      if (!task) return

      if (fieldName === "title") setTitle(task.title || "")
      if (fieldName === "description") setDescription(task.description || "")
      if (fieldName === "status") setStatus(task.status || "todo")
      if (fieldName === "assignee_id") setAssignee(task.assignee_id || "unassigned")
      if (fieldName === "due_date") setDueDate(task.due_date ? new Date(task.due_date) : undefined)

      setEditField(null)
    },
    [taskQuery.data],
  )

  const assigneeDisplay = getAssigneeDisplay(taskQuery.data?.assignee_id ?? null, membersQuery.data)

  return {
    open: taskDetailPanelOpen,
    close: closeTaskDetailPanel,
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    members: membersQuery.data,
    editField,
    setEditField,
    values: {
      title,
      setTitle,
      description,
      setDescription,
      status,
      setStatus,
      assignee,
      setAssignee,
      dueDate,
      setDueDate,
    },
    assigneeDisplay,
    saveField,
    cancelField,
  }
}

function getAssigneeDisplay(assigneeId: string | null, members: { profiles: unknown }[] | null | undefined) {
  if (!assigneeId) return "Unassigned"

  const member = members?.find((item) => {
    const profile = item.profiles as ProfileRow
    return profile?.id === assigneeId
  })

  if (!member) return "Assigned"

  const profile = member.profiles as ProfileRow
  return profile.full_name || profile.email
}
