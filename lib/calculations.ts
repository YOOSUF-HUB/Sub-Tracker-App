import type { Subscription } from "@/lib/types";

const AVERAGE_DAYS_PER_MONTH = 30.437;

export function getMonthlyCost(subscription: Pick<Subscription, "price" | "billingCycle" | "customIntervalDays">) {
  switch (subscription.billingCycle) {
    case "monthly":
      return subscription.price;
    case "yearly":
      return subscription.price / 12;
    case "weekly":
      return subscription.price * 4.345;
    case "quarterly":
      return subscription.price / 3;
    case "custom":
      return subscription.customIntervalDays
        ? (subscription.price / subscription.customIntervalDays) * AVERAGE_DAYS_PER_MONTH
        : 0;
  }
}

export function getYearlyCost(subscription: Pick<Subscription, "price" | "billingCycle" | "customIntervalDays">) {
  switch (subscription.billingCycle) {
    case "monthly":
      return subscription.price * 12;
    case "yearly":
      return subscription.price;
    case "weekly":
      return subscription.price * 52;
    case "quarterly":
      return subscription.price * 4;
    case "custom":
      return subscription.customIntervalDays
        ? (subscription.price / subscription.customIntervalDays) * 365
        : 0;
  }
}

export function getDaysUntilBilling(nextBillingDate: string) {
  const today = startOfLocalDay(new Date());
  const next = startOfLocalDay(new Date(`${nextBillingDate}T00:00:00`));

  return Math.ceil((next.getTime() - today.getTime()) / 86_400_000);
}

export function isRenewalWithin(subscription: Subscription, days: number) {
  if (subscription.status !== "active") {
    return false;
  }

  const remaining = getDaysUntilBilling(subscription.nextBillingDate);
  return remaining >= 0 && remaining <= days;
}

export function getUpcomingRenewals(subscriptions: Subscription[], days: number) {
  return subscriptions
    .filter((subscription) => isRenewalWithin(subscription, days))
    .sort(
      (a, b) =>
        new Date(a.nextBillingDate).getTime() -
        new Date(b.nextBillingDate).getTime(),
    );
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
