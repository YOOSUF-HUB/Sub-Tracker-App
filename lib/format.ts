import type { BillingCycle, SubscriptionStatus } from "@/lib/types";

export function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function humanizeBillingCycle(cycle: BillingCycle, customIntervalDays?: number | null) {
  if (cycle === "custom" && customIntervalDays) {
    return `Every ${customIntervalDays} days`;
  }

  return cycle.charAt(0).toUpperCase() + cycle.slice(1);
}

export function humanizeStatus(status: SubscriptionStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function toDateInputValue(date: string | null | undefined) {
  if (!date) {
    return "";
  }

  return date.slice(0, 10);
}
