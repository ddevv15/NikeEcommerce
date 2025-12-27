import { create } from "zustand";
import { CartDTO, getCart } from "@/lib/actions/cart";

interface CartState {
    cart: CartDTO | null;
    isOpen: boolean;
    isLoading: boolean;

    // Actions
    fetchCart: () => Promise<void>;
    setCart: (cart: CartDTO | null) => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    cart: null,
    isOpen: false,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const cart = await getCart();
            set({ cart, isLoading: false });
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            set({ isLoading: false });
        }
    },

    setCart: (cart) => set({ cart }),

    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));
