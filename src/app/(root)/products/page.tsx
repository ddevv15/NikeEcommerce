import { Suspense } from "react";
import { Card } from "../../../components";
import {
  parseFilters,
  PRICE_RANGES,
  type ProductFilters,
} from "../../../lib/utils/query";
import { getAllProducts } from "@/lib/actions/product";
import SortClient from "./SortClient";
import ActiveFilters from "./ActiveFilters";
import MobileHeader from "./MobileHeader";
import FiltersClient from "./FiltersClient";
import { FilterProvider } from "./MobileFiltersWrapper";

export const dynamic = "force-dynamic";



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
  // Filter and sort products from database
  const { products: sortedProducts, totalCount } = await getAllProducts(filters);

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
                    // Get price from pre-calculated minPrice
                    // If range (min !== max), could show "From $X"
                    const price = product.minPrice ? product.minPrice.toFixed(2) : "0.00";
                    
                    // Get primary image URL (already sorted in action)
                    const imageUrl = product.images[0]?.url ?? "";

                    // Debug: Log if no image found
                    if (!imageUrl && process.env.NODE_ENV === "development") {
                      console.log(
                        "No image found for product:",
                        product.id,
                        product.name,
                      );
                    }

                    // Get category name
                    const categoryName = product.category?.name ?? "Uncategorized";
                    
                    // Get gender label
                    const genderLabel = getGenderLabel(product.gender?.slug ?? null);
                    
                    // Get color from default variant
                    const colorLabel = getColorLabel(
                      product.defaultVariant?.color?.slug ?? null
                    );

                    return (
                      <Card
                        key={product.id}
                        id={product.id}
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
