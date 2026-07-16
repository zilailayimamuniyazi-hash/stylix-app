export interface Finish {
  id: string;
  label: string;
  stops: [string, string, string];
  stroke: string;
  metallic?: boolean;
}

export const FINISHES: Record<string, Finish> = {
  gold: { id: "gold", label: "黄金", stops: ["#fff8dc", "#daa520", "#8b6914"], stroke: "#705a0e", metallic: true },
  silver: { id: "silver", label: "银", stops: ["#ffffff", "#c8ccd0", "#7a8088"], stroke: "#6a6e76", metallic: true },
  k18: { id: "k18", label: "18K", stops: ["#fff5e0", "#e6b850", "#a07228"], stroke: "#8a611c", metallic: true },
  jade: { id: "jade", label: "翡翠", stops: ["#d4f5e2", "#3daa72", "#18664a"], stroke: "#12543c" },
  hetian: { id: "hetian", label: "和田玉", stops: ["#faf8f0", "#e8e0cc", "#c4b89a"], stroke: "#a49878" },
  pearl: { id: "pearl", label: "珍珠", stops: ["#ffffff", "#f0eaf0", "#c8c0cc"], stroke: "#aaa2b0" },
  sapphire: { id: "sapphire", label: "蓝宝石", stops: ["#a8d4ff", "#2266b8", "#0e2e60"], stroke: "#0a2450" },
  ruby: { id: "ruby", label: "红宝石", stops: ["#ffa0a0", "#c42020", "#680a0a"], stroke: "#550808" },
  "south-red": { id: "south-red", label: "南红", stops: ["#ff8866", "#c83018", "#6a1008"], stroke: "#540c06" },
  amber: { id: "amber", label: "蜜蜡", stops: ["#ffe4a0", "#d89830", "#8a5810"], stroke: "#744a0c" },
};

export const FINISH_LIST = Object.values(FINISHES);

export interface Metal {
  id: string;
  label: string;
  stops: [string, string, string];
  stroke: string;
}

export const METALS: Record<string, Metal> = {
  gold: { id: "gold", label: "黄金色", stops: ["#fff8dc", "#daa520", "#8b6914"], stroke: "#705a0e" },
  rose: { id: "rose", label: "玫瑰金", stops: ["#ffe0d0", "#d4907a", "#9a5840"], stroke: "#804830" },
  white: { id: "white", label: "白金/银", stops: ["#ffffff", "#c8ccd0", "#7a8088"], stroke: "#6a6e76" },
};

export const METAL_LIST = Object.values(METALS);

export function finishOf(id: string): Finish {
  return FINISHES[id] ?? FINISHES.gold;
}
export function metalOf(id: string): Metal {
  return METALS[id] ?? METALS.gold;
}

export const metalGradKey = (id: string) => `g-m-${id}`;
export const finishGradKey = (id: string) => `g-f-${id}`;
export const metalFill = (id: string) => `url(#${metalGradKey(id)})`;
export const finishFill = (id: string) => `url(#${finishGradKey(id)})`;
