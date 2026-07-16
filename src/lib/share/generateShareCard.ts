import type { JmtiProfile, JmtiScores } from "@/lib/identity/engine";

export interface ShareCardData {
  jmtiCode: string;
  profile: JmtiProfile;
  scores: JmtiScores;
  matchPercent: number;
}

const WIDTH = 1080;
const HEIGHT = 1350;

const COLORS = {
  bgStart: "#0a0a0a",
  bgEnd: "#1a1a1a",
  gold: "#c9a962",
  lightGold: "#e8d5a3",
  ivory: "#f5f0e8",
  ivoryMuted: "rgba(245, 240, 232, 0.55)",
};

const DIMENSIONS = [
  { key: "LO" as const, left: "L", right: "O", label: "L / O" },
  { key: "MT" as const, left: "M", right: "T", label: "M / T" },
  { key: "AS" as const, left: "A", right: "S", label: "A / S" },
  { key: "DG" as const, left: "D", right: "G", label: "D / G" },
];

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, COLORS.bgStart);
  gradient.addColorStop(1, COLORS.bgEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const radial = ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.35, 0, WIDTH / 2, HEIGHT * 0.35, WIDTH * 0.6);
  radial.addColorStop(0, "rgba(201, 169, 98, 0.08)");
  radial.addColorStop(1, "transparent");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawBorder(ctx: CanvasRenderingContext2D) {
  const inset = 32;
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.strokeRect(inset, inset, WIDTH - inset * 2, HEIGHT - inset * 2);

  ctx.strokeStyle = "rgba(201, 169, 98, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(inset + 12, inset + 12, WIDTH - (inset + 12) * 2, HEIGHT - (inset + 12) * 2);
}

function drawBrand(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "600 24px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = "center";
  ctx.letterSpacing = "8px";
  ctx.fillText("STYLIX", WIDTH / 2, 120);
  ctx.restore();

  ctx.font = "400 14px Georgia, serif";
  ctx.fillStyle = COLORS.ivoryMuted;
  ctx.textAlign = "center";
  ctx.fillText("JMTI · 珠宝人格测试", WIDTH / 2, 152);
}

function drawTypeCode(ctx: CanvasRenderingContext2D, code: string) {
  ctx.font = "700 72px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = "center";
  ctx.fillText(code, WIDTH / 2, 280);

  ctx.strokeStyle = "rgba(201, 169, 98, 0.4)";
  ctx.lineWidth = 1;
  const lineW = 200;
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2 - lineW, 310);
  ctx.lineTo(WIDTH / 2 + lineW, 310);
  ctx.stroke();
}

function drawTypeName(ctx: CanvasRenderingContext2D, alias: string, nameCn: string, nickname: string) {
  ctx.font = "500 36px 'Noto Serif SC', 'STSong', 'SimSun', serif";
  ctx.fillStyle = COLORS.lightGold;
  ctx.textAlign = "center";
  ctx.fillText(`${alias} · ${nameCn}`, WIDTH / 2, 380);

  ctx.font = "400 18px 'Noto Sans SC', 'PingFang SC', sans-serif";
  ctx.fillStyle = COLORS.ivoryMuted;
  ctx.fillText(nickname, WIDTH / 2, 420);
}

