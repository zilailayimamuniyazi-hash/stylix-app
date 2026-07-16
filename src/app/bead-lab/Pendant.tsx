"use client";

import type { PendantShape } from "./config";
import type { Pt } from "./draw";
import { finishFill, finishOf, metalFill, metalOf } from "./finishes";

interface PendantProps {
  shape: PendantShape;
  anchor: Pt;
  finish: string;
  metal: string;
  seated?: boolean;
}

export function Pendant({ shape, anchor, finish, metal, seated }: PendantProps) {
  if (shape === "none") return null;
  const f = finishOf(finish);
  const fill = finishFill(finish);
  const mFill = metalFill(metal);
  const m = metalOf(metal);
  const drop = seated ? 0 : 26;
  const cx = anchor.x;
  const cy = anchor.y + drop + (seated ? 0 : 14);
  const stroke = f.stroke;

  const bail = !seated && (
    <g>
      <line x1={anchor.x} y1={anchor.y} x2={cx} y2={cy - shapeTop(shape)}
        stroke={m.stroke} strokeWidth={1.5} opacity={0.5} />
      <line x1={anchor.x + 0.5} y1={anchor.y} x2={cx + 0.5} y2={cy - shapeTop(shape)}
        stroke="rgba(255,255,255,0.1)" strokeWidth={0.8} />
      <ellipse cx={cx} cy={anchor.y + drop * 0.5} rx={3.5} ry={4.5}
        fill="none" stroke={mFill} strokeWidth={2} />
      <ellipse cx={cx - 1} cy={anchor.y + drop * 0.5 - 1} rx={1.5} ry={2}
        fill="rgba(255,255,255,0.2)" />
    </g>
  );

  return (
    <g>
      {bail}
      <g transform={`translate(${cx},${cy})`}>
        <g transform="translate(2,4)" opacity={0.12}>
          {renderShape(shape, 0, 0, "rgba(0,0,0,0.5)", "none", "none", true)}
        </g>
        {renderShape(shape, 0, 0, fill, stroke, mFill, false)}
        {renderHighlight(shape)}
      </g>
    </g>
  );
}

function shapeTop(shape: PendantShape): number {
  if (shape === "tag") return 22;
  if (shape === "fu") return 20;
  return 16;
}

function renderHighlight(shape: PendantShape) {
  switch (shape) {
    case "peace":
      return (
        <g>
          <ellipse cx={-5} cy={-6} rx={6} ry={4} fill="rgba(255,255,255,0.3)"
            transform="rotate(-20 -5 -6)" />
          <ellipse cx={6} cy={4} rx={8} ry={3} fill="rgba(255,255,255,0.06)"
            transform="rotate(15 6 4)" />
        </g>
      );
    case "round-gem":
      return (
        <g>
          <ellipse cx={-4} cy={-5} rx={5} ry={3.5} fill="rgba(255,255,255,0.35)"
            transform="rotate(-25 -4 -5)" />
          <ellipse cx={3} cy={3} rx={7} ry={2} fill="rgba(255,255,255,0.08)"
            transform="rotate(10 3 3)" />
          <circle cx={-6} cy={-7} r={1.5} fill="rgba(255,255,255,0.5)" />
        </g>
      );
    case "heart":
      return (
        <ellipse cx={-3} cy={-6} rx={5} ry={3} fill="rgba(255,255,255,0.3)"
          transform="rotate(-30 -3 -6)" />
      );
    case "pearl-drop":
      return (
        <g>
          <ellipse cx={-3} cy={-5} rx={4} ry={3} fill="rgba(255,255,255,0.4)"
            transform="rotate(-20 -3 -5)" />
          <ellipse cx={2} cy={4} rx={5} ry={2} fill="rgba(255,255,255,0.08)" />
        </g>
      );
    case "tag":
    case "fu":
      return (
        <g>
          <rect x={-8} y={-18} width={6} height={20} rx={3}
            fill="rgba(255,255,255,0.12)" transform="rotate(-5 -5 -8)" />
          <rect x={4} y={4} width={5} height={12} rx={2.5}
            fill="rgba(255,255,255,0.05)" />
        </g>
      );
    case "clover":
      return (
        <ellipse cx={-3} cy={-5} rx={4} ry={3} fill="rgba(255,255,255,0.25)"
          transform="rotate(-25 -3 -5)" />
      );
    case "cross":
      return (
        <rect x={-3} y={-16} width={3} height={14} rx={1.5}
          fill="rgba(255,255,255,0.15)" transform="rotate(-3 -1.5 -9)" />
      );
    default:
      return null;
  }
}

function renderShape(shape: PendantShape, cx: number, cy: number, fill: string, stroke: string, metal: string, isShadow: boolean) {
  const sw = isShadow ? 0 : 0.8;
  switch (shape) {
    case "peace":
      return (
        <g>
          <circle cx={cx} cy={cy} r={18} fill={fill} stroke={stroke} strokeWidth={sw} />
          <circle cx={cx} cy={cy} r={7} fill={isShadow ? fill : "rgba(0,0,0,0.12)"}
            stroke={isShadow ? "none" : stroke} strokeWidth={sw * 0.6} />
        </g>
      );
    case "tag":
      return <rect x={cx - 13} y={cy - 22} width={26} height={44} rx={13}
        fill={fill} stroke={stroke} strokeWidth={sw} />;
    case "fu":
      return (
        <g>
          <rect x={cx - 18} y={cy - 20} width={36} height={40} rx={5}
            fill={fill} stroke={stroke} strokeWidth={sw} />
          {!isShadow && (
            <text x={cx} y={cy + 7} textAnchor="middle" fontSize={20}
              fill="rgba(120,20,10,0.55)" fontFamily="serif" fontWeight="bold">福</text>
          )}
        </g>
      );
    case "heart": {
      const d = `M ${cx} ${cy + 14} C ${cx - 20} ${cy - 4}, ${cx - 12} ${cy - 20}, ${cx} ${cy - 8} C ${cx + 12} ${cy - 20}, ${cx + 20} ${cy - 4}, ${cx} ${cy + 14} Z`;
      return <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} />;
    }
    case "clover":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw * 0.8}>
          {[0, 90, 180, 270].map((a) => (
            <ellipse key={a} cx={cx} cy={cy - 9} rx={7} ry={10}
              transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          {!isShadow && <circle cx={cx} cy={cy} r={3} fill={metal} stroke="none" />}
        </g>
      );
    case "pearl-drop":
      return <ellipse cx={cx} cy={cy} rx={12} ry={15} fill={fill} stroke={stroke} strokeWidth={sw} />;
    case "cross":
      return (
        <g fill={fill} stroke={stroke} strokeWidth={sw}>
          <rect x={cx - 5} y={cy - 18} width={10} height={40} rx={2} />
          <rect x={cx - 15} y={cy - 8} width={30} height={10} rx={2} />
        </g>
      );
    case "round-gem":
      return (
        <g>
          {!isShadow && <circle cx={cx} cy={cy} r={17.5} fill={metal} stroke="none" />}
          <circle cx={cx} cy={cy} r={15} fill={fill} stroke={stroke} strokeWidth={sw} />
          {!isShadow && (
            <>
              <circle cx={cx} cy={cy} r={16.5} fill="none" stroke={metal} strokeWidth={2.5} />
              <circle cx={cx} cy={cy} r={13} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={0.5} />
            </>
          )}
        </g>
      );
    default:
      return null;
  }
}
