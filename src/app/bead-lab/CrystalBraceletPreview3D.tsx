"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import { MATERIALS, byId, findTemplate } from "./data/catalog";
import type { ChainVariant, DesignState, MaterialShader } from "./data/types";

const FALLBACK_MATERIAL = "clear-quartz";

function normalizeMaterials(state: DesignState, count: number) {
  const isCrystal = state.templateId.startsWith("crystal-");
  const ids = isCrystal
    ? state.beadMaterialIds.filter((id) => byId(MATERIALS, id)?.family === "crystal")
    : [];
  const source = ids.length ? ids : [state.chainMaterialId || FALLBACK_MATERIAL];
  return Array.from({ length: count }, (_, index) => source[index % source.length]);
}

function CrystalMaterial({ material, surface }: { material: MaterialShader; surface: DesignState["surface"] }) {
  const isPearl = material.family === "pearl";
  const isJade = material.family === "jade";
  return (
    <meshPhysicalMaterial
      color={material.baseColor}
      roughness={Math.max(0.04, material.roughness + (1 - surface.glossiness) * 0.14)}
      metalness={0}
      transmission={isPearl ? 0 : Math.min(isJade ? 0.35 : 0.72, material.transparency + 0.12)}
      thickness={isJade ? 1.1 : 0.72}
      ior={material.ior}
      clearcoat={isPearl ? 0.95 : 0.82}
      clearcoatRoughness={isPearl ? 0.16 : 0.08}
      attenuationColor={material.baseColor}
      attenuationDistance={isJade ? 1.15 : 1.8}
      envMapIntensity={isPearl ? 1.35 : 1.8}
      iridescence={isPearl ? 0.32 : 0}
      iridescenceIOR={1.3}
    />
  );
}

function Bracelet({ state }: { state: DesignState }) {
  const template = findTemplate("bracelet", state.templateId);
  const variant = template?.variants.find((item) => item.id === state.variantId) as ChainVariant | undefined;
  const count = variant?.beadCount ?? 16;
  const beadIds = useMemo(() => normalizeMaterials(state, count), [count, state]);
  const beadDiameterMm = variant?.beadDiameterMm ?? 10;
  const beadRadius = beadDiameterMm === 8 ? 0.285 : beadDiameterMm === 6 ? 0.225 : 0.34;
  // Regular polygon with adjacent beads touching; 1.5% compression models elastic cord tension.
  const radius = (beadRadius / Math.sin(Math.PI / count)) * 0.985;

  return (
    <group rotation={[-0.13, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.026, 12, 96]} />
        <meshPhysicalMaterial color="#d7d1c5" roughness={0.32} transmission={0.35} transparent opacity={0.5} />
      </mesh>
      {beadIds.map((id, index) => {
        const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
        const material = byId(MATERIALS, id) ?? byId(MATERIALS, FALLBACK_MATERIAL)!;
        return (
          <mesh
            key={`${index}-${id}`}
            position={[Math.cos(angle) * radius, 0.03 + Math.cos(angle * 2) * 0.018, Math.sin(angle) * radius]}
            castShadow
          >
            <sphereGeometry args={[beadRadius, 40, 40]} />
            <CrystalMaterial material={material} surface={state.surface} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function CrystalBraceletPreview3D({ state }: { state: DesignState }) {
  return (
    <div className="relative h-[520px] w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_42%,#4a4a50_0%,#29292f_45%,#17171c_75%,#0c0c0f_100%)] sm:h-[560px]">
      <Canvas
        camera={{ position: [0, 5.4, 6.4], fov: 32 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        shadows
      >
        <ambientLight intensity={1.25} />
        <directionalLight position={[4, 7, 5]} intensity={5.2} color="#fff7e7" castShadow />
        <directionalLight position={[-5, 3, 2]} intensity={3.4} color="#dbe9ff" />
        <pointLight position={[0, 1, -5]} intensity={15} color="#ffffff" />
        <Bracelet state={state} />
        <ContactShadows position={[0, -0.48, 0]} opacity={0.3} scale={7} blur={2.8} far={4} />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={5.8}
          maxDistance={9.5}
          minPolarAngle={0.35}
          maxPolarAngle={1.45}
          target={[0, -0.04, 0]}
        />
      </Canvas>
      <div className="pointer-events-none absolute left-3 top-3 z-20 border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] tracking-wider text-ivory-dim backdrop-blur-sm">
        3D · 拖拽旋转 · 滚轮缩放
      </div>
    </div>
  );
}
