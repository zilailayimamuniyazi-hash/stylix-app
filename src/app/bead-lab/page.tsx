"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JewelryPreview3D from "./JewelryPreview3D";
import type { CategoryId, ChainVariant, DesignState, EarringVariant, RingVariant } from "./data/types";
import {
  CATEGORIES, MATERIALS, PENDANTS as CATALOG_PENDANTS, byId, findTemplate, templatesFor,
} from "./data/catalog";
import {
  METAL_MATERIALS, STONE_MATERIALS, blockingIssues, compatibleChainMaterials,
  compatiblePendantMaterials, compatiblePendants, validate,
} from "./data/compliance";

type Dim = "template" | "variant" | "pendant" | "baseMat" | "pendantMat" | "stoneMat" | "metalMat" | "beadPalette" | "beadEditor" | "surface" | "engraving";
type SummaryItem = { key: string; label: string; value: string; swatch?: string };

const CRYSTAL_MATERIALS = MATERIALS.filter((material) => material.family === "crystal");
const CRYSTAL_PATTERNS = [
  { id: "clear", name: "清透白晶", note: "全串白水晶", materials: ["clear-quartz"] },
  { id: "mist", name: "晨雾渐层", note: "白水晶与茶晶对称", materials: ["clear-quartz", "clear-quartz", "smoky-quartz", "smoky-quartz"] },
  { id: "violet", name: "紫霞流光", note: "紫水晶与白水晶交替", materials: ["amethyst", "amethyst", "clear-quartz"] },
  { id: "peach", name: "蜜桃鎏金", note: "粉晶、黄水晶与白晶", materials: ["rose-quartz", "rose-quartz", "citrine", "clear-quartz"] },
  { id: "spectrum", name: "五晶守护", note: "五种晶石循环排列", materials: ["clear-quartz", "rose-quartz", "amethyst", "citrine", "smoky-quartz"] },
] as const;

function crystalSequence(patternId: string, count: number) {
  const pattern = CRYSTAL_PATTERNS.find((item) => item.id === patternId) ?? CRYSTAL_PATTERNS[0];
  return Array.from({ length: count }, (_, index) => pattern.materials[index % pattern.materials.length]);
}

const TEMPLATE_META: Record<string, string> = {
  "plain-band": "经典窄版", "solitaire-ring": "四爪主石", "halo-ring": "围镶光环",
  "three-stone-ring": "三石并置", "wide-band": "利落宽面", "eternity-ring": "整圈排镶",
  "open-ring": "轻盈开口", "jade-bangle": "温润圆条", "slim-bangle": "纤细素金",
  "open-bangle": "双石收口", "floral-bangle": "花叶排镶", "silk-necklace": "两种长度的轻盈叠戴",
  "solitaire-necklace": "单颗主石锁骨链", "medallion-necklace": "支持刻字的镜面圆牌",
  "floral-necklace": "金属花瓣与中心主石", "jade-bead": "均匀冰种玉珠",
  "pearl-chain": "Akoya 珠光", "cuban-necklace": "饱满链节造型",
  "jade-bracelet": "玉珠环绕", "pearl-bracelet": "Akoya 珠光", stud: "极简贴耳",
  "crystal-bracelet": "纯色晶石单圈",
  drop: "垂坠比例", hoop: "日常耳圈",
};

function makeDefault(category: CategoryId): DesignState {
  const template = templatesFor(category)[0];
  const variant = template?.variants[0];
  const materials = template ? compatibleChainMaterials(category, template.id) : [];
  const pendants = compatiblePendants(category);
  return {
    category,
    templateId: template?.id ?? "",
    variantId: variant?.id ?? "",
    pendantId: null,
    designLanguage: "classic",
    chainMaterialId: materials[0]?.id ?? "gold-ancient",
    pendantMaterialId: pendants[0] ? compatiblePendantMaterials(pendants[0].id)[0]?.id ?? "gold-ancient" : "gold-ancient",
    stoneMaterialId: STONE_MATERIALS[0]?.id ?? "diamond",
    metalMaterialId: METAL_MATERIALS[0]?.id ?? "gold-ancient",
    engravingText: "",
    spacerMaterialId: "",
    beadPatternId: "clear",
    beadMaterialIds: ["clear-quartz"],
    surface: { glossiness: 0.55, clarity: 0.7 },
  };
}

const INITIAL_STATES: Record<CategoryId, DesignState> = {
  ring: makeDefault("ring"),
  bangle: makeDefault("bangle"),
  necklace: makeDefault("necklace"),
  earring: makeDefault("earring"),
  bracelet: makeDefault("bracelet"),
};

function encodeDesign(state: DesignState) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeDesign(value: string): DesignState | null {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as DesignState;
    if (!CATEGORIES.some((item) => item.id === parsed.category)) return null;
    if (!findTemplate(parsed.category, parsed.templateId)) return null;
    return { ...makeDefault(parsed.category), ...parsed };
  } catch {
    return null;
  }
}

function variantLabel(category: CategoryId, variant: { id: string }) {
  if (category === "ring") {
    const value = variant as RingVariant;
    return `${value.sizeNo}号 · ${value.innerDiameterMm.toFixed(1)}mm`;
  }
  if (category === "earring") return `${(variant as EarringVariant).dropMm}mm`;
  const value = variant as ChainVariant;
  if (category === "bangle") return `${value.lengthCm}mm 内径`;
  return value.beadCount
    ? `适合手围 ${(value.lengthCm - 0.8).toFixed(1)}–${(value.lengthCm - 0.2).toFixed(1)}cm · ${value.beadCount}颗`
    : `${value.lengthCm}cm`;
}