function drawDimensionBars(ctx: CanvasRenderingContext2D, scores: JmtiScores) {
  const startY = 480;
  const barHeight = 18;
  const barWidth = 680;
  const barX = (WIDTH - barWidth) / 2;
  const gap = 72;

  ctx.textAlign = "left";

  for (let i = 0; i < DIMENSIONS.length; i++) {
    const dim = DIMENSIONS[i];
    const y = startY + i * gap;
    const leftScore = scores[dim.left as keyof JmtiScores];
    const rightScore = scores[dim.right as keyof JmtiScores];
    const total = Math.max(leftScore + rightScore, 1);
    const leftRatio = leftScore / total;

    ctx.font = "500 16px Georgia, serif";
    ctx.fillStyle = COLORS.gold;
    ctx.fillText(dim.label, barX, y - 8);

    ctx.font = "400 13px 'Noto Sans SC', sans-serif";
    ctx.fillStyle = COLORS.ivoryMuted;
    ctx.textAlign = "right";
    ctx.fillText(`${leftScore} : ${rightScore}`, barX + barWidth, y - 8);
    ctx.textAlign = "left";

    ctx.fillStyle = "rgba(245, 240, 232, 0.08)";
    ctx.fillRect(barX, y, barWidth, barHeight);

    const leftW = barWidth * leftRatio;
    const rightW = barWidth - leftW;

    const leftGrad = ctx.createLinearGradient(barX, 0, barX + leftW, 0);
    leftGrad.addColorStop(0, COLORS.gold);
    leftGrad.addColorStop(1, COLORS.lightGold);
    ctx.fillStyle = leftGrad;
    ctx.fillRect(barX, y, leftW, barHeight);

    const rightGrad = ctx.createLinearGradient(barX + leftW, 0, barX + barWidth, 0);
    rightGrad.addColorStop(0, "rgba(232, 213, 163, 0.35)");
    rightGrad.addColorStop(1, "rgba(201, 169, 98, 0.15)");
    ctx.fillStyle = rightGrad;
    ctx.fillRect(barX + leftW, y, rightW, barHeight);

    ctx.font = "600 14px Georgia, serif";
    ctx.fillStyle = leftScore >= rightScore ? COLORS.ivory : COLORS.ivoryMuted;
    ctx.fillText(dim.left, barX - 28, y + 14);
    ctx.textAlign = "right";
    ctx.fillStyle = rightScore > leftScore ? COLORS.ivory : COLORS.ivoryMuted;
    ctx.fillText(dim.right, barX + barWidth + 28, y + 14);
    ctx.textAlign = "left";
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const chars = [...text];
  let line = "";
  let currentY = y;

  for (const char of chars) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, currentY);
      line = char;
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

function drawDescription(ctx: CanvasRenderingContext2D, description: string, matchPercent: number) {
  const x = 120;
  const maxWidth = WIDTH - 240;
  let y = 820;

  ctx.font = "500 14px 'Noto Sans SC', sans-serif";
  ctx.fillStyle = COLORS.gold;
  ctx.textAlign = "center";
  ctx.fillText(`匹配度 ${matchPercent}%`, WIDTH / 2, y);
  y += 40;

  ctx.font = "400 18px 'Noto Serif SC', 'STSong', serif";
  ctx.fillStyle = COLORS.ivory;
  ctx.textAlign = "left";
  y = wrapText(ctx, description, x, y, maxWidth, 32);
  return y;
}

function drawQrPlaceholder(ctx: CanvasRenderingContext2D, y: number) {
  const size = 96;
  const x = WIDTH / 2 - size / 2;
  const qrY = Math.min(y + 40, HEIGHT - 200);

  ctx.fillStyle = "rgba(245, 240, 232, 0.04)";
  ctx.fillRect(x - 8, qrY - 8, size + 16, size + 16);
  ctx.strokeStyle = "rgba(201, 169, 98, 0.35)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 8, qrY - 8, size + 16, size + 16);

  const cell = size / 8;
  ctx.fillStyle = COLORS.gold;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 0 || (row < 3 && col < 3) || (row < 3 && col > 4) || (row > 4 && col < 3)) {
        ctx.fillRect(x + col * cell, qrY + row * cell, cell - 1, cell - 1);
      }
    }
  }

  ctx.font = "400 14px 'Noto Sans SC', sans-serif";
  ctx.fillStyle = COLORS.ivoryMuted;
  ctx.textAlign = "center";
  ctx.fillText("扫码探索你的珠宝人格", WIDTH / 2, qrY + size + 36);
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.font = "400 14px Georgia, 'Noto Sans SC', serif";
  ctx.fillStyle = COLORS.ivoryMuted;
  ctx.textAlign = "center";
  ctx.fillText("stylix.com  |  AI 珠宝身份系统", WIDTH / 2, HEIGHT - 72);
}

/** Draw share card programmatically on canvas and return PNG data URL. */
export function generateShareCard(data: ShareCardData): string {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  drawBackground(ctx);
  drawBorder(ctx);
  drawBrand(ctx);
  drawTypeCode(ctx, data.jmtiCode);
  drawTypeName(ctx, data.profile.alias, data.profile.nameCn, data.profile.nickname);
  drawDimensionBars(ctx, data.scores);
  const descEndY = drawDescription(ctx, data.profile.description, data.matchPercent);
  drawQrPlaceholder(ctx, descEndY);
  drawFooter(ctx);

  return canvas.toDataURL("image/png");
}

/** Convert an existing DOM element to PNG via canvas (fallback when element is rendered). */
export async function elementToDataUrl(element: HTMLElement): Promise<string> {
  const rect = element.getBoundingClientRect();
  const scale = WIDTH / rect.width;
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = Math.round(rect.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">
        ${new XMLSerializer().serializeToString(element.cloneNode(true) as Node)}
      </foreignObject>
    </svg>`;

  const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render element"));
    };
    img.src = url;
  });
}

export function downloadShareCard(dataUrl: string, filename = "stylix-jmti-share.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function getShareUrl(jmtiCode: string): string {
  if (typeof window === "undefined") return `https://stylix.com/result?code=${jmtiCode}`;
  return `${window.location.origin}/result?code=${jmtiCode}`;
}
