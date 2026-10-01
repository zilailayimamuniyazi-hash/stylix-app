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

const zhOccasions: Record<string, string> = {
  "black-tie": "晚宴",
  "wedding guest": "婚礼宾客",
  "date night": "约会夜",
  work: "工作场合",
  "casual brunch": "周末早午餐",
  "holiday gift": "节日礼物",
};

const zhCollections: Record<string, string> = {
  "Celestial Guardians": "星辰守护系列",
  "Solar Myth": "日曜神话系列",
  "Hearth & Halo": "暖光光环系列",
  "Jewelry Sets": "珠宝套装系列",
  "Athena Line": "雅典娜系列",
  "Stellar Talisman Jewelry": "星辰护符系列",
};

const zhZodiac: Record<string, string> = {
  Aquarius: "水瓶座",
  Pisces: "双鱼座",
  Gemini: "双子座",
  Leo: "狮子座",
  Aries: "白羊座",
  Sagittarius: "射手座",
  Cancer: "巨蟹座",
  Scorpio: "天蝎座",
  Libra: "天秤座",
  Capricorn: "摩羯座",
  Taurus: "金牛座",
  Virgo: "处女座",
};

function zhMaterial(material: string) {
  return material
    .replace(/18k/gi, "18K")
    .replace(/22k/gi, "22K")
    .replace(/champagne gold/gi, "香槟金")
    .replace(/yellow gold/gi, "黄金")
    .replace(/white gold/gi, "白金")
    .replace(/rose gold/gi, "玫瑰金")
    .replace(/gold-plated/gi, "镀金")
    .replace(/gold/gi, "黄金")
    .replace(/moissanite/gi, "莫桑石")
    .replace(/diamond-style stones/gi, "钻石感宝石")
    .replace(/diamond-style/gi, "钻石感")
    .replace(/diamond/gi, "钻石")
    .replace(/cubic zirconia/gi, "锆石")
    .replace(/freshwater pearl/gi, "淡水珍珠")
    .replace(/blue sapphire-style stone/gi, "蓝宝石感宝石")
    .replace(/satin finish/gi, "缎面工艺")
    .replace(/polished/gi, "抛光")
    .replace(/brushed/gi, "拉丝")
    .replace(/,/g, "，");
}

export function productDisplay(product: Product, locale: string) {
  const generic: Record<string, { subtitle: string; narrative: string }> = {
    fr: { subtitle: "Une pièce de joaillerie pensée pour votre identité", narrative: "Choisie pour son équilibre entre matière, proportion et présence, cette pièce accompagne naturellement votre style personnel." },
    es: { subtitle: "Una joya pensada para tu identidad", narrative: "Elegida por su equilibrio entre material, proporción y presencia, esta pieza acompaña con naturalidad tu estilo personal." },
    de: { subtitle: "Ein Schmuckstück für Ihre persönliche Identität", narrative: "Ausgewählt für das Zusammenspiel von Material, Proportion und Präsenz – als natürliche Ergänzung Ihres persönlichen Stils." },
    ja: { subtitle: "あなたらしさのために選ばれたジュエリー", narrative: "素材、プロポーション、存在感の調和から選ばれ、あなた自身のスタイルに自然に寄り添う一品です。" },
    ko: { subtitle: "당신의 정체성을 위해 선별된 주얼리", narrative: "소재와 비율, 존재감의 균형을 기준으로 선택되어 당신만의 스타일에 자연스럽게 어우러지는 작품입니다." },
    ar: { subtitle: "قطعة مجوهرات مختارة لهويتك الخاصة", narrative: "اختيرت لتوازنها بين الخامة والتناسب والحضور، فتنسجم بطبيعية مع أسلوبك الشخصي." },
  };
  if (locale !== "zh") {
    const localized = generic[locale];
    return {
      name: product.name,
      subtitle: localized?.subtitle ?? product.subtitle,
      description: product.description,
      narrative: localized?.narrative ?? product.narrative,
      symbolism: product.symbolism,
      materialEnergy: product.materialEnergy,
      stylingNotes: product.stylingNotes,
      customizationOptions: product.customizationOptions ?? [],
      material: product.material,
      priceLabel: product.priceLabel ?? `$${product.price.toLocaleString()}`,
      collectionName: product.tags.collectionName,
      zodiacAffinity: product.zodiacAffinity ?? [],
      category: product.category,
      tags: product.tags.styleTags,
      occasions: product.tags.occasionTags,
    };
  }
  const copy = zhProducts[product.slug];
  return {
    name: copy?.name ?? product.name,
    subtitle: copy?.subtitle ?? product.subtitle,
    description: "一件以真实佩戴场景、比例和材质克制感为核心的珠宝，适合作为日常标志，也适合进入私人定制流程继续细化。",
    narrative: `这件作品以克制的材质、比例与光泽回应你的珠宝人格，既适合独立佩戴，也能自然融入日常叠搭。`,
    symbolism: "它承载的是个人符号，而不是装饰口号：把星座、记忆、场合与审美偏好转化为可以佩戴的形态。",
    materialEnergy: "材质方向将根据最终工厂样品确认，以金属色泽、宝石火彩、重量和佩戴舒适度共同决定。",
    stylingNotes: "建议作为造型里的一个安静焦点佩戴。保持周围服装线条干净，让珠宝的比例和光泽自然被看见。",
    customizationOptions: ["金属颜色与镀层调整", "宝石密度或主石替换", "戒圈或链长比例微调", "刻字、符号或私人定制细节"],
    material: zhMaterial(product.material),
    priceLabel: `$${product.price.toLocaleString()} 起`,
    collectionName: zhCollections[product.tags.collectionName] ?? product.tags.collectionName,
    zodiacAffinity: (product.zodiacAffinity ?? []).map((sign) => zhZodiac[sign] ?? sign),
    category: zhCategories[product.category] ?? product.category,
    tags: product.tags.styleTags.map((tag) => zhTags[tag] ?? tag),
    occasions: product.tags.occasionTags.map((tag) => zhOccasions[tag] ?? tag),
  };
}
