"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyClient() {
  const [answers, setAnswers] = useState<IdentityAnswers>(fallbackAnswers);
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(0);
  const [draw, setDraw] = useState<string | null>(null);
  const card = useMemo(() => buildDailyIdentityCard(answers), [answers]);
  const product = card.products.signature;

  useEffect(() => {
    const stored = getStoredIdentityAnswers();
    if (stored) setAnswers(stored);
    const raw = window.localStorage.getItem("stylix_daily_checkins");
    const days = raw ? (JSON.parse(raw) as string[]) : [];
    setCheckedIn(days.includes(todayKey()));
    setStreak(days.length);
  }, []);

  function checkIn() {
    const raw = window.localStorage.getItem("stylix_daily_checkins");
    const days = raw ? (JSON.parse(raw) as string[]) : [];
    const today = todayKey();
    if (!days.includes(today)) days.push(today);
    window.localStorage.setItem("stylix_daily_checkins", JSON.stringify(days));
    setCheckedIn(true);
    setStreak(days.length);
  }

  function runDraw() {
    const rewards = ["高定咨询 10% 抵扣", "免费今日穿搭话术", "设计师合作款优先预览", "明日额外抽奖一次"];
    const index = (new Date().getDate() + answers.jmtiCode.length + (answers.zodiac?.length ?? 0)) % rewards.length;
    setDraw(rewards[index]);
  }

  return (
    <div className="ui-page">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="border border-gold/20 bg-ink-soft/30 p-7 shadow-luxury">
            <p className="text-[10px] uppercase tracking-[0.45em] text-gold/70">Daily 每日身份</p>
            <h1 className="mt-5 font-serif text-5xl leading-none text-ivory">{card.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ivory/58">{card.mantra}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border border-ivory/10 p-5">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">幸运色</p>
                <p className="mt-2 font-serif text-2xl text-gold">{card.luckyColor}</p>
              </div>
              <div className="border border-ivory/10 p-5">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">幸运珠宝</p>
                <p className="mt-2 font-serif text-2xl text-gold">{product.name}</p>
              </div>
              <div className="border border-ivory/10 p-5">
                <p className="text-[9px] uppercase tracking-[0.3em] text-ivory/35">打卡次数</p>
                <p className="mt-2 font-serif text-2xl text-gold">{streak}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="border border-ivory/10 p-5">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">事业运</p>
                <p className="mt-3 text-sm leading-6 text-ivory/62">{card.careerSignal}</p>
              </div>
              <div className="border border-ivory/10 p-5">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">财富运</p>
                <p className="mt-3 text-sm leading-6 text-ivory/62">{card.wealthSignal}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={checkIn} disabled={checkedIn} className="bg-gold px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-ink-deep disabled:opacity-45">
                {checkedIn ? "今日已打卡" : "今日打卡"}
              </button>
              <button type="button" onClick={runDraw} className="border border-gold/30 px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-gold hover:bg-gold hover:text-ink-deep">
                每日抽奖
              </button>
              <Link href="/result" className="border border-ivory/15 px-7 py-3 text-[11px] uppercase tracking-[0.24em] text-ivory/55 hover:border-gold/40 hover:text-gold">
                完整身份卡
              </Link>
            </div>
            {draw && <p className="mt-5 border border-gold/20 bg-gold/5 px-5 py-4 text-sm text-gold">今日抽中：{draw}</p>}
          </section>

          <aside className="border border-ivory/10 bg-ivory text-ink-deep">
            <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
              <Image src={product.coverImage} alt={product.name} fill className="object-cover" sizes="420px" />
            </div>
            <div className="p-6">
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-deep">Lucky Jewelry</p>
              <h2 className="mt-3 font-serif text-3xl text-ink-deep">{product.name}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/58">{card.stylingNote}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={"/try-on?piece=" + product.slug} className="bg-ink px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-ivory">Try-On</Link>
                <Link href={"/product/" + product.slug} className="border border-ink/15 px-5 py-3 text-[10px] uppercase tracking-[0.22em] text-ink/60 hover:border-gold/40 hover:text-gold-deep">Buy</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
