"use server";

import { db } from "@/lib/db";
import {
    products,
    productVariants,
    productImages,
    categories,
    brands,
    colors,
    sizes,
    genders,
    reviews,
} from "@/lib/db/schema";
import { ProductFilters, PRICE_RANGES } from "@/lib/utils/query";
import {
    and,
    desc,
    eq,
    inArray,
    sql,
    asc,
    or,
    exists,
    gt,
    lt,
    gte,
    lte,
    ilike,
    count,
    SQL,
    ne,
} from "drizzle-orm";

// Types for return values
export type ProductWithDetails = typeof products.$inferSelect & {
    category: typeof categories.$inferSelect | null;
    gender: typeof genders.$inferSelect | null;
    brand: typeof brands.$inferSelect | null;
    defaultVariant: (typeof productVariants.$inferSelect & {
        color: typeof colors.$inferSelect | null;
        size: typeof sizes.$inferSelect | null;
    }) | null;
    variants: (typeof productVariants.$inferSelect & {
        color: typeof colors.$inferSelect | null;
        size: typeof sizes.$inferSelect | null;
    })[];
    images: typeof productImages.$inferSelect[];
    minPrice: number;
    maxPrice: number;
};

export type ReviewWithAuthor = typeof reviews.$inferSelect & {
    user: { id: string; name: string | null } | null;
};

export interface ProductListResult {
    products: ProductWithDetails[];
    totalCount: number;
}

// ... existing getAllProducts function (omitted for brevity in this block, but I need to keep it in the file)
// To avoid overwriting the entire large file with omitted code, I will use replace_file_content or write the whole file carefully.
// The user asked to "Update src/lib/actions/product.ts".
// I'll rewrite the whole file to ensure clean state and add the new functions.

// RE-IMPLEMENTING getAllProducts to ensure it stays the same (based on previous read)

