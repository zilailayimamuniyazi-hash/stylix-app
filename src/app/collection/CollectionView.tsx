"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { products } from "@/lib/data/products";
import type { JewelryCategory, CollectionCategory } from "@/lib/types/product";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";
import { useI18n } from "@/lib/i18n/context";
import { ProductCard } from "@/components/product/ProductCard";

// ── Collection tabs ──────────────────────────────────────────────────────────

type CollectionTab = "all" | "designer-capsule" | "celestial-essentials" | "ai-concept-archive";

const collectionCategoryMap: Record<CollectionTab, CollectionCategory | null> = {
  all: null,
  "designer-capsule": "designer-capsule",
  "celestial-essentials": "celestial-essentials",
  "ai-concept-archive": "ai-concept-archive",
};

// ── Category filter ───────────────────────────────────────────────────────────

const categoryKeys: (JewelryCategory | "all")[] = [
  "all",
  "rings",
  "necklaces",
  "bracelets",
  "earrings",
];

// ── Main component ────────────────────────────────────────────────────────────

export function CollectionView() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabKeyMap = ["all", "designer-capsule", "celestial-essentials", "ai-concept-archive"] as const;
  const tabTranslationKey: Record<CollectionTab, keyof typeof t.collectionPage.tabs> = {
    all: "all",
    "designer-capsule": "designerCapsule",
    "celestial-essentials": "celestialEssentials",
    "ai-concept-archive": "aiConceptArchive",
  };

  const tabParam = (searchParams.get("tab") as CollectionTab) ?? "all";
  const activeTab: CollectionTab = tabKeyMap.includes(tabParam as CollectionTab)
    ? tabParam
    : "all";

  const [cat, setCat] = useState<JewelryCategory | "all">("all");

  useEffect(() => {
    track({ event_name: EVENTS.COLLECTION_VIEW, tool_name: activeTab });
  }, [activeTab]);

  function setTab(key: CollectionTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "all") {
      params.delete("tab");
    } else {
      params.set("tab", key);
    }
    router.push(`${pathname}?${params.toString()}`);
    setCat("all");
  }

  const filtered = useMemo(() => {
    const targetCategory = collectionCategoryMap[activeTab];
    return products.filter((p) => {
      if (targetCategory !== null && p.tags.collectionCategory !== targetCategory) return false;
      if (cat !== "all" && p.category !== cat) return false;
      // In "all" view, show designer-capsule and celestial-essentials prominently;
      // limit ai-concept-archive to only isFeatured pieces to avoid domination
      if (activeTab === "all" && p.tags.collectionCategory === "ai-concept-archive" && !p.isFeatured) {
        return false;
      }
      return true;
    });
  }, [activeTab, cat]);

  return (
    <div className="ui-page">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="border-b border-[var(--ui-line)] py-14 lg:py-20">
        <div className="ui-container">
          <p className="ui-eyebrow">
            {t.collectionPage.pageEyebrow}
          </p>
          <h1 className="ui-title mt-4">
            {t.collectionPage.pageTitle}
          </h1>
          <p className="ui-copy mt-4 max-w-xl">
            {t.collectionPage.pageSubtitle}
          </p>
        </div>
      </header>

      {/* ── Collection tabs ───────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-[var(--ui-line)] bg-[rgba(11,12,14,.88)] backdrop-blur-xl">
        <div className="ui-container">
          <div className="flex gap-0 overflow-x-auto">
            {tabKeyMap.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`shrink-0 border-b-2 px-5 py-4 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  activeTab === key
                    ? "border-[var(--ui-accent)] text-[var(--ui-text)]"
                    : "border-transparent text-[var(--ui-text-3)] hover:text-[var(--ui-text)]"
                }`}
              >
                {t.collectionPage.tabs[tabTranslationKey[key]].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="ui-container py-12">
        {/* ── Collection description ─────────────────────────────────────── */}
        <div className="mb-10 max-w-2xl">
          <p className="ui-eyebrow mb-2">
            {t.collectionPage.tabs[tabTranslationKey[activeTab]].eyebrow}
          </p>
          <p className="ui-copy">
            {t.collectionPage.tabs[tabTranslationKey[activeTab]].description}
          </p>
          {activeTab === "designer-capsule" && (
            <p className="ui-copy mt-3">
              {t.collectionPage.designerCapsuleNote}
            </p>
          )}
          {activeTab === "ai-concept-archive" && (
            <p className="ui-copy mt-3">
              {t.collectionPage.archiveNote}
            </p>
          )}
        </div>

        {/* ── Product type filter ──────────────────────────────────────── */}
        <div className="mb-10 flex flex-wrap gap-2">
          {categoryKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setCat(key)}
              className={`min-h-11 rounded px-4 text-[10px] uppercase tracking-[0.12em] ${
                cat === key
                  ? "bg-[var(--ui-action)] text-[var(--ui-action-text)]"
                  : "text-[var(--ui-text-3)] hover:bg-[var(--ui-surface)] hover:text-[var(--ui-text)]"
              }`}
            >
              {t.collection.categoryLabels[key] ?? key}
            </button>
          ))}
        </div>

        {/* ── Count ────────────────────────────────────────────────── */}
        <p className="mb-8 text-xs uppercase tracking-[0.14em] text-[var(--ui-text-3)]">
          {filtered.length} {filtered.length === 1 ? t.collection.piece : t.collection.pieces}
          {activeTab === "all" && (
            <span className="ml-2 text-[var(--ui-text-3)]">{t.collectionPage.allTabArchiveHint}</span>
          )}
        </p>

        {/* ── Product grid ─────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="ui-surface flex flex-col items-center justify-center border-dashed py-20 text-center">
            <p className="ui-heading">{t.collectionPage.emptyTitle}</p>
            <p className="ui-copy mt-3">{t.collectionPage.emptyBody}</p>
          </div>
        )}

        {/* ── Archive CTA ───────────────────────────────────────────── */}
        {activeTab === "all" && (
          <div className="mt-16 border-t border-[var(--ui-line)] pt-12 text-center">
            <p className="ui-eyebrow mb-3">
              {t.collectionPage.archiveCta.eyebrow}
            </p>
            <p className="ui-copy mx-auto max-w-md">
              {t.collectionPage.archiveCta.description}
            </p>
            <button
              type="button"
              onClick={() => setTab("ai-concept-archive")}
              className="ui-button ui-button--secondary mt-6"
            >
              {t.collectionPage.archiveCta.button}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
