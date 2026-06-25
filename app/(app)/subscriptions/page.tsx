import { SubscriptionManager } from "@/components/subscription-manager";
import { getAllSubscriptions, getCategories } from "@/lib/subscriptions";

export default async function SubscriptionsPage() {
  const [subscriptions, categories] = await Promise.all([
    getAllSubscriptions(),
    getCategories(),
  ]);

  return (
    <SubscriptionManager categories={categories} subscriptions={subscriptions} />
  );
}
