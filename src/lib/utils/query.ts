import queryString from "query-string";

// Filter types
export interface ProductFilters {
    gender?: string[];
    size?: string[];
    color?: string[];
    priceRange?: string[];
    sort?: string;
    page?: number;
}

// Price range options with min/max values
export const PRICE_RANGES = [
    { label: "Under $50", value: "0-50", min: 0, max: 50 },
    { label: "$50 - $100", value: "50-100", min: 50, max: 100 },
    { label: "$100 - $150", value: "100-150", min: 100, max: 150 },
    { label: "Over $150", value: "150+", min: 150, max: Infinity },
] as const;

// Sort options
export const SORT_OPTIONS = [
    { label: "Featured", value: "featured" },
    { label: "Newest", value: "newest" },
    { label: "Price: High-Low", value: "price_desc" },
    { label: "Price: Low-High", value: "price_asc" },
] as const;

/**
 * Parse URL search params into a structured filters object
 */
export function parseFilters(searchParams: Record<string, string | string[] | undefined>): ProductFilters {
    const filters: ProductFilters = {};

    // Parse array params (gender, size, color, priceRange)
    const arrayParams = ["gender", "size", "color", "priceRange"] as const;

    for (const param of arrayParams) {
        const value = searchParams[param];
        if (value) {
            filters[param] = Array.isArray(value) ? value : [value];
        }
    }

    // Parse sort param
    if (searchParams.sort && typeof searchParams.sort === "string") {
        filters.sort = searchParams.sort;
    }

    // Parse page param
    if (searchParams.page && typeof searchParams.page === "string") {
        const pageNum = parseInt(searchParams.page, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
            filters.page = pageNum;
        }
    }

    return filters;
}

/**
 * Build a query string from a filters object
 */
export function buildQueryString(filters: ProductFilters): string {
    // Clean up empty arrays and undefined values
    const cleanFilters: Record<string, string | string[] | number> = {};

    for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value) && value.length > 0) {
                cleanFilters[key] = value;
            } else if (!Array.isArray(value)) {
                cleanFilters[key] = value;
            }
        }
    }

    return queryString.stringify(cleanFilters, { arrayFormat: "comma" });
}

/**
 * Toggle a value in an array parameter (add if not present, remove if present)
 */
export function toggleArrayParam(
    currentParams: Record<string, string | string[] | undefined>,
    key: string,
    value: string
): string {
    const parsed = parseFilters(currentParams);
    const currentArray = parsed[key as keyof ProductFilters] as string[] | undefined;

    let newArray: string[];

    if (currentArray && currentArray.includes(value)) {
        // Remove value
        newArray = currentArray.filter((v) => v !== value);
    } else {
        // Add value
        newArray = [...(currentArray || []), value];
    }

    const newFilters = {
        ...parsed,
        [key]: newArray.length > 0 ? newArray : undefined,
        page: 1, // Reset to page 1 when filters change
    };

    return buildQueryString(newFilters);
}

/**
 * Update a single query parameter value
 */
export function updateQueryParam(
    currentParams: Record<string, string | string[] | undefined>,
    key: string,
    value: string | number | undefined
): string {
    const parsed = parseFilters(currentParams);

    const newFilters = {
        ...parsed,
        [key]: value,
        // Reset page when sort changes
        ...(key === "sort" ? { page: 1 } : {}),
    };

    return buildQueryString(newFilters);
}

/**
 * Remove a query parameter entirely
 */
export function removeQueryParam(
    currentParams: Record<string, string | string[] | undefined>,
    key: string,
    value?: string
): string {
    const parsed = parseFilters(currentParams);

    if (value && Array.isArray(parsed[key as keyof ProductFilters])) {
        // Remove specific value from array
        const currentArray = parsed[key as keyof ProductFilters] as string[];
        const newArray = currentArray.filter((v) => v !== value);

        const newFilters = {
            ...parsed,
            [key]: newArray.length > 0 ? newArray : undefined,
            page: 1,
        };

        return buildQueryString(newFilters);
    } else {
        // Remove entire param
        const newFilters = { ...parsed };
        delete newFilters[key as keyof ProductFilters];
        newFilters.page = 1;

        return buildQueryString(newFilters);
    }
}

/**
 * Clear all filters
 */
export function clearAllFilters(): string {
    return "";
}

/**
 * Check if a value is currently selected in filters
 */
export function isFilterSelected(
    filters: ProductFilters,
    key: keyof ProductFilters,
    value: string
): boolean {
    const filterValue = filters[key];
    if (Array.isArray(filterValue)) {
        return filterValue.includes(value);
    }
    return filterValue === value;
}

/**
 * Get active filter count
 */
export function getActiveFilterCount(filters: ProductFilters): number {
    let count = 0;

    if (filters.gender?.length) count += filters.gender.length;
    if (filters.size?.length) count += filters.size.length;
    if (filters.color?.length) count += filters.color.length;
    if (filters.priceRange?.length) count += filters.priceRange.length;

    return count;
}

/**
 * Parse comma-separated query params (for URL parsing)
 */
export function parseQueryParams(searchParams: URLSearchParams): Record<string, string | string[] | undefined> {
    const params: Record<string, string | string[] | undefined> = {};

    searchParams.forEach((value, key) => {
        // Handle comma-separated values
        if (value.includes(",")) {
            params[key] = value.split(",");
        } else {
            params[key] = value;
        }
    });

    return params;
}
