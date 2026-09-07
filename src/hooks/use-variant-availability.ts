import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { productApiSlice } from "@/redux/features/product/productApiSlice";

// The cart API's nested variant only reports a `quantity` field that mirrors
// the admin/gross stock count, not what's actually purchasable (there's no
// `available_quantity` in CartProductVariantResponse) — so cart UIs can't
// use it as a ceiling. This independently fetches each cart line's product
// to read the real per-variant `available_quantity`, keyed by variant id, so
// the cart page / cart sheet can cap quantity correctly regardless of what
// the cart response itself reports.
export const useVariantAvailability = (productSlugs: string[]) => {
  const dispatch = useAppDispatch();
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const key = useMemo(
    () => Array.from(new Set(productSlugs)).sort().join(","),
    [productSlugs],
  );

  useEffect(() => {
    const slugs = key ? key.split(",") : [];
    if (slugs.length === 0) return;

    const subscriptions = slugs.map((slug) =>
      dispatch(productApiSlice.endpoints.getPublicProductDetail.initiate(slug)),
    );

    Promise.all(
      subscriptions.map((subscription) =>
        subscription.unwrap().catch(() => null),
      ),
    ).then((results) => {
      setAvailability((current) => {
        const next = { ...current };
        results.forEach((result) => {
          result?.data.variants.forEach((variant) => {
            next[variant.id] = variant.available_quantity;
          });
        });
        return next;
      });
    });

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [dispatch, key]);

  return availability;
};
