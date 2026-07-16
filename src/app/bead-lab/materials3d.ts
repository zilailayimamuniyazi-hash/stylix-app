import type { MaterialShader } from "./data/types";

function hexToRgba(hex: string): [number, number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return [r, g, b, 1.0];
}

interface ModelViewerMaterial {
  name: string;
  pbrMetallicRoughness: {
    baseColorFactor: { r: number; g: number; b: number; a: number };
    setBaseColorFactor(rgba: [number, number, number, number]): void;
    setMetallicFactor(v: number): void;
    setRoughnessFactor(v: number): void;
  };
}

interface ModelViewerModel {
  materials: ModelViewerMaterial[];
}

interface ModelViewerElement extends HTMLElement {
  model?: ModelViewerModel;
}

/**
 * Apply a MaterialShader's PBR properties to all materials in a model-viewer element.
 * Call after the model-viewer 'load' event fires.
 */
export function applyMaterial(
  viewer: ModelViewerElement | null,
  shader: MaterialShader,
  surface: { glossiness: number; clarity: number },
) {
  if (!viewer?.model?.materials) return;

  const rgba = hexToRgba(shader.baseColor);
  const effectiveRoughness = Math.max(0, Math.min(1, shader.roughness * (1 - surface.glossiness * 0.5)));

  for (const mat of viewer.model.materials) {
    try {
      mat.pbrMetallicRoughness.setBaseColorFactor(rgba);
      mat.pbrMetallicRoughness.setMetallicFactor(shader.metalness);
      mat.pbrMetallicRoughness.setRoughnessFactor(effectiveRoughness);
    } catch {
      // some materials may not support all operations
    }
  }
}

/**
 * Preserve the physical distinction between a setting and its stones whenever
 * the source GLB exposes named material slots. Older single-material assets
 * still receive the primary material as a graceful fallback.
 */
export function applyDesignMaterials(
  viewer: ModelViewerElement | null,
  materials: { primary: MaterialShader; stone?: MaterialShader; pendant?: MaterialShader; accent?: MaterialShader },
  surface: { glossiness: number; clarity: number },
) {
  if (!viewer?.model?.materials) return;

  let hasNamedSlots = false;
  for (const mat of viewer.model.materials) {
    const name = mat.name.toLowerCase();
    const shader = (/accentgold/.test(name) ? materials.accent
      : /(diamond|stone|gem)/.test(name) ? materials.stone
      : /pendant/.test(name) ? materials.pendant
      : /metal|band|chain|gallery|prong|bead|pearl|jade|crystal/.test(name) ? materials.primary
      : undefined);
    if (!shader) continue;
    hasNamedSlots = true;
    const rgba = hexToRgba(shader.baseColor);
    const roughness = Math.max(0, Math.min(1, shader.roughness * (1 - surface.glossiness * 0.5)));
    try {
      mat.pbrMetallicRoughness.setBaseColorFactor(rgba);
      mat.pbrMetallicRoughness.setMetallicFactor(shader.metalness);
      mat.pbrMetallicRoughness.setRoughnessFactor(roughness);
    } catch {
      // Ignore non-PBR materials exposed by a viewer implementation.
    }
  }
  if (!hasNamedSlots) applyMaterial(viewer, materials.primary, surface);
}

/**
 * Apply material to a specific extra-model in the scene.
 * model-viewer exposes extra models as additional materials in the same model array,
 * typically appended after the primary model's materials.
 */
export function applyMaterialByIndex(
  viewer: ModelViewerElement | null,
  shader: MaterialShader,
  surface: { glossiness: number; clarity: number },
  startIndex: number,
) {
  if (!viewer?.model?.materials) return;

  const rgba = hexToRgba(shader.baseColor);
  const effectiveRoughness = Math.max(0, Math.min(1, shader.roughness * (1 - surface.glossiness * 0.5)));

  for (let i = startIndex; i < viewer.model.materials.length; i++) {
    try {
      const mat = viewer.model.materials[i];
      mat.pbrMetallicRoughness.setBaseColorFactor(rgba);
      mat.pbrMetallicRoughness.setMetallicFactor(shader.metalness);
      mat.pbrMetallicRoughness.setRoughnessFactor(effectiveRoughness);
    } catch {
      // silently skip incompatible materials
    }
  }
}
