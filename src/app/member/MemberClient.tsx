"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCart } from "@/lib/cart/CartContext";
import { buildDailyIdentityCard, emptyJmtiScores, getStoredIdentityAnswers, type IdentityAnswers } from "@/lib/identity/engine";

const fallbackAnswers: IdentityAnswers = {
  jmtiCode: "OMAD",
  jmtiScores: { ...emptyJmtiScores(), O: 5, M: 4, A: 4, D: 5 },
  matchPercent: 62,
  zodiac: "Pisces",
  occasion: "date night",
  style: "celestial",
  budgetMax: 500,
};

export function MemberClient() {
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  const [answers, setAnswers] = useState<IdentityAnswers>(fallbackAnswers);
  const [checkins, setCheckins] = useState<string[]>([]);
  const card = useMemo(() => buildDailyIdentityCard(answers), [answers]);
  const level = checkins.length >= 20 ? "Atelier Gold" : checkins.length >= 7 ? "Lunar Silver" : "New Star";

  useEffect(() => {
    const stored = getStoredIdentityAnswers();
    if (stored) setAnswers(stored);
    const raw = window.localStorage.getItem("stylix_daily_checkins");
    setCheckins(raw ? (JSON.parse(raw) as string[]) : []);
  }, []);

  return (
    <div className="ui-page">
      <div className="ui-container py-14">
        <header className="grid gap-8 border-b border-[var(--ui-line)] pb-10 lg:grid-cols-[1fr_340px]">
          <div>
            <p className="ui-eyebrow">会员中心</p>
            <h1 className="ui-title mt-5">{user ? user.name : "游客档案"}</h1>
            <p className="mt-4 text-sm uppercase tracking-[0.25em] text-ivory/35">JMTI {answers.jmtiCode} / {card.archetype}</p>
            <p className="ui-copy mt-5 max-w-2xl">集中管理身份档案、心愿单、每日记录与订单进度，让推荐延续同一套个人偏好。</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/test" className="ui-button ui-button--primary">更新测试</Link>
              <Link href="/daily" className="ui-button ui-button--secondary">每日打卡</Link>
            </div>
          </div>
          <div className="ui-surface p-5">
            <p className="ui-eyebrow">会员等级</p>
            <p className="mt-3 font-serif text-3xl text-ivory">{level}</p>
            <p className="mt-3 text-sm leading-6 text-ivory/50">{checkins.length} 次打卡。累计 7 次升级 Lunar Silver，20 次升级 Atelier Gold。</p>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="ui-surface p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">身份档案</p>
            <h2 className="mt-3 font-serif text-2xl text-ivory">{card.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ivory/55">幸运色：{card.luckyColor}。幸运珠宝：{card.luckyGemstone}。</p>
            <p className="mt-3 text-sm leading-6 text-ivory/55">{card.recommendationReason}</p>
          </section>

          <section className="ui-surface p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">购物袋与订单</p>
            <h2 className="mt-3 font-serif text-2xl text-ivory">{items.length} 件已加入购物袋</h2>
            <p className="mt-3 text-sm text-ivory/55">{"小计：$" + subtotal.toFixed(2)}</p>
            <div className="mt-5 grid gap-3">
              <Link href="/bag" className="ui-button ui-button--secondary">查看购物袋</Link>
              <Link href="/checkout" className="ui-button ui-button--ghost">去结算</Link>
            </div>
          </section>

          <section className="ui-surface p-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold/70">打卡记录</p>
            <h2 className="mt-3 font-serif text-2xl text-ivory">{checkins.length} 次 Daily 记录</h2>
            <div className="mt-5 max-h-32 space-y-2 overflow-auto pr-2">
              {checkins.length === 0 && <p className="text-sm text-ivory/45">还没有打卡记录。</p>}
              {checkins.slice().reverse().map((day) => (
                <p key={day} className="border-b border-ivory/8 pb-2 text-sm text-ivory/55">{day}</p>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-[var(--ui-line)] bg-[#efede7] text-[#18191b]" data-theme="light">
          <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
            <div className="relative aspect-square bg-stone-100 lg:aspect-auto">
              <Image src={card.products.signature.coverImage} alt={card.products.signature.name} fill className="object-cover" sizes="320px" />
            </div>
            <div className="p-7">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-deep">今日标志款</p>
              <h2 className="mt-3 font-serif text-3xl text-ink-deep">从你的身份档案继续挑选。</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/58">这件作品与当前 JMTI 特征和今日场景匹配，可以先试戴，再决定是否加入心愿单。</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={"/product/" + card.products.signature.slug} className="ui-button ui-button--primary">查看商品</Link>
                <Link href={"/try-on?piece=" + card.products.signature.slug} className="ui-button ui-button--secondary">Try-On</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
