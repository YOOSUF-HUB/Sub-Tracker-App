import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;

function getDatabaseUrl() {
  const url = process.env.TURSO_DATABASE_URL;

  if (url) {
    return url;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "TURSO_DATABASE_URL is required in production. Use a Turso/libSQL database on Vercel.",
    );
  }

  return "file:local.db";
}

export function getDb() {
  if (!client) {
    client = createClient({
      url: getDatabaseUrl(),
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }

  return client;
}
