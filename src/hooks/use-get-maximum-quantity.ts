import { useMemo } from "react";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";
import { useGetCartQuery } from "@/redux/features/cart/cartApiSlice";
import { useCartStore } from "@/lib/stores/cartStore";

export interface UseGetMaximumQuantityOptions {
  variantId?: string | null;
  availableQuantity?: number | null;
}

/**
 * Custom hook to calculate cart quantity limits and remaining stock for product variants.
 * Handles both authenticated backend cart and unauthenticated guest cart seamlessly.
 */
export const useGetMaximumQuantity = ({
  variantId,
  availableQuantity = 0,
}: UseGetMaximumQuantityOptions = {}) => {
  const { data: meData } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data: cartData, isLoading, isFetching } = useGetCartQuery(undefined, {
    skip: !isLoggedIn,
  });
  const guestItems = useCartStore((state) => state.guestItems);

  const cartItems = useMemo(() => {
    if (isLoggedIn) {
      return cartData?.data?.items ?? [];
    }
    return guestItems.map((item) => ({
      id: item.variant.id,
      quantity: item.quantity,
      product_variant: item.variant,
    }));
  }, [isLoggedIn, cartData, guestItems]);

  const getQuantityInCart = (id?: string | null): number => {
    if (!id) return 0;
    if (isLoggedIn) {
      return (
        cartData?.data?.items?.find((item) => item.product_variant.id === id)
          ?.quantity ?? 0
      );
    }
    return (
      guestItems.find((item) => item.variant.id === id)?.quantity ?? 0
    );
  };

  const getRemainingQuantity = (
    id?: string | null,
    totalAvailable: number = 0,
  ): number => {
    const inCart = getQuantityInCart(id);
    return Math.max(0, totalAvailable - inCart);
  };

  const isLimitReached = (
    id?: string | null,
    totalAvailable: number = 0,
  ): boolean => {
    if (totalAvailable <= 0) return true;
    return getQuantityInCart(id) >= totalAvailable;
  };

  const quantityInCart = variantId ? getQuantityInCart(variantId) : 0;
  const safeAvailable = availableQuantity ?? 0;
  const remainingQuantity = Math.max(0, safeAvailable - quantityInCart);
  const isAtCartLimit = safeAvailable > 0 ? quantityInCart >= safeAvailable : false;
  const maxSelectable = Math.max(1, Math.min(24, remainingQuantity || 1));

  return {
    isLoggedIn,
    cartData,
    cartItems,
    isLoading,
    isFetching,
    quantityInCart,
    remainingQuantity,
    isAtCartLimit,
    maxSelectable,
    getQuantityInCart,
    getRemainingQuantity,
    isLimitReached,
  };
};

export default useGetMaximumQuantity;
