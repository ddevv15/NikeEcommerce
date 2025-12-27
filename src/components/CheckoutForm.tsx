"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { createOrder } from "@/lib/actions/order";
import { Trash2 } from "lucide-react";

export default function CheckoutForm() {
    const { cart, fetchCart } = useCartStore();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
    });

    const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | "cod">("stripe");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await createOrder({
                shippingAddress: formData,
                paymentMethod
            });
            if (res.ok) {
                await fetchCart();
                router.push(`/checkout/success?orderId=${res.orderId}`);
            }
        } catch (error: any) {
            alert(error.message || "Failed to place order");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-heading-3 text-dark-900 mb-4">Your bag is empty</h2>
                <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 py-8 font-jost">
            {/* Left Column: Details */}
            <div className="lg:col-span-8 flex flex-col gap-10">
                
                {/* Shipping Section */}
                <section>
                    <h2 className="text-heading-3 text-dark-900 font-medium mb-6">How would you like to get your order?</h2>
                    <div className="flex flex-col gap-4">
                        <input 
                            required
                            name="line1"
                            value={formData.line1}
                            onChange={handleChange}
                            placeholder="Address Line 1"
                            className="w-full p-4 border border-light-400 rounded-md focus:border-dark-900 outline-none"
                        />
                        <input 
                            name="line2"
                            value={formData.line2}
                            onChange={handleChange}
                            placeholder="Address Line 2 (Optional)"
                            className="w-full p-4 border border-light-400 rounded-md focus:border-dark-900 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                required
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className="w-full p-4 border border-light-400 rounded-md focus:border-dark-900 outline-none"
                            />
                            <input 
                                required
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="w-full p-4 border border-light-400 rounded-md focus:border-dark-900 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                required
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder="Postal Code"
                                className="w-full p-4 border border-light-400 rounded-md focus:border-dark-900 outline-none"
                            />
                            <select 
                                name="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full p-4 border border-light-400 rounded-md focus:border-dark-900 outline-none bg-white"
                            >
                                <option>United States</option>
                                <option>Canada</option>
                                <option>Vietnam</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Payment Section */}
                <section>
                    <h2 className="text-heading-3 text-dark-900 font-medium mb-6">Payment</h2>
                    <div className="flex flex-col gap-3">
                        {["stripe", "paypal", "cod"].map((method) => (
                            <label key={method} className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === method ? "border-dark-900 bg-light-100" : "border-light-400 hover:border-dark-700"}`}>
                                <input 
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === method}
                                    onChange={() => setPaymentMethod(method as any)}
                                    className="accent-dark-900 h-5 w-5"
                                />
                                <span className="uppercase font-medium text-dark-900">{method === 'cod' ? 'Cash on Delivery' : method}</span>
                            </label>
                        ))}
                    </div>
                </section>
                
                <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-5 rounded-full bg-dark-900 text-white font-medium hover:bg-dark-700 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? "Processing..." : "Place Order"}
                </button>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
                <div className="bg-light-100 p-6 rounded-lg sticky top-8">
                    <h2 className="text-heading-3 text-dark-900 font-medium mb-6">Order Summary</h2>
                    
                    <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto mb-6 pr-2">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-16 h-16 bg-light-200 rounded overflow-hidden flex-shrink-0">
                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <h4 className="text-sm font-medium text-dark-900 line-clamp-1">{item.product.name}</h4>
                                    <p className="text-xs text-dark-500">Qty {item.quantity}</p>
                                    <p className="text-sm font-medium text-dark-900 mt-auto">${(item.variant.price * item.quantity).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-light-300">
                        <div className="flex justify-between text-body text-dark-900">
                            <span>Subtotal</span>
                            <span>${cart.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-body text-dark-900">
                            <span>Shipping</span>
                            <span>{cart.subtotal > 50 ? "Free" : "$8.00"}</span>
                        </div>
                        <div className="flex justify-between text-body-medium font-bold text-dark-900 pt-4 border-t border-light-300">
                            <span>Total</span>
                            <span>${(cart.subtotal + (cart.subtotal > 50 ? 0 : 8)).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
