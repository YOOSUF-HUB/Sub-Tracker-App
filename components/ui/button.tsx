import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon" | "dangerIcon";

const buttonClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
  icon: "btn-icon",
  dangerIcon: "btn-danger-icon",
};

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "secondary",
  ...props
}: ButtonProps) {
  return <button className={cn(buttonClasses[variant], className)} {...props} />;
}

export function ButtonLink({
  className,
  variant = "secondary",
  ...props
}: ButtonLinkProps) {
  return <Link className={cn(buttonClasses[variant], className)} {...props} />;
}
