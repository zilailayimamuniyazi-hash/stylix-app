// 珠饰DIY 搭配器 — 数据模型
// 每个品类 = 一组维度(dimension)，每维度一排选项(option)。
// 各选一个 = 一件成品。画布实时渲染当前选择。

export type Category = "necklace" | "bracelet" | "ring";

/** 链条视觉类型，决定 Chain.tsx 怎么画 */
export type ChainStyle =
  | "cable"      // O字链：椭圆环相扣
  | "figaro"     // 肖邦链：长短环交替
  | "cuban"      // 古巴链：交叠圆角块
  | "snake"      // 蛇骨链：粗而平滑
  | "box"        // 盒子链：方形节
  | "pearl"      // 珍珠链：整串圆珠
  | "jade-bead"  // 玉珠链：整串大珠
  | "cord";      // 弹力绳/编绳：细软线

/** 吊坠/主件形状，决定 Pendant.tsx 怎么画 */
export type PendantShape =
  | "none"
  | "peace"      // 平安扣：环形
  | "tag"        // 无事牌：圆角长牌
  | "fu"         // 福牌：方牌
  | "heart"      // 爱心
  | "clover"     // 四叶草
  | "pearl-drop" // 珍珠垂坠
  | "cross"      // 十字架
  | "round-gem"; // 圆形主石

export interface Option<T extends string> {
  id: T;
  label: string;
}

/** 一件成品的完整配置 */
export interface Design {
  category: Category;
  chain: ChainStyle;
  length: number;     // 项链 cm / 手链 cm / 戒指=戒号
  pendant: PendantShape;
  finish: string;     // 指向 FINISHES
  metal: string;      // 金属色调 id，指向 METALS
}

// ── 选项库 ──────────────────────────────────────────────────────
export const CHAINS: Record<Category, Option<ChainStyle>[]> = {
  necklace: [
    { id: "cable", label: "O字链" },
    { id: "figaro", label: "肖邦链" },
    { id: "cuban", label: "古巴链" },
    { id: "snake", label: "蛇骨链" },
    { id: "box", label: "盒子链" },
    { id: "pearl", label: "珍珠链" },
    { id: "jade-bead", label: "玉珠链" },
  ],
  bracelet: [
    { id: "cord", label: "弹力珠链" },
    { id: "cable", label: "O字链" },
    { id: "figaro", label: "肖邦链" },
    { id: "pearl", label: "珍珠链" },
    { id: "jade-bead", label: "玉珠链" },
  ],
  ring: [
    { id: "snake", label: "素圈镶嵌" },
    { id: "cord", label: "串珠戒" },
  ],
};

/** 长度维度：项链档位 / 手链手围 / 戒指戒号 */
export const LENGTHS: Record<Category, { label: string; unit: string; values: number[] }> = {
  necklace: { label: "长度", unit: "cm", values: [40, 45, 50, 60] },
  bracelet: { label: "手围", unit: "cm", values: [14, 16, 17, 18, 20] },
  ring: { label: "戒号", unit: "号", values: [12, 14, 16, 18, 20] },
};

export const PENDANTS: Option<PendantShape>[] = [
  { id: "none", label: "无吊坠" },
  { id: "peace", label: "平安扣" },
  { id: "tag", label: "无事牌" },
  { id: "fu", label: "福牌" },
  { id: "heart", label: "爱心" },
  { id: "clover", label: "四叶草" },
  { id: "pearl-drop", label: "珍珠坠" },
  { id: "cross", label: "十字架" },
  { id: "round-gem", label: "圆主石" },
];

/** 戒指/手链的"主件"标签文案（复用 pendant 字段） */
export const PENDANT_LABEL: Record<Category, string> = {
  necklace: "吊坠",
  bracelet: "主件",
  ring: "主石",
};

/** 每个品类默认配置 */
export const DEFAULTS: Record<Category, Design> = {
  necklace: { category: "necklace", chain: "cable", length: 45, pendant: "peace", finish: "jade", metal: "gold" },
  bracelet: { category: "bracelet", chain: "cord", length: 16, pendant: "fu", finish: "jade", metal: "gold" },
  ring: { category: "ring", chain: "snake", length: 16, pendant: "round-gem", finish: "sapphire", metal: "gold" },
};

export const CATEGORY_LABEL: Record<Category, string> = {
  necklace: "项链",
  bracelet: "手链",
  ring: "戒指",
};
