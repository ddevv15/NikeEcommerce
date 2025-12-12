import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
    id: text("id").primaryKey(),
    sessionToken: text("session_token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Guest = typeof guest.$inferSelect;
export type NewGuest = typeof guest.$inferInsert;
