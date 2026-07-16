"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import type { Product } from "@/lib/types/product";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";
import { useI18n } from "@/lib/i18n/context";

export function AddToBag({ product }: { product: Product }) {
  const { t } = useI18n();
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.some((i) => i.product.id === product.id);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    track({ event_name: EVENTS.ADD_TO_CART, product_id: product.id });
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={handleAdd}
        className="ui-button ui-button--primary"
      >
        {added ? t.product.addedToBag : inCart ? t.product.addAnother : t.product.addToBag}
      </button>
      {inCart && (
        <Link
          href="/bag"
          className="ui-button ui-button--secondary"
        >
          {t.product.viewBag}
        </Link>
      )}
    </div>
  );
}
