import {
  MATERIALS, PENDANTS, byId, findTemplate, COMPOSITION,
} from "./catalog";
import type { DesignState, ComplianceIssue, CategoryId } from "./types";

export function compatiblePendants(category: CategoryId) {
  return PENDANTS.filter((p) => p.contract.mountsOn.includes(category));
}

export function compatibleChainMaterials(category: CategoryId, templateId: string) {
  const tpl = findTemplate(category, templateId);
  if (!tpl) return [];
  return MATERIALS.filter((m) => tpl.contract.materialFamilies.includes(m.family));
}

export function compatiblePendantMaterials(pendantId: string | null) {
  if (!pendantId) return [];
  const p = byId(PENDANTS, pendantId);
  if (!p) return [];
  return MATERIALS.filter((m) => p.contract.materialFamilies.includes(m.family));
}

export const STONE_MATERIALS = MATERIALS.filter((m) => m.family === "gem");
export const METAL_MATERIALS = MATERIALS.filter((m) => m.family === "metal");

export function validate(state: DesignState): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  const tpl = findTemplate(state.category, state.templateId);
  const variant = tpl?.variants.find((v) => v.id === state.variantId);

  if (!tpl || !variant) {
    issues.push({ code: "NO_TEMPLATE", level: "block", message: "未选择合规模板或规格变体" });
    return issues;
  }

  if (tpl.designLanguages && !tpl.designLanguages.includes(state.designLanguage)) {
    issues.push({
      code: "DL_INCOMPAT", level: "warn",
      message: `${tpl.name} 未预设「${state.designLanguage}」设计语言`,
    });
  }

  if (state.category === "necklace" || state.category === "bracelet" || state.category === "bangle") {
    const chainMat = byId(MATERIALS, state.chainMaterialId);
    if (chainMat && !tpl.contract.materialFamilies.includes(chainMat.family)) {
      issues.push({
        code: "CHAIN_MAT_INCOMPAT", level: "block",
        message: `${chainMat.name} 不在 ${tpl.name} 的兼容材质族内`,
      });
    }
  }

  if (state.category === "ring" || state.category === "earring" || state.category === "bangle") {
    const stone = byId(MATERIALS, state.stoneMaterialId);
    if (stone && stone.family !== "gem") {
      issues.push({ code: "STONE_NOT_GEM", level: "block", message: `主石必须为宝石族` });
    }
  }

  const pendant = state.pendantId ? byId(PENDANTS, state.pendantId) : null;
  if (pendant) {
    if (!pendant.contract.mountsOn.includes(state.category)) {
      issues.push({ code: "PENDANT_MOUNT_INCOMPAT", level: "block", message: `${pendant.name} 不可挂载到当前品类` });
    }
    const pMat = byId(MATERIALS, state.pendantMaterialId);
    if (pMat && !pendant.contract.materialFamilies.includes(pMat.family)) {
      issues.push({ code: "PENDANT_MAT_INCOMPAT", level: "block", message: `${pMat.name} 不在 ${pendant.name} 的兼容材质族内` });
    }
    if (!pendant.designLanguages.includes(state.designLanguage)) {
      issues.push({ code: "PENDANT_DL_INCOMPAT", level: "warn", message: `${pendant.name} 未预设「${state.designLanguage}」设计语言` });
    }
    const estRatio = 0.16 * pendant.sizeVariants.necklace;
    if (estRatio < COMPOSITION.pendantWidthPct.min - 0.001 || estRatio > COMPOSITION.pendantWidthPct.max + 0.001) {
      issues.push({ code: "PENDANT_RATIO", level: "warn", message: "吊坠视宽占比超出黄金区间" });
    }
    if (state.engravingText.trim() && !pendant.engravingArea) {
      issues.push({ code: "NO_ENGRAVE_AREA", level: "warn", message: `${pendant.name} 无预设雕刻区域` });
    }
  }

  return issues;
}

export const blockingIssues = (issues: ComplianceIssue[]) =>
  issues.filter((i) => i.level === "block");
