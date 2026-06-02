"use client"

import AppShell from "@/components/shared/app-shell"
import { WorkspacePageView } from "@/features/workspaces/components/workspace-page-view"
import { useWorkspacePage } from "@/features/workspaces/hooks/use-workspace-page"

interface WorkspaceClientProps {
  workspaceId: string
}

export default function WorkspaceClient({ workspaceId }: WorkspaceClientProps) {
  const model = useWorkspacePage(workspaceId)

  return (
    <AppShell>
      <WorkspacePageView model={model} />
    </AppShell>
  )
}
