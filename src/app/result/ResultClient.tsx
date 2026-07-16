"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { WishlistHeartButton } from "@/components/product/WishlistHeartButton";
import {
  buildDailyIdentityCard,
  getStoredIdentityAnswers,
  jmtiBasis,
  storeIdentityAnswers,
  zodiacLabels,
  type IdentityAnswers,
} from "@/lib/identity/engine";
import type { Product } from "@/lib/types/product";
import { ShareModal } from "@/components/share/ShareModal";

function ResultLoadingSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="border border-gold/20 bg-gradient-to-b from-ink-soft/70 to-ink-deep p-7 shadow-luxury">
        <div className="h-3 w-24 animate-pulse rounded bg-ivory/10" />
        <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-ivory/10" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-ivory/10" />
        <div className="mt-5 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-ivory/10" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-ivory/10" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="h-20 animate-pulse border border-ivory/10 bg-ivory/5" />
          <div className="h-20 animate-pulse border border-ivory/10 bg-ivory/5" />
        </div>
        <div className="mt-8 space-y-5 border-t border-ivory/10 pt-7">
          <div className="h-16 animate-pulse rounded bg-ivory/10" />
          <div className="h-16 animate-pulse rounded bg-ivory/10" />
        </div>
      </section>
      <section className="space-y-6">
        <div className="h-32 animate-pulse border border-ivory/10 bg-ink-soft/25" />
        <div className="h-48 animate-pulse border border-ivory/10 bg-ink-soft/25" />
        <div className="h-48 animate-pulse border border-ivory/10 bg-ink-soft/25" />
      </section>
    </div>
  );
}

const scoreLabels = [
  ["L", "理性保值"],
  ["O", "情绪审美"],
  ["M", "日常常戴"],
  ["T", "仪式佩戴"],
  ["A", "小众设计"],
  ["S", "经典大众"],
  ["D", "低调内敛"],
  ["G", "亮眼吸睛"],
] as const;

