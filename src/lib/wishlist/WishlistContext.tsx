"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types/product";
import { useAuth } from "@/lib/auth/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
}

type WishlistAction =
  | { type: "ADD"; item: WishlistItem }
  | { type: "REMOVE"; productId: string }
  | { type: "HYDRATE"; items: WishlistItem[] };

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function productToWishlistItem(product: Product): WishlistItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.coverImage,
    slug: product.slug,
  };
}

function isValidWishlistItem(value: unknown): value is WishlistItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.slug === "string"
  );
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "ADD": {
      if (state.items.some((i) => i.id === action.item.id)) return state;
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.productId) };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "stylix-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(isValidWishlistItem);
          dispatch({ type: "HYDRATE", items: validItems });
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items, hydrated]);

  useEffect(() => {
    if (!hydrated || !user) return;
    let active = true;
    const client = getSupabaseClient();
    client
      .from("user_wishlist")
      .select("item_json")
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (!active || error) return;
        const remote = (data ?? []).map((row) => row.item_json).filter(isValidWishlistItem);
        const merged = [...state.items];
        remote.forEach((item) => {
          if (!merged.some((existing) => existing.id === item.id)) merged.push(item);
        });
        dispatch({ type: "HYDRATE", items: merged });
        if (merged.length > remote.length) {
          void client.from("user_wishlist").upsert(
            merged.map((item) => ({ user_id: user.id, product_id: item.id, item_json: item })),
            { onConflict: "user_id,product_id" },
          );
        }
      });
    return () => { active = false; };
    // Merge once when the authenticated account changes; local updates sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user?.id]);

  const addItem = useCallback((product: Product) => {
    const item = productToWishlistItem(product);
    dispatch({ type: "ADD", item });
    if (user) void getSupabaseClient().from("user_wishlist").upsert({ user_id: user.id, product_id: item.id, item_json: item }, { onConflict: "user_id,product_id" });
  }, [user]);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE", productId });
    if (user) void getSupabaseClient().from("user_wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
  }, [user]);

  const isInWishlist = useCallback(
    (productId: string) => state.items.some((i) => i.id === productId),
    [state.items]
  );

  const toggleItem = useCallback(
    (product: Product) => {
      if (state.items.some((i) => i.id === product.id)) {
        dispatch({ type: "REMOVE", productId: product.id });
        if (user) void getSupabaseClient().from("user_wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      } else {
        const item = productToWishlistItem(product);
        dispatch({ type: "ADD", item });
        if (user) void getSupabaseClient().from("user_wishlist").upsert({ user_id: user.id, product_id: item.id, item_json: item }, { onConflict: "user_id,product_id" });
      }
    },
    [state.items, user]
  );

  const value = useMemo(
    () => ({ items: state.items, addItem, removeItem, isInWishlist, toggleItem }),
    [state.items, addItem, removeItem, isInWishlist, toggleItem]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
