import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: ComponentPropsWithoutRef<"input">) {
  return <input className={cn("form-input", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return <select className={cn("form-input", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn("form-textarea", className)} {...props} />;
}

export function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
