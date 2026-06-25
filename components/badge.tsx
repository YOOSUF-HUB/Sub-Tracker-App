import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/types";
import { humanizeStatus } from "@/lib/format";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
  green:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/80 dark:bg-emerald-950/50 dark:text-emerald-300",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/50 dark:text-amber-300",
  red:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900/80 dark:bg-red-950/50 dark:text-red-300",
  blue:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/80 dark:bg-sky-950/50 dark:text-sky-300",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium transition-colors duration-200",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const tone =
    status === "active" ? "green" : status === "paused" ? "amber" : "neutral";

  return <Badge tone={tone}>{humanizeStatus(status)}</Badge>;
}
