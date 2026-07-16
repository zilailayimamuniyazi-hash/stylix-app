"use client";

import { Chain } from "./Chain";
import { Pendant } from "./Pendant";
import { CANVAS, geometry } from "./draw";
import type { Design } from "./config";
import {
  FINISH_LIST, METAL_LIST, finishGradKey, metalGradKey, metalFill, metalOf,
} from "./finishes";
import { BACKDROPS, type BackdropId } from "./materials";

interface CanvasProps {
  design: Design;
  backdropId: BackdropId;
}

function sampleCount(design: Design): number {
  const { category, chain, length } = design;
  if (category === "ring") return chain === "cord" ? 16 : 0;
  const base = category === "necklace" ? length * 1.4 : length * 2.2;
  if (chain === "pearl") return Math.round(base / 10);
  if (chain === "jade-bead") return Math.round(base / 13);
  if (chain === "cuban" || chain === "figaro") return Math.round(base / 8);
  if (chain === "snake" || chain === "cord") return 2;
  return Math.round(base / 6);
}

export function ProductCanvas({ design, backdropId }: CanvasProps) {
  const backdrop = BACKDROPS[backdropId];
  const g = geometry(design.category, design.length, Math.max(sampleCount(design), 2));
  const isRing = design.category === "ring";

  return (
    <div
      style={{
        position: "relative", width: CANVAS.w, height: CANVAS.h, maxWidth: "100%",
        borderRadius: 16, overflow: "hidden", background: backdrop.background,
      }}
    >
      {/* Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)",
        pointerEvents: "none",
      }} />

      <svg width={CANVAS.w} height={CANVAS.h} viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
        style={{ position: "absolute", inset: 0, maxWidth: "100%" }}>
        <defs>
          {METAL_LIST.map((m) => (
            <linearGradient key={`lg-${m.id}`} id={metalGradKey(m.id)}
              x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={m.stops[0]} />
              <stop offset="25%" stopColor={m.stops[1]} />
              <stop offset="55%" stopColor={m.stops[0]} stopOpacity={0.65} />
              <stop offset="80%" stopColor={m.stops[1]} />
              <stop offset="100%" stopColor={m.stops[2]} />
            </linearGradient>
          ))}
          {FINISH_LIST.map((f) => (
            <radialGradient key={f.id} id={finishGradKey(f.id)} cx="35%" cy="28%" r="72%">
              <stop offset="0%" stopColor={f.stops[0]} />
              <stop offset="35%" stopColor={f.stops[1]} />
              <stop offset="100%" stopColor={f.stops[2]} />
            </radialGradient>
          ))}
          <filter id="jewelry-shadow" x="-25%" y="-15%" width="150%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
            <feOffset dx="4" dy="12" result="offsetBlur" />
            <feComponentTransfer in="offsetBlur" result="fadedBlur">
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="fadedBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="bead-soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="1" dy="3" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
          </filter>
          <filter id="ambient-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="glow" />
            <feComposite in="glow" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>

        <g filter="url(#jewelry-shadow)">
          {isRing && g.ring && (
            <g>
              <circle cx={g.ring.cx} cy={g.ring.cy} r={g.ring.r} fill="none"
                stroke={metalFill(design.metal)} strokeWidth={g.ring.band} />
              <circle cx={g.ring.cx} cy={g.ring.cy} r={g.ring.r + g.ring.band * 0.48} fill="none"
                stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
              <circle cx={g.ring.cx} cy={g.ring.cy} r={g.ring.r - g.ring.band * 0.48} fill="none"
                stroke={metalOf(design.metal).stroke} strokeWidth={0.5} opacity={0.5} />
              <circle cx={g.ring.cx} cy={g.ring.cy} r={g.ring.r + g.ring.band * 0.15} fill="none"
                stroke="rgba(255,255,255,0.06)" strokeWidth={g.ring.band * 0.3}
                strokeDasharray="1 4" />
            </g>
          )}

          {isRing && design.chain === "cord" && (
            <Chain style="jade-bead" pts={g.pts} pathD={g.d} metal={design.metal} />
          )}

          {!isRing && <Chain style={design.chain} pts={g.pts} pathD={g.d} metal={design.metal} />}

          <Pendant shape={design.pendant} anchor={g.anchor} finish={design.finish} metal={design.metal} seated={isRing} />
        </g>
      </svg>
    </div>
  );
}
