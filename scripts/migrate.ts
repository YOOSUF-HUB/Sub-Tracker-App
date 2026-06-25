import "./env";
import { applySchema } from "./schema";

async function migrate() {
  const statementCount = await applySchema();
  console.log(`Applied schema with ${statementCount} base statements.`);
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
