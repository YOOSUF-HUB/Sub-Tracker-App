import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return <section className={cn("card", className)} {...props} />;
}

export function CardHeader({
  action,
  children,
  className,
}: ComponentPropsWithoutRef<"div"> & {
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <div>{children}</div>
      {action}
    </div>
  );
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return <h2 className={cn("section-title", className)} {...props} />;
}
