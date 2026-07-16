"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { track } from "@/lib/analytics/tracker";
import { EVENTS } from "@/lib/analytics/events";
import { useCart } from "@/lib/cart/CartContext";
import { useWishlist } from "@/lib/wishlist/WishlistContext";
import { getProductBySlug } from "@/lib/data/products";
import {
  getDefaultTryOnItem,
  getTryOnItemBySlug,
  tryOnItems,
  type TryOnItem,
} from "@/lib/data/tryon-items";

// BlazePose 33-point landmark indices
const NOSE = 0;
const LEFT_EAR = 7;
const RIGHT_EAR = 8;
const MOUTH_LEFT = 9;
const MOUTH_RIGHT = 10;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;
const LEFT_INDEX = 19;
const RIGHT_INDEX = 20;

type PlacementDefaults = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
};

function defaultsForCategory(category: TryOnItem["category"]): PlacementDefaults {
  switch (category) {
    case "ring":
      return { x: 50, y: 78, scale: 16, rotate: 0, opacity: 92 };
    case "earring":
      return { x: 50, y: 38, scale: 12, rotate: 0, opacity: 92 };
    case "bracelet":
      return { x: 50, y: 72, scale: 22, rotate: 0, opacity: 92 };
    default:
      return { x: 50, y: 48, scale: 48, rotate: 0, opacity: 82 };
  }
}

function resolveInitialItem(piece?: string): TryOnItem {
  if (piece) {
    const match = getTryOnItemBySlug(piece);
    if (match) return match;
  }
  return getDefaultTryOnItem();
}