function ProductTier({ label, product, onAdd }: { label: string; product: Product; onAdd: () => void }) {
  return (
    <article className="relative grid gap-5 border border-ivory/10 bg-ink-soft/25 p-4 sm:grid-cols-[150px_1fr]">
      <div className="absolute right-3 top-3 z-10">
        <WishlistHeartButton product={product} />
      </div>
      <Link href={"/product/" + product.slug} className="relative aspect-square overflow-hidden bg-ink-soft">
        <Image src={product.coverImage} alt={product.name} fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="150px" />
      </Link>
      <div className="flex min-w-0 flex-col justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.32em] text-gold/70">{label}</p>
          <h3 className="mt-2 font-serif text-2xl text-ivory">{product.name}</h3>
          <p className="mt-1 text-sm text-ivory/45">{product.subtitle}</p>
          <p className="mt-4 text-sm leading-6 text-ivory/62">{product.narrative}</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="font-serif text-xl text-gold">{"$" + product.price.toLocaleString()}</p>
          <button type="button" onClick={onAdd} className="border border-gold/35 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-ink-deep">
            加入购物袋
          </button>
          <Link href={"/try-on?piece=" + product.slug} className="text-[10px] uppercase tracking-[0.22em] text-ivory/45 hover:text-gold">
            Try-On
          </Link>
          <Link href={"/product/" + product.slug} className="text-[10px] uppercase tracking-[0.22em] text-ivory/45 hover:text-gold">
            Buy
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ResultClient() {
  const [answers, setAnswers] = useState<IdentityAnswers | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const stored = getStoredIdentityAnswers();
    if (stored) setAnswers(stored);
    setLoaded(true);
  }, []);

  const card = useMemo(() => (answers ? buildDailyIdentityCard(answers) : null), [answers]);

  function updateBudget(value: number) {
    if (!answers) return;
    const next = { ...answers, budgetMax: value };
    setAnswers(next);
    storeIdentityAnswers(next);
  }

  if (!loaded) {
    return (
      <div className="ui-page">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <ResultLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!answers || !card) {
    return (
      <div className="ui-page">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="mx-auto max-w-lg border border-gold/20 bg-gradient-to-b from-ink-soft/70 to-ink-deep p-10 text-center shadow-luxury">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold/70">身份档案</p>
          <p className="mt-6 text-sm leading-7 text-ivory/62">你还没有完成 JMTI 珠宝人格测试。用约 4 分钟生成身份档案后，这里会出现专属推荐。</p>
            <Link href="/test" className="mt-8 inline-flex border border-gold/30 px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-ink-deep">
              开始测试
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tiers = [
    { label: "入门推荐", product: card.products.entry },
    { label: "标志推荐", product: card.products.signature },
    { label: "高定方向", product: card.products.atelier },
  ];

  return (
    <div className="ui-page">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-gold/20 bg-gradient-to-b from-ink-soft/70 to-ink-deep p-7 shadow-luxury lg:sticky lg:top-24 lg:h-fit">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold/70">今日身份卡</p>
            <h1 className="mt-5 font-serif text-5xl leading-none text-ivory">{card.title}</h1>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-ivory/35">
              JMTI {answers.jmtiCode} / 匹配度 {card.matchPercent}% / {answers.zodiac ? zodiacLabels[answers.zodiac] : "未填写星座"}
            </p>
            <p className="mt-5 text-sm leading-7 text-ivory/62">{card.jmtiType.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-ivory/10 p-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">幸运色</p>
                <p className="mt-2 font-serif text-2xl text-gold">{card.luckyColor}</p>
              </div>
              <div className="border border-ivory/10 p-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">幸运珠宝</p>
                <p className="mt-2 font-serif text-2xl text-gold">{card.luckyGemstone}</p>
              </div>
            </div>

            <div className="mt-8 space-y-5 border-t border-ivory/10 pt-7">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">事业运提示</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{card.careerSignal}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">财富运提示</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{card.wealthSignal}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">推荐理由</p>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{card.recommendationReason}</p>
              </div>
            </div>

            <div className="mt-8 border border-ivory/10 p-5">
              <div className="flex justify-between gap-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-ivory/40">价格筛选</p>
                <p className="font-serif text-xl text-gold">{"$" + answers.budgetMax}</p>
              </div>
              <input aria-label="推荐预算上限" type="range" min={150} max={2500} step={25} value={answers.budgetMax} onChange={(e) => updateBudget(Number(e.target.value))} className="mt-5 w-full accent-[#C9A962]" />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-2 border border-gold/40 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold/10"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                分享我的珠宝人格
              </button>
              <Link href="/test" className="border border-ivory/15 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-ivory/55 hover:border-gold/40 hover:text-gold">
                重新测试
              </Link>
              <Link href="/daily" className="border border-gold/30 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-gold hover:bg-gold hover:text-ink-deep">
                保存到 Daily
              </Link>
            </div>
          </section>

          <section>
            <div className="border border-ivory/10 bg-ink-soft/25 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">今日穿搭卡片</p>
              <p className="mt-4 font-serif text-2xl leading-snug text-ivory">{card.mantra}</p>
              <p className="mt-4 text-sm leading-7 text-ivory/62">{card.stylingNote}</p>
            </div>

            <div className="mt-6 grid gap-5">
              {tiers.map((tier) => (
                <ProductTier key={tier.label + tier.product.id} label={tier.label} product={tier.product} onAdd={() => addItem(tier.product)} />
              ))}
            </div>

            <div className="mt-6 border border-dashed border-gold/20 p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">测试依据</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-3 text-sm leading-6 text-ivory/55">
                  {jmtiBasis.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {scoreLabels.map(([letter, label]) => (
                    <div key={letter} className="border border-ivory/10 px-3 py-2">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-ivory/35">{letter} {label}</p>
                      <p className="mt-1 font-serif text-xl text-gold">{answers.jmtiScores[letter]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border border-dashed border-gold/20 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">每日灵感</p>
                <p className="mt-3 text-sm leading-6 text-ivory/55">你的 JMTI、星座倾向与场景偏好会共同生成每日珠宝建议，随时可以回到推荐卡继续试戴与收藏。</p>
              </div>
              <Link href="/vip-atelier" className="inline-flex justify-center bg-gold px-6 py-3 text-[10px] uppercase tracking-[0.22em] text-ink-deep">
                去私人定制
              </Link>
            </div>
          </section>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        jmtiCode={answers.jmtiCode}
        profile={card.jmtiType}
        scores={answers.jmtiScores}
        matchPercent={card.matchPercent}
      />
    </div>
  );
}
