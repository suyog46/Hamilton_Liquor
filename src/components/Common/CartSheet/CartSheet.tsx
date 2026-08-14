"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCartStore,
  useCartHydrated,
  type CartStore,
  type CartSheetLine,
  type CartQuantityApiUpdate,
} from "@/lib/stores/cartStore";
import { useGetMeQuery } from "@/redux/features/user/userApiSlice";
import {
  cartApiSlice,
  useGetCartQuery,
  useUpdateCartItemMutation,
} from "@/redux/features/cart/cartApiSlice";
import { formatPrice, formatVolume } from "@/lib/utils/productDisplay";
import { getCartItemCount } from "@/lib/utils/cartDisplay";
import { useAppDispatch } from "@/redux/hooks";
import { apiSlice } from "@/redux/apiSlice";

const CartSheet = () => {
  const dispatch = useAppDispatch();
  const open = useCartStore((state: CartStore) => state.isCartSheetOpen);
  const setOpen = useCartStore((state: CartStore) => state.setCartSheetOpen);
  const closeCartSheet = useCartStore((state: CartStore) => state.closeCartSheet);
  const guestItems = useCartStore((state: CartStore) => state.guestItems);
  const updateGuestItem = useCartStore((state: CartStore) => state.updateGuestItem);
  const setCartCount = useCartStore((state: CartStore) => state.setCount);
  const hydrated = useCartHydrated();
  const { data: meData } = useGetMeQuery();
  const isLoggedIn = !!meData?.data;
  const { data: cartData, isFetching } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const [updateCartItem] = useUpdateCartItemMutation();

  const lines: CartSheetLine[] = isLoggedIn
    ? (cartData?.data.items ?? []).map((item) => ({
        id: item.id,
        quantity: item.quantity,
        variant: item.product_variant,
      }))
    : guestItems.map((item) => ({
        id: item.variant.id,
        quantity: item.quantity,
        variant: item.variant,
      }));

  const subtotal = lines.reduce((sum, line) => sum + Number(line.variant.price) * line.quantity, 0);
  const loading = isLoggedIn ? isFetching && lines.length === 0 : !hydrated;

  // Only the network synchronization is debounced. The click handler below
  // updates the RTK cache and badge synchronously before calling this.
  const updateQuantityOnServer = useDebouncedCallback(async ({ itemId, productId, quantity }: CartQuantityApiUpdate) => {
    try {
      const response = await updateCartItem({ item_id: itemId, quantity }).unwrap();
      setCartCount(getCartItemCount(response.data));
      dispatch(cartApiSlice.util.upsertQueryData("getCart", undefined, response));
      dispatch(apiSlice.util.invalidateTags([
        { type: "Product", id: productId },
        { type: "Product", id: "PUBLIC_LIST" },
      ]));
    } catch {
      dispatch(apiSlice.util.invalidateTags(["Cart"]));
      toast.error("Failed to update quantity.");
    }
  }, 500);

  const updateQuantity = (line: CartSheetLine, quantity: number) => {
    const nextQuantity = Math.max(1, Math.min(quantity, line.variant.quantity));
    if (nextQuantity === line.quantity) return;

    if (!isLoggedIn) {
      updateGuestItem(line.variant.id, nextQuantity);
      return;
    }

    const previousCount = useCartStore.getState().count;
    const delta = nextQuantity - line.quantity;
    dispatch(
      cartApiSlice.util.updateQueryData("getCart", undefined, (draft) => {
        const item = draft.data.items.find((cartItem) => cartItem.id === line.id);
        if (item) item.quantity = nextQuantity;
      })
    );
    setCartCount(previousCount + delta);

    // Schedule only the API call; all visible state is already optimistic.
    updateQuantityOnServer({
      itemId: line.id,
      productId: line.variant.product.id,
      quantity: nextQuantity,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="border-b border-gray-100 p-6">
          <SheetTitle className="font-title text-xl font-semibold">Your Cart</SheetTitle>
          <SheetDescription>
            {lines.length > 0 ? `${lines.length} item type${lines.length === 1 ? "" : "s"} in your cart.` : "Your cart is empty."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              <Icon icon="svg-spinners:180-ring" className="h-6 w-6" />
            </div>
          ) : lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
              <Icon icon="solar:cart-large-minimalistic-linear" className="h-12 w-12" />
              <p className="text-sm">Add a product to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lines.map((line) => (
                <div key={line.id} className="flex gap-4 py-4">
                  <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {line.variant.media?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.variant.media.url} alt={line.variant.product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <Icon icon="solar:bottle-linear" className="h-7 w-7" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black">{line.variant.product.name}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatVolume(line.variant.volume_ml)}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-1.5 py-1">
                        <button
                          type="button"
                          aria-label={`Decrease ${line.variant.product.name} quantity`}
                          onClick={() => updateQuantity(line, line.quantity - 1)}
                          disabled={line.id.startsWith("optimistic:") || line.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center text-gray-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Icon icon="solar:minus-circle-linear" className="h-4 w-4" />
                        </button>
                        <span className="min-w-5 text-center text-sm font-semibold">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${line.variant.product.name} quantity`}
                          onClick={() => updateQuantity(line, line.quantity + 1)}
                          disabled={line.id.startsWith("optimistic:") || line.quantity >= line.variant.quantity}
                          className="flex h-6 w-6 items-center justify-center text-gray-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Icon icon="solar:add-circle-linear" className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-black">{formatPrice(Number(line.variant.price) * line.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="border-t border-gray-100 p-6">
          {lines.length > 0 && (
            <div className="mb-2 flex items-center justify-between text-base font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          )}
          <Link
            href="/cart"
            onClick={closeCartSheet}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-primary-normal px-6 text-sm font-semibold text-black hover:opacity-90"
          >
            Show My Cart
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
