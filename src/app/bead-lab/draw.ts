import type { Category } from "./config";

export const CANVAS = { w: 520, h: 420 };

export interface Pt { x: number; y: number; angle: number }

function necklacePath(lengthCm: number) {
  const cx = CANVAS.w / 2;
  const t = (lengthCm - 40) / 20;
  const rx = 130 + t * 35;
  const ry = 110 + t * 55;
  const cy = 120;
  const spread = Math.PI * (0.82 + t * 0.06);
  const a0 = Math.PI / 2 - spread / 2;
  const a1 = Math.PI / 2 + spread / 2;
  return { cx, cy, rx, ry, a0, a1 };
}

function braceletPath(lengthCm: number) {
  const cx = CANVAS.w / 2;
  const t = (lengthCm - 14) / 6;
  const rx = 150 + t * 35;
  const ry = 60 + t * 18;
  const cy = CANVAS.h / 2 - 30;
  const spread = Math.PI * 0.72;
  const a0 = Math.PI / 2 - spread / 2;
  const a1 = Math.PI / 2 + spread / 2;
  return { cx, cy, rx, ry, a0, a1 };
}

function sampleArc(p: { cx: number; cy: number; rx: number; ry: number; a0: number; a1: number }, n: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = p.a0 + (p.a1 - p.a0) * (n === 1 ? 0.5 : i / (n - 1));
    const x = p.cx + Math.cos(a) * p.rx;
    const y = p.cy + Math.sin(a) * p.ry;
    const angle = Math.atan2(Math.cos(a) * p.ry, -Math.sin(a) * p.rx);
    out.push({ x, y, angle });
  }
  return out;
}

function ringGeom(size: number) {
  const t = (size - 12) / 8;
  return { cx: CANVAS.w / 2, cy: CANVAS.h / 2 + 10, r: 80 + t * 18, band: 14 + t * 8 };
}

export interface Geometry {
  d: string;
  pts: Pt[];
  anchor: Pt;
  closed: boolean;
  ring: { cx: number; cy: number; r: number; band: number } | null;
}

function arcToPath(pts: Pt[]): string {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
}

export function geometry(category: Category, length: number, sampleCount: number): Geometry {
  if (category === "ring") {
    const g = ringGeom(length);
    const pts: Pt[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const a = -Math.PI / 2 + (i / sampleCount) * Math.PI * 2;
      pts.push({ x: g.cx + Math.cos(a) * g.r, y: g.cy + Math.sin(a) * g.r, angle: a + Math.PI / 2 });
    }
    return { d: "", pts, anchor: { x: g.cx, y: g.cy - g.r, angle: 0 }, closed: true, ring: g };
  }

  const arc = category === "necklace" ? necklacePath(length) : braceletPath(length);
  const pts = sampleArc(arc, sampleCount);
  const bottom = pts.reduce((lo, p) => (p.y > lo.y ? p : lo), pts[0]);
  return { d: arcToPath(pts), pts, anchor: bottom, closed: false, ring: null };
}
