import type { Product } from "@/lib/types/product";

const zhProducts: Record<string, { name: string; subtitle: string }> = {
  "aurora-celestial-band": { name: "极光星辰戒", subtitle: "拉丝金上的莫桑石星座" },
  "helios-solar-band": { name: "赫利俄斯日曜戒", subtitle: "哑光切面的建筑感黄金戒" },
  "selene-moon-ring": { name: "塞勒涅月弧戒", subtitle: "莫桑石勾勒的星月弧线" },
  "eros-duo-stack-rings": { name: "厄洛斯双生叠戴戒", subtitle: "双色金属的纤细双环" },
  "atlas-heritage-ring": { name: "阿特拉斯传承戒", subtitle: "金色框架与钻石感主石" },
  "iris-spectrum-jewelry-set": { name: "伊里斯光谱珠宝套装", subtitle: "渐变金色项链、戒指与耳饰套装" },
  "dione-signet-ring": { name: "狄俄涅印章戒", subtitle: "镜面抛光黄金平面印章戒" },
  "lyra-harp-ring": { name: "天琴竖琴戒", subtitle: "镶钻开放式线条戒" },
  "gemini-arc-talisman-necklace": { name: "双子弧光护符项链", subtitle: "金色双子符号与双星坠饰" },
  "constellation-star-station-necklace": { name: "北斗星链", subtitle: "纤细金链上的七颗北辰星" },
  "twin-star-layering-necklace": { name: "双星叠戴项链", subtitle: "不对称双星与珍珠点缀" },
  "gemini-pillar-pendant-necklace": { name: "双子立柱吊坠", subtitle: "建筑感双柱与钻石点缀" },
  "twin-stone-orbit-necklace": { name: "双石轨道项链", subtitle: "金链上的钻石与蓝宝石双石包镶" },
};

const zhTags: Record<string, string> = {
  celestial: "星辰", elegant: "优雅", minimal: "极简", bold: "醒目", classic: "经典",
  romantic: "浪漫", playful: "灵动", symbolic: "寓意", modern: "现代", sculptural: "雕塑感",
};

const zhCategories: Record<string, string> = { rings: "戒指", necklaces: "项链", earrings: "耳饰", bracelets: "手链" };

export function productDisplay(product: Product, locale: string) {
  if (locale !== "zh") return { name: product.name, subtitle: product.subtitle, category: product.category, tags: product.tags.styleTags };
  const copy = zhProducts[product.slug];
  return {
    name: copy?.name ?? product.name,
    subtitle: copy?.subtitle ?? product.subtitle,
    category: zhCategories[product.category] ?? product.category,
    tags: product.tags.styleTags.map((tag) => zhTags[tag] ?? tag),
  };
}
