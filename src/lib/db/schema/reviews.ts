import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "./products";
import { user } from "./user";

export const reviews = pgTable("reviews", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
    product: one(products, {
        fields: [reviews.productId],
        references: [products.id],
    }),
    user: one(user, {
        fields: [reviews.userId],
        references: [user.id],
    }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export const insertReviewSchema = createInsertSchema(reviews);
export const selectReviewSchema = createSelectSchema(reviews);
