"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { addCartItem } from "@/lib/actions/cart";
import { ColorPicker, SizePicker } from "@/components"; // We will compose them inside or use composition in page

// We need to know which variant is selected.
// Since ColorPicker and SizePicker are separate, we need to lift state up.
// But PDP is a server component.
// Best approach: Wrap the entire "buying form" area in a client component.

interface ProductVariantStub {
    id: string;
    color: string;
    size: string;
    stock: number;
    price: number;
}

interface ProductActionsProps {
    productId: string;
    variants: ProductVariantStub[];
    colors: { name: string; hex: string }[];
    sizes: string[];
}

export default function ProductActions({ productId, variants, colors, sizes }: ProductActionsProps) {
    // Default selections
    const [selectedColor, setSelectedColor] = useState<string>(colors[0]?.name || "");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [isAdding, setIsAdding] = useState(false);
    const { fetchCart } = useCartStore();

    // Derived state: find variant
    const selectedVariant = variants.find(v => 
        v.color === selectedColor && v.size === selectedSize
    );

    const handleAddToCart = async () => {
        if (!selectedSize) {
            alert("Please select a size"); // Could be better UI
            return;
        }
        if (!selectedVariant) {
             alert("Selected combination unavailable");
             return;
        }

        setIsAdding(true);
        try {
            await addCartItem(selectedVariant.id, 1);
            await fetchCart(); // Update UI
            // Maybe show toast or open cart drawer?
            // For now just finish loading state
        } catch (error) {
            console.error("Add to cart failed", error);
            alert("Failed to add to bag. Please try again.");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 mt-4">
            {colors.length > 0 && (
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
                                : "border-light-300 hover:border-dark-700"}
                            `}
                            title={color.name}
                            type="button"
                        >
                            <div 
                            className="w-full h-full rounded-full border border-dark-900/10" 
                            style={{ backgroundColor: color.hex }}
                            />
                        </button>
                        ))}
                    </div>
                </div>
            )}

            {sizes.length > 0 && (
                <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-body-medium font-medium text-dark-900">Select Size</h3>
                        <button className="text-body text-dark-700 hover:text-dark-900 underline-offset-4 hover:underline">
                            Size Guide
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {sizes.map((size) => {
                             // Check availability for this size given the selected color
                             const isAvailable = variants.some(v => v.color === selectedColor && v.size === size && v.stock > 0);
                             
                             return (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    // disabled={!isAvailable} // Optional: disable if out of stock
                                    className={`
                                    flex items-center justify-center py-3 rounded-md border transition-all text-body-medium
                                    ${selectedSize === size 
                                        ? "border-dark-900 bg-dark-900 text-white" 
                                        : "border-light-400 text-dark-900 hover:border-dark-700"}
                                    ${!isAvailable ? "opacity-50 cursor-not-allowed bg-light-200" : ""}
                                    `}
                                    aria-pressed={selectedSize === size}
                                    type="button"
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
               <button 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="w-full py-4 rounded-full bg-dark-900 text-white font-medium hover:bg-dark-700 transition-colors flex items-center justify-center gap-2 disabled:bg-dark-500 disabled:cursor-not-allowed"
               >
                   {isAdding ? "Adding..." : "Add to Bag"}
               </button>
               <button className="w-full py-4 rounded-full border border-light-400 text-dark-900 font-medium hover:border-dark-900 transition-colors flex items-center justify-center gap-2">
                   Favorite <Heart size={20} />
               </button>
           </div>
        </div>
    );
}
