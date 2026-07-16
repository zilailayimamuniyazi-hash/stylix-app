"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT_LABELS } from "@/lib/i18n/types";
import type { Locale } from "@/lib/i18n/types";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSelect(l: Locale) {
    setLocale(l);
    setOpen(false);
  }

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen((o) => !o);
  }

  return (
    <div ref={ref} className="relative z-[60]">
      <button
        type="button"
        onClick={handleToggle}
        className="flex min-h-11 items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ui-text-3)] hover:text-[var(--ui-text)] cursor-pointer select-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{LOCALE_SHORT_LABELS[locale]}</span>
        <svg
          className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 10 6"
          fill="none"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="glass-panel absolute right-0 top-full z-[70] mt-2 min-w-[10rem] rounded-lg border border-[var(--ui-line)] py-1"
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              role="option"
              aria-selected={l === locale}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(l);
              }}
              className={`min-h-11 w-full px-4 text-left text-[11px] tracking-[0.08em] hover:bg-white/5 cursor-pointer ${
                l === locale ? "text-[var(--ui-accent)]" : "text-[var(--ui-text-2)]"
              }`}
            >
              <span className="mr-2 font-mono opacity-50">{LOCALE_SHORT_LABELS[l]}</span>
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
