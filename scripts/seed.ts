import "./env";
import { getDb } from "../lib/db";
import type { IncomeSourceInput, SubscriptionInput } from "../lib/types";
import { applySchema } from "./schema";

type SeedSubscription = SubscriptionInput & {
  id: string;
};

type SeedIncomeSource = IncomeSourceInput & {
  id: string;
};

async function seed() {
  await applySchema();

  const now = new Date().toISOString();
  const subscriptions: SeedSubscription[] = [
    {
      id: "seed-netflix",
      name: "Netflix",
      description: "Streaming plan",
      category: "Entertainment",
      price: 15.49,
      currency: "USD",
      billingCycle: "monthly",
      customIntervalDays: null,
      nextBillingDate: daysFromNow(5),
      lastBilledDate: daysAgo(25),
      paymentMethod: "Visa",
      status: "active",
      priority: 1,
      isUnused: false,
      trialStartDate: null,
      trialEndDate: null,
      websiteUrl: "https://www.netflix.com",
      notes: "Review plan if prices change.",
    },
    {
      id: "seed-spotify",
      name: "Spotify",
      description: "Music streaming",
      category: "Entertainment",
      price: 10.99,
      currency: "USD",
      billingCycle: "monthly",
      customIntervalDays: null,
      nextBillingDate: daysFromNow(12),
      lastBilledDate: daysAgo(18),
      paymentMethod: "Mastercard",
      status: "active",
      priority: 2,
      isUnused: false,
      trialStartDate: null,
      trialEndDate: null,
      websiteUrl: "https://www.spotify.com",
      notes: null,
    },
    {
      id: "seed-github-copilot",
      name: "GitHub Copilot",
      description: "Developer coding assistant",
      category: "Development",
      price: 10,
      currency: "USD",
      billingCycle: "monthly",
      customIntervalDays: null,
      nextBillingDate: daysFromNow(18),
      lastBilledDate: daysAgo(12),
      paymentMethod: "Visa",
      status: "active",
      priority: 3,
      isUnused: false,
      trialStartDate: null,
      trialEndDate: null,
      websiteUrl: "https://github.com/features/copilot",
      notes: "Used for personal projects.",
    },
    {
      id: "seed-chatgpt",
      name: "ChatGPT",
      description: "AI assistant subscription",
      category: "Productivity",
      price: 20,
      currency: "USD",
      billingCycle: "monthly",
      customIntervalDays: null,
      nextBillingDate: daysFromNow(3),
      lastBilledDate: daysAgo(27),
      paymentMethod: "Visa",
      status: "active",
      priority: 4,
      isUnused: false,
      trialStartDate: null,
      trialEndDate: null,
      websiteUrl: "https://chatgpt.com",
      notes: null,
    },
    {
      id: "seed-vercel",
      name: "Vercel",
      description: "Hosting and deployments",
      category: "Hosting",
      price: 20,
      currency: "USD",
      billingCycle: "monthly",
      customIntervalDays: null,
      nextBillingDate: daysFromNow(25),
      lastBilledDate: daysAgo(5),
      paymentMethod: "Visa",
      status: "paused",
      priority: 5,
      isUnused: true,
      trialStartDate: daysAgo(10),
      trialEndDate: daysFromNow(20),
      websiteUrl: "https://vercel.com",
      notes: "Keep paused unless a paid project needs it.",
    },
  ];
  const db = await getDb();

  for (const subscription of subscriptions) {
    await db.execute({
      sql: `
        INSERT OR REPLACE INTO subscriptions (
          id, name, description, category, price, currency, billing_cycle,
          custom_interval_days, next_billing_date, last_billed_date,
          payment_method, status, priority, is_unused, trial_start_date,
          trial_end_date, website_url, notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        subscription.id,
        subscription.name,
        subscription.description,
        subscription.category,
        subscription.price,
        subscription.currency,
        subscription.billingCycle,
        subscription.customIntervalDays,
        subscription.nextBillingDate,
        subscription.lastBilledDate,
        subscription.paymentMethod,
        subscription.status,
        subscription.priority,
        subscription.isUnused ? 1 : 0,
        subscription.trialStartDate,
        subscription.trialEndDate,
        subscription.websiteUrl,
        subscription.notes,
        now,
        now,
      ],
    });
  }

  const incomeSources: SeedIncomeSource[] = [
    {
      id: "seed-income-salary",
      name: "Main salary",
      type: "salary",
      amount: 4200,
      currency: "USD",
      notes: "Monthly take-home estimate.",
    },
    {
      id: "seed-income-freelance",
      name: "Freelance projects",
      type: "freelance",
      amount: 650,
      currency: "USD",
      notes: "Average monthly freelance income.",
    },
    {
      id: "seed-income-passive",
      name: "Passive income",
      type: "passive",
      amount: 120,
      currency: "USD",
      notes: null,
    },
  ];

  for (const income of incomeSources) {
    await db.execute({
      sql: `
        INSERT OR REPLACE INTO income_sources (
          id, name, type, amount, currency, notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        income.id,
        income.name,
        income.type,
        income.amount,
        income.currency,
        income.notes,
        now,
        now,
      ],
    });
  }

  console.log(`Seeded ${subscriptions.length} subscriptions and ${incomeSources.length} income sources.`);
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
