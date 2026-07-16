"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { runAdvisor } from "@/lib/services/advisor-orchestrator";
import { PairingRecommendations } from "@/components/product/PairingRecommendations";
import type { AdvisorInput } from "@/lib/engine/recommendation";
import type { JewelryCategory, MoodTag, OccasionTag, StyleTag } from "@/lib/types/product";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/context";
import { uploadImage } from "@/lib/utils/upload";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";

const occasions: OccasionTag[] = [
  "black-tie",
  "wedding guest",
  "date night",
  "work",
  "casual brunch",
  "holiday gift",
];

const styles: StyleTag[] = [
  "classic",
  "elegant",
  "bold",
  "romantic",
  "celestial",
  "minimalist",
];

const moods: MoodTag[] = [
  "confident",
  "dreamy",
  "sensual",
  "polished",
  "playful",
  "powerful",
];

const budgetTiers = [1, 2, 3, 4] as const;

const categoryKeys: (JewelryCategory | "all")[] = [
  "all",
  "rings",
  "necklaces",
  "earrings",
  "bracelets",
];

const identityArchetypes: Record<StyleTag, Record<MoodTag, string>> = {
  classic: {
    confident: "The Refined Authority",
    dreamy: "The Timeless Romantic",
    sensual: "The Understated Seductress",
    polished: "The Quiet Perfectionist",
    playful: "The Considered Wit",
    powerful: "The Classic Commander",
  },
  elegant: {
    confident: "The Elevated Presence",
    dreamy: "The Soft Luminary",
    sensual: "The Graceful Muse",
    polished: "The Flawless Edit",
    playful: "The Elegant Rebel",
    powerful: "The Sovereign",
  },
  bold: {
    confident: "The Statement Maker",
    dreamy: "The Visionary",
    sensual: "The Magnetic Force",
    polished: "The Architectural Mind",
    playful: "The Rule Breaker",
    powerful: "The Icon",
  },
  romantic: {
    confident: "The Warm Protagonist",
    dreamy: "The Celestial Dreamer",
    sensual: "The Velvet Energy",
    polished: "The Curated Heart",
    playful: "The Soft Adventurer",
    powerful: "The Passionate Force",
  },
  celestial: {
    confident: "The Star-Guided",
    dreamy: "The Cosmic Wanderer",
    sensual: "The Moon-Touched",
    polished: "The Constellation Collector",
    playful: "The Cosmic Curious",
    powerful: "The Celestial Guardian",
  },
  minimalist: {
    confident: "The Essential",
    dreamy: "The Quiet Poet",
    sensual: "The Still Water",
    polished: "The Precision Edit",
    playful: "The Subversive Minimalist",
    powerful: "The Restrained Force",
  },
  minimal: {
    confident: "The Essential",
    dreamy: "The Quiet Poet",
    sensual: "The Still Water",
    polished: "The Precision Edit",
    playful: "The Subversive Minimalist",
    powerful: "The Restrained Force",
  },
};

function getIdentityArchetype(style: StyleTag, mood: MoodTag): string {
  return identityArchetypes[style]?.[mood] ?? "Celestial Minimalist";
}

const materialSuggestions: Record<StyleTag, string> = {
  classic: "18K yellow gold, white diamond, polished platinum",
  elegant: "18K champagne gold, freshwater pearl, moissanite",
  bold: "Oxidized silver, black onyx, statement moissanite",
  romantic: "18K rose gold, freshwater pearl, pink sapphire",
  celestial: "Sterling silver, moonstone, labradorite, dark rhodium",
  minimalist: "Sterling silver, brushed gold, white moissanite",
  minimal: "Sterling silver, brushed gold, white moissanite",
};

