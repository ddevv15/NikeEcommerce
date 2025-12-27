"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter out empty strings or nulls
  const validImages = images.filter((img) => img && img.trim() !== "");
  const hasImages = validImages.length > 0;

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      setSelectedIndex(index);
    }
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start md:gap-4 w-full h-full">
      {/* Thumbnails List */}
      <div 
        className="flex gap-4 overflow-x-auto md:flex-col md:overflow-y-auto md:w-[100px] md:h-[600px] md:flex-shrink-0 scrollbar-hide snap-x p-1"
        role="tablist"
        aria-label="Product image thumbnails"
      >
        {hasImages ? (
          validImages.map((img, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={selectedIndex === idx}
              aria-controls={`product-image-${idx}`}
              onClick={() => handleThumbnailClick(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-full md:h-24 overflow-hidden rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-dark-900 snap-start ${
                selectedIndex === idx ? "border-dark-900 opacity-100" : "border-transparent hover:border-light-400 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Product thumbnail ${idx + 1}`}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 64px, 96px"
              />
            </button>
          ))
        ) : null}
      </div>

      {/* Main Image Area */}
      <div className="relative flex-1 aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-xl bg-light-200 w-full">
        {hasImages ? (
          <Image
            id={`product-image-${selectedIndex}`}
            src={validImages[selectedIndex]}
            alt={`Product image ${selectedIndex + 1}`}
            fill
            priority={selectedIndex === 0}
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-dark-500 gap-2">
            <ImageOff className="w-12 h-12 opacity-50" />
            <span className="text-sm font-medium">No Image Available</span>
          </div>
        )}
        
        {/* Mobile controls */}
        {hasImages && validImages.length > 1 && (
            <>
                <button 
                    onClick={() => setSelectedIndex(prev => (prev - 1 + validImages.length) % validImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm text-dark-900 md:hidden z-10"
                    aria-label="Previous image"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                     onClick={() => setSelectedIndex(prev => (prev + 1) % validImages.length)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm text-dark-900 md:hidden z-10"
                     aria-label="Next image"
                >
                    <ChevronRight size={20} />
                </button>
                {/* Mobile Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {validImages.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                selectedIndex === idx ? "bg-dark-900" : "bg-dark-900/10" // Updated to match light/dark properly? Actually bg-white/50 vs white is better on photos usually.
                            } shadow-sm backdrop-blur-sm ring-1 ring-white/50`}
                            // Better contrast needed if image is light/dark. Let's use dark indicators with white border maybe.
                             style={{ backgroundColor: selectedIndex === idx ? '#111' : 'rgba(255,255,255,0.5)' }} 
                        />
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
}
