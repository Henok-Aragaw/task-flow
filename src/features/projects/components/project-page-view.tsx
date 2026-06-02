"use client"

import { format } from "date-fns"
import {
  AlertCircle,
  AlertTriangle,
  CalendarIcon,
  CheckCircle2,
  ExternalLink,
  Folder,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"
import TaskDetailPanel from "@/components/task/task-detail-panel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import type { TaskRow } from "@/features/tasks/queries"
import { cn } from "@/lib/utils"
import type { Database } from "@/types/database.types"
import type { CreateTaskInput, TaskStatus, useProjectPage } from "../hooks/use-project-page"
import { createTaskSchema, validateForm } from "@/lib/schemas"

type ProjectPageModel = ReturnType<typeof useProjectPage>
type MemberProfile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name">
type WorkspaceMember = { profiles: unknown }

export function ProjectPageView({ model }: { model: ProjectPageModel }) {
  const [taskIdToDelete, setTaskIdToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleRequestDeleteTask = (taskId: string) => {
    setTaskIdToDelete(taskId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDeleteTask = async () => {
    if (!taskIdToDelete) return

    await model.actions.deleteTask(taskIdToDelete)
    setDeleteDialogOpen(false)
    setTaskIdToDelete(null)
  }

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        <ProjectHeader model={model} />
        <OverdueBanner overdueTasks={model.overdueTasks} />
        <FilterToolbar model={model} />

        {model.isLoading ? (
          <TasksTableSkeleton />
        ) : !model.tasks || model.tasks.length === 0 ? (
          <TasksEmptyState onCreateClick={() => model.createDialog.setOpen(true)} />
        ) : (
          <TasksTable
            tasks={model.tasks}
            onStatusChange={model.actions.updateStatus}
            onOpenDetail={model.actions.openTaskDetail}
            onRequestDeleteTask={handleRequestDeleteTask}
          />
        )}
      </div>
      <CreateTaskDialog model={model} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDeleteTask}
      />
      <TaskDetailPanel />
    </>
  )
}

function ProjectHeader({ model }: { model: ProjectPageModel }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-6">
      <div>
        {model.isProjectLoading ? (
          <Skeleton className="h-9 w-60" />
        ) : (
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <Folder className="h-7 w-7 text-zinc-400" />
            {model.project?.name || "Project View"}
          </h1>
        )}
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Organize tasks, apply filters, and trace timeline requirements.
        </p>
      </div>
      <Button
        onClick={() => model.createDialog.setOpen(true)}
        className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shrink-0"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Task
      </Button>
    </div>
  )
}

function OverdueBanner({ overdueTasks }: { overdueTasks: { task_title: string; assignee_name: string | null }[] }) {
  if (overdueTasks.length === 0) return null

  return (
    <Card className="border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
      <CardHeader className="flex flex-row items-start gap-3 pb-3 pt-4">
        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold">Overdue Tasks Detected ({overdueTasks.length})</CardTitle>
          <CardDescription className="text-xs text-red-600/80 dark:text-red-400/80 leading-normal">
            The following tasks have past due dates and remain incomplete:
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <ul className="text-xs space-y-1 pl-8 list-disc font-medium">
          {overdueTasks.map((task) => (
            <li key={`${task.task_title}-${task.assignee_name ?? "unassigned"}`}>
              <span className="font-semibold text-red-800 dark:text-red-300">{task.task_title}</span>
              {task.assignee_name ? ` (assigned to ${task.assignee_name})` : " (unassigned)"}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function FilterToolbar({ model }: { model: ProjectPageModel }) {
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

function getAssigneeLabel(
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

function TasksTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/20">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
          <Skeleton className="h-6 w-1/3" />
        </div>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 last:border-0"
          >
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card className="border-dashed border-zinc-300 dark:border-zinc-800 bg-transparent flex flex-col items-center justify-center p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 mb-4 border border-zinc-200 dark:border-zinc-800">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <CardTitle className="text-lg font-bold mb-1">No Tasks Found</CardTitle>
      <CardDescription className="text-zinc-500 mb-6 max-w-sm">
        No tasks match your active filters, or this project is empty. Add a new task to get started!
      </CardDescription>
      <Button
        onClick={onCreateClick}
        className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Task
      </Button>
    </Card>
  )
}

function TasksTable({
  tasks,
  onStatusChange,
  onOpenDetail,
  onRequestDeleteTask,
}: {
  tasks: TaskRow[]
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onOpenDetail: (taskId: string) => void
  onRequestDeleteTask: (taskId: string) => void
}) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900/20 shadow-sm">
      <Table>
        <TableHeader className="bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-800">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-zinc-800 dark:text-zinc-300 font-semibold py-4 pl-6">Title</TableHead>
            <TableHead className="text-zinc-800 dark:text-zinc-300 font-semibold py-4">Status</TableHead>
            <TableHead className="text-zinc-800 dark:text-zinc-300 font-semibold py-4">Assignee</TableHead>
            <TableHead className="text-zinc-800 dark:text-zinc-300 font-semibold py-4">Due Date</TableHead>
            <TableHead className="text-zinc-800 dark:text-zinc-300 font-semibold py-4 text-right pr-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TaskRowItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onOpenDetail={onOpenDetail}
              onRequestDeleteTask={onRequestDeleteTask}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function TaskRowItem({
  task,
  onStatusChange,
  onOpenDetail,
  onRequestDeleteTask,
}: {
  task: TaskRow
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onOpenDetail: (taskId: string) => void
  onRequestDeleteTask: (taskId: string) => void
}) {
  const initial = task.profiles?.full_name
    ? task.profiles.full_name.charAt(0).toUpperCase()
    : task.profiles?.email
      ? task.profiles.email.charAt(0).toUpperCase()
      : "?"

  return (
    <TableRow className="border-b border-zinc-200 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
      <TableCell className="font-medium py-3.5 pl-6">
        <button
          type="button"
          className="hover:underline font-bold text-zinc-900 dark:text-white text-left focus:outline-none"
          onClick={() => onOpenDetail(task.id)}
        >
          {task.title}
        </button>
      </TableCell>
      <TableCell className="py-3.5">
        <Select
          value={task.status}
          onValueChange={(value) => {
            if (value === "todo" || value === "in_progress" || value === "done") onStatusChange(task.id, value)
          }}
        >
          <SelectTrigger className="w-32 bg-muted border-border text-foreground h-8 text-xs font-semibold focus:ring-ring">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="py-3.5">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 bg-zinc-100 border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
            <AvatarFallback className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-zinc-600 dark:text-zinc-300 truncate max-w-[120px]">
            {task.profiles?.full_name || task.profiles?.email || "Unassigned"}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
        {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-"}
      </TableCell>
      <TableCell className="py-3.5 text-right pr-6 space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-foreground"
          onClick={() => onOpenDetail(task.id)}
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
          onClick={() => onRequestDeleteTask(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

function CreateTaskDialog({ model }: { model: ProjectPageModel }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [assignee, setAssignee] = useState("unassigned")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setFieldErrors({})

    // Validate with Zod
    const validation = validateForm(createTaskSchema, { 
      title, 
      description, 
      status, 
      assignee, 
      dueDate 
    })
    
    if (!validation.success) {
      setFieldErrors(validation.errors || {})
      return
    }

    const task: CreateTaskInput = validation.data!
    model.createDialog.submit(task)
    setTitle("")
    setDescription("")
    setStatus("todo")
    setAssignee("unassigned")
    setDueDate(undefined)
    setFieldErrors({})
  }

  return (
    <Dialog open={model.createDialog.open} onOpenChange={model.createDialog.setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Task Title</label>
              <Input
                className={`bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary/25 ${fieldErrors.title ? "border-red-500 focus-visible:border-red-500" : ""}`}
                placeholder="e.g. Design user interface"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: "" })
                }}
                required
              />
              {fieldErrors.title && (
                <div className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fieldErrors.title}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatusField status={status} setStatus={setStatus} />
              <AssigneeField members={model.members} assignee={assignee} setAssignee={setAssignee} />
            </div>
            <DueDateField dueDate={dueDate} setDueDate={setDueDate} />
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Description</label>
              <Textarea
                className={`bg-background border-border text-foreground min-h-[80px] focus-visible:ring-primary/25 ${fieldErrors.description ? "border-red-500 focus-visible:border-red-500" : ""}`}
                placeholder="Task description details..."
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: "" })
                }}
              />
              {fieldErrors.description && (
                <div className="flex items-center gap-1.5 text-sm text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {fieldErrors.description}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.createDialog.setOpen(false)}
              disabled={model.createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.createTaskMutation.isPending}
            >
              {model.createTaskMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Task...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StatusField({ status, setStatus }: { status: TaskStatus; setStatus: (status: TaskStatus) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Status</label>
      <Select
        value={status}
        onValueChange={(value) => {
          if (value === "todo" || value === "in_progress" || value === "done") setStatus(value)
        }}
      >
        <SelectTrigger className="bg-background border-border text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function AssigneeField({
  members,
  assignee,
  setAssignee,
}: {
  members: WorkspaceMember[] | null | undefined
  assignee: string
  setAssignee: (assignee: string) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">Assignee</label>
      <Select value={assignee} onValueChange={(value) => setAssignee(value || "unassigned")}>
        <SelectTrigger className="bg-background border-border text-foreground">
          <SelectValue>{getAssigneeLabel(assignee, members, "Unassigned")}</SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-popover border-border text-popover-foreground">
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {members?.map((member) => {
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
  )
}

function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Are you sure you want to permanently delete this task?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DueDateField({
  dueDate,
  setDueDate,
}: {
  dueDate: Date | undefined
  setDueDate: (date: Date | undefined) => void
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground block">Due Date</label>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "w-full bg-background border-border text-foreground justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
                !dueDate && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover border-border">
          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} className="bg-popover text-foreground" />
        </PopoverContent>
      </Popover>
    </div>
  )
}
