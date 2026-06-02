import Link from "next/link"
import { cn } from "@/lib/utils"

interface WorkspaceTabsProps {
  workspaces: { id: string; name: string }[]
  activeId: string | null
}

export default function WorkspaceTabs({ workspaces, activeId }: WorkspaceTabsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Select Workspace Context
      </span>
      <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1.5 rounded-xl border border-border w-fit">
        {workspaces.map((ws) => (
          <Link
            key={ws.id}
            href={`/dashboard?workspaceId=${ws.id}`}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activeId === ws.id
                ? "bg-background text-foreground border border-border shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {ws.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
