"use client";

import AppShell from "@/components/shared/app-shell";
import { ProjectPageView } from "@/features/projects/components/project-page-view";
import { useProjectPage } from "@/features/projects/hooks/use-project-page";

interface ProjectClientProps {
  projectId: string;
}

export default function ProjectClient({ projectId }: ProjectClientProps) {
  const model = useProjectPage(projectId);

  return (
    <AppShell>
      <ProjectPageView model={model} />
    </AppShell>
  );
}
