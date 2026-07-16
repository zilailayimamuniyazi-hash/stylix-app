"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { Product } from "@/lib/types/product";
import { useWishlist } from "@/lib/wishlist/WishlistContext";

function HeartIcon({
  filled,
  style,
}: {
  filled: boolean;
  style?: CSSProperties;
}) {
  if (filled) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        style={style}
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={style}
      aria-hidden="true"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

export function WishlistHeartButton({
  product,
  className = "",
  size = 20,
}: {
  product: Product;
  className?: string;
  size?: number;
}) {
  const { isInWishlist, toggleItem } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted && isInWishlist(product.id);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product);
      }}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 hover:bg-white/8 ${
        active ? "text-[var(--ui-accent)]" : "text-[var(--ui-text-3)]"
      } ${className}`}
    >
      <HeartIcon filled={active} style={{ width: size, height: size }} />
    </button>
  );
}
