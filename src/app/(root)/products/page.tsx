import { Suspense } from "react";
import { Card } from "../../../components";
import {
  parseFilters,
  PRICE_RANGES,
  type ProductFilters,
} from "../../../lib/utils/query";
import { db } from "../../../lib/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  products,
  productVariants,
  productImages,
} from "../../../lib/db/schema";
import SortClient from "./SortClient";
import ActiveFilters from "./ActiveFilters";
import MobileHeader from "./MobileHeader";
import FiltersClient from "./FiltersClient";
import { FilterProvider } from "./MobileFiltersWrapper";

export const dynamic = "force-dynamic";

// Filter products based on filters
async function filterAndSortProducts(filters: ProductFilters) {
  // Build where conditions
  const conditions = [eq(products.isPublished, true)];

  // Gender filter
  if (filters.gender && filters.gender.length > 0) {
    // Fetch gender IDs from slugs
    const genders = await db.query.genders.findMany({
      where: (genders, { inArray }) => inArray(genders.slug, filters.gender!),
    });
    const genderIds = genders.map((g) => g.id);
    if (genderIds.length > 0) {
      conditions.push(inArray(products.genderId, genderIds));
    }
  }

  // Fetch products with relations
  let allProducts = await db.query.products.findMany({
    where: and(...conditions),
    with: {
      category: true,
      gender: true,
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
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });

  // Apply client-side filters that require variant data
  let filteredProducts = allProducts;

  // Color filter
  if (filters.color && filters.color.length > 0) {
    const colors = await db.query.colors.findMany({
      where: (colors, { inArray }) => inArray(colors.slug, filters.color!),
    });
    const colorSlugs = colors.map((c) => c.slug);
    filteredProducts = filteredProducts.filter((product) => {
      return (product.variants as Array<{ color?: { slug: string } | null }>).some(
        (variant) => variant.color && colorSlugs.includes(variant.color.slug)
      );
    });
  }

  // Size filter
  if (filters.size && filters.size.length > 0) {
    const sizes = await db.query.sizes.findMany({
      where: (sizes, { inArray }) => inArray(sizes.slug, filters.size!),
    });
    const sizeSlugs = sizes.map((s) => s.slug);
    filteredProducts = filteredProducts.filter((product) => {
      return (product.variants as Array<{ size?: { slug: string } | null }>).some(
        (variant) => variant.size && sizeSlugs.includes(variant.size.slug)
      );
    });
  }

  // Price range filter
  if (filters.priceRange && filters.priceRange.length > 0) {
    filteredProducts = filteredProducts.filter((product) => {
      const defaultVariant = product.defaultVariant as { price?: string } | null;
      const defaultPrice = defaultVariant?.price
        ? parseFloat(defaultVariant.price)
        : null;
      if (defaultPrice === null) return false;

      return filters.priceRange!.some((rangeValue) => {
        const range = PRICE_RANGES.find((r) => r.value === rangeValue);
        if (range) {
          return defaultPrice >= range.min && defaultPrice < range.max;
        }
        return false;
      });
    });
  }

  // Sort products
  let sortedProducts = [...filteredProducts];

  switch (filters.sort) {
    case "newest":
      sortedProducts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "price_asc":
      sortedProducts.sort((a, b) => {
        const variantA = a.defaultVariant as { price?: string } | null;
        const variantB = b.defaultVariant as { price?: string } | null;
        const priceA = variantA?.price ? parseFloat(variantA.price) : Infinity;
        const priceB = variantB?.price ? parseFloat(variantB.price) : Infinity;
        return priceA - priceB;
      });
      break;
    case "price_desc":
      sortedProducts.sort((a, b) => {
        const variantA = a.defaultVariant as { price?: string } | null;
        const variantB = b.defaultVariant as { price?: string } | null;
        const priceA = variantA?.price ? parseFloat(variantA.price) : 0;
        const priceB = variantB?.price ? parseFloat(variantB.price) : 0;
        return priceB - priceA;
      });
      break;
    case "featured":
    default:
      // Keep original order (newest first from query)
      break;
  }

  return sortedProducts;
}

// Get gender label for display
function getGenderLabel(slug: string | null): string {
  if (!slug) return "";
  const labels: Record<string, string> = {
    men: "Men",
    women: "Women",
    unisex: "Unisex",
    kids: "Kids",
  };
  return labels[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

// Get color label for display
function getColorLabel(slug: string | null): string {
  if (!slug) return "";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// Page props type for Next.js 15
interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Convert to flat object for parsing
  const flatParams: Record<string, string | string[] | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    flatParams[key] = value;
  }

  // Parse filters from URL
  const filters = parseFilters(flatParams);

  // Filter and sort products from database
  const sortedProducts = await filterAndSortProducts(filters);

  return (
    <FilterProvider>
      <main id="products-page" className="min-h-screen bg-light-100 font-jost">
        <div
          id="products-container"
          className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-12 py-8"
        >
          {/* Page Header */}
          <div id="page-header" className="mb-8">
            <h1 className="text-heading-3 font-medium text-dark-900">
              All Products
            </h1>
          </div>

          {/* Active Filters */}
          <Suspense fallback={null}>
            <ActiveFilters />
          </Suspense>

          {/* Main Content */}
          <div id="main-content" className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop Only */}
            <Suspense fallback={<div className="hidden lg:block w-[280px]" />}>
              <FiltersClient />
            </Suspense>

            {/* Products Area */}
            <div id="products-area" className="flex-1">
              {/* Mobile Filter Toggle & Sort */}
              <Suspense fallback={null}>
                <MobileHeader productCount={sortedProducts.length} />
              </Suspense>

              {/* Desktop Sort Header */}
              <div
                id="desktop-sort-header"
                className="hidden lg:flex lg:items-center lg:justify-between mb-6 pb-4 border-b border-light-300"
              >
                <p className="text-body text-dark-700">
                  {sortedProducts.length}{" "}
                  {sortedProducts.length === 1 ? "Product" : "Products"}
                </p>
                <Suspense fallback={null}>
                  <SortClient />
                </Suspense>
              </div>

              {/* Empty State */}
              {sortedProducts.length === 0 ? (
                <div
                  id="empty-state"
                  className="flex flex-col items-center justify-center py-16 px-4 text-center"
                >
                  <svg
                    className="h-16 w-16 text-dark-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h2 className="text-heading-3 font-medium text-dark-900 mb-2">
                    No products found
                  </h2>
                  <p className="text-body text-dark-700 max-w-md">
                    Try adjusting your filters or clearing them to see more
                    products.
                  </p>
                </div>
              ) : (
                /* Product Grid */
                <div
                  id="product-grid"
                  className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8"
                >
                {sortedProducts.map((product) => {
                  // Get price from default variant
                  const defaultVariant = product.defaultVariant as { price?: string } | null;
                  const price = defaultVariant?.price ?? "0.00";
                    // Get primary image URL (prefer isPrimary, fallback to first image)
                    // Sort images by sortOrder, then find primary or first
                    const images =
                      product.images && Array.isArray(product.images)
                        ? [...product.images]
                        : [];
                    const sortedImages = images.sort(
                      (
                        a: typeof productImages.$inferSelect,
                        b: typeof productImages.$inferSelect
                      ) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                    );
                    const primaryImage =
                      sortedImages.find(
                        (img: typeof productImages.$inferSelect) =>
                          img.isPrimary
                      ) ?? sortedImages[0];
                    const imageUrl = primaryImage?.url ?? "";

                    // Debug: Log if no image found
                    if (!imageUrl && process.env.NODE_ENV === "development") {
                      console.log(
                        "No image found for product:",
                        product.id,
                        product.name,
                        "images:",
                        images
                      );
                    }

                    // Get category name
                    const categoryName =
                      product.category?.name ?? "Uncategorized";
                    // Get gender label
                    const genderLabel = getGenderLabel(
                      product.gender?.slug ?? null
                    );
                    // Get color from default variant
                    const defaultVariantWithColor = product.defaultVariant as { color?: { slug: string } | null } | null;
                    const colorLabel = getColorLabel(
                      defaultVariantWithColor?.color?.slug ?? null
                    );

                    return (
                      <Card
                        key={product.id}
                        title={product.name}
                        category={
                          genderLabel
                            ? `${genderLabel}'s ${categoryName}`
                            : categoryName
                        }
                        price={price}
                        imageUrl={imageUrl}
                        colors={colorLabel}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </FilterProvider>
  );
}
