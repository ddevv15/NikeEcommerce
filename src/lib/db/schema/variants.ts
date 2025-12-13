import { integer, jsonb, numeric, pgTable, text, timestamp, uuid, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { products } from "./products";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";

export const productVariants = pgTable("product_variants", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),
    sku: text("sku").notNull().unique(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    colorId: uuid("color_id").references(() => colors.id),
    sizeId: uuid("size_id").references(() => sizes.id),
    inStock: integer("in_stock").notNull().default(0),
    weight: real("weight"),
    dimensions: jsonb("dimensions"), // { length, width, height }
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
        relationName: "product_variants", // Inverse of products.variants
    }),
    color: one(colors, {
        fields: [productVariants.colorId],
        references: [colors.id],
    }),
    size: one(sizes, {
        fields: [productVariants.sizeId],
        references: [sizes.id],
    }),
}));

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;

export const insertProductVariantSchema = createInsertSchema(productVariants);
export const selectProductVariantSchema = createSelectSchema(productVariants);
