"use server";

import { db } from "@/lib/db";
import { orders, orderItems, addresses, carts, cartItems } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/actions";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCart, clearCart } from "./cart";

export type CheckoutData = {
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: "stripe" | "paypal" | "cod";
};

export async function createOrder(data: CheckoutData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Authentication required for checkout");

    const cart = await getCart();
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

    try {
        // 1. Create or get addresses
        // For simplicity, we assume one-time address for this flow
        const [shippingAddr] = await db.insert(addresses).values({
            userId: user.id,
            type: "shipping",
            ...data.shippingAddress,
            isDefault: false,
        }).returning();

        // Use same for billing for now
        const [billingAddr] = await db.insert(addresses).values({
            userId: user.id,
            type: "billing",
            ...data.shippingAddress,
            isDefault: false,
        }).returning();

        // 2. Create Order
        const [newOrder] = await db.insert(orders).values({
            userId: user.id,
            totalAmount: cart.subtotal.toString(),
            shippingAddressId: shippingAddr.id,
            billingAddressId: billingAddr.id,
            status: "pending",
        }).returning();

        // 3. Create Order Items
        const itemsToInsert = cart.items.map(item => ({
            orderId: newOrder.id,
            productVariantId: item.variantId,
            quantity: item.quantity,
            priceAtPurchase: item.variant.price.toString(),
        }));

        await db.insert(orderItems).values(itemsToInsert);

        // 4. Clear Cart
        await clearCart();

        return { ok: true, orderId: newOrder.id };
    } catch (error) {
        console.error("Failed to create order:", error);
        throw new Error("Order creation failed");
    }
}

export async function getOrders() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await db.query.orders.findMany({
        where: eq(orders.userId, user.id),
        with: {
            items: {
                with: {
                    variant: {
                        with: {
                            product: true
                        }
                    }
                }
            }
        },
        orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
}
