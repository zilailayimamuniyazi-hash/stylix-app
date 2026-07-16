"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { products } from "@/lib/data/products";
import type { JewelryCategory, Product } from "@/lib/types/product";
import { ProductCard } from "@/components/product/ProductCard";

type MaterialFilter = "all" | "gold" | "silver" | "diamond" | "pearl" | "colored-gem" | "jade";
type ColorFilter = "all" | "gold" | "silver-white" | "rose" | "black" | "blue" | "red" | "rainbow";
type PriceFilter = "all" | "under-250" | "250-500" | "500-1000" | "over-1000";
type SortMode = "recommend" | "price-asc" | "price-desc";

const materialOptions: { value: MaterialFilter; label: string; terms: string[] }[] = [
  { value: "all", label: "全部材质", terms: [] },
  { value: "gold", label: "黄金 / K金", terms: ["gold", "champagne", "yellow", "18k", "22k"] },
  { value: "silver", label: "银色 / 白金", terms: ["silver", "white gold", "rhodium"] },
  { value: "diamond", label: "钻石 / 莫桑石", terms: ["diamond", "moissanite", "zirconia"] },
  { value: "pearl", label: "珍珠 / 月光", terms: ["pearl", "moonstone", "moon"] },
  { value: "colored-gem", label: "彩宝", terms: ["sapphire", "ruby", "garnet", "opal", "turquoise", "amethyst", "citrine", "spectrum"] },
  { value: "jade", label: "玉石 / 翡翠", terms: ["jade", "emerald", "green"] },
];

const colorOptions: { value: ColorFilter; label: string; terms: string[] }[] = [
  { value: "all", label: "全部色系", terms: [] },
  { value: "gold", label: "金色系", terms: ["gold", "champagne", "yellow"] },
  { value: "silver-white", label: "银白系", terms: ["silver", "white", "pearl"] },
  { value: "rose", label: "玫瑰系", terms: ["rose", "pink"] },
  { value: "black", label: "黑灰系", terms: ["black", "charcoal", "onyx"] },
  { value: "blue", label: "蓝紫系", terms: ["blue", "aquamarine", "sapphire", "amethyst", "violet"] },
  { value: "red", label: "红酒系", terms: ["red", "ruby", "garnet", "wine"] },
  { value: "rainbow", label: "彩色系", terms: ["spectrum", "opal", "mixed", "color"] },
];

const priceOptions: { value: PriceFilter; label: string; match: (price: number) => boolean }[] = [
  { value: "all", label: "全部价格", match: () => true },
  { value: "under-250", label: "$250 以下", match: (price) => price < 250 },
  { value: "250-500", label: "$250 - $500", match: (price) => price >= 250 && price <= 500 },
  { value: "500-1000", label: "$500 - $1000", match: (price) => price > 500 && price <= 1000 },
  { value: "over-1000", label: "$1000 以上", match: (price) => price > 1000 },
];

const categoryOptions: { value: "all" | JewelryCategory; label: string }[] = [
  { value: "all", label: "全部品类" },
  { value: "rings", label: "戒指" },
  { value: "necklaces", label: "项链" },
  { value: "earrings", label: "耳饰" },
  { value: "bracelets", label: "手链" },
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
    { label: "通勤戒指", keyword: "ring" },
    { label: "珍珠", keyword: "pearl" },
    { label: "金色系", keyword: "gold" },
    { label: "约会", keyword: "date" },
    { label: "星座项链", keyword: "constellation" },
    { label: "设计师款", keyword: "talisman" },
  ];

  return (
    <div className="ui-page">
      <header className="border-b border-[var(--ui-line)]">
        <div className="ui-container py-14 lg:py-20">
          <p className="ui-eyebrow">珠宝商城</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="ui-title">找到适合预算、材质与场景的珠宝。</h1>
              <p className="ui-copy mt-4 max-w-2xl">按真实购买条件筛选，并在商品详情中查看 3D 或试戴效果。</p>
            </div>
            <Link href="/test" className="ui-button ui-button--secondary justify-self-start lg:justify-self-end">不知道怎么选？获取 JMTI 推荐</Link>
          </div>
        </div>
      </header>

      <main className="ui-container py-8 lg:py-10">
        <div className="mb-4 flex items-center justify-between border-b border-[var(--ui-line)] pb-4 lg:hidden">
          <p className="text-xs text-[var(--ui-text-3)]">{filtered.length} 件商品</p>
          <button type="button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen} className="ui-button ui-button--secondary">
            {filtersOpen ? "收起筛选" : "筛选条件"}
          </button>
        </div>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} ui-surface p-5 lg:sticky lg:top-24 lg:block lg:h-fit`}>
            <p className="ui-eyebrow">筛选</p>
            <div className="mt-5 space-y-6">
              <FilterGroup title="材质" options={materialOptions} value={material} onChange={setMaterial} />
              <FilterGroup title="价格" options={priceOptions} value={price} onChange={setPrice} />
              <FilterGroup title="色系" options={colorOptions} value={color} onChange={setColor} />
              <FilterGroup title="品类" options={categoryOptions} value={category} onChange={setCategory} />
            </div>
          </aside>

          <section>
            <div className="ui-surface p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <input
                    id="shop-search"
                    aria-label="搜索珠宝"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="搜索戒指、珍珠、星座、材质或场景"
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
                <select aria-label="商品排序" value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="ui-field lg:w-44">
                  <option value="recommend">综合推荐</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--ui-text-3)]">{filtered.length} 件商品</p>
              {(material !== "all" || color !== "all" || price !== "all" || category !== "all" || keyword) && <button type="button" onClick={resetFilters} className="ui-button ui-button--ghost">清除筛选</button>}
            </div>

            <div className="mt-6 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="ui-surface mt-8 border-dashed p-10 text-center">
                <p className="ui-heading">暂时没有匹配商品</p>
                <p className="ui-copy mt-3">可以清空关键词，或放宽材质、价格与色系筛选。</p>
                <button type="button" onClick={resetFilters} className="ui-button ui-button--primary mt-6">重置全部筛选</button>
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