// Returns a canvas cropped to the bounding box of non-transparent pixels.
function trimTransparent(img: HTMLImageElement): HTMLCanvasElement | HTMLImageElement {
  const tmp = document.createElement("canvas");
  tmp.width = img.naturalWidth;
  tmp.height = img.naturalHeight;
  const ctx = tmp.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, tmp.width, tmp.height);
  const w = tmp.width;
  const h = tmp.height;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX > maxX || minY > maxY) return img;
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d")!.drawImage(tmp, minX, minY, cw, ch, 0, 0, cw, ch);
  return out;
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement | HTMLImageElement,
  cx: number,
  cy: number,
  drawW: number,
  rotateDeg: number,
  opacity: number,
) {
  const srcW = img instanceof HTMLCanvasElement ? img.width : img.naturalWidth;
  const srcH = img instanceof HTMLCanvasElement ? img.height : img.naturalHeight;
  const aspect = srcH / srcW;
  const drawH = drawW * aspect;

  ctx.save();
  ctx.globalAlpha = opacity / 100;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(cx, cy);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

interface TryOnClientProps {
  piece?: string;
}

export function TryOnClient({ piece }: TryOnClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const overlayImgRef = useRef<HTMLImageElement | null>(null);
  const overlayTrimmedRef = useRef<HTMLCanvasElement | HTMLImageElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const selectedItemRef = useRef<TryOnItem>(resolveInitialItem(piece));

  const [selectedItem, setSelectedItem] = useState<TryOnItem>(() => resolveInitialItem(piece));
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const debugMode = false;
  const [addedToBag, setAddedToBag] = useState(false);
  const [savedToWishlist, setSavedToWishlist] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fitMessage, setFitMessage] = useState<string | null>(null);
  const [samplePhoto, setSamplePhoto] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TryOnItem["category"]>(selectedItem.category);

  const [overlayX, setOverlayX] = useState(() => defaultsForCategory(selectedItem.category).x);
  const [overlayY, setOverlayY] = useState(() => defaultsForCategory(selectedItem.category).y);
  const [overlayScale, setOverlayScale] = useState(() => defaultsForCategory(selectedItem.category).scale);
  const [overlayRotate, setOverlayRotate] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(() => defaultsForCategory(selectedItem.category).opacity);

  const landmarksRef = useRef<{ x: number; y: number }[] | null>(null);
  const debugPointsRef = useRef<Record<string, { x: number; y: number }> | null>(null);
  const earringRightRef = useRef<{ x: number; y: number; scale: number } | null>(null);

  useEffect(() => {
    track({ event_name: EVENTS.TRYON_START, tool_name: "virtual-try-on" });
  }, []);

  useEffect(() => {
    selectedItemRef.current = selectedItem;
  }, [selectedItem]);

  useEffect(() => {
    const match = piece ? getTryOnItemBySlug(piece) : undefined;
    if (match && match.id !== selectedItem.id) {
      selectItem(match, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [piece]);

  function selectItem(item: TryOnItem, updateUrl = true) {
    if (samplePhoto && item.id !== selectedItem.id) resetUpload();
    setSelectedItem(item);
    setCategoryFilter(item.category);
    const defaults = defaultsForCategory(item.category);
    setOverlayX(defaults.x);
    setOverlayY(defaults.y);
    setOverlayScale(defaults.scale);
    setOverlayRotate(defaults.rotate);
    setOverlayOpacity(defaults.opacity);
    if (updateUrl) {
      router.replace(`/try-on?piece=${item.slug}`, { scroll: false });
    }
    if (photoImgRef.current) {
      autoPlace(photoImgRef.current, item);
    }
  }

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      overlayImgRef.current = img;
      overlayTrimmedRef.current = trimTransparent(img);
      if (photoImgRef.current) {
        render();
      }
    };
    img.src = selectedItem.overlayImage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem.overlayImage]);

  async function getPoseLandmarker(): Promise<PoseLandmarker | null> {
    if (poseLandmarkerRef.current) return poseLandmarkerRef.current;
    try {
      const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      });
      poseLandmarkerRef.current = landmarker;
      return landmarker;
    } catch {
      return null;
    }
  }

  function placeNecklace(lms: { x: number; y: number; visibility?: number }[]) {
    const lEar = lms[LEFT_EAR];
    const rEar = lms[RIGHT_EAR];
    const mouthL = lms[MOUTH_LEFT];
    const mouthR = lms[MOUTH_RIGHT];
    const lShoulder = lms[LEFT_SHOULDER];
    const rShoulder = lms[RIGHT_SHOULDER];

    const shoulderMidX = (lShoulder.x + rShoulder.x) / 2;
    const shoulderMidY = (lShoulder.y + rShoulder.y) / 2;
    setOverlayX(Math.round(shoulderMidX * 100));

    const shoulderSpanPct = Math.abs(lShoulder.x - rShoulder.x) * 100;
    const scale = Math.round(Math.max(32, Math.min(52, shoulderSpanPct * 0.55)));
    setOverlayScale(scale);

    const mouthMidY = (mouthL.y + mouthR.y) / 2;
    const chinY = mouthMidY + 0.04;
    const necklaceY = Math.max(chinY + 0.08, shoulderMidY - 0.07);
    setOverlayY(Math.round(necklaceY * 100));

    const angleDeg =
      (Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x) * 180) / Math.PI;
    setOverlayRotate(Math.round(Math.max(-20, Math.min(20, angleDeg))));

    const mouthMidX = (mouthL.x + mouthR.x) / 2;
    const halfW = scale / 100 / 2;
    debugPointsRef.current = {
      necklaceCenter: { x: shoulderMidX, y: necklaceY },
      necklaceLeft: { x: shoulderMidX - halfW, y: necklaceY },
      necklaceRight: { x: shoulderMidX + halfW, y: necklaceY },
      lShoulder: { x: lShoulder.x, y: lShoulder.y },
      rShoulder: { x: rShoulder.x, y: rShoulder.y },
      chin: { x: mouthMidX, y: chinY },
      nose: { x: lms[NOSE].x, y: lms[NOSE].y },
    };
    earringRightRef.current = null;
  }

  function placeRing(lms: { x: number; y: number; visibility?: number }[]) {
    const lWrist = lms[LEFT_WRIST];
    const rWrist = lms[RIGHT_WRIST];
    const lIndex = lms[LEFT_INDEX];
    const rIndex = lms[RIGHT_INDEX];

    const useRight =
      rIndex.visibility !== undefined && lIndex.visibility !== undefined
        ? (rIndex.visibility ?? 0) >= (lIndex.visibility ?? 0)
        : rIndex.x > lIndex.x;

    const wrist = useRight ? rWrist : lWrist;
    const index = useRight ? rIndex : lIndex;

    const fingerX = wrist.x + (index.x - wrist.x) * 0.65;
    const fingerY = wrist.y + (index.y - wrist.y) * 0.65;

    setOverlayX(Math.round(fingerX * 100));
    setOverlayY(Math.round(fingerY * 100));

    const shoulderSpan = Math.abs(lms[LEFT_SHOULDER].x - lms[RIGHT_SHOULDER].x);
    const scale = Math.round(Math.max(8, Math.min(22, shoulderSpan * 100 * 0.14)));
    setOverlayScale(scale);
    setOverlayRotate(Math.round(Math.max(-25, Math.min(25, (Math.atan2(index.y - wrist.y, index.x - wrist.x) * 180) / Math.PI + 90))));

    debugPointsRef.current = {
      wrist: { x: wrist.x, y: wrist.y },
      index: { x: index.x, y: index.y },
      ringCenter: { x: fingerX, y: fingerY },
    };
    earringRightRef.current = null;
  }

  function placeEarring(lms: { x: number; y: number; visibility?: number }[]) {
    const lEar = lms[LEFT_EAR];
    const rEar = lms[RIGHT_EAR];
    const shoulderSpan = Math.abs(lms[LEFT_SHOULDER].x - lms[RIGHT_SHOULDER].x);
    const scale = Math.round(Math.max(8, Math.min(18, shoulderSpan * 100 * 0.12)));

    setOverlayX(Math.round(lEar.x * 100));
    setOverlayY(Math.round((lEar.y + 0.04) * 100));
    setOverlayScale(scale);
    setOverlayRotate(0);

    earringRightRef.current = {
      x: rEar.x,
      y: rEar.y + 0.04,
      scale,
    };

    debugPointsRef.current = {
      lEar: { x: lEar.x, y: lEar.y },
      rEar: { x: rEar.x, y: rEar.y },
    };
  }

  async function autoPlace(img: HTMLImageElement, item = selectedItemRef.current) {
    setDetecting(true);
    setFitMessage(null);
    try {
      const landmarker = await getPoseLandmarker();
      if (!landmarker) {
        setFitMessage("已使用标准位置，可通过下方控制微调");
        return;
      }

      const result = landmarker.detect(img);
      const lms = result.landmarks?.[0];
      if (!lms || lms.length < 21) {
        setFitMessage("未识别到完整姿态，已保留标准位置");
        return;
      }

      landmarksRef.current = lms.map((l) => ({ x: l.x, y: l.y }));

      switch (item.category) {
        case "ring":
          placeRing(lms);
          break;
        case "earring":
          placeEarring(lms);
          break;
        default:
          placeNecklace(lms);
          break;
      }
      setFitMessage("已完成自动贴合，可继续微调");
    } finally {
      setDetecting(false);
    }
  }

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const img = photoImgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    canvas.width = naturalW * dpr;
    canvas.height = naturalH * dpr;
    canvas.style.width = `${naturalW}px`;
    canvas.style.height = `${naturalH}px`;

    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, naturalW, naturalH);

    const overlayImg = overlayTrimmedRef.current ?? overlayImgRef.current;
    if (overlayImg && !samplePhoto) {
      const cx = (overlayX / 100) * naturalW;
      const cy = (overlayY / 100) * naturalH;
      const drawW = (overlayScale / 100) * naturalW;
      drawOverlay(ctx, overlayImg, cx, cy, drawW, overlayRotate, overlayOpacity);

      if (selectedItemRef.current.category === "earring" && earringRightRef.current) {
        const right = earringRightRef.current;
        const rcx = right.x * naturalW;
        const rcy = right.y * naturalH;
        const rDrawW = (right.scale / 100) * naturalW;
        drawOverlay(ctx, overlayImg, rcx, rcy, rDrawW, -overlayRotate, overlayOpacity);
      }
    }

    if (debugMode && debugPointsRef.current) {
      const dp = debugPointsRef.current;
      const r = Math.max(6, naturalW * 0.012);
      const fontSize = Math.max(11, naturalW * 0.018);
      const c2d = ctx;

      function dot(x: number, y: number, color: string, label: string) {
        const px = x * naturalW;
        const py = y * naturalH;
        c2d.save();
        c2d.beginPath();
        c2d.arc(px, py, r + 2, 0, Math.PI * 2);
        c2d.fillStyle = "rgba(0,0,0,0.55)";
        c2d.fill();
        c2d.beginPath();
        c2d.arc(px, py, r, 0, Math.PI * 2);
        c2d.fillStyle = color;
        c2d.fill();
        c2d.font = `bold ${fontSize}px monospace`;
        c2d.fillStyle = "#fff";
        c2d.strokeStyle = "rgba(0,0,0,0.7)";
        c2d.lineWidth = 3;
        c2d.strokeText(label, px + r + 4, py + fontSize * 0.35);
        c2d.fillText(label, px + r + 4, py + fontSize * 0.35);
        c2d.restore();
      }

      Object.entries(dp).forEach(([label, pt]) => {
        dot(pt.x, pt.y, "#facc15", label);
      });
    }
  }, [debugMode, overlayOpacity, overlayRotate, overlayScale, overlayX, overlayY, samplePhoto]);

  useEffect(() => {
    render();
  }, [render, photoUrl, selectedItem]);

  useEffect(() => {
    return () => {
      if (photoUrl?.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    return () => {
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadError(null);
    setSamplePhoto(false);
    if (!f.type.startsWith("image/")) {
      setUploadError("请选择 JPG、PNG 或 WEBP 图片");
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      setUploadError("图片不能超过 12MB");
      return;
    }
    setPhotoFileName(f.name);
    const url = URL.createObjectURL(f);
    setPhotoUrl(url);

    const img = new window.Image();
    img.onload = () => {
      photoImgRef.current = img;
      render();
      autoPlace(img);
    };
    img.onerror = () => setUploadError("图片读取失败，请更换文件重试");
    img.src = url;
  }

  function useSamplePhoto() {
    const url = "/products/af5f213e39ff746e4ea3efa8a5e0a7d9.jpg";
    setUploadError(null);
    setSamplePhoto(true);
    setPhotoFileName("示例人像");
    setPhotoUrl(url);
    const img = new window.Image();
    img.onload = () => {
      photoImgRef.current = img;
      render();
      autoPlace(img);
    };
    img.onerror = () => setUploadError("示例图片暂时不可用");
    img.src = url;
  }

  function resetUpload() {
    setPhotoUrl(null);
    setPhotoFileName(null);
    setFitMessage(null);
    setUploadError(null);
    setSamplePhoto(false);
    photoImgRef.current = null;
    landmarksRef.current = null;
    debugPointsRef.current = null;
    earringRightRef.current = null;
    const c = canvasRef.current;
    if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    track({ event_name: EVENTS.TRYON_COMPLETE, tool_name: "virtual-try-on" });
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `stylix-tryon-${selectedItem.slug}.png`;
    a.click();
  }

  function handleAddToBag() {
    const product = getProductBySlug(selectedItem.slug);
    if (!product) return;
    addItem(product);
    track({ event_name: EVENTS.ADD_TO_CART, product_id: product.id });
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2200);
  }

  function handleSaveToWishlist() {
    const product = getProductBySlug(selectedItem.slug);
    if (!product) return;
    addToWishlist(product);
    setSavedToWishlist(true);
    setTimeout(() => setSavedToWishlist(false), 2200);
  }

  const inWishlist = isInWishlist(selectedItem.id);
  const categoryLabel = selectedItem.category === "necklace" ? "项链" : selectedItem.category === "ring" ? "戒指" : selectedItem.category === "earring" ? "耳饰" : "手链";
  const visibleItems = tryOnItems.filter((item) => item.category === categoryFilter);

  return (
    <div className="ui-container py-8 lg:py-12">
      <header className="mb-7 border-b border-[var(--ui-line)] pb-7">
        <p className="ui-eyebrow">Virtual Try-On</p>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><h1 className="ui-title">上传照片，预览真实佩戴比例。</h1><p className="ui-copy mt-3 max-w-2xl">系统会定位珠宝并保留手动微调能力；照片仅在当前浏览器中处理。</p></div>
          <button type="button" onClick={useSamplePhoto} className="ui-button ui-button--secondary w-fit">使用示例照片</button>
        </div>
      </header>
      {/* Success toast */}
      {(addedToBag || savedToWishlist) && (
        <div
          className="fixed top-20 left-1/2 z-50 -translate-x-1/2 border border-gold/40 bg-ink-deep/95 px-6 py-3 shadow-lg backdrop-blur-sm"
          role="status"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
            {addedToBag ? "已加入购物袋" : "已收藏"}
          </p>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-7">
        {/* ── Left panel ─────────────────────────────────────────────── */}
        <div className="order-2 space-y-5 lg:sticky lg:top-20">
          {/* Product selector */}
          <div className="ui-surface p-5">
            <p className="ui-eyebrow mb-3">当前试戴</p>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-stone-900 border border-ivory/10">
                <Image
                  src={selectedItem.productImage}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-serif text-sm text-ivory">{selectedItem.name}</p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ivory/40">
                  {categoryLabel} · ${selectedItem.price} · {selectedItem.material}
                </p>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 rounded border border-[var(--ui-line)] p-1">
              {(["necklace", "ring"] as const).map((category) => <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={`min-h-11 rounded text-[10px] tracking-[0.12em] ${categoryFilter === category ? "bg-[var(--ui-action)] text-[var(--ui-action-text)]" : "text-[var(--ui-text-3)] hover:text-[var(--ui-text)]"}`}>{category === "necklace" ? "项链" : "戒指"}</button>)}
            </div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-ivory/40 mb-2">选择款式</p>
            <div className="grid grid-cols-3 gap-2">
              {visibleItems.map((item) => {
                const active = item.id === selectedItem.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectItem(item)}
                    title={item.name}
                    className={`relative aspect-square overflow-hidden bg-stone-900 transition-colors ${
                      active
                        ? "border-2 border-[var(--ui-accent)]"
                        : "border border-[var(--ui-line)] hover:border-[var(--ui-line-strong)]"
                    }`}
                  >
                    <Image
                      src={item.productImage}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload area */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-ivory/40 mb-3">上传照片</p>
            <label className="ui-surface flex cursor-pointer flex-col items-center justify-center border-dashed px-6 py-9 hover:border-[var(--ui-line-strong)] hover:bg-[var(--ui-surface-hover)]">
              <span className="text-[10px] uppercase tracking-[0.3em] text-ivory/30 mb-1">
                {photoFileName ?? "点击上传或调用相机拍摄"}
              </span>
              <span className="text-[9px] text-ivory/40">JPG · PNG · WEBP · 最大 12MB</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="user" onChange={onFile} className="sr-only" />
            </label>
            {uploadError && <p role="alert" className="mt-2 text-xs text-red-300">{uploadError}</p>}
            <p className="mt-2 text-[9px] leading-4 text-ivory/30">图片不会上传到服务器，离开页面后即释放。</p>
            {photoUrl && (
              <button
                type="button"
                onClick={resetUpload}
                className="mt-2 text-[9px] uppercase tracking-[0.2em] text-ivory/40 hover:text-ivory/60 transition-colors"
              >
                清除照片
              </button>
            )}
          </div>

          {/* Placement controls — always visible when photo uploaded */}
          {photoUrl && !samplePhoto && (
            <div className="border border-ivory/10 px-5 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.4em] text-gold/60">位置微调</p>
                <div className="flex items-center gap-3">
                  {detecting && (
                    <span className="text-[9px] text-ivory/30 tracking-[0.2em]">识别中…</span>
                  )}
                </div>
              </div>
              {fitMessage && <p className="text-[10px] leading-5 text-ivory/45">{fitMessage}</p>}

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-ivory/40">左右位置</label>
                  <span className="text-[9px] text-ivory/30">{overlayX}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  value={overlayX}
                  onChange={(e) => setOverlayX(Number(e.target.value))}
                  className="w-full accent-[#C9A962]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-ivory/40">上下位置</label>
                  <span className="text-[9px] text-ivory/30">{overlayY}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={95}
                  value={overlayY}
                  onChange={(e) => setOverlayY(Number(e.target.value))}
                  className="w-full accent-[#C9A962]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-ivory/40">尺寸</label>
                  <span className="text-[9px] text-ivory/30">{overlayScale}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={85}
                  value={overlayScale}
                  onChange={(e) => setOverlayScale(Number(e.target.value))}
                  className="w-full accent-[#C9A962]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-ivory/40">旋转</label>
                  <span className="text-[9px] text-ivory/30">{overlayRotate}°</span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={overlayRotate}
                  onChange={(e) => setOverlayRotate(Number(e.target.value))}
                  className="w-full accent-[#C9A962]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-ivory/40">融合强度</label>
                  <span className="text-[9px] text-ivory/30">{overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-full accent-[#C9A962]"
                />
              </div>
            </div>
          )}

          {photoUrl && samplePhoto && (
            <div className="border border-gold/15 bg-gold/5 px-5 py-4">
              <p className="text-[9px] uppercase tracking-[0.3em] text-gold/65">示例佩戴成片</p>
              <p className="mt-2 text-xs leading-5 text-ivory/45">这是当前款式的真实佩戴参考。上传你自己的正面照片后，系统会进入自动贴合与手动微调模式。</p>
            </div>
          )}

          {/* Actions */}
          {photoUrl && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={download}
                className="ui-button ui-button--secondary"
              >
                保存试戴图
              </button>
              <button
                type="button"
                onClick={handleAddToBag}
                className={`ui-button ${
                  addedToBag
                    ? "ui-button--primary"
                    : "ui-button--secondary"
                }`}
              >
                {addedToBag ? "已加入" : "加入购物袋"}
              </button>
              <button
                type="button"
                onClick={handleSaveToWishlist}
                className={`ui-button ${
                  savedToWishlist || inWishlist
                    ? "ui-button--secondary text-[var(--ui-accent)]"
                    : "ui-button--ghost"
                }`}
              >
                {inWishlist ? "已在心愿单" : savedToWishlist ? "已收藏" : "收藏款式"}
              </button>
            </div>
          )}

          <div className="border-t border-ivory/8 pt-4">
            <Link
              href="/advisor"
              className="text-[10px] uppercase tracking-[0.3em] text-gold/60 hover:text-gold transition-colors"
            >
              获取 JMTI 搭配推荐 →
            </Link>
          </div>
        </div>

        {/* ── Right: canvas preview ──────────────────────────────────── */}
        <div className="order-1 flex min-w-0 flex-col gap-4">
          <div className="ui-surface ui-card-shadow relative flex min-h-[560px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#343536_0%,#202226_58%,#101113_100%)] lg:min-h-[680px]">
            {!photoUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
                <Image src="/tryon-model.svg" alt="" fill sizes="(max-width:1024px) 100vw, 70vw" className="pointer-events-none object-contain opacity-[.11]" />
                <p className="relative text-[10px] uppercase tracking-[0.24em] text-gold/70">Virtual Try-On</p>
                <p className="relative font-serif text-2xl text-ivory/70">上传照片开始试戴</p>
                <p className="relative max-w-xs text-xs text-ivory/45">
                  项链建议使用正面上半身照片，戒指建议使用能清晰看到手部的照片。
                </p>
                <button type="button" onClick={useSamplePhoto} className="ui-button ui-button--primary relative mt-3">先看示例效果</button>
              </div>
            )}

            <canvas ref={canvasRef} className="mx-auto block max-w-full max-h-[80vh]" />

            {photoUrl && (
              <div className="absolute top-4 right-4 border border-ivory/10 bg-ink-deep/80 backdrop-blur-sm px-3 py-2">
                <p className="text-[9px] uppercase tracking-[0.3em] text-gold/60">{selectedItem.name}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-ivory/40">
            {selectedItem.name} · {selectedItem.material} · {photoUrl ? "可在右侧继续微调" : "请选择款式并上传照片"}
          </p>
        </div>
      </div>
    </div>
  );
}
