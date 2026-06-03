"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Database } from "@/types/database.types"
import type { useProjectPage } from "../hooks/use-project-page"

type ProjectPageModel = ReturnType<typeof useProjectPage>
type MemberProfile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name">
type WorkspaceMember = { profiles: unknown }

export function FilterToolbar({ model }: { model: ProjectPageModel }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search tasks..."
          className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-zinc-700"
          value={model.filters.search}
          onChange={(event) => model.filters.setSearch(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
        <SlidersHorizontal className="h-4 w-4 text-zinc-500 mr-1 hidden sm:block" />
        <Select
          value={model.filters.status || "all"}
          onValueChange={(value) => model.filters.setStatus(!value || value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={model.filters.assignee || "all"}
          onValueChange={(value) => model.filters.setAssignee(!value || value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-full sm:w-48 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
            <SelectValue>{getAssigneeLabel(model.filters.assignee || "", model.members, "All Assignees")}</SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {model.members?.map((member) => {
              const profile = member.profiles as MemberProfile
              return (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.full_name || profile.email}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export function getAssigneeLabel(
  assignee: string,
  members: WorkspaceMember[] | null | undefined,
  fallback: string,
) {
  if (!assignee) return fallback
  if (assignee === "unassigned") return "Unassigned"

  const profile = members?.find((member) => {
    const profile = member.profiles as MemberProfile
    return profile?.id === assignee
  })?.profiles as MemberProfile | undefined

  return profile?.full_name || profile?.email || fallback
}
