import "./env";
import { readFileSync } from "fs";
import { join } from "path";
import { getDb } from "../lib/db";
import type { SubscriptionInput } from "../lib/types";

type SeedSubscription = SubscriptionInput & {
  id: string;
};

async function seed() {
  await migrateSchema();

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
      paymentMethod: "Visa",
      status: "active",
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
      paymentMethod: "Mastercard",
      status: "active",
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
      paymentMethod: "Visa",
      status: "active",
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
      paymentMethod: "Visa",
      status: "active",
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
      paymentMethod: "Visa",
      status: "paused",
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
          custom_interval_days, next_billing_date, payment_method, status,
          website_url, notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        subscription.paymentMethod,
        subscription.status,
        subscription.websiteUrl,
        subscription.notes,
        now,
        now,
      ],
    });
  }

  console.log(`Seeded ${subscriptions.length} subscriptions.`);
}

async function migrateSchema() {
  const schemaPath = join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const db = await getDb();

  await db.batch(
    statements.map((sql) => ({ sql, args: [] })),
    "write",
  );
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
