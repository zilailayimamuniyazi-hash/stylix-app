import type {
  MaterialShader, PendantComponent, ChainTemplate, ClaspComponent,
  RingTemplate, EarringTemplate, CategoryId, DesignLanguage,
  CompatibilityContract,
} from "./types";

export const MATERIALS: MaterialShader[] = [
  {
    id: "jadeite", name: "冰种翡翠", family: "jade",
    baseColor: "#3fae7a", roughness: 0.25, metalness: 0, ior: 1.61,
    reflection: 0.18, sss: 0.35, transparency: 0.35, textures: ["半透明冰润"],
    description: "清透青绿色，适合东方玉石珠串", specification: "天然色系 · 玉石",
  },
  {
    id: "hetian", name: "和田白玉", family: "jade",
    baseColor: "#f2ede1", roughness: 0.45, metalness: 0, ior: 1.58,
    reflection: 0.15, sss: 0.4, transparency: 0.2, textures: ["温润油脂光"],
    description: "乳白柔光，适合低饱和搭配", specification: "白玉色系 · 玉石",
  },
  {
    id: "diamond", name: "白钻", family: "gem",
    baseColor: "#eaf6ff", roughness: 0.02, metalness: 0, ior: 2.42,
    reflection: 0.9, sss: 0, transparency: 0.9, textures: ["明亮式火彩"],
    description: "无色主石，用于戒指与镶嵌款", specification: "无色宝石 · 高折射",
  },
  {
    id: "ruby", name: "红宝石", family: "gem",
    baseColor: "#c21c3c", roughness: 0.08, metalness: 0, ior: 1.77,
    reflection: 0.6, sss: 0.1, transparency: 0.5, textures: ["深红通透"],
    description: "浓郁红色主石，适合金色与铂金", specification: "红色宝石 · 刻面",
  },
  {
    id: "gold-ancient", name: "18K 古法金", family: "metal",
    baseColor: "#d4af37", roughness: 0.32, metalness: 0.95, ior: 0.47,
    reflection: 0.35, sss: 0, transparency: 0, textures: ["暖金柔光"],
    description: "克制暖金色，适合日常和东方题材", specification: "18K 金色 · 金属",
  },
  {
    id: "rose-gold", name: "18K 玫瑰金", family: "metal",
    baseColor: "#e6a58c", roughness: 0.2, metalness: 0.95, ior: 0.47,
    reflection: 0.55, sss: 0, transparency: 0, textures: ["柔和玫瑰色"],
    description: "偏暖粉金色，与珍珠和粉晶协调", specification: "18K 玫瑰色 · 金属",
  },
  {
    id: "platinum", name: "PT950 铂金", family: "metal",
    baseColor: "#e5e4e2", roughness: 0.15, metalness: 0.95, ior: 0.47,
    reflection: 0.65, sss: 0, transparency: 0, textures: ["冷白高光"],
    description: "冷调白色金属，突出无色宝石火彩", specification: "PT950 色系 · 金属",
  },
  {
    id: "silver-925", name: "S925 银", family: "metal",
    baseColor: "#d8d9dc", roughness: 0.2, metalness: 0.92, ior: 0.18,
    reflection: 0.58, sss: 0, transparency: 0, textures: ["明亮银白"],
    description: "清爽银白色，适合轻珠宝和水晶", specification: "S925 色系 · 金属",
  },
  {
    id: "pearl-akoya", name: "Akoya 珍珠", family: "pearl",
    baseColor: "#fdf6ee", roughness: 0.3, metalness: 0.1, ior: 1.53,
    reflection: 0.4, sss: 0.25, transparency: 0.1, textures: ["细腻珠光"],
    description: "奶油白珠光，适合成串和金属点缀", specification: "6.5-8.5mm · 珍珠",
  },
  {
    id: "clear-quartz", name: "白水晶", family: "crystal",
    baseColor: "#dbe8e8", roughness: 0.06, metalness: 0, ior: 1.54,
    reflection: 0.55, sss: 0.05, transparency: 0.62, textures: ["清透冰感"],
    description: "无色通透，适合纯净或金色点缀", specification: "天然水晶色系 · 10mm",
  },
  {
    id: "rose-quartz", name: "粉晶", family: "crystal",
    baseColor: "#dca5ad", roughness: 0.12, metalness: 0, ior: 1.54,
    reflection: 0.42, sss: 0.22, transparency: 0.38, textures: ["柔粉雾光"],
    description: "低饱和粉色，适合玫瑰金点缀", specification: "粉色水晶色系 · 10mm",
  },
  {
    id: "amethyst", name: "紫水晶", family: "crystal",
    baseColor: "#76549a", roughness: 0.08, metalness: 0, ior: 1.54,
    reflection: 0.5, sss: 0.08, transparency: 0.48, textures: ["深浅紫调"],
    description: "克制紫色，适合银色与铂金点缀", specification: "紫色水晶色系 · 10mm",
  },
  {
    id: "citrine", name: "黄水晶", family: "crystal",
    baseColor: "#d4a447", roughness: 0.08, metalness: 0, ior: 1.54,
    reflection: 0.48, sss: 0.06, transparency: 0.5, textures: ["蜜糖金黄"],
    description: "温暖金黄色，与古法金协调", specification: "黄色水晶色系 · 10mm",
  },
  {
    id: "smoky-quartz", name: "茶晶", family: "crystal",
    baseColor: "#75665c", roughness: 0.1, metalness: 0, ior: 1.54,
    reflection: 0.4, sss: 0.03, transparency: 0.42, textures: ["烟茶通透"],
    description: "中性茶褐色，适合极简和叠戴", specification: "茶色水晶色系 · 10mm",
  },
];

