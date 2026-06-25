import "./env";
import { readFileSync } from "fs";
import { join } from "path";
import { getDb } from "../lib/db";

async function migrate() {
  const schemaPath = join(process.cwd(), "db", "schema.sql");
  const schema = readFileSync(schemaPath, "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  if (!statements.length) {
    console.log("No migration statements found.");
    return;
  }

  const db = await getDb();

  await db.batch(
    statements.map((sql) => ({ sql, args: [] })),
    "write",
  );

  console.log(`Applied ${statements.length} migration statements.`);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
