import ProjectClient from "./project-client"

interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params

  return <ProjectClient projectId={projectId} />
}
