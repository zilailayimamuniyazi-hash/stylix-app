"use client";

import { useMemo } from "react";
import { getProductBySlug } from "@/lib/data/products";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import type { Product } from "@/lib/types/product";
import { PairingRecommendations } from "@/components/product/PairingRecommendations";

export function ProductPairingSection({ currentProduct }: { currentProduct: Product }) {
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();

  const ownedProducts = useMemo(() => {
    const byId = new Map<string, Product>();
    byId.set(currentProduct.id, currentProduct);

    for (const item of cartItems) {
      byId.set(item.product.id, item.product);
    }

    for (const item of wishlistItems) {
      if (byId.has(item.id)) continue;
      const product = getProductBySlug(item.slug);
      if (product) byId.set(product.id, product);
    }

    return Array.from(byId.values());
  }, [currentProduct, cartItems, wishlistItems]);

  return <PairingRecommendations ownedProducts={ownedProducts} />;
}
