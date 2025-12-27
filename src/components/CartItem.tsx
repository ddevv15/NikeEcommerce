"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { CartItemDTO, updateCartItem, removeCartItem } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart.store";

interface CartItemProps {
  item: CartItemDTO;
}

export default function CartItem({ item }: CartItemProps) {
  const { setCart } = useCartStore();

  const handleUpdateQuantity = async (newQty: number) => {
    // Optimistic UI could be handled here, but for now we wait for server
    const updatedCart = await updateCartItem(item.id, newQty);
    setCart(updatedCart);
  };

  const handleRemove = async () => {
    const updatedCart = await removeCartItem(item.id);
    setCart(updatedCart);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-6 py-6 border-b border-light-200 last:border-0 relative">
      {/* Image */}
      <div className="relative aspect-square w-24 sm:w-36 flex-shrink-0 overflow-hidden rounded bg-light-200">
        <Image
          src={item.product.imageUrl || "/placeholder.png"}
          alt={item.product.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 96px, 144px"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-body-medium font-medium text-dark-900">
              <Link href={`/products/${item.product.id}`} className="hover:underline">
                {item.product.name}
              </Link>
            </h3>
            <p className="text-body text-dark-500">
              {item.variant.color} / {item.variant.size}
            </p>
          </div>
          <p className="text-body-medium font-medium text-dark-900">
            ${(item.variant.price * item.quantity).toFixed(2)}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 sm:mt-0">
           {/* Quantity Controls */}
           <div className="flex items-center gap-3">
               <span className="text-body text-dark-500 text-sm">Qty</span>
               <div className="flex items-center border border-light-400 rounded-full h-8 w-24 justify-between px-2">
                    <button 
                        onClick={() => handleUpdateQuantity(item.quantity - 1)}
                        className="text-dark-500 hover:text-dark-900 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium text-dark-900">{item.quantity}</span>
                    <button 
                         onClick={() => handleUpdateQuantity(item.quantity + 1)}
                         className="text-dark-500 hover:text-dark-900"
                         aria-label="Increase quantity"
                    >
                        <Plus size={14} />
                    </button>
               </div>
           </div>

           {/* Remove Button */}
           <button 
               onClick={handleRemove}
               className="text-dark-500 hover:text-red transition-colors p-2 -mr-2"
               aria-label="Remove item"
           >
               <Trash2 size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}
