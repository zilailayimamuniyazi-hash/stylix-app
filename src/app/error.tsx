"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div className="glass-panel max-w-lg border border-white/10 p-8 backdrop-blur-[20px] sm:p-10">
      <p className="text-[10px] uppercase tracking-[.3em] text-gold/70">System notice</p>
      <h2 className="mt-4 font-serif text-3xl text-ivory">{t.errors.somethingWrong}</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-ivory/50">
        {t.errors.unexpectedError}
      </p>
      <button
        onClick={reset}
        className="mt-7 min-h-11 bg-gold px-7 text-[10px] font-medium uppercase tracking-[.2em] text-ink-deep hover:bg-gold-light"
      >
        {t.errors.tryAgain}
      </button>
      </div>
    </div>
  );
}
