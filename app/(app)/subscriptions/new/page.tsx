import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SubscriptionForm } from "@/components/subscription-form";
import { createSubscriptionAction } from "@/app/actions/subscriptions";
import { getCategories } from "@/lib/subscriptions";

export default async function NewSubscriptionPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl page-stack">
      <Link className="btn-secondary w-fit" href="/subscriptions">
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Back
      </Link>

      <section className="card sm:p-6">
        <div className="mb-6">
          <p className="eyebrow">New record</p>
          <h1 className="mt-1 text-2xl font-semibold text-strong">
            Add subscription
          </h1>
        </div>
        <SubscriptionForm
          action={createSubscriptionAction}
          categories={categories}
          submitLabel="Create subscription"
        />
      </section>
    </div>
  );
}
