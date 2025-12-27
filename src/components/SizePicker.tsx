"use client";

import { useState } from "react";

interface SizePickerProps {
  sizes: string[];
}

export default function SizePicker({ sizes }: SizePickerProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-body-medium font-medium text-dark-900">Select Size</h3>
        <button className="text-body text-dark-700 hover:text-dark-900 underline-offset-4 hover:underline">
            Size Guide
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`
              flex items-center justify-center py-3 rounded-md border transition-all text-body-medium
              ${selectedSize === size 
                ? "border-dark-900 bg-dark-900 text-white" 
                : "border-light-400 text-dark-900 hover:border-dark-700"
              }
            `}
            aria-pressed={selectedSize === size}
            type="button"
          >
            {size}
          </button>
        ))}
      </div>
      {selectedSize === null && (
         <p className="mt-2 text-red text-xs hidden" role="alert">Please select a size.</p>
      )}
    </div>
  );
}