function dimensionLabel(category: CategoryId, dim: Dim) {
  if (dim === "template") return category === "ring" ? "戒型" : category === "bangle" ? "镯型" : category === "necklace" ? "项链款" : category === "earring" ? "耳饰款" : "链型";
  if (dim === "variant") return category === "ring" ? "戒号" : category === "bangle" ? "圈口" : category === "earring" ? "尺寸" : "长度";
  if (dim === "pendant") return "主件";
  if (dim === "baseMat") return category === "bangle" ? "镯身材质" : category === "necklace" ? "项链材质" : "主体材质";
  if (dim === "pendantMat") return "主件材质";
  if (dim === "stoneMat") return "主石";
  if (dim === "metalMat") return "金属色";
  if (dim === "beadPalette") return "配色方案";
  if (dim === "beadEditor") return "逐珠搭配";
  if (dim === "surface") return "表面工艺";
  return "刻字";
}

export default function BeadLabPage() {
  const [category, setCategory] = useState<CategoryId>("ring");
  const [states, setStates] = useState(INITIAL_STATES);
  const [dim, setDim] = useState<Dim>("template");
  const [notice, setNotice] = useState<string | null>(null);
  const [changedField, setChangedField] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [sharePreview, setSharePreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<number | null>(null);

  const state = states[category];
  const templates = useMemo(() => templatesFor(category), [category]);
  const currentTemplate = useMemo(() => findTemplate(category, state.templateId), [category, state.templateId]);
  const variants = useMemo(() => currentTemplate?.variants ?? [], [currentTemplate]);
  const pendants = useMemo(() => compatiblePendants(category), [category]);
  const baseMaterials = useMemo(() => compatibleChainMaterials(category, state.templateId), [category, state.templateId]);
  const pendantMaterials = useMemo(() => compatiblePendantMaterials(state.pendantId), [state.pendantId]);
  const blockers = useMemo(() => blockingIssues(validate(state)), [state]);
  const isStructureBased = category === "necklace" || category === "bracelet" || category === "bangle";
  const isCrystal = category === "bracelet" && state.templateId.startsWith("crystal-");
  const allowsPendant = false;
  const hasStone = (currentTemplate?.stoneCount ?? (category === "earring" ? 1 : 0)) > 0;

  const notify = useCallback((message: string) => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2400);
  }, []);

  const update = useCallback((patch: Partial<DesignState>) => {
    setStates((previous) => ({ ...previous, [category]: { ...previous[category], ...patch } }));
    const field = Object.keys(patch)[0];
    if (field) {
      setChangedField(field);
      window.setTimeout(() => setChangedField(null), 650);
    }
  }, [category]);

  const dimensions = useMemo(() => {
    const items: Dim[] = ["template", "variant"];
    if (allowsPendant) items.push("pendant");
    if (isCrystal) items.push("beadPalette", "beadEditor");
    else if (isStructureBased) items.push("baseMat");
    if (allowsPendant && state.pendantId) items.push("pendantMat");
    if (hasStone) items.push("stoneMat");
    if (!isStructureBased) items.push("metalMat");
    items.push("surface");
    const pendant = state.pendantId ? byId(CATALOG_PENDANTS, state.pendantId) : null;
    if (currentTemplate?.engravingArea || pendant?.engravingArea) items.push("engraving");
    return items;
  }, [allowsPendant, currentTemplate?.engravingArea, hasStone, isCrystal, isStructureBased, state.pendantId]);

  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("design");
    const decoded = shared ? decodeDesign(shared) : null;
    if (decoded) {
      setCategory(decoded.category);
      setStates((previous) => ({ ...previous, [decoded.category]: decoded }));
      notify("已打开分享作品");
      return;
    }
    const restored = { ...INITIAL_STATES };
    CATEGORIES.forEach(({ id }) => {
      try {
        const raw = localStorage.getItem(`bead-lab-3d-${id}`);
        const parsed = raw ? JSON.parse(raw) as DesignState : null;
        if (parsed?.category === id && findTemplate(id, parsed.templateId)) restored[id] = { ...makeDefault(id), ...parsed };
      } catch {
        localStorage.removeItem(`bead-lab-3d-${id}`);
      }
    });
    setStates(restored);
  }, [notify]);

  useEffect(() => {
    if (!dimensions.includes(dim)) setDim("template");
  }, [dim, dimensions]);

  useEffect(() => {
    if (!currentTemplate) return;
    const patch: Partial<DesignState> = {};
    if (!currentTemplate.variants.some((variant) => variant.id === state.variantId)) patch.variantId = currentTemplate.variants[0]?.id ?? "";
    if (isStructureBased) {
      const materials = compatibleChainMaterials(category, state.templateId);
      if (materials.length && !materials.some((material) => material.id === state.chainMaterialId)) patch.chainMaterialId = materials[0].id;
    }
    if (isCrystal) {
      const selectedVariant = currentTemplate.variants.find((variant) => variant.id === (patch.variantId ?? state.variantId)) as ChainVariant | undefined;
      const count = selectedVariant?.beadCount ?? 16;
      const valid = state.beadMaterialIds.filter((id) => CRYSTAL_MATERIALS.some((material) => material.id === id));
      if (valid.length !== count) {
        const source = valid.length ? valid : crystalSequence(state.beadPatternId, count);
        patch.beadMaterialIds = Array.from({ length: count }, (_, index) => source[index % source.length]);
      }
    }
    if (!allowsPendant && state.pendantId) patch.pendantId = null;
    if (Object.keys(patch).length) update(patch);
  }, [allowsPendant, category, currentTemplate, isCrystal, isStructureBased, state.beadMaterialIds, state.beadPatternId, state.chainMaterialId, state.pendantId, state.templateId, state.variantId, update]);

  const summary = useMemo<SummaryItem[]>(() => {
    const items: SummaryItem[] = [
      { key: "category", label: "品类", value: CATEGORIES.find((item) => item.id === category)?.name ?? "-" },
      { key: "templateId", label: dimensionLabel(category, "template"), value: currentTemplate?.name ?? "-" },
    ];
    const variant = currentTemplate?.variants.find((item) => item.id === state.variantId);
    if (variant) items.push({ key: "variantId", label: dimensionLabel(category, "variant"), value: variantLabel(category, variant) });
    if (isCrystal) {
      const names = [...new Set(state.beadMaterialIds.map((id) => byId(MATERIALS, id)?.name).filter(Boolean))];
      items.push({ key: "beadPatternId", label: "晶石组合", value: names.join(" · ") || "白水晶" });
    } else if (isStructureBased) {
      const material = byId(MATERIALS, state.chainMaterialId);
      if (material) items.push({ key: "chainMaterialId", label: dimensionLabel(category, "baseMat"), value: material.name, swatch: material.baseColor });
    }
    if (state.pendantId) {
      const pendant = byId(CATALOG_PENDANTS, state.pendantId);
      const material = byId(MATERIALS, state.pendantMaterialId);
      if (pendant) items.push({ key: "pendantId", label: "主件", value: pendant.name });
      if (material) items.push({ key: "pendantMaterialId", label: "主件材质", value: material.name, swatch: material.baseColor });
    }
    if (hasStone) {
      const stone = byId(MATERIALS, state.stoneMaterialId);
      if (stone) items.push({ key: "stoneMaterialId", label: "主石", value: stone.name, swatch: stone.baseColor });
    }
    if (!isStructureBased) {
      const metal = byId(MATERIALS, state.metalMaterialId);
      if (metal) items.push({ key: "metalMaterialId", label: "金属", value: metal.name, swatch: metal.baseColor });
    }
    items.push({ key: "surface", label: "工艺", value: state.surface.glossiness > 0.75 ? "高光镜面" : state.surface.glossiness < 0.3 ? "细腻磨砂" : "柔和缎面" });
    if (state.engravingText.trim()) items.push({ key: "engravingText", label: "刻字", value: state.engravingText.trim() });
    return items;
  }, [category, currentTemplate, hasStone, isCrystal, isStructureBased, state]);

  const productionSpec = useMemo(() => {
    const variant = currentTemplate?.variants.find((item) => item.id === state.variantId);
    const material = byId(MATERIALS, isStructureBased ? state.chainMaterialId : state.metalMaterialId);
    const stoneCount = currentTemplate?.stoneCount ?? 0;
    const chainVariant = variant as ChainVariant | undefined;
    const ringVariant = variant as RingVariant | undefined;
    const earringVariant = variant as EarringVariant | undefined;
    const code = ({ ring: "RG", bangle: "BG", necklace: "NK", earring: "ER", bracelet: "BR" } as const)[category];
    const sku = `${code}-${state.templateId}-${state.variantId}-${material?.id ?? "NA"}`.toUpperCase();
    let size = variant ? variantLabel(category, variant) : "待确认";
    let structure = "金属主体 · 工厂按确认版 CAD 制作";
    let weight = "下单后由 CAD 核算";
    let qc = "尺寸、表面与刻字内容需在投产前复核";

    if (category === "ring" && ringVariant) {
      const width = Math.round(((currentTemplate as { bandWidthRatio?: number })?.bandWidthRatio ?? 0.14) * 20 * 10) / 10;
      size = `${ringVariant.sizeNo}号 · 内径 ${ringVariant.innerDiameterMm.toFixed(1)}mm · 戒臂约 ${width}mm`;
      weight = `${(2.4 + width * 0.65 + stoneCount * 0.12).toFixed(1)}–${(3.1 + width * 0.8 + stoneCount * 0.16).toFixed(1)}g`;
      qc = "戒号需使用标准戒圈复核；镶石款确认主石实测尺寸后开镶口";
    } else if (category === "bangle" && chainVariant) {
      size = `内径 ${chainVariant.lengthCm}mm`;
      weight = material?.family === "jade" ? "约 28–48g（按料胚实测）" : "约 12–24g（CAD 核算）";
      qc = "闭口镯须确认手掌最宽处；开口镯须确认手腕宽度与开口方向";
    } else if (category === "necklace" && chainVariant) {
      size = `成品链长 ${chainVariant.lengthCm}cm${chainVariant.beadCount ? ` · ${chainVariant.beadCount}颗` : ""}`;
      structure = chainVariant.beadCount ? "珠串线材 + 金属扣头 + 双保险收尾" : "金属链身 + 龙虾扣/弹簧扣";
      weight = chainVariant.beadCount ? "按珠材实称，金属配件另计" : "约 2.5–12g（随链宽变化）";
      qc = "确认净链长是否包含扣头；吊坠孔径必须大于链头最大外径";
    } else if (category === "earring" && earringVariant) {
      size = `成对制作 · 单只垂坠/直径 ${earringVariant.dropMm}mm`;
      structure = state.templateId === "stud" ? "耳针 + 耳堵 · 成对" : state.templateId === "hoop" ? "铰链耳圈 · 成对" : "耳针主体 + 垂坠连接环 · 左右镜像";
      weight = `约 ${(1.2 + earringVariant.dropMm * 0.035).toFixed(1)}–${(1.8 + earringVariant.dropMm * 0.05).toFixed(1)}g/对`;
      qc = "成对校验重量差、垂坠长度与左右方向；单只重量建议不超过 6g";
    } else if (category === "bracelet" && chainVariant) {
      size = variantLabel(category, chainVariant);
      structure = chainVariant.beadCount ? `${chainVariant.beadDiameterMm ?? 8}mm 珠 × ${chainVariant.beadCount} · 0.8mm 弹力线双股收尾` : "金属链节 + 扣头";
      weight = chainVariant.beadCount ? "按珠材批次实称，预留 2 颗售后备珠" : "约 4–15g（随链宽变化）";
      qc = "下单必须填写贴腕/标准/宽松偏好；天然珠允许合理色差与纹理差异";
    }

    const leadTime = material?.id === "silver-925" ? "7–10 个工作日" : material?.family === "jade" || material?.family === "pearl" || material?.family === "crystal" ? "7–14 个工作日" : "12–18 个工作日";
    return { sku, size, material: material?.name ?? "待确认", stoneCount, structure, weight, leadTime, qc };
  }, [category, currentTemplate, isStructureBased, state]);

  const saveDesign = useCallback(() => {
    localStorage.setItem(`bead-lab-3d-${category}`, JSON.stringify(state));
    notify("作品已保存");
  }, [category, notify, state]);

  const randomize = useCallback(() => {
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    const template = pick(templates);
    if (!template) return;
    const pendant = allowsPendant && Math.random() > 0.25 ? pick(compatiblePendants(category))?.id ?? null : null;
    const material = pick(compatibleChainMaterials(category, template.id));
    const pendantMaterial = pendant ? pick(compatiblePendantMaterials(pendant)) : undefined;
    const surfaces = [{ glossiness: 0.9, clarity: 0.9 }, { glossiness: 0.55, clarity: 0.7 }, { glossiness: 0.2, clarity: 0.55 }];
    const nextVariant = pick(template.variants);
    const crystalTemplate = category === "bracelet" && template.id.startsWith("crystal-");
    const pattern = pick([...CRYSTAL_PATTERNS]);
    const beadCount = (nextVariant as ChainVariant | undefined)?.beadCount ?? 16;
    update({
      templateId: template.id,
      variantId: nextVariant?.id ?? "",
      pendantId: pendant,
      chainMaterialId: material?.id ?? state.chainMaterialId,
      pendantMaterialId: pendantMaterial?.id ?? state.pendantMaterialId,
      stoneMaterialId: pick(STONE_MATERIALS)?.id ?? state.stoneMaterialId,
      metalMaterialId: pick(METAL_MATERIALS)?.id ?? state.metalMaterialId,
      beadPatternId: crystalTemplate ? pattern.id : state.beadPatternId,
      beadMaterialIds: crystalTemplate ? crystalSequence(pattern.id, beadCount) : state.beadMaterialIds,
      surface: pick(surfaces),
      engravingText: "",
    });
    notify("已生成一款新组合");
  }, [allowsPendant, category, notify, state, templates, update]);

  const capturePreview = useCallback(async () => {
    const viewer = canvasRef.current?.querySelector("model-viewer") as unknown as { toBlob?: (options: { idealAspect: boolean }) => Promise<Blob> } | null;
    if (viewer?.toBlob) {
      try { return await viewer.toBlob({ idealAspect: true }); } catch { return null; }
    }
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return null;
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  }, []);

  const downloadPreview = useCallback(async () => {
    const blob = await capturePreview();
    if (!blob) return notify("3D 预览加载完成后即可保存图片");
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stylix-${category}-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
    notify("作品图片已保存");
  }, [capturePreview, category, notify]);

  const openShare = useCallback(async () => {
    localStorage.setItem(`bead-lab-3d-${category}`, JSON.stringify(state));
    const blob = await capturePreview();
    if (sharePreview) URL.revokeObjectURL(sharePreview);
    setShareBlob(blob);
    setSharePreview(blob ? URL.createObjectURL(blob) : null);
    setShareOpen(true);
  }, [capturePreview, category, sharePreview, state]);

  const shareUrl = typeof window === "undefined" ? "" : `${window.location.origin}${window.location.pathname}?design=${encodeDesign(state)}`;
  const currentIndex = Math.max(0, dimensions.indexOf(dim));
  const isFinalStep = currentIndex === dimensions.length - 1;

  return (
    <div className="studio-shell min-h-screen text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-16 h-72 bg-[radial-gradient(ellipse_55%_70%_at_50%_0%,rgba(212,175,55,0.08),transparent)]" />
      <div className="studio-shell__inner relative mx-auto max-w-[1440px] px-4 pb-14 pt-24 sm:px-8 lg:px-12">
        <header className="studio-header mb-7 text-center">
          <p className="studio-eyebrow">STYLIX CUSTOM STUDIO</p>
          <h1 className="studio-title mt-3 font-serif">从材质开始，创造一件只属于你的作品。</h1>
          <p className="studio-lede mx-auto mt-4 max-w-xl">每一步选择都会同步为可生产规格。先定义作品，再生成一份可供设计师确认的定制方案。</p>
        </header>

        <section className="studio-trust" aria-label="Studio 能力与交付保障">
          <div><strong>5 类珠宝</strong><span>戒指、手镯、项链、耳饰与手链</span></div>
          <div><strong>规格实时联动</strong><span>尺寸、材质与 3D 预览同步更新</span></div>
          <div><strong>投产前复核</strong><span>CAD、克重与天然材质批次最终确认</span></div>
        </section>

        <div className="studio-category-nav scrollbar-none -mx-4 mb-6 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="mx-auto flex w-max min-w-full justify-center border-b border-white/10 sm:min-w-0">
            {CATEGORIES.map((item) => (
              <button key={item.id} type="button" onClick={() => { setCategory(item.id); setDim("template"); }}
                className={`relative min-w-[82px] px-5 py-3 text-sm transition-colors sm:min-w-[108px] ${category === item.id ? "text-gold" : "text-ivory-dim hover:text-ivory"}`}>
                {item.name}
                {category === item.id && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-gold" />}
              </button>
            ))}
          </div>
        </div>

        <div className="studio-workspace grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="studio-preview-column">
            <div ref={canvasRef} className="relative overflow-hidden border border-white/10 bg-[#171714] shadow-luxury">
              <JewelryPreview3D state={state} fallback={null} />
              <button type="button" onClick={randomize}
                className="absolute right-3 top-3 z-30 border border-white/10 bg-black/55 px-3 py-2 text-[10px] tracking-[0.16em] text-ivory/75 backdrop-blur-md transition-colors hover:border-gold/40 hover:text-gold">
                换个灵感
              </button>
            </div>
            {blockers.length > 0 && <div className="mt-3 border-l-2 border-red-400 bg-red-400/5 px-4 py-3 text-xs text-red-300">{blockers[0].message}</div>}
            <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-1 py-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold/65">你的作品</p>
                <h2 className="mt-1 font-serif text-2xl text-ivory">{currentTemplate?.name ?? "定制珠宝"}</h2>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ivory-dim">
                {summary.slice(2, 6).map((item) => <span key={item.key}>{item.value}</span>)}
              </div>
            </div>
          </section>

          <aside className="studio-config border border-white/10 bg-[#191916] shadow-[0_24px_80px_rgba(0,0,0,.24)] lg:sticky lg:top-20">
            <div className="border-b border-white/10 px-5 pb-4 pt-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-gold/60">Configure</p>
                  <h2 className="mt-1 font-serif text-xl">{dimensionLabel(category, dim)}</h2>
                </div>
                <span className="text-xs text-ivory-muted">{currentIndex + 1} / {dimensions.length}</span>
              </div>
              <div className="h-px bg-white/8"><div className="h-px bg-gold transition-all" style={{ width: `${((currentIndex + 1) / dimensions.length) * 100}%` }} /></div>
              <div className="scrollbar-none -mx-2 mt-3 flex overflow-x-auto">
                {dimensions.map((item) => (
                  <button key={item} type="button" onClick={() => setDim(item)}
                    className={`shrink-0 px-2 py-2 text-[11px] transition-colors ${dim === item ? "text-gold" : "text-ivory-muted hover:text-ivory"}`}>
                    {dimensionLabel(category, item)}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[250px] p-5">
              <DimPanel dim={dim} state={state} category={category} onSet={update} templates={templates}
                variants={variants} pendants={pendants} baseMaterials={baseMaterials} pendantMaterials={pendantMaterials} />
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex justify-between gap-2">
                <button type="button" disabled={currentIndex === 0} onClick={() => setDim(dimensions[currentIndex - 1])}
                  className="px-3 py-2 text-xs text-ivory-dim transition-colors hover:text-ivory disabled:opacity-20">上一步</button>
                {!isFinalStep ? (
                  <button type="button" onClick={() => setDim(dimensions[currentIndex + 1])}
                    className="bg-gold-gradient px-7 py-2.5 text-xs font-semibold text-ink transition hover:brightness-110">下一步</button>
                ) : (
                  <button type="button" onClick={saveDesign} disabled={blockers.length > 0}
                    className="studio-secondary-button px-7 py-2.5 text-xs font-medium disabled:opacity-30">保存规格草稿</button>
                )}
              </div>
              <div className="grid grid-cols-3 border-t border-white/8 pt-3">
                <button type="button" onClick={saveDesign} className="py-2 text-[11px] text-ivory-dim hover:text-gold">保存作品</button>
                <button type="button" onClick={downloadPreview} className="border-x border-white/8 py-2 text-[11px] text-ivory-dim hover:text-gold">保存图片</button>
                <button type="button" data-share-trigger onClick={openShare} className="py-2 text-[11px] text-ivory-dim hover:text-gold">分享作品</button>
              </div>
              {isFinalStep ? (
                <a href={`/vip-atelier?from=bead-lab&sku=${encodeURIComponent(productionSpec.sku)}`}
                  className="studio-designer-cta studio-designer-cta--primary mt-3 flex min-h-11 items-center justify-center px-5 text-[10px] uppercase tracking-[.2em] transition">
                  提交给设计师确认<span className="ml-3" aria-hidden="true">→</span>
                </a>
              ) : (
                <button type="button" onClick={() => setDim(dimensions[currentIndex + 1])}
                  className="studio-designer-cta mt-3 flex w-full min-h-11 items-center justify-center px-5 text-[10px] uppercase tracking-[.2em]">
                  完成配置后提交<span className="ml-3" aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </aside>
        </div>

        <section className="studio-summary mt-7 border-t border-white/10 pt-5">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {summary.map((item) => (
              <div key={item.key} className={`flex items-center gap-2 text-xs transition-colors ${changedField === item.key ? "text-gold" : "text-ivory-dim"}`}>
                <span className="text-ivory-muted">{item.label}</span>
                {item.swatch && <span className="h-3 w-3 rounded-full border border-white/15" style={{ background: item.swatch }} />}
                <span className="text-ivory/80">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="studio-spec glass-panel mt-7 border border-white/10 p-6 backdrop-blur-[20px] lg:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
            <div><p className="text-[9px] uppercase tracking-[0.28em] text-gold/65">Production specification</p><h2 className="mt-2 font-serif text-2xl text-ivory">可生产规格单</h2></div>
            <p className="font-mono text-[10px] tracking-[0.14em] text-ivory/40">SKU {productionSpec.sku}</p>
          </div>
          <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["成品尺寸", productionSpec.size], ["主材", productionSpec.material], ["结构", productionSpec.structure],
              ["石数 / 珠数", productionSpec.stoneCount ? `${productionSpec.stoneCount} 颗主石/镶石` : "见结构规格"],
              ["预估克重", productionSpec.weight], ["标准交期", productionSpec.leadTime], ["投产复核", productionSpec.qc],
            ].map(([label, value]) => <div key={label}><p className="text-[9px] uppercase tracking-[0.2em] text-ivory/30">{label}</p><p className="mt-2 text-xs leading-5 text-ivory/65">{value}</p></div>)}
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-[10px] leading-5 text-ivory/35">当前为设计预估，最终克重、石级、损耗、工费与报价以 CAD、实物选料和工厂确认单为准。</p>
        </section>
      </div>

      {notice && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-[210] -translate-x-1/2 border border-gold/25 bg-[#17181c]/95 px-5 py-3 text-xs text-gold shadow-luxury backdrop-blur">{notice}</div>}
      <ShareDesignDialog open={shareOpen} onClose={() => setShareOpen(false)} preview={sharePreview} blob={shareBlob}
        url={shareUrl} title={currentTemplate?.name ?? "我的定制珠宝"} summary={summary} notify={notify} />
    </div>
  );
}

interface DimPanelProps {
  dim: Dim;
  state: DesignState;
  category: CategoryId;
  onSet: (patch: Partial<DesignState>) => void;
  templates: ReturnType<typeof templatesFor>;
  variants: { id: string }[];
  pendants: ReturnType<typeof compatiblePendants>;
  baseMaterials: ReturnType<typeof compatibleChainMaterials>;
  pendantMaterials: ReturnType<typeof compatiblePendantMaterials>;
}

function DimPanel({ dim, state, category, onSet, templates, variants, pendants, baseMaterials, pendantMaterials }: DimPanelProps) {
  if (dim === "template") return <OptionGrid items={templates.map((item) => ({ id: item.id, label: item.name, meta: TEMPLATE_META[item.id] }))} active={state.templateId} onPick={(templateId) => {
    const selected = templates.find((item) => item.id === templateId);
    onSet({ templateId, variantId: selected?.variants[0]?.id ?? "", pendantId: null });
  }} />;
  if (dim === "variant") return <OptionGrid items={variants.map((item) => ({ id: item.id, label: variantLabel(category, item) }))} active={state.variantId} onPick={(variantId) => onSet({ variantId })} cols={2} />;
  if (dim === "pendant") return <OptionGrid items={[{ id: "__none__", label: "纯链款", meta: "不搭配主件" }, ...pendants.map((item) => ({ id: item.id, label: item.name, meta: item.engravingArea ? "支持刻字" : "经典比例" }))]} active={state.pendantId ?? "__none__"} onPick={(id) => onSet({ pendantId: id === "__none__" ? null : id })} />;
  if (dim === "baseMat") return <MaterialGrid items={baseMaterials} active={state.chainMaterialId} onPick={(chainMaterialId) => onSet({ chainMaterialId })} />;
  if (dim === "pendantMat") return <MaterialGrid items={pendantMaterials} active={state.pendantMaterialId} onPick={(pendantMaterialId) => onSet({ pendantMaterialId })} />;
  if (dim === "stoneMat") return <MaterialGrid items={STONE_MATERIALS} active={state.stoneMaterialId} onPick={(stoneMaterialId) => onSet({ stoneMaterialId })} />;
  if (dim === "metalMat") return <MaterialGrid items={METAL_MATERIALS} active={state.metalMaterialId} onPick={(metalMaterialId) => onSet({ metalMaterialId })} />;
  if (dim === "beadPalette") return <CrystalPalettePanel state={state} onSet={onSet} />;
  if (dim === "beadEditor") return <CrystalBeadEditor state={state} onSet={onSet} />;
  if (dim === "surface") return <SurfacePanel active={state.surface.glossiness} onPick={(surface) => onSet({ surface })} />;
  return <EngravingPanel value={state.engravingText} onChange={(engravingText) => onSet({ engravingText })} />;
}

function OptionGrid({ items, active, onPick, cols = 2 }: { items: { id: string; label: string; meta?: string }[]; active: string; onPick: (id: string) => void; cols?: number }) {
  return <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {items.map((item) => <button key={item.id} type="button" onClick={() => onPick(item.id)}
      aria-pressed={active === item.id}
      className={`flex min-h-[64px] items-center justify-between gap-3 rounded border px-3 py-3 text-left ${active === item.id ? "border-white/20 bg-white/[.075] text-ivory" : "border-white/8 bg-transparent text-ivory/70 hover:border-white/[.16] hover:bg-white/[.035] hover:text-ivory"}`}>
      <span><span className="block text-xs">{item.label}</span>{item.meta && <span className="mt-1 block text-[9px] text-ivory-muted">{item.meta}</span>}</span>
      <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active === item.id ? "border-[var(--ui-accent)]" : "border-white/20"}`}><span className={`h-1.5 w-1.5 rounded-full bg-[var(--ui-accent)] ${active === item.id ? "opacity-100" : "opacity-0"}`} /></span>
    </button>)}
  </div>;
}

function MaterialGrid({ items, active, onPick }: { items: { id: string; name: string; baseColor: string; textures?: string[]; description?: string; specification?: string }[]; active: string; onPick: (id: string) => void }) {
  return <div className="grid gap-2 sm:grid-cols-2">
    {items.map((item) => <button key={item.id} type="button" onClick={() => onPick(item.id)}
      className={`flex min-h-[84px] items-start gap-3 border px-3 py-3 text-left transition-all ${active === item.id ? "border-gold/55 bg-gold/8" : "border-white/8 bg-white/[0.025] hover:border-white/20"}`}>
      <span className="mt-0.5 h-10 w-10 shrink-0 rounded-full border border-white/15 shadow-inner" style={{ background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.72), ${item.baseColor} 55%, rgba(0,0,0,.45))` }} />
      <span className="min-w-0">
        <span className={`block text-xs ${active === item.id ? "text-gold" : "text-ivory/80"}`}>{item.name}</span>
        <span className="mt-1 block text-[9px] leading-4 text-ivory-muted">{item.specification ?? item.textures?.[0] ?? "经典质感"}</span>
        {item.description && <span className="mt-0.5 block text-[9px] leading-4 text-ivory/40">{item.description}</span>}
      </span>
    </button>)}
  </div>;
}

function CrystalPalettePanel({ state, onSet }: { state: DesignState; onSet: (patch: Partial<DesignState>) => void }) {
  const template = findTemplate("bracelet", state.templateId);
  const variant = template?.variants.find((item) => item.id === state.variantId) as ChainVariant | undefined;
  const count = variant?.beadCount ?? 16;

  return <div className="grid gap-2">
    {CRYSTAL_PATTERNS.map((pattern) => (
      <button key={pattern.id} type="button" onClick={() => onSet({ beadPatternId: pattern.id, beadMaterialIds: crystalSequence(pattern.id, count) })}
        className={`flex min-h-[66px] items-center justify-between gap-4 border px-3 py-3 text-left transition-all ${state.beadPatternId === pattern.id ? "border-gold/55 bg-gold/8" : "border-white/8 bg-white/[0.025] hover:border-white/20"}`}>
        <span><span className={`block text-xs ${state.beadPatternId === pattern.id ? "text-gold" : "text-ivory/80"}`}>{pattern.name}</span><span className="mt-1 block text-[9px] text-ivory-muted">{pattern.note}</span></span>
        <span className="flex shrink-0 -space-x-1">
          {pattern.materials.map((id, index) => {
            const material = byId(MATERIALS, id);
            return <span key={`${id}-${index}`} className="h-5 w-5 rounded-full border border-black/30" style={{ background: material?.baseColor }} />;
          })}
        </span>
      </button>
    ))}
    <p className="pt-2 text-[10px] leading-5 text-ivory-muted">配色均按对称、重复或渐层规则生成，选择后仍可逐颗调整。</p>
  </div>;
}

function CrystalBeadEditor({ state, onSet }: { state: DesignState; onSet: (patch: Partial<DesignState>) => void }) {
  const template = findTemplate("bracelet", state.templateId);
  const variant = template?.variants.find((item) => item.id === state.variantId) as ChainVariant | undefined;
  const count = variant?.beadCount ?? 16;
  const [activeIndex, setActiveIndex] = useState(0);
  const source = state.beadMaterialIds.length ? state.beadMaterialIds : crystalSequence("clear", count);
  const beads = Array.from({ length: count }, (_, index) => source[index % source.length]);
  const activeMaterial = byId(MATERIALS, beads[Math.min(activeIndex, count - 1)]);

  useEffect(() => {
    if (activeIndex >= count) setActiveIndex(Math.max(0, count - 1));
  }, [activeIndex, count]);

  const applyMaterial = (materialId: string) => {
    const next = [...beads];
    next[Math.min(activeIndex, count - 1)] = materialId;
    onSet({ beadPatternId: "custom", beadMaterialIds: next, chainMaterialId: materialId });
  };

  return <div>
    <div className="mb-4 flex items-end justify-between gap-3">
      <div><p className="text-xs text-ivory/80">选择珠位，再指定晶石</p><p className="mt-1 text-[9px] text-ivory-muted">当前第 {Math.min(activeIndex + 1, count)} 颗 · {activeMaterial?.name ?? "白水晶"}</p></div>
      <button type="button" onClick={() => onSet({ beadPatternId: "clear", beadMaterialIds: crystalSequence("clear", count) })} className="text-[10px] text-ivory-muted hover:text-gold">重置</button>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {beads.map((id, index) => {
        const material = byId(MATERIALS, id);
        return <button key={index} type="button" onClick={() => setActiveIndex(index)} aria-label={`选择第 ${index + 1} 颗珠子`}
          className={`aspect-square rounded-full border p-1 transition-transform hover:scale-105 ${activeIndex === index ? "border-gold ring-2 ring-gold/20" : "border-white/15"}`}>
          <span className="block h-full w-full rounded-full shadow-inner" style={{ background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,.9), ${material?.baseColor ?? "#dbe8e8"} 58%, rgba(0,0,0,.35))` }} />
        </button>;
      })}
    </div>
    <div className="mt-5 grid grid-cols-5 gap-2">
      {CRYSTAL_MATERIALS.map((material) => <button key={material.id} type="button" onClick={() => applyMaterial(material.id)} title={material.name}
        className={`flex flex-col items-center gap-1.5 border px-1 py-2 text-[9px] ${activeMaterial?.id === material.id ? "border-gold/55 text-gold" : "border-white/8 text-ivory-muted hover:border-white/20"}`}>
        <span className="h-7 w-7 rounded-full border border-white/15" style={{ background: `radial-gradient(circle at 30% 25%, white, ${material.baseColor} 62%, #222)` }} />
        <span>{material.name.replace("水晶", "晶")}</span>
      </button>)}
    </div>
  </div>;
}

function SurfacePanel({ active, onPick }: { active: number; onPick: (surface: DesignState["surface"]) => void }) {
  const options = [
    { id: "mirror", label: "高光镜面", meta: "明亮反射", surface: { glossiness: 0.9, clarity: 0.9 } },
    { id: "satin", label: "柔和缎面", meta: "细腻低闪", surface: { glossiness: 0.55, clarity: 0.7 } },
    { id: "matte", label: "细腻磨砂", meta: "克制雾光", surface: { glossiness: 0.2, clarity: 0.55 } },
  ];
  const selected = active > 0.75 ? "mirror" : active < 0.3 ? "matte" : "satin";
  return <OptionGrid items={options} active={selected} onPick={(id) => onPick(options.find((item) => item.id === id)?.surface ?? options[1].surface)} />;
}

function EngravingPanel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div>
    <label htmlFor="diy-engraving" className="mb-2 block text-xs text-ivory-dim">刻字内容</label>
    <input id="diy-engraving" value={value} maxLength={12} onChange={(event) => onChange(event.target.value)} placeholder="输入最多 12 个字符"
      className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ivory outline-none placeholder:text-ivory-muted focus:border-gold/50" />
    <div className="mt-2 flex justify-between text-[10px] text-ivory-muted"><span>支持中文、英文与数字</span><span>{value.length}/12</span></div>
  </div>;
}

function ShareDesignDialog({ open, onClose, preview, blob, url, title, summary, notify }: {
  open: boolean; onClose: () => void; preview: string | null; blob: Blob | null; url: string; title: string; summary: SummaryItem[]; notify: (message: string) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const activeElement = document.activeElement as HTMLElement | null;
    const previousFocus = activeElement && activeElement !== document.body
      ? activeElement
      : document.querySelector<HTMLElement>("[data-share-trigger]");
    const focusableSelector = "button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusable = () => [...(dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])];
    const focusTimer = window.setTimeout(() => focusable()[0]?.focus(), 0);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); notify("分享链接已复制"); } catch { notify("复制失败，请检查浏览器权限"); }
  };
  const nativeShare = async () => {
    if (!navigator.share) return copy();
    const data: ShareData = { title: `Stylix · ${title}`, text: "这是我在 Stylix 定制的珠宝作品", url };
    if (blob) {
      const file = new File([blob], `stylix-${Date.now()}.png`, { type: blob.type || "image/png" });
      if (navigator.canShare?.({ files: [file] })) data.files = [file];
    }
    try { await navigator.share(data); } catch { /* The user may cancel the native share sheet. */ }
  };
  const saveImage = () => {
    if (!preview) return notify("当前设备未生成预览图，可先复制分享链接");
    const link = document.createElement("a"); link.href = preview; link.download = `stylix-${Date.now()}.png`; link.click();
  };

  return <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="share-design-title" onClick={(event) => { if (event.currentTarget === event.target) onClose(); }}
    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
    <div className="studio-dialog grid max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-lg border border-gold/20 bg-[#111216] md:grid-cols-[1.08fr_.92fr]">
      <div className="min-h-[300px] bg-[#222329]">
        {preview ? (
          // The preview is an object URL captured directly from model-viewer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={title} className="h-full min-h-[300px] w-full object-cover" />
        ) : <div className="flex h-full min-h-[300px] items-center justify-center text-sm text-ivory-muted">3D 作品预览</div>}
      </div>
      <div className="relative flex flex-col p-6">
        <button type="button" onClick={onClose} aria-label="关闭分享" className="absolute right-4 top-4 text-xl text-ivory-muted hover:text-ivory">×</button>
        <p className="text-[9px] uppercase tracking-[0.28em] text-gold/65">My Stylix Piece</p>
        <h2 id="share-design-title" className="mt-2 font-serif text-2xl text-ivory">{title}</h2>
        <div className="mt-5 space-y-2 border-y border-white/10 py-4">
          {summary.slice(0, 7).map((item) => <div key={item.key} className="flex justify-between gap-4 text-[11px]"><span className="text-ivory-muted">{item.label}</span><span className="text-ivory/80">{item.value}</span></div>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-ivory-dim">分享链接会保留这件作品的全部选择，好友打开后可以继续查看和搭配。</p>
        <div className="mt-auto grid gap-2 pt-6">
          <button type="button" onClick={nativeShare} className="bg-gold-gradient py-3 text-xs font-semibold text-ink hover:brightness-110">分享作品</button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={copy} className="border border-white/10 py-3 text-[11px] text-ivory-dim hover:border-gold/30 hover:text-gold">复制链接</button>
            <button type="button" onClick={saveImage} className="border border-white/10 py-3 text-[11px] text-ivory-dim hover:border-gold/30 hover:text-gold">保存图片</button>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
