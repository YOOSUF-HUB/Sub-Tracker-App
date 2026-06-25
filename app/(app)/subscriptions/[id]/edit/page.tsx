import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SubscriptionForm } from "@/components/subscription-form";
import { updateSubscriptionAction } from "@/app/actions/subscriptions";
import { getCategories, getSubscriptionById } from "@/lib/subscriptions";

type EditSubscriptionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSubscriptionPage({
  params,
}: EditSubscriptionPageProps) {
  const { id } = await params;
  const [subscription, categories] = await Promise.all([
    getSubscriptionById(id),
    getCategories(),
  ]);

  if (!subscription) {
    notFound();
  }

  const action = updateSubscriptionAction.bind(null, subscription.id);

  return (
    <div className="mx-auto max-w-3xl page-stack">
      <Link className="btn-secondary w-fit" href={`/subscriptions/${subscription.id}`}>
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Back
      </Link>

      <section className="card sm:p-6">
        <div className="mb-6">
          <p className="eyebrow">Update record</p>
          <h1 className="mt-1 text-2xl font-semibold text-strong">
            Edit {subscription.name}
          </h1>
        </div>
        <SubscriptionForm
          action={action}
          categories={categories}
          subscription={subscription}
          submitLabel="Save changes"
        />
      </section>
    </div>
  );
}
