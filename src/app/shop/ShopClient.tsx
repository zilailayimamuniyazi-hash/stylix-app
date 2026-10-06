"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/lib/data/products";
import type { JewelryCategory, Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { useI18n } from "@/lib/i18n/context";

type MaterialFilter = "all" | "gold" | "silver" | "diamond" | "pearl" | "colored-gem" | "jade";
type ColorFilter = "all" | "gold" | "silver-white" | "rose" | "black" | "blue" | "red" | "rainbow";
type PriceFilter = "all" | "under-250" | "250-500" | "500-1000" | "over-1000";
type SortMode = "recommend" | "price-asc" | "price-desc";

const materialOptions: { value: MaterialFilter; label: string; terms: string[] }[] = [
  { value: "all", label: "All Materials", terms: [] },
  { value: "gold", label: "Gold / Karat Gold", terms: ["gold", "champagne", "yellow", "18k", "22k"] },
  { value: "silver", label: "Silver / White Gold", terms: ["silver", "white gold", "rhodium"] },
  { value: "diamond", label: "Diamond / Moissanite", terms: ["diamond", "moissanite", "zirconia"] },
  { value: "pearl", label: "Pearl / Moonstone", terms: ["pearl", "moonstone", "moon"] },
  { value: "colored-gem", label: "Colored Gemstones", terms: ["sapphire", "ruby", "garnet", "opal", "turquoise", "amethyst", "citrine", "spectrum"] },
  { value: "jade", label: "Jade / Emerald", terms: ["jade", "emerald", "green"] },
];

const colorOptions: { value: ColorFilter; label: string; terms: string[] }[] = [
  { value: "all", label: "All Colors", terms: [] },
  { value: "gold", label: "Gold", terms: ["gold", "champagne", "yellow"] },
  { value: "silver-white", label: "Silver & White", terms: ["silver", "white", "pearl"] },
  { value: "rose", label: "Rose", terms: ["rose", "pink"] },
  { value: "black", label: "Black & Charcoal", terms: ["black", "charcoal", "onyx"] },
  { value: "blue", label: "Blue & Violet", terms: ["blue", "aquamarine", "sapphire", "amethyst", "violet"] },
  { value: "red", label: "Ruby & Wine", terms: ["red", "ruby", "garnet", "wine"] },
  { value: "rainbow", label: "Multicolor", terms: ["spectrum", "opal", "mixed", "color"] },
];

const priceOptions: { value: PriceFilter; label: string; match: (price: number) => boolean }[] = [
  { value: "all", label: "All Prices", match: () => true },
  { value: "under-250", label: "Under $250", match: (price) => price < 250 },
  { value: "250-500", label: "$250 - $500", match: (price) => price >= 250 && price <= 500 },
  { value: "500-1000", label: "$500 - $1000", match: (price) => price > 500 && price <= 1000 },
  { value: "over-1000", label: "Over $1000", match: (price) => price > 1000 },
];

const categoryOptions: { value: "all" | JewelryCategory; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "rings", label: "Rings" },
  { value: "necklaces", label: "Necklaces" },
  { value: "earrings", label: "Earrings" },
  { value: "bracelets", label: "Bracelets" },
];

function productText(product: Product) {
  return [
    product.name,
    product.subtitle,
    product.description,
    product.narrative,
    product.material,
    product.symbolism,
    product.materialEnergy,
    product.tags.collectionName,
    product.tags.metalTone,
  ].join(" ").toLowerCase();
}

function matchesTerms(product: Product, terms: string[]) {
  if (!terms.length) return true;
  const text = productText(product);
  return terms.some((term) => text.includes(term.toLowerCase()));
}

