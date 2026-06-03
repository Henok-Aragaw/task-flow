"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

interface SyncWorkspaceStateProps {
  workspaceId: string | null;
}

export default function SyncWorkspaceState({
  workspaceId,
}: SyncWorkspaceStateProps) {
  const { setActiveWorkspaceId } = useUIStore();

  useEffect(() => {
    if (workspaceId) {
      setActiveWorkspaceId(workspaceId);
    }
  }, [workspaceId, setActiveWorkspaceId]);

  return null;
}
