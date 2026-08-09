import { create } from "zustand";

interface CartStore {
  count: number;
  setCount: (count: number) => void;
}

export const useCartStore = create<CartStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));
