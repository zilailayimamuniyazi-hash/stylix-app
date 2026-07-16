"use client";

import { useEffect, useRef, useState } from "react";
import type { ChainVariant, DesignState, EarringVariant, RingVariant } from "./data/types";
import { resolveGlbScene } from "./data/glbMap";
import { byId, findTemplate, MATERIALS } from "./data/catalog";
import { applyDesignMaterials } from "./materials3d";
import CrystalBraceletPreview3D from "./CrystalBraceletPreview3D";

let mvImportPromise: Promise<void> | null = null;
function ensureModelViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (mvImportPromise) return mvImportPromise;
  mvImportPromise = import("@google/model-viewer").then(() => {});
  return mvImportPromise;
}

interface Props {
  state: DesignState;
  fallback: React.ReactNode;
}

export default function JewelryPreview3D({ state, fallback }: Props) {
  const template = findTemplate(state.category, state.templateId);
  if (state.category === "bracelet" && template?.beaded) {
    return <CrystalBraceletPreview3D state={state} />;
  }

  return <ModelViewerPreview state={state} fallback={fallback} />;
}

function ModelViewerPreview({ state, fallback }: Props) {
  const viewerRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [mvReady, setMvReady] = useState(false);

  const scene = resolveGlbScene(state);
  const template = findTemplate(state.category, state.templateId);
  const variant = template?.variants.find((item) => item.id === state.variantId);
  let modelScale = 1;
  if (state.category === "ring" && variant) modelScale = (variant as RingVariant).innerDiameterMm / 16.5;
  if (state.category === "bangle" && variant) modelScale = (variant as ChainVariant).lengthCm / 56;
  if (state.category === "necklace" && variant) modelScale = (variant as ChainVariant).lengthCm / 45;
  if (state.category === "earring" && variant) {
    const base = state.templateId === "stud" ? 9 : state.templateId === "drop" ? 45 : 35;
    modelScale = (variant as EarringVariant).dropMm / base;
  }

  useEffect(() => {
    let mounted = true;
    ensureModelViewer().then(() => {
      if (mounted) setMvReady(true);
    }).catch(() => {
      if (mounted) setError(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [scene?.primary]);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !mvReady) return;
    const onLoad = () => setLoaded(true);
    const onErr = () => setError(true);
    el.addEventListener("load", onLoad);
    el.addEventListener("error", onErr);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("error", onErr);
    };
  }, [mvReady, scene?.primary]);

  useEffect(() => {
    if (!mvReady || loaded) return;
    const timeout = window.setTimeout(() => setError(true), 12000);
    return () => window.clearTimeout(timeout);
  }, [mvReady, loaded, scene?.primary]);

  useEffect(() => {
    if (!loaded || !viewerRef.current) return;
    const viewer = viewerRef.current as unknown as Parameters<typeof applyDesignMaterials>[0];
    const isChainy = state.category === "necklace" || state.category === "bracelet" || state.category === "bangle";
    const primaryShader = byId(MATERIALS, isChainy ? state.chainMaterialId : state.metalMaterialId);
    if (!primaryShader) return;
    applyDesignMaterials(viewer, {
      primary: primaryShader,
      stone: byId(MATERIALS, state.stoneMaterialId),
      pendant: byId(MATERIALS, state.pendantMaterialId),
      accent: byId(MATERIALS, state.metalMaterialId),
    }, state.surface);
  }, [loaded, state.chainMaterialId, state.metalMaterialId, state.pendantMaterialId, state.stoneMaterialId, state.surface, state.category]);

  if (!scene || error) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-ink-border bg-ink-soft px-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-gold">3D</div>
        <p className="text-sm text-ivory">预览暂不可用</p>
        <p className="max-w-xs text-xs leading-5 text-ivory-dim">当前设备未能加载 3D 预览。配置仍可保存，稍后可在支持 WebGL 的设备继续查看。</p>
        {fallback}
      </div>
    );
  }

  if (!mvReady) {
    return (
      <div className="flex items-center justify-center min-h-[480px] rounded-2xl"
        style={{ background: "radial-gradient(ellipse at 50% 42%, #3a3a40 0%, #17171c 58%, #0b0b0e 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <span className="text-ivory-dim text-xs tracking-wider">加载 3D 引擎...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[520px] w-full sm:min-h-[560px]">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl"
          style={{ background: "radial-gradient(ellipse at 50% 42%, #3a3a40 0%, #17171c 58%, #0b0b0e 100%)" }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <span className="text-ivory-dim text-xs tracking-wider">加载模型...</span>
          </div>
        </div>
      )}

      {/* @ts-ignore model-viewer web component */}
      <model-viewer
        ref={viewerRef}
        src={scene.primary}
        camera-controls=""
        auto-rotate={state.category === "necklace" ? undefined : ""}
        auto-rotate-delay="1800"
        rotation-per-second="12deg"
        interaction-prompt="none"
        loading="eager"
        exposure="2.7"
        shadow-intensity="1.5"
        shadow-softness="1"
        environment-image="neutral"
        tone-mapping="commerce"
        scale={`${modelScale} ${modelScale} ${modelScale}`}
        camera-orbit={state.category === "necklace" ? "0deg 82deg 108%" : "0deg 70deg 108%"}
        min-field-of-view="20deg"
        max-field-of-view="45deg"
        style={{
          width: "100%",
          height: "min(62vh, 560px)",
          minHeight: 520,
          background: "radial-gradient(ellipse at 50% 42%, #48484e 0%, #29292f 45%, #17171c 75%, #0c0c0f 100%)",
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.4s ease",
          borderRadius: 16,
        }}
      />

      {loaded && (
        <div className="absolute top-3 left-3 bg-ink/70 backdrop-blur-sm text-ivory-dim text-[10px]
          px-2.5 py-1 rounded-md border border-ivory/5 tracking-wider z-20">
          3D · 拖拽旋转 · 滚轮缩放
        </div>
      )}
      {loaded && scene.isPartial && (
        <div className="absolute bottom-3 left-3 right-3 rounded-md border border-gold/20 bg-ink/80 px-3 py-2 text-center text-[10px] leading-4 text-gold-muted backdrop-blur-sm">
          当前链身为实物 3D 预览，所选吊坠将按设计稿制作
        </div>
      )}
    </div>
  );
}
