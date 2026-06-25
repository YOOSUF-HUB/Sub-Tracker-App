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
  slate: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-100 text-emerald-700",
  sky: "bg-sky-100 text-sky-700",
  amber: "bg-amber-100 text-amber-700",
};

export function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone = "slate",
}: StatCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 break-words text-2xl font-semibold text-slate-950">
            {value}
          </p>
        </div>
        <div className={cn("rounded-md p-2", tones[tone])}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
      </div>
      {helper ? <p className="mt-3 text-sm text-slate-500">{helper}</p> : null}
    </article>
  );
}
