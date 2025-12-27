"use server";

import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { carts, cartItems, productVariants, products, productImages, colors, sizes, guest } from "@/lib/db/schema";
import { getCurrentUser, guestSession } from "@/lib/auth/actions";
import { createGuestSession } from "@/lib/auth/actions";

// Types
export type CartItemDTO = {
    id: string;
    quantity: number;
    variantId: string;
    product: {
        id: string;
        name: string;
        slug: string; // Assuming name is usable as slug or we have id
        imageUrl: string;
    };
    variant: {
        price: number;
        color: string;
        size: string;
        stock: number;
    };
};

export type CartDTO = {
    id: string;
    items: CartItemDTO[];
    subtotal: number;
    totalItems: number;
};

// --- Helpers ---

// Helper to get or create a cart for the current context (User or Guest)
async function getOrCreateCartId(): Promise<{ cartId: string; isGuest: boolean } | null> {
    const user = await getCurrentUser();

    if (user) {
        // 1. Check if user has a cart
        const userCart = await db.query.carts.findFirst({
            where: eq(carts.userId, user.id),
        });

        if (userCart) return { cartId: userCart.id, isGuest: false };

        // 2. Create one if not
        const [newCart] = await db.insert(carts).values({ userId: user.id }).returning();
        return { cartId: newCart.id, isGuest: false };
    }

    // Guest Flow
    let { sessionToken } = await guestSession();

    // If no guest session, create one
    if (!sessionToken) {
        const result = await createGuestSession();
        if (result.ok && result.sessionToken) {
            sessionToken = result.sessionToken;
        } else {
            return null; // Should not happen
        }
    }

    // Find guest record to get ID (guest table id is text?? Schema said text)
    // Wait, guest table definition in schema/guest.ts wasn't shown fully, 
    // but carts.ts says guestId references guest.id (text).
    // Let's assume sessionToken maps to a guest record.
    const guestRecord = await db.query.guest.findFirst({
        where: eq(guest.sessionToken, sessionToken),
    });

    if (!guestRecord) {
        // If session token exists but no record (expired?), create new session? 
        // For now, assume createGuestSession handles it.
        return null;
    }

    const guestCart = await db.query.carts.findFirst({
        where: eq(carts.guestId, guestRecord.id),
    });

    if (guestCart) return { cartId: guestCart.id, isGuest: true };

    const [newCart] = await db.insert(carts).values({ guestId: guestRecord.id }).returning();
    return { cartId: newCart.id, isGuest: true };
}


// --- Actions ---

export async function getCart(): Promise<CartDTO | null> {
    try {
        const user = await getCurrentUser();
        let cartRecord;

        if (user) {
            cartRecord = await db.query.carts.findFirst({
                where: eq(carts.userId, user.id),
                with: {
                    items: {
                        with: {
                            variant: {
                                with: {
                                    product: {
                                        with: { images: true }
                                    },
                                    color: true,
                                    size: true
                                }
                            }
                        }
                    }
                }
            });
        } else {
            const { sessionToken } = await guestSession();
            if (!sessionToken) return null;

            const guestRecord = await db.query.guest.findFirst({
                where: eq(guest.sessionToken, sessionToken),
            });
            if (!guestRecord) return null;

            cartRecord = await db.query.carts.findFirst({
                where: eq(carts.guestId, guestRecord.id),
                with: {
                    items: {
                        with: {
                            variant: {
                                with: {
                                    product: {
                                        with: { images: true }
                                    },
                                    color: true,
                                    size: true
                                }
                            }
                        }
                    }
                }
            });
        }

        if (!cartRecord) return { id: "", items: [], subtotal: 0, totalItems: 0 };

        // Transform to DTO
        const items: CartItemDTO[] = cartRecord.items.map(item => {
            const v = item.variant;
            const p = v.product;
            // Primary image or first
            const img = p.images.find((i: any) => i.isPrimary) || p.images[0];

            return {
                id: item.id,
                quantity: item.quantity,
                variantId: v.id,
                product: {
                    id: p.id,
                    name: p.name,
                    slug: p.id, // Using ID as slug for now since we don't have separate slug
                    imageUrl: img?.url || "/placeholder.png"
                },
                variant: {
                    price: Number(v.salePrice || v.price),
                    color: v.color?.name || "One Color",
                    size: v.size?.name || "One Size",
                    stock: v.inStock
                }
            };
        });

        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.variant.price), 0);
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

        return {
            id: cartRecord.id,
            items,
            subtotal,
            totalItems
        };

    } catch (e) {
        console.error("getCart Error:", e);
        return null;
    }
}

export async function addCartItem(variantId: string, quantity: number = 1) {
    try {
        const info = await getOrCreateCartId();
        if (!info) throw new Error("Could not initialize cart");
        const { cartId } = info;

        // Check if item exists
        const existingItem = await db.query.cartItems.findFirst({
            where: and(
                eq(cartItems.cartId, cartId),
                eq(cartItems.productVariantId, variantId)
            )
        });

        if (existingItem) {
            await db.update(cartItems)
                .set({ quantity: existingItem.quantity + quantity })
                .where(eq(cartItems.id, existingItem.id));
        } else {
            await db.insert(cartItems).values({
                cartId,
                productVariantId: variantId,
                quantity
            });
        }

        return await getCart(); // Return updated cart
    } catch (e) {
        console.error("addCartItem Error:", e);
        throw e;
    }
}

export async function updateCartItem(itemId: string, quantity: number) {
    try {
        if (quantity <= 0) {
            return await removeCartItem(itemId);
        }

        await db.update(cartItems)
            .set({ quantity })
            .where(eq(cartItems.id, itemId));

        return await getCart();
    } catch (e) {
        console.error("updateCartItem Error:", e);
        throw e;
    }
}

export async function removeCartItem(itemId: string) {
    try {
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
        return await getCart();
    } catch (e) {
        console.error("removeCartItem Error:", e);
        throw e;
    }
}

export async function clearCart() {
    try {
        const info = await getOrCreateCartId();
        if (!info) return null;

        await db.delete(cartItems).where(eq(cartItems.cartId, info.cartId));
        return await getCart();
    } catch (e) {
        console.error("clearCart Error:", e);
        throw e;
    }
}

