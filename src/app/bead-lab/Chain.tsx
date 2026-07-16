"use client";

import type { ChainStyle } from "./config";
import type { Pt } from "./draw";
import { finishFill, finishOf, metalFill, metalOf } from "./finishes";

interface ChainProps {
  style: ChainStyle;
  pts: Pt[];
  pathD: string;
  metal: string;
}

const deg = (r: number) => (r * 180) / Math.PI;

export function Chain({ style, pts, pathD, metal }: ChainProps) {
  const m = metalOf(metal);
  const mFill = metalFill(metal);

  if (style === "pearl" || style === "jade-bead") {
    const fid = style === "pearl" ? "pearl" : "jade";
    const f = finishOf(fid);
    const r = style === "pearl" ? 8 : 10;
    return (
      <g>
        <path d={pathD} fill="none" stroke={m.stroke} strokeWidth={1} opacity={0.15} strokeDasharray="2 4" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x + 1} cy={p.y + 2} r={r} fill="rgba(0,0,0,0.15)" filter="url(#bead-soft-shadow)" />
            <circle cx={p.x} cy={p.y} r={r} fill={finishFill(fid)} stroke={f.stroke} strokeWidth={0.4} />
            <ellipse cx={p.x - r * 0.3} cy={p.y - r * 0.3} rx={r * 0.35} ry={r * 0.25}
              fill="rgba(255,255,255,0.45)" transform={`rotate(-25 ${p.x - r * 0.3} ${p.y - r * 0.3})`} />
            <ellipse cx={p.x + r * 0.15} cy={p.y + r * 0.2} rx={r * 0.5} ry={r * 0.15}
              fill="rgba(255,255,255,0.08)" transform={`rotate(20 ${p.x} ${p.y})`} />
          </g>
        ))}
      </g>
    );
  }

  if (style === "snake") {
    return (
      <g>
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={11} strokeLinecap="round"
          transform="translate(1,2)" />
        <path d={pathD} fill="none" stroke={mFill} strokeWidth={9} strokeLinecap="round" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={3}
          strokeLinecap="round" strokeDasharray="1 3" />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} strokeLinecap="round" />
      </g>
    );
  }

  if (style === "cord") {
    return (
      <g>
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={4} strokeLinecap="round"
          transform="translate(0.5,1.5)" />
        <path d={pathD} fill="none" stroke={m.stroke} strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g>
      <path d={pathD} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={2.5}
        transform="translate(0.5,1)" />
      <path d={pathD} fill="none" stroke={mFill} strokeWidth={1.5} opacity={0.3} />
      {pts.map((p, i) => {
        const rot = deg(p.angle);
        if (style === "cuban") {
          return (
            <g key={i}>
              <rect x={p.x - 6} y={p.y - 4} width={12} height={8} rx={2.5}
                transform={`rotate(${rot} ${p.x} ${p.y})`}
                fill={mFill} stroke={m.stroke} strokeWidth={0.4} />
              <rect x={p.x - 4} y={p.y - 2.5} width={8} height={1.5} rx={0.75}
                transform={`rotate(${rot} ${p.x} ${p.y})`}
                fill="rgba(255,255,255,0.15)" />
            </g>
          );
        }
        if (style === "box") {
          return (
            <g key={i}>
              <rect x={p.x - 3.5} y={p.y - 3.5} width={7} height={7} rx={1}
                transform={`rotate(${rot} ${p.x} ${p.y})`}
                fill={mFill} stroke={m.stroke} strokeWidth={0.4} />
              <rect x={p.x - 2} y={p.y - 2} width={4} height={1} rx={0.5}
                transform={`rotate(${rot} ${p.x} ${p.y})`}
                fill="rgba(255,255,255,0.18)" />
            </g>
          );
        }
        const long = style === "figaro" && i % 3 === 0;
        const rx = long ? 8 : 4.5;
        return (
          <g key={i}>
            <ellipse cx={p.x} cy={p.y} rx={rx} ry={3}
              transform={`rotate(${rot} ${p.x} ${p.y})`}
              fill="none" stroke={mFill} strokeWidth={2.2} />
            <ellipse cx={p.x} cy={p.y} rx={rx * 0.6} ry={1}
              transform={`rotate(${rot} ${p.x} ${p.y})`}
              fill="rgba(255,255,255,0.1)" />
          </g>
        );
      })}
    </g>
  );
}
