import { config } from "dotenv";
import path from "path";

// Load env vars content first
config({ path: path.resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function resetDb() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is not set");
    }

    console.log("Initializing DB connection for reset...");
    const client = neon(process.env.DATABASE_URL);
    const db = drizzle(client);

    console.log("Dropping all tables...");
    // Drop tables in correct order to avoid FK constraint violations
    await db.execute(sql`DROP TABLE IF EXISTS "account" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "session" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "verification" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "guest" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "products" CASCADE;`);
    console.log("Tables dropped.");
    process.exit(0);
}

resetDb().catch((err) => {
    console.error(err);
    process.exit(1);
});
