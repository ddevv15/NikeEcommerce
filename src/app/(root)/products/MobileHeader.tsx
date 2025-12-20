"use client";

import { useSearchParams } from "next/navigation";
import { Sort } from "../../../components";
import { getActiveFilterCount, parseFilters } from "../../../lib/utils/query";
import { useFilterContext } from "./MobileFiltersWrapper";

interface MobileHeaderProps {
  productCount: number;
}

export default function MobileHeader({ productCount }: MobileHeaderProps) {
  const { openFilters } = useFilterContext();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const currentParams = Object.fromEntries(searchParams.entries());
  const parsedFilters = parseFilters(currentParams);
  const activeCount = getActiveFilterCount(parsedFilters);

  return (
    <>
      {/* Mobile Filter Toggle & Sort Row */}
      <div className="flex items-center justify-between gap-4 mb-4 lg:hidden">
        <button
          onClick={openFilters}
          className="flex items-center gap-2 px-4 py-2 border border-light-300 rounded-md 
                     text-body-medium font-medium text-dark-900 hover:bg-light-200 transition-colors"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-dark-900 text-light-100 text-footnote">
              {activeCount}
            </span>
          )}
        </button>
        <Sort />
      </div>

      {/* Mobile Product Count */}
      <p className="text-body text-dark-700 mb-4 lg:hidden">
        {productCount} {productCount === 1 ? "Product" : "Products"}
      </p>
    </>
  );
}
