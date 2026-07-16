export type CategoryId = "ring" | "bangle" | "necklace" | "earring" | "bracelet";

export type DesignLanguage = "classic" | "modern" | "luxury" | "minimal";

export interface MaterialShader {
  id: string;
  name: string;
  family: "jade" | "gem" | "metal" | "pearl" | "crystal";
  baseColor: string;
  roughness: number;
  metalness: number;
  ior: number;
  reflection: number;
  sss: number;
  transparency: number;
  textures: string[];
  description?: string;
  specification?: string;
}

export interface CompatibilityContract {
  mountsOn: CategoryId[];
  materialFamilies: MaterialShader["family"][];
  claspIds?: string[];
}

export interface PendantComponent {
  id: string;
  name: string;
  aspectRatio: number;
  designLanguages: DesignLanguage[];
  engravingArea: boolean;
  contract: CompatibilityContract;
  sizeVariants: { necklace: number; bracelet: number };
}

export interface ChainVariant {
  id: string;
  beadCount?: number;
  beadDiameterMm?: number;
  lengthCm: number;
  gravity: { sag: number; liftSide: number };
}

export interface ChainTemplate {
  id: string;
  name: string;
  category: CategoryId;
  thicknessRatio: number;
  variants: ChainVariant[];
  contract: CompatibilityContract;
  beaded: boolean;
  engravingArea?: boolean;
  stoneCount?: number;
}

export interface RingVariant {
  id: string;
  sizeNo: number;
  innerDiameterMm: number;
}

export interface RingTemplate {
  id: string;
  name: string;
  category: "ring";
  bandWidthRatio: number;
  setting: "none" | "prong" | "halo" | "three-stone";
  prongCount: number;
  stoneCount: number;
  hasHalo: boolean;
  designLanguages: DesignLanguage[];
  engravingArea: boolean;
  variants: RingVariant[];
  contract: CompatibilityContract;
}

export interface EarringVariant {
  id: string;
  dropMm: number;
}

export interface EarringTemplate {
  id: string;
  name: string;
  category: "earring";
  style: "stud" | "drop" | "hoop";
  hasPendant: boolean;
  stoneCount: number;
  designLanguages: DesignLanguage[];
  variants: EarringVariant[];
  contract: CompatibilityContract;
}

export interface ClaspComponent {
  id: string;
  name: string;
  fitsCategories: CategoryId[];
}

export interface DesignState {
  category: CategoryId;
  templateId: string;
  variantId: string;
  pendantId: string | null;
  designLanguage: DesignLanguage;
  chainMaterialId: string;
  pendantMaterialId: string;
  stoneMaterialId: string;
  metalMaterialId: string;
  engravingText: string;
  spacerMaterialId: string;
  beadPatternId: string;
  beadMaterialIds: string[];
  surface: { glossiness: number; clarity: number };
}

export interface ComplianceIssue {
  code: string;
  level: "block" | "warn";
  message: string;
}