export const PENDANTS: PendantComponent[] = [
  {
    id: "pingan", name: "平安扣", aspectRatio: 1.0,
    designLanguages: ["classic", "modern", "luxury", "minimal"],
    engravingArea: true, sizeVariants: { necklace: 1.0, bracelet: 0.6 },
    contract: { mountsOn: ["necklace", "bracelet"], materialFamilies: ["jade", "metal"] },
  },
  {
    id: "fupai", name: "福牌", aspectRatio: 0.66,
    designLanguages: ["classic", "luxury", "minimal"],
    engravingArea: true, sizeVariants: { necklace: 1.0, bracelet: 0.55 },
    contract: { mountsOn: ["necklace", "bracelet"], materialFamilies: ["jade", "metal"] },
  },
  {
    id: "ruyi", name: "如意", aspectRatio: 1.2,
    designLanguages: ["classic", "luxury"],
    engravingArea: false, sizeVariants: { necklace: 1.0, bracelet: 0.6 },
    contract: { mountsOn: ["necklace"], materialFamilies: ["jade", "metal"] },
  },
  {
    id: "leaf", name: "叶子", aspectRatio: 0.5,
    designLanguages: ["modern", "minimal", "luxury"],
    engravingArea: false, sizeVariants: { necklace: 1.0, bracelet: 0.55 },
    contract: { mountsOn: ["necklace", "bracelet", "earring"], materialFamilies: ["jade", "gem", "metal"] },
  },
  {
    id: "gourd", name: "葫芦", aspectRatio: 0.55,
    designLanguages: ["classic", "luxury"],
    engravingArea: false, sizeVariants: { necklace: 1.0, bracelet: 0.55 },
    contract: { mountsOn: ["necklace", "bracelet"], materialFamilies: ["jade", "metal"] },
  },
  {
    id: "solitaire", name: "单钻吊坠", aspectRatio: 0.618,
    designLanguages: ["modern", "luxury", "minimal"],
    engravingArea: false, sizeVariants: { necklace: 1.0, bracelet: 0.5 },
    contract: { mountsOn: ["necklace", "earring"], materialFamilies: ["gem", "metal"] },
  },
  {
    id: "bamboo", name: "竹节", aspectRatio: 0.35,
    designLanguages: ["classic", "luxury", "minimal"],
    engravingArea: false, sizeVariants: { necklace: 1.0, bracelet: 0.5 },
    contract: { mountsOn: ["necklace", "bracelet"], materialFamilies: ["jade", "metal"] },
  },
  {
    id: "ingot", name: "元宝", aspectRatio: 1.2,
    designLanguages: ["classic", "luxury"],
    engravingArea: false, sizeVariants: { necklace: 1.0, bracelet: 0.6 },
    contract: { mountsOn: ["necklace", "bracelet"], materialFamilies: ["jade", "metal"] },
  },
  {
    id: "wushipai", name: "无事牌", aspectRatio: 0.6,
    designLanguages: ["classic", "luxury", "minimal"],
    engravingArea: true, sizeVariants: { necklace: 1.0, bracelet: 0.55 },
    contract: { mountsOn: ["necklace", "bracelet"], materialFamilies: ["jade", "metal"] },
  },
];

