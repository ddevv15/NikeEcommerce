import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { categories } from "./categories";
import { genders } from "./filters/genders";
import { brands } from "./brands";
import { reviews } from "./reviews";

export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    categoryId: uuid("category_id").references(() => categories.id),
    genderId: uuid("gender_id").references(() => genders.id),
    brandId: uuid("brand_id").references(() => brands.id),
    isPublished: boolean("is_published").notNull().default(false),
    defaultVariantId: uuid("default_variant_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productsRelations = relations(products, ({ one, many }) => {
    // Lazy import to avoid circular dependency
    const { productVariants } = require("./variants");
    const { productCollections } = require("./collections");
    return {
        category: one(categories, {
            fields: [products.categoryId],
            references: [categories.id],
        }),
        gender: one(genders, {
            fields: [products.genderId],
            references: [genders.id],
        }),
        brand: one(brands, {
            fields: [products.brandId],
            references: [brands.id],
        }),
        defaultVariant: one(productVariants, {
            fields: [products.defaultVariantId],
            references: [productVariants.id],
            relationName: "default_variant",
        }),
        variants: many(productVariants, {
            relationName: "product_variants",
        }),
        images: many(productImages),
        reviews: many(reviews),
        productCollections: many(productCollections),
    };
});

export const productImages = pgTable("product_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id),
    variantId: uuid("variant_id"),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
});

export const productImagesRelations = relations(productImages, ({ one }) => {
    const { productVariants } = require("./variants");
    return {
        product: one(products, {
            fields: [productImages.productId],
            references: [products.id],
        }),
        variant: one(productVariants, {
            fields: [productImages.variantId],
            references: [productVariants.id],
        }),
    };
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export const insertProductImageSchema = createInsertSchema(productImages);
export const selectProductImageSchema = createSelectSchema(productImages);
