"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Color {
  name: string;
  hex: string;
}

interface ColorPickerProps {
  colors: Color[];
}

export default function ColorPicker({ colors }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "");

  if (!colors || colors.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-body-medium font-medium text-dark-900">
        Colour Shown: {selectedColor}
      </span>
      <div className="flex gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => setSelectedColor(color.name)}
            className={`
              relative w-10 h-10 rounded-full border-2 transition-all p-0.5
              ${selectedColor === color.name 
                ? "border-dark-900 ring-2 ring-offset-2 ring-dark-900" 
                : "border-light-300 hover:border-dark-700"
              }
            `}
            title={color.name}
            type="button"
          >
            <div 
              className="w-full h-full rounded-full border border-dark-900/10" 
              style={{ backgroundColor: color.hex }}
            />
            {selectedColor === color.name && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Check 
                        size={16} 
                        className={color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === 'white' ? "text-dark-900" : "text-white"} 
                    />
                </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
