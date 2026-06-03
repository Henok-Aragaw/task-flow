import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Database } from "@/types/database.types";

interface ProjectCardProps {
  project: Database["public"]["Tables"]["projects"]["Row"];
  doneCount: number;
  totalCount: number;
}

export default function ProjectCard({
  project,
  doneCount,
  totalCount,
}: ProjectCardProps) {
  const pct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <Card className="border-border bg-card text-card-foreground hover:bg-accent/40 transition-all duration-200 shadow-sm h-full hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold truncate text-foreground">
            {project.name}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Created {new Date(project.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tasks Status</span>
              <span className="font-semibold text-foreground">
                {doneCount}/{totalCount} Done
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
