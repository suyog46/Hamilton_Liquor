import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartProductVariant } from "@/redux/features/cart/cartApiSlice";

export interface GuestCartItem {
  variant: CartProductVariant;
  quantity: number;
}

interface CartStore {
  // Badge count for the real (logged-in) backend cart.
  count: number;
  setCount: (count: number) => void;

  // Local cart for guests — persisted so it survives refresh/redirect to
  // login, then merged into the real cart once they sign in.
  guestItems: GuestCartItem[];
  addGuestItem: (variant: CartProductVariant, quantity: number) => void;
  updateGuestItem: (variantId: string, quantity: number) => void;
  removeGuestItem: (variantId: string) => void;
  clearGuestItems: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      count: 0,
      setCount: (count) => set({ count }),

      guestItems: [],
      addGuestItem: (variant, quantity) =>
        set((state) => {
          const existing = state.guestItems.find((item) => item.variant.id === variant.id);
          if (existing) {
            return {
              guestItems: state.guestItems.map((item) =>
                item.variant.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item
              ),
            };
          }
          return { guestItems: [...state.guestItems, { variant, quantity }] };
        }),
      updateGuestItem: (variantId, quantity) =>
        set((state) => ({
          guestItems: state.guestItems.map((item) =>
            item.variant.id === variantId ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
      removeGuestItem: (variantId) =>
        set((state) => ({
          guestItems: state.guestItems.filter((item) => item.variant.id !== variantId),
        })),
      clearGuestItems: () => set({ guestItems: [] }),
    }),
    {
      name: "hls-guest-cart",
      // The real-cart badge count is re-derived from the API on load — only
      // the guest cart itself needs to survive a refresh.
      partialize: (state) => ({ guestItems: state.guestItems }),
    }
  )
);

// The persisted guest cart only exists in localStorage, so the very first
// client render (and the server-rendered pass) can't see it yet — read this
// before trusting `guestItems` to avoid a flash of "empty cart" or an SSR
// hydration mismatch.
export const useCartHydrated = () => {
  const [hydrated, setHydrated] = useState(() => useCartStore.persist.hasHydrated());

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
};
