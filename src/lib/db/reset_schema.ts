import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "./index";
import { sql } from "drizzle-orm";

async function main() {
    console.log("💥 Dropping all tables to reset schema...");

    // List of all tables to drop. Order doesn't strictly matter with CASCADE, but good to be thorough.
    const tables = [
        "order_items", "payments", "orders", "cart_items", "carts",
        "reviews", "wishlists", "product_images", "product_variants",
        "product_collections", "products", "collections", "categories",
        "brands", "genders", "colors", "sizes", "addresses",
        "account", "session", "user", "verification", "guest", "coupons"
    ];

    for (const table of tables) {
        await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE;`));
        console.log(`Dropped table: ${table}`);
    }

    console.log("✅ All tables dropped. Ready for fresh db:push.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        process.exit(0);
    });
