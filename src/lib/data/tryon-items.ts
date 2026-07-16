export interface TryOnItem {
  id: string;
  name: string;
  slug: string;
  category: "necklace" | "ring" | "earring" | "bracelet";
  productImage: string;
  overlayImage: string;
  price: number;
  material: string;
}

/** Curated catalog of pieces with AR overlay assets in /public/tryon/. */
export const tryOnItems: TryOnItem[] = [
  {
    id: "p-twin-star-layering",
    slug: "twin-star-layering-necklace",
    name: "Twin Star Layering Necklace",
    category: "necklace",
    productImage: "/products/1ffdb7bc94a5e758db69ec44fd06c83b.png",
    overlayImage: "/tryon/necklace-twin-star.svg",
    price: 188,
    material: "18K 镀金 · 白色锆石",
  },
  {
    id: "p-constellation-star-station",
    slug: "constellation-star-station-necklace",
    name: "Constellation Star Station",
    category: "necklace",
    productImage: "/products/09fbcf7b14f107b8cef5c9a5690e9f8b.jpg",
    overlayImage: "/tryon/necklace-constellation.svg",
    price: 205,
    material: "S925 银 · 星芒锆石",
  },
  {
    id: "p-gemini-arc",
    slug: "gemini-arc-talisman-necklace",
    name: "Gemini Arc Talisman",
    category: "necklace",
    productImage: "/products/08bbd545378298049f4ec03b77b783a2.png",
    overlayImage: "/tryon/necklace-gemini-arc.svg",
    price: 218,
    material: "18K 镀金 · 黑玛瑙",
  },
  {
    id: "p-aurora-ring",
    slug: "aurora-celestial-band",
    name: "Aurora Celestial Band",
    category: "ring",
    productImage: "/products/gold-ring.jpg",
    overlayImage: "/tryon/ring-gold-solitaire.svg",
    price: 295,
    material: "18K 金色 · 白色锆石",
  },
  {
    id: "p-selene-ring",
    slug: "selene-moon-ring",
    name: "Selene Moon Ring",
    category: "ring",
    productImage: "/products/微信图片_20260212130431_2_2.jpg",
    overlayImage: "/tryon/ring-silver-minimal.svg",
    price: 280,
    material: "S925 银 · 月光母贝",
  },
  {
    id: "p-dione-ring",
    slug: "dione-signet-ring",
    name: "Dione Signet Ring",
    category: "ring",
    productImage: "/products/微信图片_20260214000203_40_36.jpg",
    overlayImage: "/tryon/ring-black-enamel.svg",
    price: 295,
    material: "黑色珐琅 · 18K 镀金",
  },
  {
    id: "p-helios-ring",
    slug: "helios-solar-band",
    name: "Helios Solar Band",
    category: "ring",
    productImage: "/products/微信图片_20260213120908_37_36.jpg",
    overlayImage: "/tryon/ring-gold-bold.svg",
    price: 320,
    material: "18K 金色 · 镜面宽戒",
  },
  {
    id: "p-eros-ring",
    slug: "eros-duo-stack-rings",
    name: "Eros Duo Stack",
    category: "ring",
    productImage: "/products/1961b5b431c6e985cd27e0b35696b561.png",
    overlayImage: "/tryon/ring-rose-gold.svg",
    price: 355,
    material: "18K 玫瑰金 · 双环叠戴",
  },
  {
    id: "p-atlas-ring",
    slug: "atlas-heritage-ring",
    name: "Atlas Heritage Ring",
    category: "ring",
    productImage: "/products/ac04653034c79937e100e3ad36141111.png",
    overlayImage: "/tryon/ring-gold-band.svg",
    price: 340,
    material: "18K 金色 · 经典素圈",
  },
];

export function getTryOnItemBySlug(slug: string): TryOnItem | undefined {
  return tryOnItems.find((item) => item.slug === slug);
}

export function getTryOnItemById(id: string): TryOnItem | undefined {
  return tryOnItems.find((item) => item.id === id);
}

export function getDefaultTryOnItem(): TryOnItem {
  return tryOnItems[0];
}
