import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CreditCard,
  Flame,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { Badge, StatusBadge } from "@/components/badge";
import { IncomeManager } from "@/components/income-manager";
import { StatCard } from "@/components/stat-card";
import {
  compareCurrentMonthToLast,
  getInflationSummary,
  getMonthlyCostTrend,
  getMonthlySubscriptionTotal,
  getNetBurnRate,
  getPrimaryCurrency,
  getProjectedYearlySpendGrowth,
  getSpendByCategory,
  getTopExpensiveSubscriptions,
  getUpcomingRenewals,
  getUnusedSubscriptions,
  getYearlySubscriptionTotal,
} from "@/lib/calculations";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/format";
import { getIncomeSources } from "@/lib/income";
import { getAllSubscriptions } from "@/lib/subscriptions";

export default async function DashboardPage() {
  const [subscriptions, incomeSources] = await Promise.all([
    getAllSubscriptions(),
    getIncomeSources(),
  ]);
  const currency = getPrimaryCurrency(subscriptions, incomeSources);
  const renewals7Days = getUpcomingRenewals(subscriptions, 7);
  const renewals30Days = getUpcomingRenewals(subscriptions, 30);
  const monthlyCost = getMonthlySubscriptionTotal(subscriptions, currency);
  const yearlyCost = getYearlySubscriptionTotal(subscriptions, currency);
  const netBurn = getNetBurnRate(subscriptions, incomeSources, currency);
  const spendComparison = compareCurrentMonthToLast(subscriptions, currency);
  const growth = getProjectedYearlySpendGrowth(subscriptions, currency);
  const inflation = getInflationSummary(subscriptions, currency);
  const categorySpend = getSpendByCategory(subscriptions, currency);
  const monthlyTrend = getMonthlyCostTrend(subscriptions, currency, 6);
  const topExpensive = getTopExpensiveSubscriptions(subscriptions, currency, 5);
  const unusedSubscriptions = getUnusedSubscriptions(subscriptions);
  const recentlyAdded = [...subscriptions]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <Link className="btn-primary justify-center" href="/subscriptions/new">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add subscription
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          helper="Active subscriptions"
          icon={Wallet}
          title="Monthly cost"
          tone="emerald"
          value={formatCurrency(monthlyCost, currency)}
        />
        <StatCard
          helper="All monthly income sources"
          icon={Banknote}
          title="Monthly income"
          tone="sky"
          value={formatCurrency(netBurn.income, currency)}
        />
        <StatCard
          helper={netBurn.net >= 0 ? "Income left after subscriptions" : "Subscriptions exceed income"}
          icon={Flame}
          title="Net burn rate"
          tone={netBurn.net >= 0 ? "slate" : "amber"}
          value={formatCurrency(netBurn.net, currency)}
        />
        <StatCard
          helper={`${renewals7Days.length} within 7 days`}
          icon={CalendarClock}
          title="Renewals in 30 days"
          tone="amber"
          value={String(renewals30Days.length)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          helper="Estimated from active subscriptions"
          icon={TrendingUp}
          title="Yearly cost"
          tone="sky"
          value={formatCurrency(yearlyCost, currency)}
        />
        <StatCard
          helper={formatPercent(spendComparison.percentage)}
          icon={TrendingUp}
          title="This month vs last"
          tone={spendComparison.difference <= 0 ? "emerald" : "amber"}
          value={formatCurrency(spendComparison.difference, currency)}
        />
        <StatCard
          helper={formatPercent(growth.percentage)}
          icon={CreditCard}
          title="Yearly growth"
          tone={growth.difference <= 0 ? "emerald" : "amber"}
          value={formatCurrency(growth.difference, currency)}
        />
        <StatCard
          helper={`${inflation.affectedCount} changed subscription(s)`}
          icon={AlertTriangle}
          title="Inflation view"
          tone={inflation.difference <= 0 ? "slate" : "amber"}
          value={formatCurrency(inflation.difference, currency)}
        />
      </section>

      <AnalyticsCharts
        currency={currency}
        lineData={monthlyTrend}
        pieData={categorySpend}
      />

      <IncomeManager currency={currency} incomeSources={incomeSources} />

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="Top 5 most expensive">
          {topExpensive.length ? (
            <div className="space-y-3">
              {topExpensive.map((subscription, index) => (
                <Link
                  className="card card-hover flex items-center justify-between gap-4"
                  href={`/subscriptions/${subscription.id}`}
                  key={subscription.id}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-strong">
                      {index + 1}. {subscription.name}
                    </p>
                    <p className="mt-1 text-sm muted">
                      {subscription.category}
                    </p>
                  </div>
                  <p className="font-semibold text-strong">
                    {formatCurrency(subscription.monthlyCost, currency)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No active subscriptions in this currency yet." />
          )}
        </Panel>

        <Panel
          action={<Link className="btn-secondary" href="/subscriptions">Manage</Link>}
          title="Unused reminders"
        >
          {unusedSubscriptions.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {unusedSubscriptions.map((subscription) => (
                <Link
                  className="row-link flex items-center justify-between gap-4 px-2 py-4"
                  href={`/subscriptions/${subscription.id}`}
                  key={subscription.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-strong">
                      {subscription.name}
                    </p>
                    <p className="mt-1 text-sm muted">
                      {formatCurrency(subscription.price, subscription.currency)} ·{" "}
                      {subscription.category}
                    </p>
                  </div>
                  <Badge tone="amber">Unused</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="No subscriptions are currently flagged as unused." />
          )}
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel
          action={<Link className="btn-secondary" href="/subscriptions">View all</Link>}
          title="Upcoming renewals"
        >
          {renewals30Days.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {renewals30Days.slice(0, 8).map((subscription) => (
                <Link
                  className="row-link flex items-center justify-between gap-4 px-2 py-4"
                  href={`/subscriptions/${subscription.id}`}
                  key={subscription.id}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-strong">
                        {subscription.name}
                      </p>
                      {renewals7Days.some((item) => item.id === subscription.id) ? (
                        <Badge tone="amber">Soon</Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm muted">
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
                  className="card card-hover block"
                  href={`/subscriptions/${subscription.id}`}
                  key={subscription.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-strong">
                        {subscription.name}
                      </p>
                      <p className="mt-1 text-sm muted">
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
    <section className="card">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-state">{message}</div>
  );
}
