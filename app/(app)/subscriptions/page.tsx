import Link from "next/link";
import { Edit3, Eye, Plus, Search } from "lucide-react";
import { DeleteSubscriptionButton } from "@/components/delete-subscription-button";
import { StatusBadge } from "@/components/badge";
import {
  formatCurrency,
  formatDate,
  humanizeBillingCycle,
} from "@/lib/format";
import { getCategories, getSubscriptions } from "@/lib/subscriptions";
import type { Subscription, SubscriptionStatus } from "@/lib/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = getParam(params.search);
  const category = getParam(params.category) || "all";
  const status = getParam(params.status) || "all";
  const sort = getParam(params.sort) || "nextBillingAsc";

  const [subscriptions, categories] = await Promise.all([
    getSubscriptions({
      search,
      category,
      status: status as SubscriptionStatus | "all",
    }),
    getCategories(),
  ]);

  const sortedSubscriptions =
    sort === "nextBillingDesc" ? [...subscriptions].reverse() : subscriptions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Manage</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">
            Subscriptions
          </h1>
        </div>
        <Link className="btn-primary justify-center" href="/subscriptions/new">
          <Plus aria-hidden="true" className="h-4 w-4" />
          Add subscription
        </Link>
      </div>

      <form className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" method="GET">
        <div className="grid gap-3 md:grid-cols-[1.3fr_0.8fr_0.8fr_0.9fr_auto]">
          <label className="sr-only" htmlFor="search">
            Search by name
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              className="form-input pl-9"
              defaultValue={search}
              id="search"
              name="search"
              placeholder="Search by name"
            />
          </div>

          <label className="sr-only" htmlFor="category">
            Category
          </label>
          <select
            className="form-input"
            defaultValue={category}
            id="category"
            name="category"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="status">
            Status
          </label>
          <select className="form-input" defaultValue={status} id="status" name="status">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <label className="sr-only" htmlFor="sort">
            Sort
          </label>
          <select className="form-input" defaultValue={sort} id="sort" name="sort">
            <option value="nextBillingAsc">Billing date ↑</option>
            <option value="nextBillingDesc">Billing date ↓</option>
          </select>

          <button className="btn-secondary justify-center" type="submit">
            <Search aria-hidden="true" className="h-4 w-4" />
            Apply
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {sortedSubscriptions.length ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[840px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                    <th className="px-4 py-3 font-medium">Next billing</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedSubscriptions.map((subscription) => (
                    <SubscriptionRow key={subscription.id} subscription={subscription} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {sortedSubscriptions.map((subscription) => (
                <SubscriptionMobileCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="font-medium text-slate-950">No subscriptions found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add a subscription or adjust your filters.
            </p>
            <Link className="btn-primary mt-5" href="/subscriptions/new">
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add subscription
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function SubscriptionRow({ subscription }: { subscription: Subscription }) {
  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-4 py-4">
        <Link
          className="font-medium text-slate-950 hover:text-slate-700"
          href={`/subscriptions/${subscription.id}`}
        >
          {subscription.name}
        </Link>
        {subscription.description ? (
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">
            {subscription.description}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-4 text-slate-600">{subscription.category}</td>
      <td className="px-4 py-4 text-slate-600">
        {formatCurrency(subscription.price, subscription.currency)}
        <span className="block text-xs text-slate-400">
          {humanizeBillingCycle(
            subscription.billingCycle,
            subscription.customIntervalDays,
          )}
        </span>
      </td>
      <td className="px-4 py-4 text-slate-600">
        {formatDate(subscription.nextBillingDate)}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={subscription.status} />
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-end gap-2">
          <Link
            className="btn-icon"
            href={`/subscriptions/${subscription.id}`}
            title="View subscription"
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Link>
          <Link
            className="btn-icon"
            href={`/subscriptions/${subscription.id}/edit`}
            title="Edit subscription"
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Link>
          <DeleteSubscriptionButton compact id={subscription.id} />
        </div>
      </td>
    </tr>
  );
}

function SubscriptionMobileCard({ subscription }: { subscription: Subscription }) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            className="font-medium text-slate-950"
            href={`/subscriptions/${subscription.id}`}
          >
            {subscription.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{subscription.category}</p>
        </div>
        <StatusBadge status={subscription.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-slate-500">Cost</p>
          <p className="mt-1 font-medium text-slate-950">
            {formatCurrency(subscription.price, subscription.currency)}
          </p>
        </div>
        <div>
          <p className="text-slate-500">Next billing</p>
          <p className="mt-1 font-medium text-slate-950">
            {formatDate(subscription.nextBillingDate)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link className="btn-secondary" href={`/subscriptions/${subscription.id}`}>
          <Eye aria-hidden="true" className="h-4 w-4" />
          View
        </Link>
        <Link
          className="btn-secondary"
          href={`/subscriptions/${subscription.id}/edit`}
        >
          <Edit3 aria-hidden="true" className="h-4 w-4" />
          Edit
        </Link>
        <DeleteSubscriptionButton id={subscription.id} />
      </div>
    </article>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
