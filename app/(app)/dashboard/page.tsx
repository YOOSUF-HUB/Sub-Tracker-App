import Link from "next/link";
import {
  CalendarClock,
  CreditCard,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/badge";
import { StatCard } from "@/components/stat-card";
import {
  getMonthlyCost,
  getUpcomingRenewals,
  getYearlyCost,
} from "@/lib/calculations";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format";
import { getAllSubscriptions } from "@/lib/subscriptions";
import type { Subscription } from "@/lib/types";

export default async function DashboardPage() {
  const subscriptions = await getAllSubscriptions();
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active",
  );
  const renewals7Days = getUpcomingRenewals(subscriptions, 7);
  const renewals30Days = getUpcomingRenewals(subscriptions, 30);
  const recentlyAdded = [...subscriptions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">
            Dashboard
          </h1>
        </div>
        <Link className="btn-primary justify-center" href="/subscriptions/new">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add subscription
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          helper="Estimated from active subscriptions"
          icon={Wallet}
          title="Monthly cost"
          tone="emerald"
          value={formatTotals(activeSubscriptions, getMonthlyCost)}
        />
        <StatCard
          helper="Estimated from active subscriptions"
          icon={TrendingUp}
          title="Yearly cost"
          tone="sky"
          value={formatTotals(activeSubscriptions, getYearlyCost)}
        />
        <StatCard
          helper="Currently billing or expected to bill"
          icon={CreditCard}
          title="Active subscriptions"
          tone="slate"
          value={String(activeSubscriptions.length)}
        />
        <StatCard
          helper={`${renewals7Days.length} within 7 days`}
          icon={CalendarClock}
          title="Renewals in 30 days"
          tone="amber"
          value={String(renewals30Days.length)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel
          action={<Link className="btn-secondary" href="/subscriptions">View all</Link>}
          title="Upcoming renewals"
        >
          {renewals30Days.length ? (
            <div className="divide-y divide-slate-100">
              {renewals30Days.slice(0, 8).map((subscription) => (
                <Link
                  className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-50"
                  href={`/subscriptions/${subscription.id}`}
                  key={subscription.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-slate-950">
                        {subscription.name}
                      </p>
                      {renewals7Days.some((item) => item.id === subscription.id) ? (
                        <Badge tone="amber">Soon</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(subscription.nextBillingDate)} ·{" "}
                      {formatCurrency(subscription.price, subscription.currency)}
                    </p>
                  </div>
                  <StatusBadge status={subscription.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No active renewals are due in the next 30 days." />
          )}
        </Panel>

        <Panel title="Recently added">
          {recentlyAdded.length ? (
            <div className="space-y-3">
              {recentlyAdded.map((subscription) => (
                <Link
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:bg-slate-50"
                  href={`/subscriptions/${subscription.id}`}
                  key={subscription.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950">
                        {subscription.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Added {formatDateTime(subscription.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={subscription.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="Add your first subscription to start tracking spend." />
          )}
        </Panel>
      </section>
    </div>
  );
}

function Panel({
  action,
  children,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
      {message}
    </div>
  );
}

function formatTotals(
  subscriptions: Subscription[],
  calculator: (subscription: Subscription) => number,
) {
  if (!subscriptions.length) {
    return "$0";
  }

  const totals = new Map<string, number>();

  for (const subscription of subscriptions) {
    totals.set(
      subscription.currency,
      (totals.get(subscription.currency) ?? 0) + calculator(subscription),
    );
  }

  return [...totals.entries()]
    .map(([currency, total]) => formatCurrency(total, currency))
    .join(" + ");
}