export const CLASPS: ClaspComponent[] = [
  { id: "lobster", name: "龙虾扣", fitsCategories: ["necklace", "bracelet"] },
  { id: "spring", name: "弹簧扣", fitsCategories: ["necklace", "bracelet"] },
  { id: "elastic", name: "弹力扣", fitsCategories: ["bracelet"] },
];

export const CHAINS: ChainTemplate[] = [
  {
    id: "silk-necklace", name: "双层叠链", category: "necklace", beaded: false, thicknessRatio: 0.08,
    engravingArea: false, stoneCount: 0,
    contract: { mountsOn: ["necklace"], materialFamilies: ["metal"], claspIds: ["lobster", "spring"] },
    variants: [
      { id: "silk-40", lengthCm: 40, gravity: { sag: 0.28, liftSide: 0.12 } },
      { id: "silk-45", lengthCm: 45, gravity: { sag: 0.33, liftSide: 0.14 } },
    ],
  },
  {
    id: "solitaire-necklace", name: "星芒单钻项链", category: "necklace", beaded: false, thicknessRatio: 0.08,
    engravingArea: false, stoneCount: 1,
    contract: { mountsOn: ["necklace"], materialFamilies: ["metal"], claspIds: ["lobster", "spring"] },
    variants: [
      { id: "sol-40", lengthCm: 40, gravity: { sag: 0.3, liftSide: 0.13 } },
      { id: "sol-45", lengthCm: 45, gravity: { sag: 0.35, liftSide: 0.14 } },
    ],
  },
  {
    id: "medallion-necklace", name: "镜面圆牌项链", category: "necklace", beaded: false, thicknessRatio: 0.09,
    engravingArea: true, stoneCount: 0,
    contract: { mountsOn: ["necklace"], materialFamilies: ["metal"], claspIds: ["lobster", "spring"] },
    variants: [
      { id: "med-42", lengthCm: 42, gravity: { sag: 0.31, liftSide: 0.13 } },
      { id: "med-48", lengthCm: 48, gravity: { sag: 0.37, liftSide: 0.15 } },
    ],
  },
  {
    id: "floral-necklace", name: "花影项链", category: "necklace", beaded: false, thicknessRatio: 0.08,
    engravingArea: false, stoneCount: 1,
    contract: { mountsOn: ["necklace"], materialFamilies: ["metal"], claspIds: ["lobster", "spring"] },
    variants: [
      { id: "flo-40", lengthCm: 40, gravity: { sag: 0.3, liftSide: 0.13 } },
      { id: "flo-45", lengthCm: 45, gravity: { sag: 0.35, liftSide: 0.14 } },
    ],
  },
  {
    id: "jade-bead", name: "冰种玉珠项链", category: "necklace", beaded: true, thicknessRatio: 0.12,
    engravingArea: false, stoneCount: 0,
    contract: { mountsOn: ["necklace"], materialFamilies: ["jade"], claspIds: ["lobster", "spring"] },
    variants: [
      { id: "jb-42", beadCount: 48, beadDiameterMm: 8, lengthCm: 42, gravity: { sag: 0.28, liftSide: 0.12 } },
      { id: "jb-45", beadCount: 54, beadDiameterMm: 7, lengthCm: 45, gravity: { sag: 0.33, liftSide: 0.14 } },
    ],
  },
  {
    id: "pearl-chain", name: "Akoya 珍珠项链", category: "necklace", beaded: true, thicknessRatio: 0.12,
    engravingArea: false, stoneCount: 0,
    contract: { mountsOn: ["necklace"], materialFamilies: ["pearl"], claspIds: ["lobster", "spring"] },
    variants: [
      { id: "pc-42", beadCount: 48, beadDiameterMm: 7, lengthCm: 42, gravity: { sag: 0.3, liftSide: 0.13 } },
      { id: "pc-45", beadCount: 52, beadDiameterMm: 7, lengthCm: 45, gravity: { sag: 0.34, liftSide: 0.14 } },
    ],
  },
  {
    id: "cuban-necklace", name: "鎏金古巴链", category: "necklace", beaded: false, thicknessRatio: 0.16,
    engravingArea: false, stoneCount: 0,
    contract: { mountsOn: ["necklace"], materialFamilies: ["metal"], claspIds: ["lobster"] },
    variants: [
      { id: "cub-42", lengthCm: 42, gravity: { sag: 0.28, liftSide: 0.11 } },
      { id: "cub-48", lengthCm: 48, gravity: { sag: 0.32, liftSide: 0.13 } },
    ],
  },
  {
    id: "jade-bracelet", name: "玉珠手链", category: "bracelet", beaded: true, thicknessRatio: 0.12,
    contract: { mountsOn: ["bracelet"], materialFamilies: ["jade"], claspIds: ["elastic"] },
    variants: [
      { id: "jbr-15", beadCount: 18, beadDiameterMm: 10, lengthCm: 15, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "jbr-16", beadCount: 19, beadDiameterMm: 10, lengthCm: 16, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "jbr-17", beadCount: 20, beadDiameterMm: 10, lengthCm: 17, gravity: { sag: 0.5, liftSide: 0.5 } },
    ],
  },
  {
    id: "pearl-bracelet", name: "珍珠手链", category: "bracelet", beaded: true, thicknessRatio: 0.12,
    contract: { mountsOn: ["bracelet"], materialFamilies: ["pearl"], claspIds: ["lobster", "elastic"] },
    variants: [
      { id: "pbr-15", beadCount: 22, beadDiameterMm: 8, lengthCm: 15, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "pbr-16", beadCount: 23, beadDiameterMm: 8, lengthCm: 16, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "pbr-17", beadCount: 24, beadDiameterMm: 8, lengthCm: 17, gravity: { sag: 0.5, liftSide: 0.5 } },
    ],
  },
  {
    id: "crystal-bracelet", name: "晶石单圈手链", category: "bracelet", beaded: true, thicknessRatio: 0.12,
    contract: { mountsOn: ["bracelet"], materialFamilies: ["crystal"], claspIds: ["elastic"] },
    variants: Array.from({ length: 4 }, (_, index) => {
      const beadCount = 18 + index;
      const lengthCm = 15 + index;
      return { id: `cbr-${beadCount}`, beadCount, beadDiameterMm: 10, lengthCm, gravity: { sag: 0.5, liftSide: 0.5 } };
    }),
  },
  {
    id: "jade-bangle", name: "圆条玉镯", category: "bangle", beaded: false, thicknessRatio: 0.18,
    engravingArea: false, stoneCount: 0,
    contract: { mountsOn: ["bangle"], materialFamilies: ["jade"] },
    variants: [
      { id: "jbg-54", lengthCm: 54, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "jbg-56", lengthCm: 56, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "jbg-58", lengthCm: 58, gravity: { sag: 0.5, liftSide: 0.5 } },
    ],
  },
  {
    id: "slim-bangle", name: "窄版素镯", category: "bangle", beaded: false, thicknessRatio: 0.10,
    engravingArea: true, stoneCount: 0,
    contract: { mountsOn: ["bangle"], materialFamilies: ["metal"] },
    variants: [
      { id: "sbg-54", lengthCm: 54, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "sbg-56", lengthCm: 56, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "sbg-58", lengthCm: 58, gravity: { sag: 0.5, liftSide: 0.5 } },
    ],
  },
  {
    id: "open-bangle", name: "开口手镯", category: "bangle", beaded: false, thicknessRatio: 0.12,
    engravingArea: true, stoneCount: 2,
    contract: { mountsOn: ["bangle"], materialFamilies: ["metal"] },
    variants: [
      { id: "obg-54", lengthCm: 54, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "obg-56", lengthCm: 56, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "obg-58", lengthCm: 58, gravity: { sag: 0.5, liftSide: 0.5 } },
    ],
  },
  {
    id: "floral-bangle", name: "花叶镶嵌镯", category: "bangle", beaded: false, thicknessRatio: 0.16,
    engravingArea: false, stoneCount: 7,
    contract: { mountsOn: ["bangle"], materialFamilies: ["metal"] },
    variants: [
      { id: "fbg-54", lengthCm: 54, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "fbg-56", lengthCm: 56, gravity: { sag: 0.5, liftSide: 0.5 } },
      { id: "fbg-58", lengthCm: 58, gravity: { sag: 0.5, liftSide: 0.5 } },
    ],
  },
];

