"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { JmtiProfile, JmtiScores } from "@/lib/identity/engine";
import { downloadShareCard, generateShareCard, getShareUrl } from "@/lib/share/generateShareCard";
import { JMTIShareCard } from "./JMTIShareCard";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  jmtiCode: string;
  profile: JmtiProfile;
  scores: JmtiScores;
  matchPercent: number;
}

export function ShareModal({ open, onClose, jmtiCode, profile, scores, matchPercent }: ShareModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showWeChatHint, setShowWeChatHint] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generatePreview = useCallback(() => {
    setGenerating(true);
    try {
      const dataUrl = generateShareCard({ jmtiCode, profile, scores, matchPercent });
      setPreviewUrl(dataUrl);
    } catch {
      setPreviewUrl(null);
    } finally {
      setGenerating(false);
    }
  }, [jmtiCode, profile, scores, matchPercent]);

  useEffect(() => {
    if (open) {
      setCopied(false);
      setShowWeChatHint(false);
      generatePreview();
    }
  }, [open, generatePreview]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleSave = useCallback(() => {
    if (!previewUrl) return;
    downloadShareCard(previewUrl, `stylix-${jmtiCode.toLowerCase()}-share.png`);
  }, [previewUrl, jmtiCode]);

  const handleCopyLink = useCallback(async () => {
    const url = getShareUrl(jmtiCode);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [jmtiCode]);

  const handleWeChatShare = useCallback(() => {
    setShowWeChatHint(true);
  }, []);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="glass-panel relative max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-white/[.05] shadow-luxury backdrop-blur-[20px] animate-fade-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-ivory/30 transition-colors hover:text-ivory/60"
          aria-label="关闭"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 pt-12">
          <p id="share-modal-title" className="text-center text-[10px] uppercase tracking-[0.45em] text-gold/70">
            分享珠宝人格
          </p>
          <h2 className="mt-3 text-center font-serif text-2xl text-ivory">生成专属分享卡</h2>

          <div className="mt-6 flex justify-center">
            {generating ? (
              <div className="flex aspect-[4/5] w-full max-w-[280px] items-center justify-center border border-ivory/10 bg-ink-soft/30">
                <p className="text-sm text-ivory/40">生成中…</p>
              </div>
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`JMTI ${jmtiCode} 分享卡`}
                className="w-full max-w-[280px] border border-gold/20 shadow-card"
              />
            ) : (
              <JMTIShareCard
                jmtiCode={jmtiCode}
                profile={profile}
                scores={scores}
                matchPercent={matchPercent}
                className="max-w-[280px]"
              />
            )}
          </div>

          {showWeChatHint && (
            <div className="mt-4 rounded border border-gold/20 bg-gold/5 p-4 text-center">
              <p className="text-sm leading-6 text-ivory/70">
                请先点击「保存图片」，然后在微信中选择图片发送给好友或发布到朋友圈。
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!previewUrl}
              className="border border-gold/35 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-gold transition-colors hover:bg-gold hover:text-ink-deep disabled:opacity-40"
            >
              保存图片
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="border border-ivory/15 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-ivory/55 transition-colors hover:border-gold/40 hover:text-gold"
            >
              {copied ? "已复制" : "复制链接"}
            </button>
            <button
              type="button"
              onClick={handleWeChatShare}
              className="border border-ivory/15 px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-ivory/55 transition-colors hover:border-gold/40 hover:text-gold"
            >
              分享到微信
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
