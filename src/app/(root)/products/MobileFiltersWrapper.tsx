"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Filters } from "../../../components";

interface FilterContextType {
  openFilters: () => void;
  closeFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function useFilterContext() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilterContext must be used within FilterProvider");
  }
  return context;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <FilterContext.Provider
      value={{
        openFilters: () => setIsFilterOpen(true),
        closeFilters: () => setIsFilterOpen(false),
      }}
    >
      {children}
      {/* Render Filters outside the main content tree - not inside products-area */}
      <Filters isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </FilterContext.Provider>
  );
}
