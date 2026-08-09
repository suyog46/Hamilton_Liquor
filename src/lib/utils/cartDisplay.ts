import type { Cart } from "@/redux/features/cart/cartApiSlice";
import type { GuestCartItem } from "@/lib/stores/cartStore";

export const getCartItemCount = (cart: Cart) =>
  cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const getGuestCartItemCount = (items: GuestCartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity, 0);
