"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useI18n();
  const links = [
    { href: "/test", label: t.nav.test },
    { href: "/try-on", label: t.nav.tryOn },
    { href: "/vip-atelier", label: t.nav.vip },
    { href: "/designers", label: t.nav.designers },
    { href: "/daily", label: t.nav.daily },
    { href: "/member", label: t.nav.member },
  ];

  // The editorial homepage already contains its own Atelier/Contact footer.
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-[var(--ui-line)] bg-[var(--ui-bg)]">
      <div className="ui-container py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-serif text-3xl uppercase tracking-[0.14em] text-[var(--ui-text)]">Stylix</p>
            <p className="ui-copy mt-4 max-w-sm">
              {t.footer.description}
            </p>
          </div>
          <div>
            <p className="ui-eyebrow">{t.footer.experience}</p>
            <div className="mt-4 grid gap-1">
              {links.slice(0, 4).map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="ui-eyebrow">{t.footer.service}</p>
            <div className="mt-4 grid gap-1">
              {links.slice(4).map((link) => (
                <Link key={link.href} href={link.href} className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">
                  {link.label}
                </Link>
              ))}
              <a href="mailto:zilailayimamuniyazi@gmail.com" className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">
                {t.footer.customerEmail}
              </a>
              <Link href="/privacy" className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">{t.footer.privacy}</Link>
              <Link href="/terms" className="flex min-h-9 items-center text-sm text-[var(--ui-text-2)] hover:text-[var(--ui-text)]">{t.footer.terms}</Link>
            </div>
          </div>
        </div>
        <p className="mt-10 border-t border-[var(--ui-line)] pt-6 text-[10px] text-[var(--ui-text-3)]">
          © {new Date().getFullYear()} Stylix. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
