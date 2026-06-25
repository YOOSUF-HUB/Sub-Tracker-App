export const billingCycles = [
  "monthly",
  "yearly",
  "weekly",
  "quarterly",
  "custom",
] as const;

export const subscriptionStatuses = ["active", "cancelled", "paused"] as const;

export type BillingCycle = (typeof billingCycles)[number];
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export type Subscription = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
  nextBillingDate: string;
  paymentMethod: string | null;
  status: SubscriptionStatus;
  websiteUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionInput = {
  name: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  customIntervalDays: number | null;
  nextBillingDate: string;
  paymentMethod: string | null;
  status: SubscriptionStatus;
  websiteUrl: string | null;
  notes: string | null;
};

export type SubscriptionFilters = {
  search?: string;
  category?: string;
  status?: SubscriptionStatus | "all";
};