const ringSizes = (prefix: string) => [
  { id: `${prefix}-9`, sizeNo: 9, innerDiameterMm: 15.6 },
  { id: `${prefix}-12`, sizeNo: 12, innerDiameterMm: 16.5 },
  { id: `${prefix}-15`, sizeNo: 15, innerDiameterMm: 17.4 },
  { id: `${prefix}-18`, sizeNo: 18, innerDiameterMm: 18.3 },
];

export const RINGS: RingTemplate[] = [
  {
    id: "plain-band", name: "素圈戒", category: "ring", bandWidthRatio: 0.16,
    setting: "none", prongCount: 0, stoneCount: 0, hasHalo: false,
    designLanguages: ["classic", "modern", "minimal"], engravingArea: true,
    variants: ringSizes("pb"), contract: { mountsOn: ["ring"], materialFamilies: ["metal"] },
  },
  {
    id: "solitaire-ring", name: "单钻戒", category: "ring", bandWidthRatio: 0.12,
    setting: "prong", prongCount: 6, stoneCount: 1, hasHalo: false,
    designLanguages: ["modern", "luxury", "minimal"], engravingArea: true,
    variants: ringSizes("sr"), contract: { mountsOn: ["ring"], materialFamilies: ["metal", "gem"] },
  },
  {
    id: "halo-ring", name: "光环戒", category: "ring", bandWidthRatio: 0.13,
    setting: "halo", prongCount: 4, stoneCount: 1, hasHalo: true,
    designLanguages: ["luxury", "modern"], engravingArea: false,
    variants: ringSizes("hr"), contract: { mountsOn: ["ring"], materialFamilies: ["metal", "gem"] },
  },
  {
    id: "three-stone-ring", name: "三石戒", category: "ring", bandWidthRatio: 0.14,
    setting: "three-stone", prongCount: 4, stoneCount: 3, hasHalo: false,
    designLanguages: ["luxury", "classic"], engravingArea: false,
    variants: ringSizes("ts"), contract: { mountsOn: ["ring"], materialFamilies: ["metal", "gem"] },
  },
  {
    id: "wide-band", name: "宽版戒", category: "ring", bandWidthRatio: 0.24,
    setting: "none", prongCount: 0, stoneCount: 0, hasHalo: false,
    designLanguages: ["classic", "modern", "minimal"], engravingArea: true,
    variants: ringSizes("wb"), contract: { mountsOn: ["ring"], materialFamilies: ["metal"] },
  },
  {
    id: "eternity-ring", name: "满钻戒", category: "ring", bandWidthRatio: 0.14,
    setting: "prong", prongCount: 0, stoneCount: 22, hasHalo: false,
    designLanguages: ["luxury", "modern"], engravingArea: false,
    variants: ringSizes("et"), contract: { mountsOn: ["ring"], materialFamilies: ["metal", "gem"] },
  },
  {
    id: "open-ring", name: "开口戒", category: "ring", bandWidthRatio: 0.12,
    setting: "none", prongCount: 0, stoneCount: 0, hasHalo: false,
    designLanguages: ["modern", "minimal"], engravingArea: false,
    variants: ringSizes("or"), contract: { mountsOn: ["ring"], materialFamilies: ["metal"] },
  },
];

