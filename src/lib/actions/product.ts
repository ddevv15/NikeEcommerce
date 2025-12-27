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

export interface ProductListResult {
    products: ProductWithDetails[];
    totalCount: number;
}

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

    // Conditions array
    const conditions: SQL[] = [eq(products.isPublished, true)];

    // 1. Search (Name or Description)
    if (search) {
        conditions.push(
            or(
                ilike(products.name, `%${search}%`),
                ilike(products.description, `%${search}%`)
            )!
        );
    }

    // 2. Gender Filter
    // We need to resolve slugs to IDs first if passing slugs, 
    // but for efficiency, let's assume we can filter by joining or subquery.
    // The User passed SLUGS in the filters (from URL).
    // We'll use subqueries to filter by slug without separate DB calls.
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

    // 3. Category Filter (if we add it later, current filters don't have it explicitly in params type but user map use it)
    // Skipped for now based on types.

    // 4. Color Filter (Exists in variants?)
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

    // 5. Size Filter
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

    // 6. Price Range Filter
    // This requires checking if ANY variant matches the price range.
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

    // FIRST QUERY: Get IDs and Total Count
    // We execute a query to get matched IDs sorted correctly.

    let orderBy: SQL | SQL[] = desc(products.createdAt);

    // Sorting Logic
    if (sort === "price_asc" || sort === "price_desc") {
        // Sort by min price of the product
        // We need to join variants to sort by price
        // This is tricky with plain 'findMany'.
        // We will use a Common Table Expression or just a smarter select.
    } else if (sort === "newest") {
        orderBy = desc(products.createdAt);
    } else if (sort === "featured") {
        // Assuming featured means created_at for now, or some other metric
        // If we had isFeatured flag, we'd use it.
        // Defaulting to newest.
        orderBy = desc(products.createdAt);
    }

    // Because Drizzle query builder with complex joins/groups for pagination + distinct + sort is standard SQL.
    // Strategy: Select ID, MinPrice from products JOIN variants GROUP BY products.id

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

    // Apply Order By to the subquery result?
    // Actually we can order the main query.

    let finalQuery = matchedProductsQuery;

    // Sort direction
    if (sort === "price_asc") {
        // We need to order by the aggregated minPrice
        // .orderBy(asc(sql`MIN(${productVariants.price})`)) works with groupBy
        // @ts-ignore - Check Drizzle type definition for aggregate sorting
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalQuery = matchedProductsQuery.orderBy(asc(sql`MIN(${productVariants.price})`)) as any;
    } else if (sort === "price_desc") {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalQuery = matchedProductsQuery.orderBy(desc(sql`MIN(${productVariants.price})`)) as any;
    } else {
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        finalQuery = matchedProductsQuery.orderBy(desc(products.createdAt)) as any;
    }

    // Get all matched IDs (for count and for slicing)
    // Ideally, we'd use COUNT(*) OVER() but Drizzle support varies.
    // We'll fetch all IDs first (lightweight) then slice in memory if not too huge?
    // No, valid pagination requires SQL LIMIT/OFFSET.

    // Refined Strategy:
    // 1. Get Count
    // 2. Get Page IDs

    // To avoid code duplication, we can reuse the `conditions`.

    // Count Query
    // Note: count(products.id) with groupBy might return count per group.
    // We want total groups.
    // select count(*) from (select id from ... group by id) as sub

    // Simplifying:
    // Since we have a potential 1-to-many with variants, and we use `groupBy(products.id)`,
    // the row count of the query equals proper product count.

    // Re-build query for execution with Limit/Offset
    const rows = await finalQuery.limit(limit).offset(offset);
    const matchedIds = rows.map((r) => r.id);

    // Calculate total count (separate query, optimized)
    // For total count, we don't need sorting or limit.
    // We can use count(distinct products.id) with the same joins and where.
    const countResult = await db
        .select({ value: sql<number>`count(distinct ${products.id})`.mapWith(Number) })
        .from(products)
        // We strictly need the same joins if filters depend on them (exists clauses handle themselves, but joins don't)
        // Our 'conditions' use 'exists' subqueries for relations, so we don't need leftJoin(productVariants) for filtering!
        // WAIT. My `matchedProductsQuery` used `leftJoin(productVariants)` for sorting by price.
        // If I filter by price, I used `exists`.
        // So for COUNT, I only need to join if I used the join in `conditions`.
        // My `conditions` use `exists` for variants.
        // So `db.select({ count: count() }).from(products).where(and(...conditions))` is enough!
        // Much faster.
        .where(and(...conditions));

    const totalCount = countResult[0]?.value || 0;

    if (matchedIds.length === 0) {
        return { products: [], totalCount };
    }

    // Fetch Full Details for IDs
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

    // Calculate aggregates (min/max price) and Sort Images
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enhancedProducts = productsData.map((p: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const prices = p.variants.map((v: any) => Number(v.price));
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        // Sort images: primary first, then by sortOrder
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

    // Re-sort the JS array to match the ID order from the first query
    // (because `inArray` does not preserve order)
    const sortedEnhancedProducts = matchedIds.map((id) =>
        enhancedProducts.find((p) => p.id === id)!
    ).filter(Boolean);

    return {
        products: sortedEnhancedProducts,
        totalCount,
    };
}

export async function getProduct(productId: string) {
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
            reviews: true, // Assuming review fetching was requested
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

    return {
        ...product,
        minPrice,
        maxPrice,
    } as unknown as ProductWithDetails;
}
