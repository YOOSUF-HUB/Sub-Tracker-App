import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "slate" | "emerald" | "sky" | "amber";
};

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
};

export function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "slate",
}: StatCardProps) {
  return (
    <article className="card card-hover">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium muted">{title}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-slate-950">
            {value}
          </p>
        </div>
        <div className={cn("rounded-md p-2", tones[tone])}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      {helper ? <p className="mt-3 text-sm muted">{helper}</p> : null}
    </article>
  );
}