export const EARRINGS: EarringTemplate[] = [
  {
    id: "stud", name: "耳钉", category: "earring", style: "stud", hasPendant: false, stoneCount: 1,
    designLanguages: ["modern", "minimal", "luxury"],
    variants: [{ id: "st-s", dropMm: 6 }, { id: "st-m", dropMm: 9 }],
    contract: { mountsOn: ["earring"], materialFamilies: ["metal", "gem"] },
  },
  {
    id: "drop", name: "耳坠", category: "earring", style: "drop", hasPendant: true, stoneCount: 1,
    designLanguages: ["classic", "luxury", "modern", "minimal"],
    variants: [{ id: "dr-30", dropMm: 30 }, { id: "dr-45", dropMm: 45 }],
    contract: { mountsOn: ["earring"], materialFamilies: ["metal", "gem", "jade"] },
  },
  {
    id: "hoop", name: "耳圈", category: "earring", style: "hoop", hasPendant: false, stoneCount: 0,
    designLanguages: ["modern", "minimal"],
    variants: [{ id: "hp-s", dropMm: 20 }, { id: "hp-l", dropMm: 35 }],
    contract: { mountsOn: ["earring"], materialFamilies: ["metal"] },
  },
];

export const COMPOSITION = {
  pendantWidthPct: { min: 0.15, max: 0.18 },
  chainThicknessFactor: 0.12,
  goldenRatio: 1.618,
  whitespacePct: 0.15,
};

