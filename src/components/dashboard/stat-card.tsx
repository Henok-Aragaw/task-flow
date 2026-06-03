import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  accentColor: string; // e.g. "amber", "indigo", "emerald"
}

const colorMap: Record<
  string,
  { bar: string; bg: string; text: string; hoverBorder: string }
> = {
  amber: {
    bar: "bg-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    hoverBorder: "hover:border-amber-500/50",
  },
  blue: {
    bar: "bg-sky-500",
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    hoverBorder: "hover:border-sky-500/50",
  },
  emerald: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverBorder: "hover:border-emerald-500/50",
  },
};

export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  accentColor,
}: StatCardProps) {
  const colors = colorMap[accentColor] ?? colorMap.amber;

  return (
    <Card
      className={`border-border bg-card text-card-foreground backdrop-blur-sm relative overflow-hidden group transition-all duration-200 shadow-sm ${colors.hoverBorder}`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${colors.bar}`} />
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-sm font-semibold text-muted-foreground">
          {label}
        </span>
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
