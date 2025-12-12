import {
    json,
    numeric,
    pgTable,
    serial,
    text,
    timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    imageUrl: text("image_url"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    colors: text("colors"),
    badge: json("badge"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
