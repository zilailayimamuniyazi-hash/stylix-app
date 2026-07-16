"use client";

import type { JmtiProfile, JmtiScores } from "@/lib/identity/engine";

export interface JMTIShareCardProps {
  jmtiCode: string;
  profile: JmtiProfile;
  scores: JmtiScores;
  matchPercent: number;
  className?: string;
}

const DIMENSIONS = [
  { left: "L", right: "O", label: "L / O" },
  { left: "M", right: "T", label: "M / T" },
  { left: "A", right: "S", label: "A / S" },
  { left: "D", right: "G", label: "D / G" },
] as const;

export function JMTIShareCard({ jmtiCode, profile, scores, matchPercent, className = "" }: JMTIShareCardProps) {
  return (
    <div
      className={`relative aspect-[4/5] w-full max-w-[360px] overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] ${className}`}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_35%,rgba(201,169,98,0.08),transparent)]" />

      <div className="absolute inset-4 border border-[#c9a962]">
        <div className="absolute inset-3 border border-[#c9a962]/25" />
      </div>

      <div className="relative flex h-full flex-col px-8 py-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.55em] text-[#c9a962]">STYLIX</p>
        <p className="mt-1 text-[9px] tracking-[0.2em] text-[#f5f0e8]/45">JMTI · 珠宝人格测试</p>

        <div className="mt-8">
          <p className="font-serif text-5xl tracking-wider text-[#c9a962]">{jmtiCode}</p>
          <div className="mx-auto mt-3 h-px w-24 bg-[#c9a962]/40" />
        </div>

        <div className="mt-5">
          <p className="font-serif text-2xl text-[#e8d5a3]">
            {profile.alias} · {profile.nameCn}
          </p>
          <p className="mt-2 text-xs text-[#f5f0e8]/50">{profile.nickname}</p>
        </div>

        <div className="mt-8 space-y-5 px-2">
          {DIMENSIONS.map((dim) => {
            const leftScore = scores[dim.left];
            const rightScore = scores[dim.right];
            const total = Math.max(leftScore + rightScore, 1);
            const leftPct = (leftScore / total) * 100;

            return (
              <div key={dim.label}>
                <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.2em]">
                  <span className="text-[#c9a962]">{dim.label}</span>
                  <span className="text-[#f5f0e8]/40">
                    {leftScore} : {rightScore}
                  </span>
                </div>
                <div className="relative flex h-2 overflow-hidden bg-[#f5f0e8]/8">
                  <div
                    className="h-full bg-gradient-to-r from-[#c9a962] to-[#e8d5a3]"
                    style={{ width: `${leftPct}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-[#e8d5a3]/35 to-[#c9a962]/15"
                    style={{ width: `${100 - leftPct}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between font-serif text-[10px]">
                  <span className={leftScore >= rightScore ? "text-[#f5f0e8]" : "text-[#f5f0e8]/35"}>{dim.left}</span>
                  <span className={rightScore > leftScore ? "text-[#f5f0e8]" : "text-[#f5f0e8]/35"}>{dim.right}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#c9a962]">匹配度 {matchPercent}%</p>
          <p className="mt-3 text-left text-sm leading-relaxed text-[#f5f0e8]/80">{profile.description}</p>

          <div className="mt-6 flex flex-col items-center">
            <div className="grid h-16 w-16 grid-cols-8 gap-px border border-[#c9a962]/35 p-1">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={
                    (Math.floor(i / 8) + (i % 8)) % 2 === 0 ||
                    (Math.floor(i / 8) < 3 && i % 8 < 3) ||
                    (Math.floor(i / 8) < 3 && i % 8 > 4) ||
                    (Math.floor(i / 8) > 4 && i % 8 < 3)
                      ? "bg-[#c9a962]"
                      : "bg-transparent"
                  }
                />
              ))}
            </div>
            <p className="mt-3 text-[9px] text-[#f5f0e8]/40">扫码探索你的珠宝人格</p>
          </div>

          <p className="mt-5 text-[9px] tracking-[0.15em] text-[#f5f0e8]/40">stylix.com | AI 珠宝身份系统</p>
        </div>
      </div>
    </div>
  );
}