export const byId = <T extends { id: string }>(arr: T[], id: string): T | undefined =>
  arr.find((x) => x.id === id);

export interface TemplateLike {
  id: string;
  name: string;
  category: CategoryId;
  contract: CompatibilityContract;
  variants: { id: string }[];
  designLanguages?: DesignLanguage[];
  engravingArea?: boolean;
  stoneCount?: number;
  beaded?: boolean;
}

export function templatesFor(category: CategoryId): TemplateLike[] {
  switch (category) {
    case "necklace": return CHAINS.filter((c) => c.category === "necklace") as unknown as TemplateLike[];
    case "bracelet": return CHAINS.filter((c) => c.category === "bracelet") as unknown as TemplateLike[];
    case "bangle": return CHAINS.filter((c) => c.category === "bangle") as unknown as TemplateLike[];
    case "ring": return RINGS as unknown as TemplateLike[];
    case "earring": return EARRINGS as unknown as TemplateLike[];
  }
}

export function findTemplate(category: CategoryId, id: string): TemplateLike | undefined {
  return templatesFor(category).find((t) => t.id === id);
}

export const CATEGORIES: { id: CategoryId; name: string }[] = [
  { id: "ring", name: "戒指" },
  { id: "bangle", name: "手镯" },
  { id: "necklace", name: "项链" },
  { id: "earring", name: "耳饰" },
  { id: "bracelet", name: "手链" },
];
