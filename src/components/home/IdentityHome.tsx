"use client";

import Image from "next/image";
import Link from "next/link";

const paths = [
  { href: "/test", step: "01", label: "理解风格", title: "珠宝人格测试", body: "用约四分钟建立个人审美坐标，减少无效浏览。", image: "/identity-portrait/jewelry/06-nova/cover.png" },
  { href: "/try-on", step: "02", label: "验证选择", title: "真实佩戴预览", body: "上传照片，在自己的脸、颈部或手部查看比例与气质。", image: "/ai-stylist-gemini-dark.jpg" },
  { href: "/bead-lab", step: "03", label: "完成作品", title: "珠宝设计工作室", body: "从款式、尺寸和材质开始，生成可供设计师确认的规格。", image: "/products/1961b5b431c6e985cd27e0b35696b561.png" },
];

const selected = [
  { href: "/product/iris-spectrum-jewelry-set", image: "/products/微信图片_20260213144941_39_36.jpg", name: "Iris Spectrum", meta: "Jewelry Set" },
  { href: "/product/dione-signet-ring", image: "/products/微信图片_20260214000203_40_36.jpg", name: "Dione Signet", meta: "22K Gold" },
  { href: "/product/lyra-harp-ring", image: "/products/微信图片_20260214001257_41_36.jpg", name: "Lyra Harp", meta: "White Gold" },
];

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4"><path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function IdentityHome() {
  return (
    <div className="bg-[var(--ui-bg)] text-[var(--ui-text)]">
      <section className="relative min-h-[calc(100svh-1px)] overflow-hidden">
        <video autoPlay muted loop playsInline poster="/hero-editorial.jpg" className="absolute inset-0 h-full w-full object-cover object-[62%_center]">
          <source src="/hero-video.mp4.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,8,.9)_0%,rgba(6,7,8,.58)_46%,rgba(6,7,8,.12)_78%),linear-gradient(0deg,rgba(6,7,8,.7)_0%,transparent_45%)]" />
        <div className="ui-container relative flex min-h-[100svh] items-end pb-16 pt-28 lg:items-center lg:pb-20">
          <div className="max-w-[700px]">
            <p className="ui-eyebrow">Jewelry intelligence for real life</p>
            <h1 className="ui-display mt-6 max-w-[680px]">为你的风格，找到真正适合的珠宝。</h1>
            <p className="ui-copy mt-6 max-w-lg text-[15px]">Stylix 把个人审美、佩戴场景和真实效果放在同一条路径中，让选择更少，却更准确。</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/test" className="ui-button ui-button--primary">开始珠宝人格测试 <Arrow /></Link>
              <Link href="/shop" className="ui-button ui-button--secondary">浏览作品</Link>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-white/15">
            <div className="ui-container grid grid-cols-3 py-3 text-center sm:text-left">
              {[["16", "珠宝人格"], ["5", "设计品类"], ["3D", "试戴与预览"]].map(([value, label]) => <div key={label} className="border-r border-white/10 px-3 last:border-0 sm:flex sm:items-baseline sm:gap-3"><strong className="font-serif text-lg font-normal text-white">{value}</strong><span className="block text-[9px] text-white/55 sm:inline">{label}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="ui-section">
        <div className="ui-container">
          <div className="grid gap-6 border-b border-[var(--ui-line)] pb-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
            <p className="ui-eyebrow">A clearer way to choose</p>
            <div><h2 className="ui-title max-w-3xl">从认识自己，到确认一件作品。</h2><p className="ui-copy mt-5 max-w-2xl">每个工具只解决一个问题，结果会带到下一步，不让用户反复填写偏好。</p></div>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg bg-[var(--ui-line)] lg:grid-cols-3">
            {paths.map((item) => (
              <Link href={item.href} key={item.href} className="group relative min-h-[480px] overflow-hidden bg-[var(--ui-surface)]">
                <Image src={item.image} alt="" fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover opacity-62 transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.025] group-hover:opacity-78" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-[9px] uppercase tracking-[.18em] text-white/55">{item.step} · {item.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-5"><div><h3 className="font-serif text-3xl">{item.title}</h3><p className="mt-3 max-w-sm text-sm leading-6 text-white/62">{item.body}</p></div><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 group-hover:border-white"><Arrow /></span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-section border-y border-[var(--ui-line)] bg-[#efede7] text-[#18191b]" data-theme="light">
        <div className="ui-container">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="ui-eyebrow">Selected objects</p><h2 className="ui-title mt-4">本周甄选</h2></div><Link href="/shop" className="ui-button ui-button--secondary">查看全部 <Arrow /></Link></div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {selected.map((item) => <Link href={item.href} key={item.name} className="group"><div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#dedbd4]"><Image src={item.image} alt={item.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" /></div><div className="mt-4 flex items-start justify-between border-t border-black/15 pt-4"><div><h3 className="font-serif text-2xl">{item.name}</h3><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-black/50">{item.meta}</p></div><Arrow /></div></Link>)}
          </div>
        </div>
      </section>

      <section className="ui-section">
        <div className="ui-container grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="ui-eyebrow">Private atelier</p><h2 className="ui-title mt-4 max-w-3xl">已经有明确想法？把它整理成一份设计师能直接理解的委托。</h2></div><Link href="/vip-atelier" className="ui-button ui-button--primary">开始高级定制 <Arrow /></Link></div>
      </section>
    </div>
  );
}
