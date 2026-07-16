"use client";

import Link from "next/link";

const links = [
  { href: "/test", label: "JMTI 珠宝人格测试" },
  { href: "/try-on", label: "虚拟试戴" },
  { href: "/vip-atelier", label: "VIP 高级定制" },
  { href: "/designers", label: "设计师合作" },
  { href: "/daily", label: "Daily 每日身份" },
  { href: "/member", label: "会员中心" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--ui-line)] bg-[var(--ui-bg)]">
      <div className="ui-container py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-serif text-3xl uppercase tracking-[0.14em] text-[var(--ui-text)]">Stylix</p>
            <p className="ui-copy mt-4 max-w-sm">
              从理解个人风格，到预览、选择与定制一件真正适合你的珠宝。
            </p>
          </div>
          <div>
            <p className="ui-eyebrow">体验</p>
            <div className="mt-4 grid gap-1">
              {links.slice(0, 4).map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="ui-eyebrow">服务</p>
            <div className="mt-4 grid gap-1">
              {links.slice(4).map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">
                  {link.label}
                </Link>
              ))}
              <a href="mailto:zilailayimamuniyazi@gmail.com" className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">
                客服邮箱
              </a>
              <Link href="/privacy" className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">隐私政策</Link>
              <Link href="/terms" className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">服务条款</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-[var(--ui-line)] pt-6 text-[10px] text-[var(--ui-text-3)]">
          © {new Date().getFullYear()} Stylix. JMTI identity-led jewelry intelligence.
        </p>
      </div>
    </footer>
  );
}
