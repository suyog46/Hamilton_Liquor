import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartProductVariant } from "@/redux/features/cart/cartApiSlice";

export interface GuestCartItem {
  variant: CartProductVariant;
  quantity: number;
}

export interface CartSheetLine {
  id: string;
  quantity: number;
  variant: CartProductVariant;
}

export interface CartQuantityApiUpdate {
  itemId: string;
  productId: string;
  quantity: number;
}

export interface CartStore {
  isCartSheetOpen: boolean;
  openCartSheet: () => void;
  closeCartSheet: () => void;
  setCartSheetOpen: (open: boolean) => void;

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
      isCartSheetOpen: false,
      openCartSheet: () => set({ isCartSheetOpen: true }),
      closeCartSheet: () => set({ isCartSheetOpen: false }),
      setCartSheetOpen: (open) => set({ isCartSheetOpen: open }),

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
  // `.persist` is attached by the zustand persist middleware and should
  // always be present — but guard it defensively so a transient bundling
  // hiccup (seen intermittently in dev) degrades to "treat as hydrated"
  // instead of crashing every page that renders the cart sheet.
  const [hydrated, setHydrated] = useState(() => useCartStore.persist?.hasHydrated() ?? true);

  useEffect(() => {
    if (!useCartStore.persist) {
      setHydrated(true);
      return;
    }
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
};
