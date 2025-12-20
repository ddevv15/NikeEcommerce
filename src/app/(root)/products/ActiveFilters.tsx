"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { parseFilters, removeQueryParam, PRICE_RANGES } from "../../../lib/utils/query";

// Get display labels for filter values
const GENDER_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
  kids: "Kids",
};

const SIZE_LABELS: Record<string, string> = {
  xs: "XS",
  s: "S",
  m: "M",
  l: "L",
  xl: "XL",
  xxl: "XXL",
  "8": "Size 8",
  "9": "Size 9",
  "10": "Size 10",
  "11": "Size 11",
  "12": "Size 12",
};

const COLOR_LABELS: Record<string, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  black: "Black",
  white: "White",
  grey: "Grey",
  yellow: "Yellow",
  orange: "Orange",
};

export default function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const currentParams = Object.fromEntries(searchParams.entries());
  const filters = parseFilters(currentParams);

  // Handle removing a filter
  const handleRemoveFilter = useCallback(
    (key: string, value: string) => {
      const newQuery = removeQueryParam(currentParams, key, value);
      router.push(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
    },
    [currentParams, pathname, router]
  );

  // Handle clearing all filters
  const handleClearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  // Build list of active filters
  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  if (filters.gender) {
    filters.gender.forEach((g) => {
      activeFilters.push({
        key: "gender",
        value: g,
        label: GENDER_LABELS[g] || g,
      });
    });
  }

  if (filters.size) {
    filters.size.forEach((s) => {
      activeFilters.push({
        key: "size",
        value: s,
        label: SIZE_LABELS[s] || s.toUpperCase(),
      });
    });
  }

  if (filters.color) {
    filters.color.forEach((c) => {
      activeFilters.push({
        key: "color",
        value: c,
        label: COLOR_LABELS[c] || c,
      });
    });
  }

  if (filters.priceRange) {
    filters.priceRange.forEach((pr) => {
      const range = PRICE_RANGES.find((r) => r.value === pr);
      activeFilters.push({
        key: "priceRange",
        value: pr,
        label: range?.label || pr,
      });
    });
  }

  // Don't render if no active filters
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-body text-dark-700 mr-2">Active Filters:</span>
      
      {activeFilters.map((filter) => (
        <button
          key={`${filter.key}-${filter.value}`}
          onClick={() => handleRemoveFilter(filter.key, filter.value)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                     bg-light-200 text-dark-900 text-caption font-medium
                     hover:bg-light-300 transition-colors group"
        >
          {filter.label}
          <svg
            className="h-3.5 w-3.5 text-dark-500 group-hover:text-dark-900 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      ))}

      {activeFilters.length > 1 && (
        <button
          onClick={handleClearAll}
          className="text-body text-dark-700 underline underline-offset-2 hover:text-dark-900 transition-colors ml-2"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