export function ShopClient() {
  const { locale } = useI18n();
  const zh = locale === "zh";
  const c = zh ? { eyebrow: "珠宝甄选", title: "按预算、材质与场合，找到适合你的珠宝。", intro: "依据真实购买考量进行筛选，再以 3D 或虚拟试戴探索每一件作品。", test: "不确定从哪里开始？先完成 JMTI 风格解读", pieces: "件作品", hide: "收起筛选", show: "显示筛选", filters: "筛选", material: "材质", price: "价格", color: "颜色", category: "类别", search: "搜索戒指、珍珠、星座、材质或场合", sort: "商品排序", recommended: "推荐排序", low: "价格：从低到高", high: "价格：从高到低", clear: "清除筛选", none: "没有符合条件的珠宝", noneBody: "请清除搜索内容，或放宽材质、价格和颜色筛选。", reset: "重置全部筛选" } : { eyebrow: "The Jewelry Edit", title: "Find a jewel for your budget, material and moment.", intro: "Filter by real purchase considerations, then explore each piece in 3D or through virtual try-on.", test: "Not sure where to begin? Take the JMTI reading", pieces: "pieces", hide: "Hide Filters", show: "Show Filters", filters: "Filters", material: "Material", price: "Price", color: "Color", category: "Category", search: "Search rings, pearls, constellations, materials or occasions", sort: "Sort products", recommended: "Recommended", low: "Price: Low to High", high: "Price: High to Low", clear: "Clear Filters", none: "No matching pieces", noneBody: "Clear the search or broaden the material, price and color filters.", reset: "Reset All Filters" };
  const label = (en: string) => zh ? ({ "All Materials":"全部材质", "Gold / Karat Gold":"黄金 / K 金", "Silver / White Gold":"银 / 白金", "Diamond / Moissanite":"钻石 / 莫桑石", "Pearl / Moonstone":"珍珠 / 月光石", "Colored Gemstones":"彩色宝石", "Jade / Emerald":"玉石 / 祖母绿", "All Colors":"全部颜色", Gold:"金色", "Silver & White":"银白色", Rose:"玫瑰色", "Black & Charcoal":"黑色与炭灰", "Blue & Violet":"蓝色与紫色", "Ruby & Wine":"红宝石与酒红", Multicolor:"多彩", "All Prices":"全部价格", "Under $250":"$250 以下", "Over $1000":"$1000 以上", "All Categories":"全部类别", Rings:"戒指", Necklaces:"项链", Earrings:"耳饰", Bracelets:"手链" } as Record<string,string>)[en] ?? en : en;
  const [material, setMaterial] = useState<MaterialFilter>("all");
  const [color, setColor] = useState<ColorFilter>("all");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [category, setCategory] = useState<"all" | JewelryCategory>("all");
  const [sort, setSort] = useState<SortMode>("recommend");
  const [keyword, setKeyword] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  function resetFilters() {
    setMaterial("all");
    setColor("all");
    setPrice("all");
    setCategory("all");
    setKeyword("");
    setSort("recommend");
  }

  const filtered = useMemo(() => {
    const materialConfig = materialOptions.find((item) => item.value === material) ?? materialOptions[0];
    const colorConfig = colorOptions.find((item) => item.value === color) ?? colorOptions[0];
    const priceConfig = priceOptions.find((item) => item.value === price) ?? priceOptions[0];
    const query = keyword.trim().toLowerCase();

    const result = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false;
      if (!priceConfig.match(product.price)) return false;
      if (!matchesTerms(product, materialConfig.terms)) return false;
      if (!matchesTerms(product, colorConfig.terms)) return false;
      if (query && !productText(product).includes(query)) return false;
      return true;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return Number(b.isFeatured) - Number(a.isFeatured) || a.budgetTier - b.budgetTier;
    });
  }, [category, color, keyword, material, price, sort]);

  const hotSearchTerms: { label: string; keyword: string }[] = [
    { label: zh ? "日常戒指" : "Everyday Rings", keyword: "ring" },
    { label: zh ? "珍珠" : "Pearls", keyword: "pearl" },
    { label: zh ? "黄金" : "Gold", keyword: "gold" },
    { label: zh ? "约会之夜" : "Date Night", keyword: "date" },
    { label: zh ? "星座" : "Constellation", keyword: "constellation" },
    { label: zh ? "设计师作品" : "Designer Pieces", keyword: "talisman" },
  ];

  return (
    <div className="ui-page">
      <header className="border-b border-[var(--ui-line)]">
        <div className="ui-container py-14 lg:py-20">
          <p className="ui-eyebrow">{c.eyebrow}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="ui-title">{c.title}</h1>
              <p className="ui-copy mt-4 max-w-2xl">{c.intro}</p>
            </div>
            <Link href="/test" className="ui-button ui-button--secondary justify-self-start lg:justify-self-end">{c.test}</Link>
          </div>
        </div>
      </header>

      <main className="ui-container py-8 lg:py-10">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--ui-line)] pb-4 lg:hidden">
          <p className="text-xs text-[var(--ui-text-3)]">{filtered.length} {c.pieces}</p>
          <button type="button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen} className="ui-button ui-button--secondary">
            {filtersOpen ? c.hide : c.show}
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} ui-surface p-5 lg:sticky lg:top-24 lg:block lg:h-fit`}>
            <p className="ui-eyebrow">{c.filters}</p>
            <div className="mt-5 space-y-6">
              <FilterGroup title={c.material} options={materialOptions.map((x) => ({ ...x, label: label(x.label) }))} value={material} onChange={setMaterial} />
              <FilterGroup title={c.price} options={priceOptions.map((x) => ({ ...x, label: label(x.label) }))} value={price} onChange={setPrice} />
              <FilterGroup title={c.color} options={colorOptions.map((x) => ({ ...x, label: label(x.label) }))} value={color} onChange={setColor} />
              <FilterGroup title={c.category} options={categoryOptions.map((x) => ({ ...x, label: label(x.label) }))} value={category} onChange={setCategory} />
            </div>
          </aside>

          <section>
            <div className="ui-surface p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <input
                    id="shop-search"
                    aria-label={c.search}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={c.search}
                    className="ui-field"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {hotSearchTerms.map((item) => (
                      <button key={item.label} type="button" onClick={() => setKeyword(item.keyword)} className="ui-badge hover:border-[var(--ui-line-strong)] hover:text-[var(--ui-text)]">
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <select aria-label={c.sort} value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="ui-field lg:w-44">
                  <option value="recommend">{c.recommended}</option>
                  <option value="price-asc">{c.low}</option>
                  <option value="price-desc">{c.high}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--ui-text-3)]">{filtered.length} {c.pieces}</p>
              {(material !== "all" || color !== "all" || price !== "all" || category !== "all" || keyword) && <button type="button" onClick={resetFilters} className="ui-button ui-button--ghost">{c.clear}</button>}
            </div>

            <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="ui-surface mt-8 border-dashed p-10 text-center">
                <p className="ui-heading">{c.none}</p>
                <p className="ui-copy mt-3">{c.noneBody}</p>
                <button type="button" onClick={resetFilters} className="ui-button ui-button--primary mt-6">{c.reset}</button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function FilterGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-medium text-[var(--ui-text-3)]">{title}</p>
      <div className="grid gap-2">
        {options.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={value === item.value}
            className={"flex min-h-11 items-center justify-between rounded px-3 text-left text-sm " + (value === item.value ? "bg-white/[.07] text-[var(--ui-text)]" : "text-[var(--ui-text-2)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]")}
          >
            <span>{item.label}</span><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full bg-[var(--ui-accent)] ${value === item.value ? "opacity-100" : "opacity-0"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
