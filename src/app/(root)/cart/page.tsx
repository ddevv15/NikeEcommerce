"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { CartItem, CartSummary } from "@/components";

export default function CartPage() {
  const { cart, fetchCart, isLoading } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading) {
      // Basic skeleton or loading state
      return (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-jost min-h-[60vh] flex items-center justify-center">
              <span className="text-dark-500">Loading your bag...</span>
          </div>
      );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-jost min-h-[60vh]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items Column */}
        <div className="lg:col-span-8">
            <h1 className="text-heading-3 md:text-heading-2 font-medium text-dark-900 mb-2">Bag</h1>
            {hasItems ? (
                 <div className="flex flex-col">
                     {cart.items.map((item) => (
                         <CartItem key={item.id} item={item} />
                     ))}
                 </div>
            ) : (
                <div className="py-8">
                    <p className="text-body text-dark-700 mb-6">There are no items in your bag.</p>
                    <Link 
                        href="/"
                        className="inline-block py-3 px-6 rounded-full bg-dark-900 text-white font-medium hover:bg-dark-700 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-4">
            <CartSummary />
        </div>
      </div>
      
      {/* "You Might Also Like" could go here if we wanted to reuse RecommendedProducts, 
          but it's a server component and this is a client page. 
          We would need to fetch it or wrap this page. 
          For now, keeping it focused on Cart. 
      */}
    </div>
  );
}