export async function getAllProducts(
    filters: ProductFilters
): Promise<ProductListResult> {
    const {
        search,
        gender,
        color,
        size,
        priceRange,
        sort = "newest",
        page = 1,
    } = filters;

    const limit = 12;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [eq(products.isPublished, true)];

    if (search) {
        conditions.push(
            or(
                ilike(products.name, `%${search}%`),
                ilike(products.description, `%${search}%`)
            )!
        );
    }

    if (gender && gender.length > 0) {
        conditions.push(
            inArray(
                products.genderId,
                db
                    .select({ id: genders.id })
                    .from(genders)
                    .where(inArray(genders.slug, gender))
            )
        );
    }

    if (color && color.length > 0) {
        conditions.push(
            exists(
                db
                    .select({ id: productVariants.id })
                    .from(productVariants)
                    .leftJoin(colors, eq(productVariants.colorId, colors.id))
                    .where(
                        and(
                            eq(productVariants.productId, products.id),
                            inArray(colors.slug, color)
                        )
                    )
            )
        );
    }

    if (size && size.length > 0) {
        conditions.push(
            exists(
                db
                    .select({ id: productVariants.id })
                    .from(productVariants)
                    .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
                    .where(
                        and(
                            eq(productVariants.productId, products.id),
                            inArray(sizes.slug, size)
                        )
                    )
            )
        );
    }

    if (priceRange && priceRange.length > 0) {
        const priceConditions: SQL[] = [];

        for (const rangeStr of priceRange) {
            const range = PRICE_RANGES.find((r) => r.value === rangeStr);
            if (range) {
                const { min, max } = range;
                if (max === Infinity) {
                    priceConditions.push(gte(productVariants.price, min.toString()));
                } else {
                    priceConditions.push(
                        and(
                            gte(productVariants.price, min.toString()),
                            lt(productVariants.price, max.toString())
                        )!
                    );
                }
            }
        }

        if (priceConditions.length > 0) {
            conditions.push(
                exists(
                    db
                        .select({ id: productVariants.id })
                        .from(productVariants)
                        .where(
                            and(
                                eq(productVariants.productId, products.id),
                                or(...priceConditions)
                            )
                        )
                )
            );
        }
    }

    let orderBy: SQL | SQL[] = desc(products.createdAt);

    if (sort === "newest") {
        orderBy = desc(products.createdAt);
    } else if (sort === "featured") {
        orderBy = desc(products.createdAt);
    }

    const matchedProductsQuery = db
        .select({
            id: products.id,
            minPrice: sql<number>`MIN(${productVariants.price})`.mapWith(Number),
            createdAt: products.createdAt,
        })
        .from(products)
        .leftJoin(productVariants, eq(products.id, productVariants.productId))
        .where(and(...conditions))
        .groupBy(products.id);

    let finalQuery = matchedProductsQuery;

    if (sort === "price_asc") {
        // @ts-ignore
        finalQuery = matchedProductsQuery.orderBy(asc(sql`MIN(${productVariants.price})`)) as any;
    } else if (sort === "price_desc") {
        // @ts-ignore
        finalQuery = matchedProductsQuery.orderBy(desc(sql`MIN(${productVariants.price})`)) as any;
    } else {
        // @ts-ignore
        finalQuery = matchedProductsQuery.orderBy(desc(products.createdAt)) as any;
    }

    const rows = await finalQuery.limit(limit).offset(offset);
    const matchedIds = rows.map((r) => r.id);

    const countResult = await db
        .select({ value: sql<number>`count(distinct ${products.id})`.mapWith(Number) })
        .from(products)
        .where(and(...conditions));

    const totalCount = countResult[0]?.value || 0;

    if (matchedIds.length === 0) {
        return { products: [], totalCount };
    }

    const productsData = await db.query.products.findMany({
        where: inArray(products.id, matchedIds),
        with: {
            category: true,
            gender: true,
            brand: true,
            defaultVariant: {
                with: {
                    color: true,
                    size: true,
                },
            },
            variants: {
                with: {
                    color: true,
                    size: true,
                },
            },
            images: true,
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enhancedProducts = productsData.map((p: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prices = p.variants.map((v: any) => Number(v.price));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortedImages = [...p.images].sort((a: any, b: any) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        return {
            ...p,
            minPrice,
            maxPrice,
            images: sortedImages,
        } as unknown as ProductWithDetails;
    });

    const sortedEnhancedProducts = matchedIds.map((id) =>
        enhancedProducts.find((p) => p.id === id)!
    ).filter(Boolean);

    return {
        products: sortedEnhancedProducts,
        totalCount,
    };
}

export async function getProduct(productId: string) {
    if (!productId) return null;

    try {
        const product = await db.query.products.findFirst({
            where: eq(products.id, productId),
            with: {
                category: true,
                gender: true,
                brand: true,
                defaultVariant: {
                    with: {
                        color: true,
                        size: true,
                    },
                },
                variants: {
                    with: {
                        color: true,
                        size: true,
                    },
                },
                images: true,
            },
        });

        if (!product) return null;

        // Calculate aggregates
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productAny = product as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prices = productAny.variants.map((v: any) => Number(v.price));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Sort images
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sortedImages = [...product.images].sort((a: any, b: any) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return (a.sortOrder || 0) - (b.sortOrder || 0);
        });

        return {
            ...product,
            images: sortedImages,
            minPrice,
            maxPrice,
        } as unknown as ProductWithDetails;
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function getProductReviews(productId: string) {
    if (!productId) return [];

    try {
        const productReviews = await db.query.reviews.findMany({
            where: eq(reviews.productId, productId),
            orderBy: desc(reviews.createdAt),
            limit: 10,
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        return productReviews;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export async function getRecommendedProducts(productId: string) {
    if (!productId) return [];

    try {
        // First get the current product to know its category/gender
        const currentProduct = await db.query.products.findFirst({
            where: eq(products.id, productId),
            columns: {
                categoryId: true,
                genderId: true,
                brandId: true,
            }
        });

        if (!currentProduct) return [];

        // Fetch related products
        // Prioritize same category and gender
        // Exclude current product
        const recommendations = await db.query.products.findMany({
            where: and(
                eq(products.isPublished, true),
                ne(products.id, productId),
                eq(products.categoryId, currentProduct.categoryId as string) // simplifying safely
            ),
            limit: 4,
            with: {
                category: true,
                gender: true,
                brand: true,
                images: true, // Needed for card
                defaultVariant: true, // Needed for price
                variants: true // Needed for dynamic price calculation
            }
        });

        // Calculate min prices for them
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return recommendations.map((p: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const prices = p.variants.map((v: any) => Number(v.price));
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            return {
                ...p,
                minPrice
            };
        }) as ProductWithDetails[];

    } catch (error) {
        console.error("Error fetching recommended products:", error);
        return [];
    }
}
