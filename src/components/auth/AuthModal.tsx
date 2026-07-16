"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import { useI18n } from "@/lib/i18n/context";

type Mode = "login" | "register";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register } = useAuth();
  const { t } = useI18n();
  const a = t.auth;
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(null);
      setEmail("");
      setPassword("");
      setName("");
    }
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = mode === "login"
        ? await login(email, password)
        : await register(email, password, name);

      if (result.ok && "requiresConfirmation" in result && result.requiresConfirmation) {
        setSuccess("注册邮件已发送，请前往邮箱完成验证后登录。");
      } else if (result.ok) {
        onClose();
      } else {
        setError(result.error === "invalid_email" ? a.errorInvalidEmail : (result.error ?? a.errorGeneric));
      }
    } catch {
      setError(a.errorGeneric);
    }
    setLoading(false);
  }, [mode, email, password, name, login, register, onClose, a]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div role="dialog" aria-modal="true" className="glass-panel ui-dialog-shadow relative w-full max-w-md rounded-lg border border-[var(--ui-line)] animate-fade-up">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ivory/30 hover:text-ivory/60 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="px-8 py-10 sm:px-10 sm:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="font-serif text-2xl text-ivory mb-2">
              {mode === "login" ? a.loginTitle : a.registerTitle}
            </p>
            <p className="text-xs text-ivory/40">
              {mode === "login" ? a.loginSubtitle : a.registerSubtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (
              <div>
                <label className="block text-[9px] uppercase tracking-[0.3em] text-ivory/40 mb-2">
                  {a.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="ui-field"
                  placeholder={a.namePlaceholder}
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] uppercase tracking-[0.3em] text-ivory/40 mb-2">
                {a.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="ui-field"
                placeholder={a.emailPlaceholder}
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.3em] text-ivory/40 mb-2">
                {a.passwordLabel}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="ui-field"
                placeholder={a.passwordPlaceholder}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center">{error}</p>
            )}
            {success && <p role="status" className="border border-gold/20 bg-gold/5 px-4 py-3 text-center text-xs leading-5 text-gold">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="ui-button ui-button--primary w-full"
            >
              {loading
                ? a.loading
                : mode === "login"
                  ? a.loginButton
                  : a.registerButton}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setSuccess(null); }}
              className="text-xs text-ivory/40 hover:text-gold transition-colors"
            >
              {mode === "login" ? a.switchToRegister : a.switchToLogin}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
