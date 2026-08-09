import type { Cart } from "@/redux/features/cart/cartApiSlice";

export const getCartItemCount = (cart: Cart) =>
  cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const getCartSubtotal = (cart: Cart) =>
  cart.items.reduce((sum, item) => sum + Number(item.product_variant.price) * item.quantity, 0);
