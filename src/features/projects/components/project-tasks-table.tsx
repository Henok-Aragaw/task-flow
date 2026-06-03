"use client"

import { format } from "date-fns"
import { CheckCircle2, Plus, ExternalLink, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { TaskRow } from "@/features/tasks/queries"
import type { TaskStatus } from "../hooks/use-project-page"

export function TasksTable({
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

export function TasksTableSkeleton() {
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

export function TasksEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
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
