"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { getCurrentUser } from "@/lib/auth/actions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartSummary() {
  const { cart } = useCartStore();
  const [isGuest, setIsGuest] = useState(true);
  const router = useRouter();

  // Basic check for layout purposes - real logic is in checkout flow
  useEffect(() => {
     getCurrentUser().then(u => setIsGuest(!u));
  }, []);

  if (!cart) return null;

  const subtotal = cart.subtotal;
  const shipping = subtotal > 50 ? 0 : 8; // Free shipping over $50 logic (example)
  const total = subtotal + shipping;

  const handleCheckout = () => {
      if (isGuest) {
          router.push("/sign-in?redirect=/checkout");
      } else {
          router.push("/checkout");
      }
  };

  return (
    <div className="bg-light-200 p-6 rounded-lg sticky top-8">
      <h2 className="text-heading-3 text-dark-900 font-medium mb-6">Summary</h2>
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center text-body text-dark-900">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-body text-dark-900">
          <span>Estimated Shipping & Handling</span>
          <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between items-center text-body text-dark-900">
            <span>Estimated Tax</span>
            <span>—</span> 
        </div>
      </div>
      
      <div className="border-t border-light-400 py-4 mb-6">
         <div className="flex justify-between items-center text-body-medium font-medium text-dark-900">
             <span>Total</span>
             <span>${total.toFixed(2)}</span>
         </div>
      </div>

      <button 
        onClick={handleCheckout}
        className="w-full py-4 rounded-full bg-dark-900 text-white font-medium hover:bg-dark-700 transition-all active:scale-[0.98]"
      >
        Member Checkout
      </button>

      {isGuest && (
         <button className="w-full mt-3 py-4 rounded-full border border-light-400 text-dark-900 font-medium hover:border-dark-900 transition-all active:scale-[0.98]">
             Guest Checkout
         </button>
      )}
    </div>
  );
}
