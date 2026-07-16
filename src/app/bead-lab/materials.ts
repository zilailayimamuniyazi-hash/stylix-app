// 珠饰DIY — 真实材质系统
// 用分层径向渐变模拟球体反光，光源统一设在左上角 (30% 28%)。

export type BeadKind = "bead" | "metal" | "pendant";

export interface BeadMaterial {
  id: string;
  name: string;
  kind: BeadKind;
  diameter: number;
  background: string;
  shadow: string;
  gloss: number;
}

const specular = (strength: number) =>
  `radial-gradient(circle at 32% 26%, rgba(255,255,255,${strength}) 0%, rgba(255,255,255,0) 38%)`;

export const MATERIALS: Record<string, BeadMaterial> = {
  "white-jade": {
    id: "white-jade",
    name: "白玉",
    kind: "bead",
    diameter: 8,
    background: [
      specular(0.85),
      "radial-gradient(circle at 38% 34%, #ffffff 0%, #f4f1e8 30%, #e8e2d2 62%, #d2c9b4 100%)",
    ].join(","),
    shadow: "rgba(120,110,88,0.45)",
    gloss: 0.5,
  },
  "south-red": {
    id: "south-red",
    name: "南红",
    kind: "bead",
    diameter: 8,
    background: [
      specular(0.6),
      "radial-gradient(circle at 38% 34%, #ff7a5c 0%, #e03b21 34%, #a81607 70%, #6f0d04 100%)",
    ].join(","),
    shadow: "rgba(90,10,4,0.5)",
    gloss: 0.55,
  },
  pearl: {
    id: "pearl",
    name: "珍珠",
    kind: "bead",
    diameter: 8,
    background: [
      "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 42%)",
      "radial-gradient(circle at 68% 72%, rgba(255,214,236,0.55) 0%, rgba(255,214,236,0) 50%)",
      "radial-gradient(circle at 72% 40%, rgba(206,240,255,0.5) 0%, rgba(206,240,255,0) 46%)",
      "radial-gradient(circle at 42% 40%, #ffffff 0%, #f2eef4 44%, #ded6e0 78%, #c3b9c8 100%)",
    ].join(","),
    shadow: "rgba(110,100,120,0.4)",
    gloss: 0.7,
  },
  gold: {
    id: "gold",
    name: "金珠",
    kind: "metal",
    diameter: 4,
    background: [
      "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 26%)",
      "radial-gradient(circle at 62% 66%, rgba(120,72,10,0.6) 0%, rgba(120,72,10,0) 44%)",
      "radial-gradient(circle at 44% 40%, #fff3c4 0%, #f2c14e 32%, #c98f18 66%, #8a5a09 100%)",
    ].join(","),
    shadow: "rgba(90,60,8,0.5)",
    gloss: 0.95,
  },
  glass: {
    id: "glass",
    name: "琉璃",
    kind: "bead",
    diameter: 8,
    background: [
      "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 34%)",
      "radial-gradient(circle at 66% 70%, rgba(20,90,120,0.55) 0%, rgba(20,90,120,0) 52%)",
      "radial-gradient(circle at 44% 40%, #9fe8ff 0%, #46b6d8 38%, #1f7fa6 72%, #0f4f6b 100%)",
    ].join(","),
    shadow: "rgba(12,60,80,0.45)",
    gloss: 0.8,
  },
  crystal: {
    id: "crystal",
    name: "水晶",
    kind: "bead",
    diameter: 8,
    background: [
      "radial-gradient(circle at 30% 24%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 40%)",
      "radial-gradient(circle at 64% 68%, rgba(150,110,190,0.4) 0%, rgba(150,110,190,0) 54%)",
      "radial-gradient(circle at 44% 40%, #ffffff 0%, #f3ecfb 40%, #ddc9f0 74%, #b79bd6 100%)",
    ].join(","),
    shadow: "rgba(120,90,160,0.35)",
    gloss: 0.9,
  },
  "fu-pendant": {
    id: "fu-pendant",
    name: "福牌",
    kind: "pendant",
    diameter: 22,
    background: [
      specular(0.55),
      "radial-gradient(circle at 40% 34%, #fffdf5 0%, #f6efe0 34%, #e6dac1 68%, #cbb98f 100%)",
    ].join(","),
    shadow: "rgba(120,100,60,0.5)",
    gloss: 0.45,
  },
};

export const MATERIAL_LIST = Object.values(MATERIALS);

export type BackdropId = "wood" | "velvet" | "dark";

export interface Backdrop {
  id: BackdropId;
  name: string;
  background: string;
  shadowScale: number;
  stringColor: string;
}

export const BACKDROPS: Record<BackdropId, Backdrop> = {
  wood: {
    id: "wood",
    name: "浅木纹",
    background: [
      "radial-gradient(120% 80% at 50% -10%, rgba(255,250,240,0.55) 0%, rgba(255,250,240,0) 55%)",
      "repeating-linear-gradient(92deg, rgba(150,110,70,0.06) 0px, rgba(150,110,70,0.06) 2px, rgba(150,110,70,0) 2px, rgba(150,110,70,0) 9px)",
      "repeating-linear-gradient(90deg, rgba(120,85,50,0.05) 0px, rgba(120,85,50,0.05) 1px, rgba(120,85,50,0) 1px, rgba(120,85,50,0) 26px)",
      "linear-gradient(160deg, #e9d7bd 0%, #ddc4a3 45%, #d0b48f 100%)",
    ].join(","),
    shadowScale: 1,
    stringColor: "rgba(90,70,45,0.55)",
  },
  velvet: {
    id: "velvet",
    name: "丝绒黑",
    background: [
      "radial-gradient(90% 70% at 50% 38%, rgba(40,38,50,0.9) 0%, rgba(20,18,28,0.95) 55%, rgba(10,8,16,1) 100%)",
      "repeating-linear-gradient(45deg, rgba(80,76,90,0.04) 0px, rgba(80,76,90,0.04) 1px, rgba(80,76,90,0) 1px, rgba(80,76,90,0) 3px)",
      "radial-gradient(120% 120% at 50% 50%, rgba(30,28,38,0) 60%, rgba(8,6,14,0.8) 100%)",
      "linear-gradient(160deg, #1a1824 0%, #0e0c18 100%)",
    ].join(","),
    shadowScale: 1.3,
    stringColor: "rgba(100,96,110,0.6)",
  },
  dark: {
    id: "dark",
    name: "深灰绒",
    background: [
      "radial-gradient(80% 60% at 50% 40%, rgba(50,48,55,0.8) 0%, rgba(25,23,30,1) 70%)",
      "repeating-linear-gradient(135deg, rgba(60,58,68,0.03) 0px, rgba(60,58,68,0.03) 1px, transparent 1px, transparent 4px)",
      "linear-gradient(170deg, #2a2830 0%, #151320 100%)",
    ].join(","),
    shadowScale: 1.5,
    stringColor: "rgba(80,76,90,0.5)",
  },
};
