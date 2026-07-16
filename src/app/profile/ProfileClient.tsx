"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/cart/CartContext";
import { useI18n } from "@/lib/i18n/context";
import { AuthModal } from "@/components/auth/AuthModal";
import {
  loadOrdersFromStorage,
  mergeOrderLists,
  normalizeOrderStatus,
  statusBadgeClass,
  timelineStepIndex,
  type OrderHistoryItem,
} from "@/lib/order/orderHistory";

type Tab = "cart" | "orders" | "jewelry" | "portrait";

export function ProfileClient() {
  const { user } = useAuth();
  const { t } = useI18n();
  const p = t.profile;
  const { items } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>("cart");
  const [authOpen, setAuthOpen] = useState(false);

  if (!user) {
    return (
      <div className="ui-page flex items-center justify-center">
        <div className="glass-panel mx-6 max-w-md border border-white/10 p-8 text-center backdrop-blur-[20px]">
          <h1 className="font-serif text-3xl text-ivory">{t.auth.loginTitle}</h1>
          <p className="text-sm text-ivory/50">{t.auth.loginSubtitle}</p>
          <button type="button" onClick={() => setAuthOpen(true)} className="ui-button ui-button--primary mt-7">登录 / 注册</button>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "cart", label: p.tabs.cart },
    { key: "orders", label: p.tabs.orders },
    { key: "jewelry", label: p.tabs.jewelry },
    { key: "portrait", label: p.tabs.portrait },
  ];

  return (
    <div className="ui-page">
      {/* Profile header */}
      <div className="border-b border-ivory/10 py-10 px-6 lg:px-10">
        <div className="mx-auto max-w-5xl flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold font-serif text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-ivory">{user.name}</h1>
            <p className="text-xs text-ivory/40 mt-1">
              {user.email} · {p.memberSince} {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-ivory/10">
        <div className="mx-auto max-w-5xl px-6 lg:px-10">
          <div className="flex gap-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 border-b-2 px-6 py-4 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  activeTab === tab.key
                    ? "border-gold text-gold"
                    : "border-transparent text-ivory/40 hover:text-ivory/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10">
        {activeTab === "cart" && <CartTab />}
        {activeTab === "orders" && <OrdersTab email={user.email} />}
        {activeTab === "jewelry" && <JewelryTab />}
        {activeTab === "portrait" && <PortraitTab />}
      </div>
    </div>
  );
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function OrdersTab({ email }: { email: string }) {
  const { t, locale } = useI18n();
  const o = t.profile.orders;
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: sessionData } = await getSupabaseClient().auth.getSession();
        const token = sessionData.session?.access_token;
        const res = token
          ? await fetch("/api/orders/history", { headers: { Authorization: `Bearer ${token}` } })
          : null;
        const remote: OrderHistoryItem[] = res?.ok
          ? ((await res.json()).orders ?? [])
          : [];
        const local = loadOrdersFromStorage(email);
        if (!cancelled) {
          setOrders(mergeOrderLists(remote, local));
        }
      } catch {
        if (!cancelled) {
          setOrders(loadOrdersFromStorage(email));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-gold/50 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <p className="text-sm text-ivory/40">{o.loading}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title={o.empty}
        subtitle={o.emptySub}
        ctaLabel={o.shopNow}
        ctaHref="/shop"
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const expanded = expandedId === order.order_id;
        const status = normalizeOrderStatus(order.status);
        const statusLabel = o.status[status];
        const itemSummary = order.items_json
          .map((item) => `${item.name}${item.qty > 1 ? ` ×${item.qty}` : ""}`)
          .join(", ");
        const progress = timelineStepIndex(order.status);
        const timelineSteps = [
          o.timeline.ordered,
          o.timeline.confirmed,
          o.timeline.shipped,
          o.timeline.delivered,
        ];

        return (
          <div
            key={order.order_id}
            className="border border-ivory/10 bg-ink-soft/30 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : order.order_id)}
              className="w-full text-left px-5 py-5 hover:bg-ivory/[0.02] transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <p className="font-serif text-sm text-ivory">
                      {o.orderId} {order.order_id}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-[0.2em] ${statusBadgeClass(order.status)}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-ivory/40">
                    {o.placed}{" "}
                    {new Date(order.placed_at).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-ivory/50 mt-2 truncate">{itemSummary}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-ivory/30 mb-1">
                    {o.total}
                  </p>
                  <p className="font-serif text-base text-ivory">
                    ${formatCents(order.total_cents)}
                  </p>
                  <svg
                    className={`mt-3 ml-auto h-4 w-4 text-ivory/30 transition-transform ${expanded ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
            </button>

            {expanded && (
              <div className="border-t border-ivory/10 px-5 py-6 space-y-8">
                {/* Line items */}
                <div>
                  <p className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mb-4">
                    {o.items}
                  </p>
                  <div className="space-y-3">
                    {order.items_json.map((item, i) => (
                      <div
                        key={`${item.id}-${i}`}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-ivory">{item.name}</p>
                          {item.qty > 1 && (
                            <p className="text-[10px] text-ivory/35 mt-0.5">
                              {o.qty} {item.qty}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 font-serif text-ivory">
                          ${(item.price * item.qty).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping address */}
                {order.shipping_address1 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.35em] text-gold/60 mb-3">
                      {o.shippingAddress}
                    </p>
                    <div className="text-sm text-ivory/60 space-y-0.5">
                      {(order.first_name || order.last_name) && (
                        <p className="text-ivory">
                          {order.first_name} {order.last_name}
                        </p>
                      )}
                      <p>{order.shipping_address1}</p>
                      {order.shipping_address2 && <p>{order.shipping_address2}</p>}
                      <p>
                        {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                      </p>
                      <p>{order.shipping_country}</p>
                    </div>
                  </div>
                )}

                {/* Status timeline */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {timelineSteps.map((label, i) => {
                      const completed = i <= progress;
                      return (
                        <div key={label} className="flex flex-1 flex-col items-center gap-2">
                          <div className="flex w-full items-center">
                            {i > 0 && (
                              <div
                                className={`h-px flex-1 ${i <= progress ? "bg-gold/40" : "bg-ivory/10"}`}
                              />
                            )}
                            <div
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                completed ? "bg-gold" : "bg-ivory/20"
                              }`}
                            />
                            {i < timelineSteps.length - 1 && (
                              <div
                                className={`h-px flex-1 ${i < progress ? "bg-gold/40" : "bg-ivory/10"}`}
                              />
                            )}
                          </div>
                          <p
                            className={`text-[9px] uppercase tracking-[0.15em] text-center ${
                              completed ? "text-ivory/70" : "text-ivory/25"
                            }`}
                          >
                            {label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CartTab() {
  const { t } = useI18n();
  const p = t.profile.cart;
  const { items, removeItem, setQuantity } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title={p.empty}
        subtitle={p.emptySub}
        ctaLabel={p.browseCollection}
        ctaHref="/collection"
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.product.id}
          className="flex gap-4 border border-ivory/8 p-4"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-ink-soft">
            <Image
              src={item.product.coverImage}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-sm text-ivory truncate">{item.product.name}</h3>
            <p className="text-xs text-ivory/40 mt-1">{item.product.subtitle}</p>
            <p className="text-sm text-ivory/80 mt-2">
              ${item.product.price.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end justify-between">
            <button
              type="button"
              onClick={() => removeItem(item.product.id)}
              className="text-ivory/25 hover:text-ivory/60 transition-colors"
              aria-label="Remove"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                className="h-6 w-6 flex items-center justify-center border border-ivory/15 text-ivory/40 text-xs hover:border-ivory/30"
              >
                −
              </button>
              <span className="text-xs text-ivory/60 w-4 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                className="h-6 w-6 flex items-center justify-center border border-ivory/15 text-ivory/40 text-xs hover:border-ivory/30"
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface JewelryItem {
  id: string;
  name: string;
  desc: string;
  image: string;
  addedAt: string;
}

const JEWELRY_STORAGE_KEY = "stylix-my-jewelry";

function loadJewelry(): JewelryItem[] {
  try {
    const raw = localStorage.getItem(JEWELRY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveJewelry(items: JewelryItem[]) {
  localStorage.setItem(JEWELRY_STORAGE_KEY, JSON.stringify(items));
}

function JewelryTab() {
  const { t } = useI18n();
  const p = t.profile.jewelry;
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(loadJewelry());
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSave = useCallback(() => {
    if (!imagePreview || !name.trim()) return;
    const newItem: JewelryItem = {
      id: `j_${Date.now()}`,
      name: name.trim(),
      desc: desc.trim(),
      image: imagePreview,
      addedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    setItems(updated);
    saveJewelry(updated);
    setShowForm(false);
    setName("");
    setDesc("");
    setImagePreview(null);
  }, [imagePreview, name, desc, items]);

  const handleDelete = useCallback((id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    saveJewelry(updated);
  }, [items]);

  if (items.length === 0 && !showForm) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full border border-ivory/10 flex items-center justify-center mb-6">
          <svg className="w-6 h-6 text-ivory/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <p className="font-serif text-xl text-ivory/60 mb-2">{p.empty}</p>
        <p className="text-sm text-ivory/35 mb-8 max-w-xs">{p.emptySub}</p>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-8 py-3 text-[11px] uppercase tracking-[0.25em] border border-gold/30 text-gold hover:border-gold hover:bg-gold/5 transition-all"
        >
          {p.browseCollection}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Upload button */}
      <div className="flex justify-end mb-6">
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] border border-gold/30 text-gold rounded-lg hover:border-gold hover:bg-gold/5 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {p.upload}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="border border-ivory/10 rounded-lg p-6 mb-8 bg-ivory/[0.02]">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Image upload */}
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-full sm:w-40 h-40 shrink-0 border-2 border-dashed border-ivory/15 rounded-lg flex items-center justify-center cursor-pointer hover:border-gold/30 transition-colors overflow-hidden"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" width={160} height={160} className="object-cover w-full h-full" />
              ) : (
                <div className="text-center p-4">
                  <svg className="w-8 h-8 text-ivory/20 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p className="text-[10px] text-ivory/30">{p.uploadHint}</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={p.namePlaceholder}
                className="w-full border border-ivory/12 bg-ivory/[0.02] rounded-md px-3.5 py-2.5 text-sm text-ivory placeholder-ivory/25 focus:border-gold/40 focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={p.descPlaceholder}
                className="w-full border border-ivory/12 bg-ivory/[0.02] rounded-md px-3.5 py-2.5 text-sm text-ivory placeholder-ivory/25 focus:border-gold/40 focus:outline-none transition-colors"
              />
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!imagePreview || !name.trim()}
                  className="px-5 py-2 text-[11px] uppercase tracking-[0.15em] bg-gold/90 text-ink-deep rounded-md hover:bg-gold transition-colors disabled:opacity-30"
                >
                  {p.save}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setImagePreview(null); setName(""); setDesc(""); }}
                  className="px-5 py-2 text-[11px] uppercase tracking-[0.15em] text-ivory/40 hover:text-ivory/60 transition-colors"
                >
                  {p.cancel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jewelry grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group border border-ivory/8 rounded-lg overflow-hidden">
            <div className="relative aspect-square bg-ink-soft">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="200px" />
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-black/50 text-ivory/50 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                aria-label={p.delete}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm text-ivory font-serif truncate">{item.name}</p>
              {item.desc && <p className="text-[10px] text-ivory/35 truncate mt-0.5">{item.desc}</p>}
              <p className="text-[9px] text-ivory/25 mt-1.5">
                {p.addedOn} {new Date(item.addedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortraitTab() {
  const { t } = useI18n();
  const p = t.profile.portrait;

  return (
    <EmptyState
      title={p.empty}
      subtitle={p.emptySub}
      ctaLabel={p.goToPortrait}
      ctaHref="/identity-portrait"
    />
  );
}

function EmptyState({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full border border-ivory/10 flex items-center justify-center mb-6">
        <svg className="w-6 h-6 text-ivory/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </div>
      <p className="font-serif text-xl text-ivory/60 mb-2">{title}</p>
      <p className="text-sm text-ivory/35 mb-8 max-w-xs">{subtitle}</p>
      <Link
        href={ctaHref}
        className="px-8 py-3 text-[11px] uppercase tracking-[0.25em] border border-gold/30 text-gold hover:border-gold hover:bg-gold/5 transition-all"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
