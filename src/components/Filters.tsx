"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  parseFilters,
  toggleArrayParam,
  isFilterSelected,
  getActiveFilterCount,
  clearAllFilters,
  PRICE_RANGES,
  type ProductFilters,
} from "../lib/utils/query";

// Filter group configuration
const FILTER_GROUPS = [
  {
    key: "gender" as const,
    label: "Gender",
    options: [
      { label: "Men", value: "men" },
      { label: "Women", value: "women" },
      { label: "Unisex", value: "unisex" },
      { label: "Kids", value: "kids" },
    ],
  },
  {
    key: "size" as const,
    label: "Size",
    options: [
      { label: "XS", value: "xs" },
      { label: "S", value: "s" },
      { label: "M", value: "m" },
      { label: "L", value: "l" },
      { label: "XL", value: "xl" },
      { label: "XXL", value: "xxl" },
      { label: "8", value: "8" },
      { label: "9", value: "9" },
      { label: "10", value: "10" },
      { label: "11", value: "11" },
      { label: "12", value: "12" },
    ],
  },
  {
    key: "color" as const,
    label: "Color",
    options: [
      { label: "Red", value: "red" },
      { label: "Blue", value: "blue" },
      { label: "Green", value: "green" },
      { label: "Black", value: "black" },
      { label: "White", value: "white" },
      { label: "Grey", value: "grey" },
      { label: "Yellow", value: "yellow" },
      { label: "Orange", value: "orange" },
    ],
  },
  {
    key: "priceRange" as const,
    label: "Price",
    options: PRICE_RANGES.map((range) => ({
      label: range.label,
      value: range.value,
    })),
  },
];

interface FiltersProps {
  isOpen?: boolean;
  onClose?: () => void;
  desktopOnly?: boolean; // If true, only render desktop sidebar (no mobile drawer)
}

export default function Filters({
  isOpen = false,
  onClose,
  desktopOnly = false,
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track expanded sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    gender: true,
    size: true,
    color: true,
    priceRange: true,
  });

  // Parse current filters from URL
  const currentParams = Object.fromEntries(searchParams.entries());
  const filters = parseFilters(currentParams);
  const activeCount = getActiveFilterCount(filters);

  // Handle filter toggle
  const handleFilterToggle = useCallback(
    (key: string, value: string) => {
      const newQuery = toggleArrayParam(currentParams, key, value);
      router.push(`${pathname}${newQuery ? `?${newQuery}` : ""}`, {
        scroll: false,
      });
    },
    [currentParams, pathname, router]
  );

  // Handle clear all filters
  const handleClearAll = useCallback(() => {
    router.push(pathname, { scroll: false });
    onClose?.();
  }, [pathname, router, onClose]);

  // Toggle section expansion
  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filterContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-light-300 px-4 py-4 lg:px-0 lg:border-0">
        <h2 className="text-heading-3 font-medium text-dark-900">
          Filters
          {activeCount > 0 && (
            <span className="ml-2 text-body text-dark-700">
              ({activeCount})
            </span>
          )}
        </h2>

        <div className="flex items-center gap-4">
          {activeCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-body text-dark-700 underline underline-offset-2 hover:text-dark-900 transition-colors"
            >
              Clear All
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 hover:bg-light-200 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <svg
              className="h-5 w-5 text-dark-900"
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
        </div>
      </div>

      {/* Filter Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-0">
        {FILTER_GROUPS.map((group) => (
          <div
            key={group.key}
            className="border-b border-light-300 py-4 last:border-0"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(group.key)}
              className="flex w-full items-center justify-between text-left"
              aria-expanded={expandedSections[group.key]}
            >
              <span className="text-body-medium font-medium text-dark-900">
                {group.label}
              </span>
              <svg
                className={`h-5 w-5 text-dark-700 transition-transform duration-200 ${
                  expandedSections[group.key] ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Section Content */}
            {expandedSections[group.key] && (
              <div className="mt-4 space-y-3 pl-[5px]">
                {group.options.map((option) => {
                  const isSelected = isFilterSelected(
                    filters,
                    group.key,
                    option.value
                  );

                  return (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 group"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          handleFilterToggle(group.key, option.value)
                        }
                        className="h-5 w-5 rounded border-2 border-dark-500 text-dark-900 
                                   focus:ring-2 focus:ring-dark-900 focus:ring-offset-2
                                   checked:bg-dark-900 checked:border-dark-900
                                   cursor-pointer transition-colors pl-[5px]"
                      />
                      <span
                        className={`text-body transition-colors ${
                          isSelected
                            ? "text-dark-900 font-medium"
                            : "text-dark-700 group-hover:text-dark-900"
                        }`}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // If desktopOnly is true, only render desktop sidebar
  if (desktopOnly) {
    return (
      <aside className="hidden lg:block w-[280px] flex-shrink-0 pr-8">
        <div className="sticky top-24">{filterContent}</div>
      </aside>
    );
  }

  // Otherwise, render mobile drawer (desktop sidebar is handled by FiltersClient)
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-dark-900/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-[320px] bg-light-100 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {filterContent}
      </div>
    </>
  );
}
