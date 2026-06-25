import { cn } from "@/lib/utils";
import type { SubscriptionStatus } from "@/lib/types";
import { humanizeStatus } from "@/lib/format";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium",
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
