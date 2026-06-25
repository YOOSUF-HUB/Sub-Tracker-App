import type { IncomeSource, Subscription } from "@/lib/types";

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

export function getPrimaryCurrency(
  subscriptions: Subscription[],
  incomeSources: IncomeSource[] = [],
) {
  return (
    incomeSources[0]?.currency ||
    subscriptions.find((subscription) => subscription.status === "active")?.currency ||
    subscriptions[0]?.currency ||
    "USD"
  );
}

export function getTotalMonthlyIncome(
  incomeSources: IncomeSource[],
  currency: string,
) {
  return incomeSources
    .filter((source) => source.currency === currency)
    .reduce((total, source) => total + source.amount, 0);
}

export function getIncomeByType(incomeSources: IncomeSource[], currency: string) {
  const totals = new Map<string, number>();

  for (const source of incomeSources.filter((item) => item.currency === currency)) {
    totals.set(source.type, (totals.get(source.type) ?? 0) + source.amount);
  }

  return [...totals.entries()].map(([label, value]) => ({ label, value }));
}

export function getMonthlySubscriptionTotal(
  subscriptions: Subscription[],
  currency: string,
) {
  return getActiveSubscriptions(subscriptions)
    .filter((subscription) => subscription.currency === currency)
    .reduce((total, subscription) => total + getMonthlyCost(subscription), 0);
}

export function getYearlySubscriptionTotal(
  subscriptions: Subscription[],
  currency: string,
) {
  return getActiveSubscriptions(subscriptions)
    .filter((subscription) => subscription.currency === currency)
    .reduce((total, subscription) => total + getYearlyCost(subscription), 0);
}

export function getSpendByCategory(subscriptions: Subscription[], currency: string) {
  const totals = new Map<string, number>();

  for (const subscription of getActiveSubscriptions(subscriptions)) {
    if (subscription.currency !== currency) {
      continue;
    }

    totals.set(
      subscription.category,
      (totals.get(subscription.category) ?? 0) + getMonthlyCost(subscription),
    );
  }

  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function getTopExpensiveSubscriptions(
  subscriptions: Subscription[],
  currency: string,
  limit = 5,
) {
  return getActiveSubscriptions(subscriptions)
    .filter((subscription) => subscription.currency === currency)
    .map((subscription) => ({
      ...subscription,
      monthlyCost: getMonthlyCost(subscription),
    }))
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, limit);
}

export function getUnusedSubscriptions(subscriptions: Subscription[]) {
  return subscriptions.filter(
    (subscription) => subscription.status !== "cancelled" && subscription.isUnused,
  );
}

export function getMonthlyCostTrend(
  subscriptions: Subscription[],
  currency: string,
  months = 6,
) {
  const now = new Date();
  const points: Array<{ label: string; value: number }> = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const month = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const label = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(month);

    const value = getActiveSubscriptions(subscriptions)
      .filter((subscription) => subscription.currency === currency)
      .reduce(
        (total, subscription) =>
          total + getMonthlyCostAtMonth(subscription, month),
        0,
      );

    points.push({ label, value });
  }

  return points;
}

export function compareCurrentMonthToLast(
  subscriptions: Subscription[],
  currency: string,
) {
  const [lastMonth, thisMonth] = getMonthlyCostTrend(subscriptions, currency, 2);
  const difference = (thisMonth?.value ?? 0) - (lastMonth?.value ?? 0);
  const percentage =
    lastMonth && lastMonth.value > 0 ? (difference / lastMonth.value) * 100 : 0;

  return {
    current: thisMonth?.value ?? 0,
    previous: lastMonth?.value ?? 0,
    difference,
    percentage,
  };
}

export function getInflationSummary(
  subscriptions: Subscription[],
  currency: string,
) {
  const changedSubscriptions = getActiveSubscriptions(subscriptions).filter(
    (subscription) =>
      subscription.currency === currency && subscription.previousPrice !== null,
  );

  const previousMonthly = changedSubscriptions.reduce(
    (total, subscription) =>
      total +
      getMonthlyCost({
        ...subscription,
        price: subscription.previousPrice ?? subscription.price,
      }),
    0,
  );
  const currentMonthly = changedSubscriptions.reduce(
    (total, subscription) => total + getMonthlyCost(subscription),
    0,
  );
  const difference = currentMonthly - previousMonthly;

  return {
    affectedCount: changedSubscriptions.length,
    currentMonthly,
    previousMonthly,
    difference,
    percentage:
      previousMonthly > 0 ? (difference / previousMonthly) * 100 : 0,
  };
}

export function getProjectedYearlySpendGrowth(
  subscriptions: Subscription[],
  currency: string,
) {
  const activeSubscriptions = getActiveSubscriptions(subscriptions).filter(
    (subscription) => subscription.currency === currency,
  );
  const current = activeSubscriptions.reduce(
    (total, subscription) => total + getYearlyCost(subscription),
    0,
  );
  const previous = activeSubscriptions.reduce(
    (total, subscription) =>
      total +
      getYearlyCost({
        ...subscription,
        price: subscription.previousPrice ?? subscription.price,
      }),
    0,
  );

  return {
    current,
    previous,
    difference: current - previous,
    percentage: previous > 0 ? ((current - previous) / previous) * 100 : 0,
  };
}

export function getNetBurnRate(
  subscriptions: Subscription[],
  incomeSources: IncomeSource[],
  currency: string,
) {
  const income = getTotalMonthlyIncome(incomeSources, currency);
  const subscriptionCost = getMonthlySubscriptionTotal(subscriptions, currency);

  return {
    income,
    subscriptionCost,
    net: income - subscriptionCost,
  };
}

export function getActiveSubscriptions(subscriptions: Subscription[]) {
  return subscriptions.filter((subscription) => subscription.status === "active");
}

function getMonthlyCostAtMonth(subscription: Subscription, month: Date) {
  if (!subscription.previousPrice || !subscription.priceChangedAt) {
    return getMonthlyCost(subscription);
  }

  const changeMonth = new Date(subscription.priceChangedAt);
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const changeMonthStart = new Date(
    changeMonth.getFullYear(),
    changeMonth.getMonth(),
    1,
  );

  if (monthStart < changeMonthStart) {
    return getMonthlyCost({
      ...subscription,
      price: subscription.previousPrice,
    });
  }

  return getMonthlyCost(subscription);
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
