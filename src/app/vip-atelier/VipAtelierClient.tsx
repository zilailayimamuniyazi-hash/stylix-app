"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const stones = ["月光石", "钻石", "珍珠", "祖母绿", "黑玛瑙", "紫水晶"];
const metals = ["18K 黄金", "白金", "玫瑰金", "925 银", "铂金"];
const forms = ["戒指", "项链", "手链", "耳饰", "吊坠"];
const budgets = ["$300-600", "$600-1,200", "$1,200-3,000", "$3,000+ 高定"];

function Pick({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={"group flex min-h-14 items-center justify-between rounded border px-4 text-left text-sm " + (active ? "border-[var(--ui-accent)] bg-[rgba(199,170,112,.1)] text-[var(--ui-text)]" : "border-[var(--ui-line)] text-[var(--ui-text-2)] hover:border-[var(--ui-line-strong)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]")}><span>{children}</span><span className={"flex h-4 w-4 items-center justify-center rounded-full border " + (active ? "border-[var(--ui-accent)]" : "border-[var(--ui-line-strong)]")}><span className={"h-1.5 w-1.5 rounded-full bg-[var(--ui-accent)] transition-opacity " + (active ? "opacity-100" : "opacity-0")} /></span></button>
  );
}

export function VipAtelierClient() {
  const [stone, setStone] = useState(stones[0]);
  const [metal, setMetal] = useState(metals[0]);
  const [form, setForm] = useState(forms[0]);
  const [budget, setBudget] = useState(budgets[1]);
  const [story, setStory] = useState("");
  const [email, setEmail] = useState("");

  const brief = useMemo(() => {
    return `${metal} ${stone} ${form}，预算 ${budget}。`;
  }, [budget, form, metal, stone]);

  const mailto = "mailto:zilailayimamuniyazi@gmail.com?subject=Stylix VIP Atelier Brief&body=" + encodeURIComponent(brief + "\n\nStory: " + story + "\nEmail: " + email);

  return (
    <div className="ui-page">
      <section className="relative min-h-[480px] overflow-hidden border-b border-[var(--ui-line)]">
        <Image src="/products/f3114855360ee41d9254be376d710a06.png" alt="高级珠宝定制" fill priority sizes="100vw" className="object-cover object-[center_42%] opacity-55" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,10,.94),rgba(8,9,10,.66)_56%,rgba(8,9,10,.16)),linear-gradient(0deg,var(--ui-bg),transparent_45%)]" />
        <div className="ui-container relative flex min-h-[480px] items-center py-16">
          <div className="min-w-0 max-w-3xl"><p className="ui-eyebrow">Private atelier · By appointment</p><h1 className="ui-display mt-6">把想法整理成一份清晰的私人委托。</h1><p className="ui-copy mt-6 max-w-xl">选择主石、金属、品类与预算，设计师将在确认比例、工艺和佩戴细节后进入设计阶段。</p></div>
        </div>
      </section>
      <div className="ui-container py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_420px] xl:gap-20">
          <section>
            <div className="flex items-end justify-between border-b border-[var(--ui-line)] pb-6"><div><p className="ui-eyebrow">Create your brief</p><h2 className="ui-title mt-3">定义作品方向</h2></div><p className="hidden text-[10px] uppercase tracking-[.14em] text-[var(--ui-text-3)] sm:block">01 — 04</p></div>
            <div className="mt-10 grid gap-x-10 gap-y-12 xl:grid-cols-2">
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#c8a96b]">01 · 选择主石</p>
                <div className="grid gap-2 sm:grid-cols-2">{stones.map((item) => <Pick key={item} active={stone === item} onClick={() => setStone(item)}>{item}</Pick>)}</div>
              </div>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#c8a96b]">02 · 选择金属</p>
                <div className="grid gap-2 sm:grid-cols-2">{metals.map((item) => <Pick key={item} active={metal === item} onClick={() => setMetal(item)}>{item}</Pick>)}</div>
              </div>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#c8a96b]">03 · 选择品类</p>
                <div className="grid gap-2 sm:grid-cols-2">{forms.map((item) => <Pick key={item} active={form === item} onClick={() => setForm(item)}>{item}</Pick>)}</div>
              </div>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#c8a96b]">04 · 预算范围</p>
                <div className="grid gap-2">{budgets.map((item) => <Pick key={item} active={budget === item} onClick={() => setBudget(item)}>{item}</Pick>)}</div>
              </div>
            </div>
          </section>

          <aside className="ui-surface ui-card-shadow p-7 lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-between"><p className="ui-eyebrow">Your private brief</p><span className="ui-badge">实时更新</span></div>
            <h2 className="mt-5 border-b border-[var(--ui-line)] pb-6 font-serif text-3xl leading-tight text-[var(--ui-text)]">{brief}</h2>
            <label htmlFor="atelier-story" className="mt-6 block text-[10px] text-[var(--ui-text-3)]">作品背后的故事</label><textarea id="atelier-story" value={story} onChange={(e) => setStory(e.target.value)} placeholder="想纪念的人、日期、场景，或你希望它传达的气质。" className="ui-field mt-3 min-h-32 py-3 text-sm leading-6" />
            <label htmlFor="atelier-email" className="mt-5 block text-[10px] text-[var(--ui-text-3)]">联系方式</label><input id="atelier-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="设计师回访邮箱" className="ui-field mt-3" />
            <a href={mailto} className="ui-button ui-button--primary mt-5 w-full">
              联系设计师
            </a>
            <Link href="/test" className="ui-button ui-button--ghost mt-3 w-full">
              先做 JMTI 测试
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
