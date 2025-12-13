import { integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

export const coupons = pgTable("coupons", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: numeric("discount_value").notNull(),
    expiresAt: timestamp("expires_at"),
    maxUsage: integer("max_usage"),
    usedCount: integer("used_count").notNull().default(0),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

export const insertCouponSchema = createInsertSchema(coupons);
export const selectCouponSchema = createSelectSchema(coupons);
