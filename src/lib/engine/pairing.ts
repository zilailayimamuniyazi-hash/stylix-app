import type { Product } from "@/lib/types/product";
import type { JewelryCategory, StyleTag } from "@/lib/types/product";

export interface PairingResult {
  product: Product;
  reason: string;
  confidence: number;
}

const CATEGORY_PAIR_TARGETS: Record<JewelryCategory, JewelryCategory[]> = {
  rings: ["necklaces", "earrings"],
  necklaces: ["earrings", "bracelets"],
  earrings: ["rings", "necklaces"],
  bracelets: ["necklaces", "earrings", "rings"],
};

const COLLECTION_CONFIDENCE = 0.92;
const METAL_CONFIDENCE = 0.72;
const STYLE_CONFIDENCE = 0.58;
const CATEGORY_CONFIDENCE = 0.45;

function normalizeStyle(tag: StyleTag): StyleTag {
  return tag === "minimalist" ? "minimal" : tag;
}

function styleOverlap(a: StyleTag[], b: StyleTag[]): string[] {
  const setA = new Set(a.map(normalizeStyle));
  return b.filter((tag) => setA.has(normalizeStyle(tag)));
}

function metalsMatch(a: Product, b: Product): boolean {
  const toneA = a.tags.metalTone;
  const toneB = b.tags.metalTone;
  if (toneA === toneB) return true;
  if (toneA === "mixed" || toneB === "mixed") return true;

  const matA = a.material.toLowerCase();
  const matB = b.material.toLowerCase();
  const goldInA = matA.includes("gold");
  const goldInB = matB.includes("gold");
  const silverInA = matA.includes("silver") || matA.includes("white gold") || matA.includes("platinum");
  const silverInB = matB.includes("silver") || matB.includes("white gold") || matB.includes("platinum");
  if (goldInA && goldInB) return true;
  if (silverInA && silverInB) return true;
  return false;
}

function isComplementaryCategory(owned: Product, candidate: Product): boolean {
  return CATEGORY_PAIR_TARGETS[owned.category]?.includes(candidate.category) ?? false;
}

function buildReason(
  owned: Product,
  candidate: Product,
  matchType: "collection" | "metal" | "style"
): string {
  switch (matchType) {
    case "collection":
      return `Matches ${owned.name} in the ${candidate.tags.collectionName} collection`;
    case "metal": {
      const tone = candidate.tags.metalTone;
      const toneLabel =
        tone === "gold"
          ? "gold tone"
          : tone === "silver"
            ? "silver tone"
            : tone === "rose-gold"
              ? "rose gold tone"
              : "mixed-metal finish";
      return `Same ${toneLabel} as ${owned.name}`;
    }
    case "style": {
      const shared = styleOverlap(owned.tags.styleTags, candidate.tags.styleTags);
      const label = shared[0] ?? "complementary";
      return `${label.charAt(0).toUpperCase() + label.slice(1)} style pairs with your ${owned.category.slice(0, -1)}`;
    }
  }
}

function scoreCandidate(owned: Product, candidate: Product): PairingResult | null {
  if (owned.id === candidate.id) return null;
  if (!isComplementaryCategory(owned, candidate)) return null;

  const sameCollection = owned.tags.collectionName === candidate.tags.collectionName;
  const metalMatch = metalsMatch(owned, candidate);
  const sharedStyles = styleOverlap(owned.tags.styleTags, candidate.tags.styleTags);
  const hasStyleMatch = sharedStyles.length > 0;

  if (sameCollection) {
    return {
      product: candidate,
      reason: buildReason(owned, candidate, "collection"),
      confidence: COLLECTION_CONFIDENCE + Math.min(sharedStyles.length * 0.02, 0.06),
    };
  }

  if (metalMatch) {
    return {
      product: candidate,
      reason: buildReason(owned, candidate, "metal"),
      confidence: METAL_CONFIDENCE + (hasStyleMatch ? 0.05 : 0),
    };
  }

  if (hasStyleMatch) {
    return {
      product: candidate,
      reason: buildReason(owned, candidate, "style"),
      confidence: STYLE_CONFIDENCE + Math.min(sharedStyles.length * 0.03, 0.09),
    };
  }

  return {
    product: candidate,
    reason: `Completes your look alongside ${owned.name}`,
    confidence: CATEGORY_CONFIDENCE,
  };
}

/**
 * Rule-based pairing engine — recommends complementary jewelry based on owned/wishlisted pieces.
 */
export function getPairingRecommendations(
  ownedProducts: Product[],
  allProducts: Product[],
  maxResults = 6
): PairingResult[] {
  if (ownedProducts.length === 0) return [];

  const ownedIds = new Set(ownedProducts.map((p) => p.id));
  const candidates = allProducts.filter((p) => !ownedIds.has(p.id));

  const bestByProduct = new Map<string, PairingResult>();

  for (const owned of ownedProducts) {
    for (const candidate of candidates) {
      const scored = scoreCandidate(owned, candidate);
      if (!scored) continue;

      const existing = bestByProduct.get(candidate.id);
      if (!existing || scored.confidence > existing.confidence) {
        bestByProduct.set(candidate.id, scored);
      }
    }
  }

  const minResults = Math.min(4, bestByProduct.size);
  const limit = Math.max(minResults, Math.min(maxResults, bestByProduct.size));

  return Array.from(bestByProduct.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
