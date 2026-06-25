import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  ChevronLeft,
  Edit3,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/badge";
import { DeleteSubscriptionButton } from "@/components/delete-subscription-button";
import { StatCard } from "@/components/stat-card";
import {
  getDaysUntilBilling,
  getMonthlyCost,
  getYearlyCost,
} from "@/lib/calculations";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  humanizeBillingCycle,
} from "@/lib/format";
import { getSubscriptionById } from "@/lib/subscriptions";

type SubscriptionDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubscriptionDetailsPage({
  params,
}: SubscriptionDetailsPageProps) {
  const { id } = await params;
  const subscription = await getSubscriptionById(id);

  if (!subscription) {
    notFound();
  }

  const daysRemaining = getDaysUntilBilling(subscription.nextBillingDate);
  const daysTone = daysRemaining < 0 ? "red" : daysRemaining <= 7 ? "amber" : "blue";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link className="btn-secondary w-fit" href="/subscriptions">
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Back
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            className="btn-primary"
            href={`/subscriptions/${subscription.id}/edit`}
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
            Edit
          </Link>
          <DeleteSubscriptionButton id={subscription.id} />
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={subscription.status} />
              <Badge tone={daysTone}>
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} days overdue`
                  : `${daysRemaining} days remaining`}
              </Badge>
            </div>
            <h1 className="break-words text-3xl font-semibold text-slate-950">
              {subscription.name}
            </h1>
            {subscription.description ? (
              <p className="mt-2 max-w-2xl text-slate-600">
                {subscription.description}
              </p>
            ) : null}
          </div>
          {subscription.websiteUrl ? (
            <a
              className="btn-secondary w-fit"
              href={subscription.websiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Website
            </a>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          helper={humanizeBillingCycle(
            subscription.billingCycle,
            subscription.customIntervalDays,
          )}
          icon={Wallet}
          title="Monthly estimate"
          tone="emerald"
          value={formatCurrency(getMonthlyCost(subscription), subscription.currency)}
        />
        <StatCard
          helper={humanizeBillingCycle(
            subscription.billingCycle,
            subscription.customIntervalDays,
          )}
          icon={Wallet}
          title="Yearly estimate"
          tone="sky"
          value={formatCurrency(getYearlyCost(subscription), subscription.currency)}
        />
        <StatCard
          helper={formatDate(subscription.nextBillingDate)}
          icon={CalendarClock}
          title="Next renewal"
          tone="amber"
          value={daysRemaining < 0 ? "Overdue" : `${daysRemaining} days`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Details</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail label="Category" value={subscription.category} />
            <Detail
              label="Price"
              value={formatCurrency(subscription.price, subscription.currency)}
            />
            <Detail
              label="Billing cycle"
              value={humanizeBillingCycle(
                subscription.billingCycle,
                subscription.customIntervalDays,
              )}
            />
            <Detail label="Currency" value={subscription.currency} />
            <Detail
              label="Next billing date"
              value={formatDate(subscription.nextBillingDate)}
            />
            <Detail
              label="Payment method"
              value={subscription.paymentMethod || "Not set"}
            />
            <Detail label="Created" value={formatDateTime(subscription.createdAt)} />
            <Detail label="Updated" value={formatDateTime(subscription.updatedAt)} />
          </dl>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Notes</h2>
          {subscription.notes ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
              {subscription.notes}
            </p>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No notes saved for this subscription.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-slate-950">{value}</dd>
    </div>
  );
}
