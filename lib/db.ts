import type { Client } from "@libsql/client";

let clientPromise: Promise<Client> | undefined;

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

export async function getDb() {
  if (!clientPromise) {
    clientPromise = createDbClient();
  }

  return clientPromise;
}

async function createDbClient() {
  const url = getDatabaseUrl();
  const config = {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  };

  if (url.startsWith("file:")) {
    const { createClient } = await import("@libsql/client");
    return createClient(config);
  }

  const { createClient } = await import("@libsql/client/web");
  return createClient(config);
}
