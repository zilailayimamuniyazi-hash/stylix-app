"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

const stones = ["Moonstone", "Diamond", "Pearl", "Emerald", "Black Onyx", "Amethyst"];
const metals = ["18K Yellow Gold", "White Gold", "Rose Gold", "925 Silver", "Platinum"];
const forms = ["Ring", "Necklace", "Bracelet", "Earrings", "Pendant"];
const budgets = ["$300–600", "$600–1,200", "$1,200–3,000", "$3,000+ Bespoke"];

function Pick({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={"group flex min-h-14 items-center justify-between rounded border px-4 text-left text-sm " + (active ? "border-[var(--ui-accent)] bg-[rgba(199,170,112,.1)] text-[var(--ui-text)]" : "border-[var(--ui-line)] text-[var(--ui-text-2)] hover:border-[var(--ui-line-strong)] hover:bg-[var(--ui-surface-hover)] hover:text-[var(--ui-text)]")}><span>{children}</span><span className={"flex h-4 w-4 items-center justify-center rounded-full border " + (active ? "border-[var(--ui-accent)]" : "border-[var(--ui-line-strong)]")}><span className={"h-1.5 w-1.5 rounded-full bg-[var(--ui-accent)] transition-opacity " + (active ? "opacity-100" : "opacity-0")} /></span></button>
  );
}

export function VipAtelierClient() {
  const { locale } = useI18n();
  const zh = locale === "zh";
  const tr = (value: string) => zh ? ({ Moonstone:"月光石", Diamond:"钻石", Pearl:"珍珠", Emerald:"祖母绿", "Black Onyx":"黑玛瑙", Amethyst:"紫水晶", "18K Yellow Gold":"18K 黄金", "White Gold":"白金", "Rose Gold":"玫瑰金", "925 Silver":"925 银", Platinum:"铂金", Ring:"戒指", Necklace:"项链", Bracelet:"手链", Earrings:"耳饰", Pendant:"吊坠", "$3,000+ Bespoke":"$3,000 以上高级定制" } as Record<string,string>)[value] ?? value : value;
  const [stone, setStone] = useState(stones[0]);
  const [metal, setMetal] = useState(metals[0]);
  const [form, setForm] = useState(forms[0]);
  const [budget, setBudget] = useState(budgets[1]);
  const [story, setStory] = useState("");
  const [email, setEmail] = useState("");

  const brief = zh ? `${tr(metal)} · ${tr(stone)} · ${tr(form)}。预算 ${tr(budget)}。` : `${metal} · ${stone} · ${form}. Budget ${budget}.`;

  const mailto = "mailto:zilailayimamuniyazi@gmail.com?subject=Stylix VIP Atelier Brief&body=" + encodeURIComponent(brief + "\n\nStory: " + story + "\nEmail: " + email);

  return (
    <div className="ui-page">
      <section className="relative min-h-[480px] overflow-hidden border-b border-[var(--ui-line)]">
        <Image src="/products/f3114855360ee41d9254be376d710a06.png" alt="Bespoke fine jewelry" fill priority sizes="100vw" className="object-cover object-[center_42%] opacity-35" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,250,248,.98),rgba(251,250,248,.78)_56%,rgba(251,250,248,.18)),linear-gradient(0deg,var(--ui-bg),transparent_45%)]" />
        <div className="ui-container relative flex min-h-[480px] items-center py-16">
          <div className="min-w-0 max-w-3xl"><p className="ui-eyebrow">{zh ? "私人珠宝工坊 · 预约制" : "Private atelier · By appointment"}</p><h1 className="ui-display mt-6">{zh ? "将灵感塑造成一件经过深思熟虑的私人定制作品。" : "Shape an idea into a considered private commission."}</h1><p className="ui-copy mt-6 max-w-xl">{zh ? "选择宝石、金属、造型与预算。设计师将在设计开始前，与你共同打磨比例、工艺和佩戴方式。" : "Choose the stone, metal, form and budget. A designer will refine proportion, craftsmanship and the way the piece is worn before design begins."}</p></div>
        </div>
      </section>
      <div className="ui-container py-16 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_420px] xl:gap-20">
          <section>
            <div className="flex items-end justify-between border-b border-[var(--ui-line)] pb-6"><div><p className="ui-eyebrow">{zh ? "创建你的定制简报" : "Create your brief"}</p><h2 className="ui-title mt-3">{zh ? "定义创作方向。" : "Define the direction."}</h2></div><p className="hidden text-[10px] uppercase tracking-[.14em] text-[var(--ui-text-3)] sm:block">01 — 04</p></div>
            <div className="mt-10 grid gap-x-10 gap-y-12 xl:grid-cols-2">
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#767681]">01 · {zh ? "选择宝石" : "Select a stone"}</p>
                <div className="grid gap-2 sm:grid-cols-2">{stones.map((item) => <Pick key={item} active={stone === item} onClick={() => setStone(item)}>{tr(item)}</Pick>)}</div>
              </div>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#767681]">02 · {zh ? "选择金属" : "Select a metal"}</p>
                <div className="grid gap-2 sm:grid-cols-2">{metals.map((item) => <Pick key={item} active={metal === item} onClick={() => setMetal(item)}>{tr(item)}</Pick>)}</div>
              </div>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#767681]">03 · {zh ? "选择品类" : "Select a form"}</p>
                <div className="grid gap-2 sm:grid-cols-2">{forms.map((item) => <Pick key={item} active={form === item} onClick={() => setForm(item)}>{tr(item)}</Pick>)}</div>
              </div>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#767681]">04 · {zh ? "预算范围" : "Investment range"}</p>
                <div className="grid gap-2">{budgets.map((item) => <Pick key={item} active={budget === item} onClick={() => setBudget(item)}>{tr(item)}</Pick>)}</div>
              </div>
            </div>
          </section>

          <aside className="ui-surface ui-card-shadow p-7 lg:sticky lg:top-24 lg:h-fit">
            <div className="flex items-center justify-between"><p className="ui-eyebrow">{zh ? "你的定制简报" : "Your private brief"}</p><span className="ui-badge">{zh ? "实时预览" : "Live Preview"}</span></div>
            <h2 className="mt-5 border-b border-[var(--ui-line)] pb-6 font-serif text-3xl leading-tight text-[var(--ui-text)]">{brief}</h2>
            <label htmlFor="atelier-story" className="mt-6 block text-[10px] text-[var(--ui-text-3)]">{zh ? "这件作品背后的故事" : "The story behind the piece"}</label><textarea id="atelier-story" value={story} onChange={(e) => setStory(e.target.value)} placeholder={zh ? "希望这件作品承载的一个人、日期、地点或感受。" : "A person, date, place or feeling you would like the piece to hold."} className="ui-field mt-3 min-h-32 py-3 text-sm leading-6" />
            <label htmlFor="atelier-email" className="mt-5 block text-[10px] text-[var(--ui-text-3)]">{zh ? "联系方式" : "Contact"}</label><input id="atelier-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={zh ? "用于设计师咨询的邮箱" : "Email for the designer consultation"} className="ui-field mt-3" />
            <a href={mailto} className="ui-button ui-button--primary mt-5 w-full">
              {zh ? "联系设计师" : "Contact the Designer"}
            </a>
            <Link href="/test" className="ui-button ui-button--ghost mt-3 w-full">
              {zh ? "先完成 JMTI 风格解读" : "Take the JMTI Reading First"}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