export function AdvisorClient() {
  const { t, locale } = useI18n();
  const a = t.advisor;

  const [occasion, setOccasion] = useState<OccasionTag>("date night");
  const [style, setStyle] = useState<StyleTag>("elegant");
  const [mood, setMood] = useState<MoodTag>("polished");
  const [zodiac, setZodiac] = useState<string>("");
  const [budgetTier, setBudgetTier] = useState<1 | 2 | 3 | 4 | undefined>(undefined);
  const [jewelryCategory, setJewelryCategory] = useState<JewelryCategory | "all">("all");
  const [outfitName, setOutfitName] = useState<string | null>(null);
  const [outfitPreview, setOutfitPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [result, setResult] = useState<ReturnType<typeof runAdvisor> | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: AdvisorInput = {
      occasion,
      style,
      mood,
      budgetTier: budgetTier,
      jewelryCategory: jewelryCategory === "all" ? undefined : jewelryCategory,
    };
    track({ event_name: EVENTS.ADVISOR_SUBMIT, tool_name: "ai-advisor" });
    const r = runAdvisor(input);
    setResult(r);
    if (r) track({ event_name: EVENTS.ADVISOR_RESULT_VIEW, tool_name: "ai-advisor" });
  }

  const mainPick = result?.recommendations[0] ?? null;
  const supportingPicks = result?.recommendations.slice(1) ?? [];
  const identityArchetype = result ? getIdentityArchetype(style, mood) : null;
  const suggestedMaterial = result ? (materialSuggestions[style] ?? materialSuggestions.elegant) : null;

  const advisorOwnedProducts = useMemo(
    () => result?.recommendations.map((r) => r.product) ?? [],
    [result]
  );

  return (
    <div className="ui-page pt-24">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="border-b border-ivory/10 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="ui-eyebrow">{a.eyebrow}</p>
          <h1 className="ui-title mt-4">{a.title}</h1>
          <p className="ui-copy mt-6 max-w-2xl">
            {a.subtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-12 lg:px-10">
        {/* ── Form ────────────────────────────────────────────────────── */}
        <form onSubmit={onSubmit} className="space-y-10 lg:col-span-4">

          {/* Zodiac */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.zodiacLabel}</label>
            <select
              aria-label={a.zodiacLabel}
              value={zodiac}
              onChange={(e) => setZodiac(e.target.value)}
              className="ui-field mt-3"
            >
              <option value="">{a.zodiacNone}</option>
              {a.zodiacSigns.map((sign) => (
                <option key={sign} value={sign}>{sign}</option>
              ))}
            </select>
          </div>

          {/* Occasion */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.occasionLabel}</label>
            <select
              aria-label={a.occasionLabel}
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as OccasionTag)}
              className="ui-field mt-3"
            >
              {occasions.map((o) => (
                <option key={o} value={o}>{a.occasionLabels[o] ?? o}</option>
              ))}
            </select>
          </div>

          {/* Style / Aesthetic */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.styleLabel}</label>
            <select
              aria-label={a.styleLabel}
              value={style}
              onChange={(e) => setStyle(e.target.value as StyleTag)}
              className="ui-field mt-3"
            >
              {styles.map((s) => (
                <option key={s} value={s}>{a.styleLabels[s] ?? s}</option>
              ))}
            </select>
          </div>

          {/* Mood */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.moodLabel}</label>
            <select
              aria-label={a.moodLabel}
              value={mood}
              onChange={(e) => setMood(e.target.value as MoodTag)}
              className="ui-field mt-3"
            >
              {moods.map((m) => (
                <option key={m} value={m}>{a.moodLabels[m] ?? m}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.budgetLabel}</label>
            <select
              aria-label={a.budgetLabel}
              value={budgetTier ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setBudgetTier(v === "" ? undefined : (Number(v) as 1 | 2 | 3 | 4));
              }}
              className="ui-field mt-3"
            >
              <option value="">{a.noPreference}</option>
              {budgetTiers.map((tier, i) => (
                <option key={tier} value={tier}>{a.budgets[i]}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.categoryLabel}</label>
            <select
              aria-label={a.categoryLabel}
              value={jewelryCategory}
              onChange={(e) => setJewelryCategory(e.target.value as JewelryCategory | "all")}
              className="ui-field mt-3"
            >
              {categoryKeys.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? a.allCategories : (a.categoryLabels[c] ?? c)}
                </option>
              ))}
            </select>
          </div>

          {/* Outfit upload */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.outfitLabel}</label>
            <input
              aria-label={a.outfitLabel}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setUploadError(null);
                setUploading(true);
                setOutfitName(f.name);
                setOutfitPreview(URL.createObjectURL(f));
                const res = await uploadImage(f);
                setUploading(false);
                if (!res.ok) setUploadError(res.error.message);
              }}
              className="mt-3 block w-full text-sm text-ivory-dim file:mr-4 file:border file:border-gold/40 file:bg-transparent file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-widest file:text-gold"
            />
            {uploading && (
              <p className="mt-2 text-xs text-ivory-dim animate-pulse">Uploading…</p>
            )}
            {uploadError && (
              <p className="mt-2 text-xs text-red-400">{uploadError}</p>
            )}
            {outfitPreview && !uploadError && (
              <div className="mt-3 relative aspect-[4/3] w-full overflow-hidden border border-ivory/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={outfitPreview} alt="Outfit preview" className="h-full w-full object-cover" />
              </div>
            )}
            {outfitName && !outfitPreview && (
              <p className="mt-2 text-xs text-ivory-dim">{outfitName} — {a.outfitNote}</p>
            )}
          </div>

          <Button type="submit">{a.submit}</Button>
        </form>

        {/* ── Result panel ─────────────────────────────────────────────── */}
        <div className="lg:col-span-8">
          {!result && (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center border border-dashed border-ivory/15 p-10 text-center gap-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold/60">Identity + Occasion + Aesthetic + Energy</p>
              <p className="font-serif text-xl text-ivory/40">
                {a.emptyResult}
              </p>
              <p className="text-xs text-ivory/40 max-w-xs">
                Complete the profile to the left and receive your symbolic styling rationale.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-10">

              {/* ── Identity Card ──────────────────────────────────────── */}
              <div className="border border-gold/20 bg-gradient-to-b from-ink-soft/60 to-ink-deep p-8 lg:p-10">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gold/70">Your Jewelry Identity</p>
                <div className="mt-4 flex flex-wrap items-end gap-6">
                  <div>
                    <p className="font-serif text-3xl text-ivory leading-tight">{identityArchetype}</p>
                    {zodiac && (
                      <p className="mt-2 text-xs text-gold-muted tracking-widest uppercase">{zodiac} · {style} · {mood}</p>
                    )}
                    {!zodiac && (
                      <p className="mt-2 text-xs text-ivory/40 tracking-widest uppercase">{style} · {mood}</p>
                    )}
                  </div>
                </div>
                {suggestedMaterial && (
                  <div className="mt-6 border-t border-ivory/10 pt-6">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-gold/60">Suggested Materials</p>
                    <p className="mt-2 text-sm text-ivory-dim">{suggestedMaterial}</p>
                  </div>
                )}
              </div>

              {/* ── Style Direction ────────────────────────────────────── */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.styleDirection}</p>
                <p className="mt-3 font-serif text-lg leading-relaxed text-ivory-soft">
                  {result.styleDirection}
                </p>
              </div>

              {/* ── Main + Supporting picks ────────────────────────────── */}
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                {/* Main pick */}
                {mainPick && (
                  <div className="border border-ivory/10">
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <Image
                        src={mainPick.product.coverImage}
                        alt={mainPick.product.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 560px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-gold">{a.mainPick}</p>
                        <h3 className="mt-1 font-serif text-2xl text-ivory">{mainPick.product.name}</h3>
                        <p className="mt-1 text-sm text-ivory-dim">{mainPick.product.priceLabel}</p>
                        {mainPick.matchReasons[0] && (
                          <p className="mt-3 text-xs leading-relaxed text-ivory/70">{mainPick.matchReasons[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Why it fits */}
                    <div className="border-t border-ivory/10 px-6 py-5 bg-ink-soft/30">
                      <p className="text-[9px] uppercase tracking-[0.35em] text-gold/70 mb-3">Why it fits your profile</p>
                      <div className="space-y-1">
                        {mainPick.matchReasons.map((reason, i) => (
                          <p key={i} className="text-xs leading-relaxed text-ivory/60">
                            <span className="text-gold/40 mr-2">—</span>{reason}
                          </p>
                        ))}
                        <p className="text-xs leading-relaxed text-ivory/60">
                          <span className="text-gold/40 mr-2">—</span>
                          Material: {mainPick.product.material}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 border-t border-ivory/10 px-6 py-4">
                      <Link
                        href={`/product/${mainPick.product.slug}`}
                        className="text-[10px] uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors"
                      >
                        {a.viewProduct}
                      </Link>
                      <Link
                        href={`/try-on?piece=${mainPick.product.slug}`}
                        className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim hover:text-gold transition-colors"
                      >
                        {a.tryOn}
                      </Link>
                      <Link
                        href="/vip"
                        className="text-[10px] uppercase tracking-[0.2em] text-ivory-dim hover:text-gold transition-colors"
                      >
                        {a.requestCustomization}
                      </Link>
                    </div>
                  </div>
                )}

                {/* Supporting picks */}
                {supportingPicks.length > 0 && (
                  <div className="flex flex-col gap-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-gold">{a.supportingPicks}</p>
                    {supportingPicks.map(({ product, matchReasons }) => (
                      <div key={product.id} className="grid grid-cols-[100px_1fr] border border-ivory/10">
                        <div className="relative h-full min-h-[120px] overflow-hidden">
                          <Image
                            src={product.coverImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="100px"
                          />
                        </div>
                        <div className="flex flex-col justify-between p-4">
                          <div>
                            <h4 className="font-serif text-base text-ivory leading-tight">{product.name}</h4>
                            <p className="mt-1 text-xs text-ivory-dim">{product.priceLabel}</p>
                            {matchReasons[0] && (
                              <p className="mt-2 text-xs leading-relaxed text-ivory/60">{matchReasons[0]}</p>
                            )}
                          </div>
                          <Link
                            href={`/product/${product.slug}`}
                            className="mt-3 text-[10px] uppercase tracking-[0.2em] text-gold hover:text-gold-light transition-colors self-start"
                          >
                            {a.viewProduct}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <PairingRecommendations
                ownedProducts={advisorOwnedProducts}
                title={
                  locale === "zh"
                    ? "与您的选择完美搭配"
                    : "Also pairs well with your selections"
                }
                eyebrow={locale === "zh" ? "完整造型" : "Complete the Look"}
                className="border-t-0 pt-0"
              />

              {/* ── Symbolic Styling Note ──────────────────────────────── */}
              <div className="border-t border-ivory/10 pt-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold">{a.stylingNote}</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-dim italic">{result.stylingNote}</p>
              </div>

              {/* ── Footer actions ────────────────────────────────────── */}
              <div className="flex flex-wrap gap-4 border-t border-ivory/10 pt-8">
                <Button type="button" onClick={() => setResult(null)}>
                  {a.tryAnotherDirection}
                </Button>
                <Link
                  href="/collection"
                  className="inline-flex items-center border border-ivory/20 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-ivory-dim hover:border-gold/40 hover:text-gold transition-colors"
                >
                  {a.exploreOtherStyles}
                </Link>
                <Link
                  href="/vip"
                  className="inline-flex items-center border border-gold/20 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-gold/70 hover:border-gold hover:text-gold transition-colors"
                >
                  Apply for Private Atelier
                </Link>
              </div>

              {/* ── Editorial references placeholder ──────────────────── */}
              <div className="border border-dashed border-ivory/10 px-8 py-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-ivory/30">{a.luxuryInspirationSoon}</p>
                <p className="mt-2 font-serif text-lg text-ivory/50">{a.luxuryInspirationTitle}</p>
                <p className="mt-2 text-xs text-ivory/40">{a.luxuryInspirationNote}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
