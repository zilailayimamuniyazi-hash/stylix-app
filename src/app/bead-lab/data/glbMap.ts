import type { DesignState } from "./types";

const CHAIN_GLB: Record<string, string> = {
  "silk-necklace": "necklace_silk_studio",
  "solitaire-necklace": "necklace_solitaire_studio",
  "medallion-necklace": "necklace_medallion_studio",
  "floral-necklace": "necklace_floral_studio",
  "jade-bead": "necklace_jade_bead_studio",
  "pearl-chain": "necklace_pearl_studio",
  "cuban-necklace": "necklace_cuban_studio",
  "jade-bracelet": "bracelet_jade_studio",
  "pearl-bracelet": "bracelet_pearl_studio",
  "crystal-bracelet": "bracelet_crystal_studio",
  "jade-bangle": "bangle_58",
  "slim-bangle": "bangle_slim",
  "open-bangle": "bangle_open",
  "floral-bangle": "bangle_floral",
};

const RING_GLB: Record<string, string> = {
  "plain-band": "ring_plain_studio",
  "wide-band": "ring_wide_studio",
  "solitaire-ring": "solitaire_ring_studio",
  "halo-ring": "ring_halo_studio",
  "three-stone-ring": "ring_three_stone_studio",
  "eternity-ring": "ring_eternity_studio",
  "open-ring": "ring_open_studio",
};

const EARRING_GLB: Record<string, string> = {
  stud: "earring_stud_studio",
  drop: "earring_drop_studio",
  hoop: "earring_hoop_studio",
};

const PENDANT_GLB: Record<string, string> = {
  pingan: "pingankou_35",
  fupai: "fupai_22",
  ruyi: "pingankou_40",
  leaf: "leaf_34",
  gourd: "gourd_30",
  solitaire: "solitaire_12",
  bamboo: "bamboo_34",
  ingot: "ingot_28",
  wushipai: "wushipai_25",
};

export interface GlbScene {
  primary: string;
  isPartial?: boolean;
}

const COMPOSED_MODELS = new Set([
  "bead_necklace_22", "box_chain_46", "bracelet_16", "cuban_chain_34",
  "figaro_chain_11", "o_chain_40", "snake_chain",
].flatMap((chain) => [
  "bamboo_34", "fupai_22", "gourd_30", "ingot_28", "leaf_34",
  "pingankou_35", "pingankou_40", "wushipai_25",
].map((pendant) => `composed_${chain}_${pendant}.glb`)));

/**
 * Resolves DesignState to a GLB scene.
 * When a pendant is selected on a chain, returns the pre-composed GLB.
 * Falls back to separate pendant if composed file doesn't exist.
 */
export function resolveGlbScene(state: DesignState): GlbScene | null {
  let primaryName: string | undefined;

  switch (state.category) {
    case "necklace":
    case "bracelet":
    case "bangle":
      primaryName = CHAIN_GLB[state.templateId];
      break;
    case "ring":
      primaryName = RING_GLB[state.templateId];
      break;
    case "earring":
      primaryName = EARRING_GLB[state.templateId];
      break;
  }

  if (!primaryName) return null;

  if (state.pendantId && (state.category === "necklace" || state.category === "bracelet")) {
    const pendantFile = PENDANT_GLB[state.pendantId];
    if (pendantFile) {
      const composedName = `composed_${primaryName}_${pendantFile}.glb`;
      if (COMPOSED_MODELS.has(composedName)) return { primary: `/models/${composedName}` };
      // Never request a model that is not shipped. Keep the base piece usable while
      // signalling that this selected component still needs a production render.
      return { primary: `/models/${primaryName}.glb`, isPartial: true };
    }
  }

  return {
    primary: `/models/${primaryName}.glb`,
  };
}
