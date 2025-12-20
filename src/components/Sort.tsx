"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { parseFilters, updateQueryParam, SORT_OPTIONS } from "../lib/utils/query";

export default function Sort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current sort from URL
  const currentParams = Object.fromEntries(searchParams.entries());
  const filters = parseFilters(currentParams);
  const currentSort = filters.sort || "featured";

  // Get current sort label
  const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === currentSort);
  const currentLabel = currentSortOption?.label || "Sort By";

  // Handle sort change
  const handleSortChange = useCallback(
    (sortValue: string) => {
      const newQuery = updateQueryParam(currentParams, "sort", sortValue);
      router.push(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
      setIsOpen(false);
    },
    [currentParams, pathname, router]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sort Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-body-medium font-medium text-dark-900 
                   hover:text-dark-700 transition-colors rounded-md hover:bg-light-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Sort By:</span>
        <span className="text-dark-700">{currentLabel}</span>
        <svg
          className={`h-4 w-4 text-dark-700 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 z-20 min-w-[200px] bg-light-100 
                     rounded-lg shadow-lg border border-light-300 py-2 
                     animate-in fade-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = currentSort === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full px-4 py-2 text-left text-body transition-colors
                           hover:bg-light-200 ${
                             isSelected
                               ? "text-dark-900 font-medium bg-light-200"
                               : "text-dark-700"
                           }`}
                role="option"
                aria-selected={isSelected}
              >
                {option.label}
                {isSelected && (
                  <svg
                    className="inline-block ml-2 h-4 w-4 text-dark-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
