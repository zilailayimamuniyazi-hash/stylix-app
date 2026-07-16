"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { useAuth } from "@/lib/auth/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const nav = [
  { href: "/test", label: "JMTI 测试" },
  { href: "/try-on", label: "Try-On" },
  { href: "/bead-lab", label: "设计工作室" },
  { href: "/vip-atelier", label: "高级定制" },
  { href: "/designers", label: "设计师合作" },
  { href: "/shop", label: "商城" },
];

function isActive(pathname: string, href: string) {
  if (href === "/test") return pathname === "/test" || pathname === "/result" || pathname === "/daily";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { itemCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const isHome = pathname === "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`fixed top-0 z-50 w-full border-b border-[var(--ui-line)] backdrop-blur-xl ${isHome ? "bg-black/55" : "bg-[rgba(11,12,14,.88)]"}`}>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" className="font-serif text-xl uppercase tracking-[0.14em] text-[var(--ui-text)] hover:text-[var(--ui-accent-hover)] sm:text-2xl">
          STYLIX
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={"text-[10px] uppercase tracking-[0.1em] hover:text-[var(--ui-text)] " + (isActive(pathname, item.href) ? "text-[var(--ui-accent)]" : "text-[var(--ui-text-3)]")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <LanguageSwitcher />
          <Link href="/daily" className="text-[10px] uppercase tracking-[0.12em] text-[var(--ui-text-3)] hover:text-[var(--ui-text)]">
            Daily
          </Link>
          <Link
            href="/wishlist"
            className="relative flex min-h-11 min-w-11 items-center justify-center text-[var(--ui-text-3)] hover:text-[var(--ui-text)]"
            aria-label="Wishlist"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            {mounted && wishlistItems.length > 0 && (
              <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-rosegold">({wishlistItems.length})</span>
            )}
          </Link>
          <Link href="/bag" className="relative inline-flex min-h-11 items-center text-[10px] uppercase tracking-[0.12em] text-[var(--ui-text-3)] hover:text-[var(--ui-text)]">
            购物袋
            {mounted && itemCount > 0 && <span className="ml-1 text-gold">({itemCount})</span>}
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/member" className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-xs font-serif text-gold">
                {user.name.charAt(0).toUpperCase()}
              </Link>
              <button type="button" onClick={logout} className="min-h-11 text-[10px] uppercase tracking-[0.12em] text-[var(--ui-text-3)] hover:text-[var(--ui-text)]">
                退出
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setAuthOpen(true)} className="ui-button ui-button--secondary min-h-9 px-4 text-[10px]">登录</button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 xl:hidden"
          aria-label={open ? "关闭导航" : "打开导航"}
          aria-expanded={open}
        >
          <span className={`h-px w-5 bg-[var(--ui-text)] transition-transform ${open ? "translate-y-1 rotate-45" : ""}`} />
          <span className={`h-px w-5 bg-[var(--ui-text)] transition-transform ${open ? "-translate-y-1 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[var(--ui-line)] bg-[var(--ui-bg)] px-6 py-6 xl:hidden">
          <div className="flex flex-col gap-4">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="flex min-h-11 items-center text-sm text-[var(--ui-text-2)]">
                {item.label}
              </Link>
            ))}
            <Link href="/daily" onClick={() => setOpen(false)} className="text-sm uppercase tracking-widest text-ivory-soft">
              Daily
            </Link>
            <Link href="/member" onClick={() => setOpen(false)} className="text-sm uppercase tracking-widest text-ivory-soft">
              会员中心
            </Link>
            <Link href="/wishlist" onClick={() => setOpen(false)} className="text-sm uppercase tracking-widest text-ivory-soft">
              心愿单 {mounted && wishlistItems.length > 0 && "(" + wishlistItems.length + ")"}
            </Link>
            <Link href="/bag" onClick={() => setOpen(false)} className="text-sm uppercase tracking-widest text-ivory-soft">
              购物袋 {mounted && itemCount > 0 && "(" + itemCount + ")"}
            </Link>
            {user && (
              <button type="button" onClick={() => { logout(); setOpen(false); }} className="text-left text-sm uppercase tracking-widest text-ivory-soft">
                退出
              </button>
            )}
            {!user && <button type="button" onClick={() => { setAuthOpen(true); setOpen(false); }} className="text-left text-sm uppercase tracking-widest text-gold">登录 / 注册</button>}
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
