export const billingCycles = [
  "monthly",
  "yearly",
  "weekly",
  "quarterly",
  "custom",
] as const;

export const subscriptionStatuses = ["active", "cancelled", "paused"] as const;
export const incomeSourceTypes = ["salary", "freelance", "passive", "other"] as const;

export type BillingCycle = (typeof billingCycles)[number];
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];
export type IncomeSourceType = (typeof incomeSourceTypes)[number];

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
  lastBilledDate: string | null;
  paymentMethod: string | null;
  status: SubscriptionStatus;
  priority: number;
  isUnused: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  previousPrice: number | null;
  priceChangedAt: string | null;
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
  lastBilledDate: string | null;
  paymentMethod: string | null;
  status: SubscriptionStatus;
  priority: number;
  isUnused: boolean;
  trialStartDate: string | null;
  trialEndDate: string | null;
  websiteUrl: string | null;
  notes: string | null;
};

export type SubscriptionFilters = {
  search?: string;
  category?: string;
  status?: SubscriptionStatus | "all";
};

export type QuickSubscriptionInput = {
  name: string;
  category: string;
  price: number;
  status: SubscriptionStatus;
  nextBillingDate: string;
  isUnused: boolean;
  priority: number;
};

export type BulkSubscriptionUpdate = {
  status?: SubscriptionStatus;
  category?: string;
  isUnused?: boolean;
};

export type IncomeSource = {
  id: string;
  name: string;
  type: IncomeSourceType;
  amount: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type IncomeSourceInput = {
  name: string;
  type: IncomeSourceType;
  amount: number;
  currency: string;
  notes: string | null;
};
