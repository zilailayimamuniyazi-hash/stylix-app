"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { Locale, Translations } from "./types";
import { LOCALES, RTL_LOCALES } from "./types";
import { getTranslations } from "./index";

const STORAGE_KEY = "stylix-locale";

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored && LOCALES.includes(stored)) return stored;
  const browser = navigator.language.split("-")[0] as Locale;
  if (LOCALES.includes(browser)) return browser;
  return "en";
}

function applyLocaleToDocument(locale: Locale) {
  if (typeof document === "undefined") return;
  const isRTL = RTL_LOCALES.includes(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = isRTL ? "rtl" : "ltr";
}

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    applyLocaleToDocument(detected);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
    applyLocaleToDocument(next);
  }, []);

  const t = useMemo(() => getTranslations(locale), [locale]);

  const value = useMemo(
    () => ({ locale, t, setLocale }),
    [locale, t, setLocale]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
