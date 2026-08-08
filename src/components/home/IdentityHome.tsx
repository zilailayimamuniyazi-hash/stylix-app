"use client";

import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, ContactShadows, Environment, Float, Lightformer, useGLTF } from "@react-three/drei";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useI18n } from "@/lib/i18n/context";

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const productAssets = [
  {
    href: "/product/iris-spectrum-jewelry-set",
    image: "/products/微信图片_20260213144941_39_36.jpg",
    variant: "pendant" as const,
  },
  {
    href: "/product/dione-signet-ring",
    image: "/products/微信图片_20260214000203_40_36.jpg",
    variant: "ring" as const,
  },
  {
    href: "/product/lyra-harp-ring",
    image: "/products/微信图片_20260214001257_41_36.jpg",
    variant: "leaf" as const,
  },
];

type StageVariant = "hero" | "signature" | "pendant" | "charm" | "leaf" | "ring";

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PremiumLink({ href, children, variant = "dark" }: { href: string; children: React.ReactNode; variant?: "dark" | "light" }) {
  const isLight = variant === "light";
  return (
    <Link
      href={href}
      className={[
        "group inline-flex min-h-12 items-center justify-center gap-3 border px-6 text-[11px] font-semibold uppercase tracking-[0.14em] outline-none transition duration-500 focus-visible:ring-2 focus-visible:ring-gold/50",
        isLight
          ? "border-black/25 text-[#17181a] hover:border-black hover:bg-black hover:text-[#f4f0e8]"
          : "border-white/25 text-white hover:border-white hover:bg-white hover:text-black",
      ].join(" ")}
    >
      <span>{children}</span>
      <span className="transition duration-500 group-hover:translate-x-1"><Arrow /></span>
    </Link>
  );
}

function useMouseParallax(strength = 1) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 70, damping: 24, mass: 0.35 });
  const y = useSpring(rawY, { stiffness: 70, damping: 24, mass: 0.35 });

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: MouseEvent) => {
      rawX.set((event.clientX / window.innerWidth - 0.5) * strength);
      rawY.set((event.clientY / window.innerHeight - 0.5) * strength);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY, reduceMotion, strength]);

  return { x, y };
}

class WebGLBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.setState({ failed: true });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function StaticJewelryFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full overflow-hidden bg-[#090909]">
        <Image src="/products/微信图片_20260214000203_40_36.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover opacity-72" priority />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_42%,rgba(199,170,112,.2),transparent_34%),linear-gradient(90deg,rgba(7,8,9,.96),rgba(7,8,9,.24)_68%,rgba(7,8,9,.72))]" />
      </div>
    </div>
  );
}

function JewelryModel({ url, scale = 1, position = [0, 0, 0] as [number, number, number], rotate = true }: { url: string; scale?: number; position?: [number, number, number]; rotate?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  useEffect(() => {
    const tuneMaterial = (material: THREE.Material) => {
      if ("envMapIntensity" in material) material.envMapIntensity = 1.7;
      material.needsUpdate = true;
    };

    scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (Array.isArray(mesh.material)) mesh.material.forEach(tuneMaterial);
        else if (mesh.material) tuneMaterial(mesh.material);
      }
    });
  }, [scene]);

  useFrame((state) => {
    if (!group.current || !rotate) return;
    group.current.rotation.y += 0.0028;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.42) * 0.06;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function RoomLightRig({ warm = true }: { warm?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <hemisphereLight args={[warm ? "#fff8ec" : "#f2f6ff", "#17110c", 1.08]} />
      <directionalLight position={[3.8, 4.2, 4]} intensity={1.95} color="#fff6e4" />
      <directionalLight position={[-4, -0.6, -2.2]} intensity={0.74} color={warm ? "#c7aa70" : "#9bb4df"} />
      <pointLight position={[0, 2.1, 2.8]} intensity={0.82} color="#f0d7a0" />
      <spotLight position={[0.5, 3.2, 3.8]} angle={0.4} penumbra={0.9} intensity={1.5} color="#fffaf0" />
    </>
  );
}

function JewelryScene({ variant = "hero" }: { variant?: StageVariant }) {
  const reduceMotion = useReducedMotion();
  const isHero = variant === "hero";
  const modelByVariant: Record<StageVariant, { url: string; scale: number; position?: [number, number, number] }> = {
    hero: { url: "/models/composed_box_chain_46_pingankou_35.glb", scale: 1.26 },
    signature: { url: "/models/solitaire_ring_studio.glb", scale: 1.85 },
    pendant: { url: "/models/composed_box_chain_46_pingankou_35.glb", scale: 1.18 },
    charm: { url: "/models/fupai_22.glb", scale: 1.25 },
    leaf: { url: "/models/leaf_34.glb", scale: 1.22 },
    ring: { url: "/models/solitaire_ring_studio.glb", scale: 1.78 },
  };
  const model = modelByVariant[variant];

  return (
    <Canvas
      shadows={false}
      dpr={[1, 1.55]}
      camera={{ position: isHero ? [0, 0.18, 5.25] : [0, 0.1, 4.35], fov: isHero ? 35 : 31 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <RoomLightRig warm={variant !== "leaf"} />
      <Suspense fallback={<FallbackJewel />}>
        <Float speed={reduceMotion ? 0 : 1.1} rotationIntensity={isHero ? 0.22 : 0.12} floatIntensity={isHero ? 0.55 : 0.25}>
          <JewelryModel url={model.url} scale={model.scale} position={model.position} rotate={!reduceMotion} />
        </Float>
        {isHero && (
          <>
            <Float speed={reduceMotion ? 0 : 0.9} rotationIntensity={0.14} floatIntensity={0.35}>
              <JewelryModel url="/models/fupai_22.glb" scale={0.78} position={[-1.72, -0.68, -0.55]} rotate={!reduceMotion} />
            </Float>
            <Float speed={reduceMotion ? 0 : 1} rotationIntensity={0.16} floatIntensity={0.35}>
              <JewelryModel url="/models/leaf_34.glb" scale={0.72} position={[1.68, 0.76, -0.72]} rotate={!reduceMotion} />
            </Float>
          </>
        )}
      </Suspense>
    </Canvas>
  );
}

function FallbackJewel() {
  return null;
}

function ThreeStage({ variant = "hero", className = "absolute inset-0" }: { variant?: StageVariant; className?: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <StaticJewelryFallback />;

  return (
    <WebGLBoundary fallback={<StaticJewelryFallback />}>
      <div className={className}>
        <JewelryScene variant={variant} />
      </div>
    </WebGLBoundary>
  );
}

function HeroRingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#070809]">
      <Image src="/products/微信图片_20260214000203_40_36.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 62vw" className="object-cover opacity-72" priority />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_42%,rgba(222,190,128,.26),transparent_34%),linear-gradient(90deg,rgba(7,8,9,.96)_0%,rgba(7,8,9,.46)_52%,rgba(7,8,9,.88)_100%)]" />
      <div className="absolute inset-x-[18%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
    </div>
  );
}

function HeroRingModel({ reducedMotion, onReady }: { reducedMotion: boolean; onReady: () => void }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/hero-ring.glb");

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) return;
      const mesh = object as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!material) return;
        if ("metalness" in material) material.metalness = Math.max((material.metalness as number) ?? 0, 0.86);
        if ("roughness" in material) material.roughness = Math.min((material.roughness as number) ?? 0.28, 0.22);
        if ("envMapIntensity" in material) material.envMapIntensity = 2.25;
        material.needsUpdate = true;
      });
    });
    onReady();
  }, [onReady, scene]);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y += delta * 0.16;
    group.current.rotation.x = -0.1 + Math.sin(state.clock.elapsedTime * 0.32) * 0.025;
  });

  return (
    <group ref={group} rotation={[-0.1, -0.42, 0.04]} scale={0.86} position={[0.08, -0.08, 0]}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function HeroCameraRig({
  mouseX,
  mouseY,
  scrollProgress,
  reducedMotion,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  useFrame(({ camera }) => {
    const scroll = reducedMotion ? 0 : scrollProgress.get();
    const targetX = reducedMotion ? 0 : mouseX.get() * 0.012;
    const targetY = reducedMotion ? 0.12 : 0.12 - mouseY.get() * 0.01 + scroll * 0.32;
    const targetZ = 4.95 + scroll * 0.42;
    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.055);
    camera.lookAt(0, -0.06, 0);
  });

  return null;
}

function HeroRingScene({
  mouseX,
  mouseY,
  scrollProgress,
  onReady,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  onReady: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      shadows
      dpr={isMobile ? [0.85, 1.1] : [1, 1.45]}
      camera={{ position: [0, 0.12, isMobile ? 5.45 : 4.95], fov: isMobile ? 38 : 33 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#070809"]} />
      <HeroCameraRig mouseX={mouseX} mouseY={mouseY} scrollProgress={scrollProgress} reducedMotion={Boolean(reducedMotion) || isMobile} />
      <ambientLight intensity={0.24} />
      <hemisphereLight args={["#fff7e8", "#08090a", 0.62]} />
      <spotLight position={[2.4, 3.2, 3.4]} angle={0.34} penumbra={0.92} intensity={3.1} color="#fff2d8" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-3.4, 1.8, 2.8]} intensity={1.2} color="#d8b979" />
      <pointLight position={[0.2, -1.5, 2.2]} intensity={0.58} color="#f4dfb4" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4.2} color="#fff3df" position={[0, 4.2, 2.8]} scale={[4.8, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#caa765" position={[-3.4, 1.6, 1.6]} scale={[1.4, 3.2, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#f9e8c8" position={[3.2, -0.8, 2.8]} scale={[1.2, 2.4, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <Float speed={reducedMotion || isMobile ? 0 : 0.42} rotationIntensity={reducedMotion || isMobile ? 0 : 0.06} floatIntensity={reducedMotion || isMobile ? 0 : 0.12}>
          <HeroRingModel reducedMotion={Boolean(reducedMotion) || isMobile} onReady={onReady} />
        </Float>
        <ContactShadows position={[0, -1.24, 0]} opacity={0.28} scale={5} blur={2.6} far={3.2} color="#050505" resolution={512} />
      </Suspense>
    </Canvas>
  );
}

function HeroRingStage({
  mouseX,
  mouseY,
  scrollProgress,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollProgress: MotionValue<number>;
}) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => setMounted(true), []);

  return (
    <div className="absolute inset-0">
      <motion.div animate={{ opacity: ready ? 0 : 1 }} transition={{ duration: 0.8, ease }} className="absolute inset-0">
        <HeroRingFallback />
      </motion.div>
      {mounted && (
        <WebGLBoundary fallback={<HeroRingFallback />}>
          <motion.div animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.9, ease }} className="absolute inset-0">
            <HeroRingScene mouseX={mouseX} mouseY={mouseY} scrollProgress={scrollProgress} onReady={handleReady} />
          </motion.div>
        </WebGLBoundary>
      )}
    </div>
  );
}

function RecommendationFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#0b0c0e]">
      <Image src="/products/微信图片_20260214000203_40_36.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 54vw" className="object-cover opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(222,190,128,.28),transparent_36%),linear-gradient(180deg,rgba(8,9,10,.16),rgba(8,9,10,.92))]" />
      <div className="absolute bottom-[22%] left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
    </div>
  );
}

function RecommendationJewelModel({
  reducedMotion,
  cursor,
  dragRotation,
  onReady,
}: {
  reducedMotion: boolean;
  cursor: MutableRefObject<{ x: number; y: number }>;
  dragRotation: MutableRefObject<number>;
  onReady: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/recommendation-jewel.glb");
  const [frame, setFrame] = useState({ scale: 1, center: new THREE.Vector3() });

  useEffect(() => {
    const nextScene = scene.clone(true);
    nextScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(nextScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    scene.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) return;
      const mesh = object as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!material) return;
        if ("metalness" in material) material.metalness = Math.max((material.metalness as number) ?? 0, 0.84);
        if ("roughness" in material) material.roughness = Math.min((material.roughness as number) ?? 0.26, 0.24);
        if ("envMapIntensity" in material) material.envMapIntensity = 2.1;
        if ("ior" in material) material.ior = Math.max((material.ior as number) ?? 1.45, 1.5);
        material.needsUpdate = true;
      });
    });

    setFrame({ scale: 2.42 / maxDim, center });
    onReady();
  }, [onReady, scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const autoRotation = reducedMotion ? 0 : delta * 0.13;
    group.current.rotation.y += autoRotation;
    group.current.rotation.y += (dragRotation.current - group.current.rotation.y) * 0.035;
    group.current.rotation.x += (-0.12 + cursor.current.y * 0.14 - group.current.rotation.x) * 0.055;
    group.current.rotation.z += (cursor.current.x * 0.035 - group.current.rotation.z) * 0.05;
    group.current.position.y = Math.sin(state.clock.elapsedTime * 0.42) * (reducedMotion ? 0 : 0.025);
  });

  return (
    <group ref={group} rotation={[-0.12, -0.25, 0]} scale={frame.scale}>
      <primitive object={scene} position={[-frame.center.x, -frame.center.y, -frame.center.z]} />
    </group>
  );
}

function RecommendationCameraRig({ cursor, reducedMotion }: { cursor: MutableRefObject<{ x: number; y: number }>; reducedMotion: boolean }) {
  useFrame(({ camera }) => {
    const target = reducedMotion ? new THREE.Vector3(0, 0.08, 4.65) : new THREE.Vector3(cursor.current.x * 0.1, 0.08 - cursor.current.y * 0.06, 4.65);
    camera.position.lerp(target, 0.055);
    camera.lookAt(0, -0.02, 0);
  });

  return null;
}

function RecommendationScene({
  cursor,
  dragRotation,
  onReady,
}: {
  cursor: MutableRefObject<{ x: number; y: number }>;
  dragRotation: MutableRefObject<number>;
  onReady: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Canvas
      shadows
      dpr={isMobile ? [0.8, 1] : [1, 1.4]}
      camera={{ position: [0, 0.08, isMobile ? 5.2 : 4.65], fov: isMobile ? 38 : 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#0b0c0e"]} />
      <RecommendationCameraRig cursor={cursor} reducedMotion={Boolean(reducedMotion) || isMobile} />
      <ambientLight intensity={0.32} />
      <hemisphereLight args={["#fff6e5", "#090909", 0.72]} />
      <spotLight position={[2.6, 3.4, 3]} angle={0.36} penumbra={0.92} intensity={2.9} color="#fff0d5" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-2.8, 1.4, 2.6]} intensity={1.1} color="#d6b777" />
      <pointLight position={[0.2, -1.2, 2.4]} intensity={0.5} color="#f4d9a2" />
      <Environment resolution={96} frames={1}>
        <Lightformer form="rect" intensity={4} color="#fff1d7" position={[0, 3.8, 2.6]} scale={[4, 1, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#c7a465" position={[-3.2, 1.2, 1.4]} scale={[1, 3, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#fff7ea" position={[2.8, -0.4, 2.8]} scale={[1.8, 1.8, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <RecommendationJewelModel reducedMotion={Boolean(reducedMotion) || isMobile} cursor={cursor} dragRotation={dragRotation} onReady={onReady} />
        <ContactShadows position={[0, -1.12, 0]} opacity={0.22} scale={4.8} blur={2.4} far={3} color="#030303" resolution={isMobile ? 256 : 512} />
      </Suspense>
    </Canvas>
  );
}

function RecommendationStage() {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cursor = useRef({ x: 0, y: 0 });
  const dragRotation = useRef(-0.25);
  const dragStart = useRef<{ x: number; rotation: number } | null>(null);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => setMounted(true), []);

  return (
    <div
      className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        cursor.current = {
          x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
          y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
        };
        if (dragging && dragStart.current) {
          dragRotation.current = dragStart.current.rotation + (event.clientX - dragStart.current.x) * 0.008;
        }
      }}
      onPointerDown={(event) => {
        if (window.matchMedia("(max-width: 767px)").matches) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        dragStart.current = { x: event.clientX, rotation: dragRotation.current };
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setDragging(false);
        dragStart.current = null;
      }}
      onPointerLeave={() => {
        setDragging(false);
        dragStart.current = null;
        cursor.current = { x: 0, y: 0 };
      }}
    >
      <motion.div animate={{ opacity: ready ? 0 : 1 }} transition={{ duration: 0.75, ease }} className="absolute inset-0">
        <RecommendationFallback />
      </motion.div>
      {mounted && (
        <WebGLBoundary fallback={<RecommendationFallback />}>
          <motion.div animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 0.8, ease }} className="absolute inset-0">
            <RecommendationScene cursor={cursor} dragRotation={dragRotation} onReady={handleReady} />
          </motion.div>
        </WebGLBoundary>
      )}
    </div>
  );
}

function progressRange(value: number, start: number, end: number) {
  if (end === start) return 0;
  return THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
}

function storyPhase(value: number, points: number[]) {
  for (let index = 0; index < points.length - 1; index += 1) {
    if (value <= points[index + 1]) return index;
  }
  return points.length - 2;
}

function SharedStoryModel({
  progress,
  reducedMotion,
  onReady,
}: {
  progress: MotionValue<number>;
  reducedMotion: boolean;
  onReady: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/hero-ring.glb");
  const [frame, setFrame] = useState({ scale: 1, center: new THREE.Vector3() });

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    scene.traverse((object) => {
      if (!(object as THREE.Mesh).isMesh) return;
      const mesh = object as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        if (!material) return;
        if ("metalness" in material) material.metalness = Math.max((material.metalness as number) ?? 0, 0.86);
        if ("roughness" in material) material.roughness = Math.min((material.roughness as number) ?? 0.28, 0.23);
        if ("envMapIntensity" in material) material.envMapIntensity = 2.05;
        material.needsUpdate = true;
      });
    });

    setFrame({ scale: 2.08 / maxDim, center });
    onReady();
  }, [onReady, scene]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const p = reducedMotion ? 0 : progress.get();
    const phasePoints = [0, 0.13, 0.28, 0.43, 0.58, 0.76, 0.9, 1];
    const phase = storyPhase(p, phasePoints);
    const local = progressRange(p, phasePoints[phase], phasePoints[phase + 1]);
    const eased = THREE.MathUtils.smoothstep(local, 0, 1);
    const positions = [
      new THREE.Vector3(1.18, 0.08, 0),
      new THREE.Vector3(0.72, -0.02, 0),
      new THREE.Vector3(0.12, 0.02, 0),
      new THREE.Vector3(-0.62, 0.08, 0),
      new THREE.Vector3(0.76, 0.0, 0),
      new THREE.Vector3(0.1, -0.06, 0),
      new THREE.Vector3(-0.9, -0.12, 0),
      new THREE.Vector3(-1.18, -0.22, 0),
    ];
    const scales = [1.06, 0.82, 0.64, 0.58, 0.92, 0.72, 0.42, 0.34];
    const from = positions[phase];
    const to = positions[phase + 1];

    group.current.position.lerpVectors(from, to, eased);
    const targetScale = THREE.MathUtils.lerp(scales[phase], scales[phase + 1], eased) * frame.scale;
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
    group.current.rotation.y += reducedMotion ? 0 : delta * THREE.MathUtils.lerp(0.08, 0.18, p);
    group.current.rotation.x = -0.16 + Math.sin(state.clock.elapsedTime * 0.28) * (reducedMotion ? 0 : 0.025) + p * 0.18;
    group.current.rotation.z = THREE.MathUtils.lerp(0.04, -0.22, p);
  });

  return (
    <group ref={group} rotation={[-0.16, -0.38, 0.04]}>
      <primitive object={scene} position={[-frame.center.x, -frame.center.y, -frame.center.z]} />
    </group>
  );
}

function SharedStoryCameraRig({ progress, reducedMotion }: { progress: MotionValue<number>; reducedMotion: boolean }) {
  const keyLight = useRef<THREE.SpotLight>(null);
  const fillLight = useRef<THREE.DirectionalLight>(null);

  useFrame(({ camera }) => {
    const p = reducedMotion ? 0 : progress.get();
    const distance = THREE.MathUtils.lerp(5.4, 6.35, progressRange(p, 0.15, 0.9));
    const targetX = THREE.MathUtils.lerp(0.08, -0.18, progressRange(p, 0.35, 0.86));
    const targetY = THREE.MathUtils.lerp(0.1, 0.24, progressRange(p, 0.1, 0.72));
    camera.position.lerp(new THREE.Vector3(targetX, targetY, distance), 0.045);
    camera.lookAt(0, -0.02, 0);

    if (keyLight.current) keyLight.current.intensity = THREE.MathUtils.lerp(2.4, 3.45, progressRange(p, 0.22, 0.56));
    if (fillLight.current) fillLight.current.intensity = THREE.MathUtils.lerp(0.72, 1.25, progressRange(p, 0.48, 0.78));
  });

  return (
    <>
      <spotLight ref={keyLight} position={[2.2, 3.4, 3.1]} angle={0.36} penumbra={0.9} intensity={2.4} color="#fff0d7" />
      <directionalLight ref={fillLight} position={[-3.2, 1.4, 2.6]} intensity={0.72} color="#cfad6d" />
    </>
  );
}

function SharedStoryScene({ progress, onReady }: { progress: MotionValue<number>; onReady: () => void }) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      shadows={false}
      dpr={[0.8, 1.15]}
      camera={{ position: [0, 0.1, 5.4], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <SharedStoryCameraRig progress={progress} reducedMotion={Boolean(reducedMotion)} />
      <ambientLight intensity={0.18} />
      <hemisphereLight args={["#fff4df", "#08090a", 0.5]} />
      <pointLight position={[0, -1.5, 2.2]} intensity={0.35} color="#f4dfb4" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={3.4} color="#fff2d9" position={[0, 3.8, 2.4]} scale={[4.2, 1, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#caa765" position={[-3, 1.3, 1.4]} scale={[1, 2.8, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <SharedStoryModel progress={progress} reducedMotion={Boolean(reducedMotion)} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}

function SharedStoryLayer({ progress }: { progress: MotionValue<number> }) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const layerOpacity = useTransform(progress, [0, 0.04, 0.9, 1], [0, 0.52, 0.42, 0]);
  const champagneGlow = useTransform(progress, [0, 0.24, 0.52, 0.78, 1], [0.18, 0.26, 0.36, 0.22, 0.08]);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => setMounted(true), []);

  if (reducedMotion) return null;

  return (
    <motion.div className="pointer-events-none sticky top-0 z-[1] -mb-[100svh] hidden h-[100svh] overflow-hidden lg:block" style={{ opacity: layerOpacity }}>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,rgba(199,170,112,.28),transparent_32%),radial-gradient(circle_at_36%_54%,rgba(255,246,226,.08),transparent_28%)]"
        style={{ opacity: champagneGlow }}
      />
      <motion.div animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1, ease }} className="absolute inset-0">
        {mounted && (
          <WebGLBoundary fallback={null}>
            <SharedStoryScene progress={progress} onReady={handleReady} />
          </WebGLBoundary>
        )}
      </motion.div>
    </motion.div>
  );
}

function RoomShell({
  children,
  className = "",
  tone = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light" | "stone";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const chamberY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const threshold = useTransform(scrollYProgress, [0, 0.5, 1], [0.18, 0, 0.22]);
  const dark = tone === "dark";

  return (
    <section
      ref={ref}
      className={[
        "room-scene relative min-h-[112svh] overflow-hidden",
        dark ? "bg-[#070809] text-[#f4f0e8]" : "bg-[#efe9dd] text-[#17181a]",
        className,
      ].join(" ")}
      data-theme={dark ? undefined : "light"}
    >
      <motion.div
        aria-hidden="true"
        style={{ y: chamberY }}
        className={[
          "pointer-events-none absolute inset-[-10%]",
          dark
            ? "bg-[radial-gradient(circle_at_55%_42%,rgba(199,170,112,.18),transparent_32%),linear-gradient(115deg,rgba(255,255,255,.06)_0_1px,transparent_1px_16%),linear-gradient(180deg,#070809_0%,#12110e_48%,#070809_100%)]"
            : "bg-[radial-gradient(circle_at_48%_42%,rgba(255,255,255,.92),transparent_28%),linear-gradient(115deg,rgba(23,24,26,.08)_0_1px,transparent_1px_18px),linear-gradient(180deg,#f6f0e5_0%,#e4dac9_100%)]",
        ].join(" ")}
      />
      <motion.div
        aria-hidden="true"
        style={{ opacity: threshold }}
        className={["pointer-events-none absolute inset-0", dark ? "bg-black" : "bg-[#f8f1e6]"].join(" ")}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-[8vw] top-[8svh] hidden h-[84svh] border-x border-white/10 lg:block" />
      {children}
    </section>
  );
}

function ObjectPedestal({ variant, label, active = false }: { variant: StageVariant; label: string; active?: boolean }) {
  return (
    <motion.div
      className={[
        "relative min-h-[280px] overflow-hidden border transition duration-700 sm:min-h-[340px]",
        active ? "border-gold/50 bg-[#171411]" : "border-white/12 bg-white/[0.035]",
      ].join(" ")}
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ duration: 0.55, ease }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(199,170,112,.24),transparent_40%)]" />
      <ThreeStage variant={variant} className="absolute inset-0" />
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-white/16 pt-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/62">{label}</span>
        <span className="h-2 w-2 rounded-full bg-gold/80 shadow-[0_0_24px_rgba(199,170,112,.8)]" />
      </div>
    </motion.div>
  );
}

const atelierNav = [
  { label: "Our Process", href: "/test" },
  { label: "Materials", href: "/shop" },
  { label: "Journal", href: "/daily" },
  { label: "About", href: "/designers" },
];

const contactNav = [
  { label: "Private Consultation", href: "/vip-atelier" },
  { label: "Custom Orders", href: "/bead-lab" },
  { label: "Virtual Try-On", href: "/try-on" },
  { label: "Client Profile", href: "/member" },
];

function EditorialShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={["relative bg-[#fbfaf8] text-[#05050a]", className].join(" ")}>
      <div className="mx-auto w-full max-w-[1510px] px-6 sm:px-12 lg:px-[96px]">{children}</div>
    </section>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-[0.46em] text-[#070816] sm:text-sm">{children}</p>;
}

function EditorialArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-4 border-b border-[#070816] pb-3 text-[11px] font-medium uppercase tracking-[0.42em] text-[#070816] outline-none transition duration-500 hover:gap-6 focus-visible:ring-2 focus-visible:ring-[#d8ccb7] sm:text-sm"
    >
      <span>{children}</span>
      <Arrow />
    </Link>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[#050505] text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/hero-video.mp4.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/hero-editorial.jpg"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,.42)),linear-gradient(90deg,rgba(0,0,0,.58),rgba(0,0,0,.08)_54%,rgba(0,0,0,.5))]" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1510px] flex-col justify-between px-6 py-9 sm:px-12 lg:px-[96px]">
        <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.42em]">
          <Link href="/" className="outline-none focus-visible:ring-2 focus-visible:ring-white/40">STYLIX</Link>
          <Link href="/vip-atelier" className="hidden text-white/72 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 sm:block">Atelier</Link>
        </div>
        <div className="pb-12">
          <motion.h1 className="max-w-[1040px] font-serif text-[clamp(4.2rem,11.5vw,12.5rem)] font-normal leading-[.82] tracking-[-0.02em]" variants={stagger} initial="hidden" animate="show">
            <motion.span variants={reveal} className="block">Your identity.</motion.span>
            <motion.em variants={reveal} className="block font-serif italic">Your jewel.</motion.em>
          </motion.h1>
          <motion.p variants={reveal} initial="hidden" animate="show" className="mt-8 max-w-[620px] text-[18px] leading-9 tracking-[0.08em] text-white/74">
            A private atelier for bespoke jewellery, authored by artificial intelligence and made precious by the person who wears it.
          </motion.p>
          <motion.div variants={reveal} initial="hidden" animate="show" className="mt-10 flex flex-wrap items-center gap-8">
            <EditorialArrowLink href="/test">Begin your reading</EditorialArrowLink>
            <Link href="/try-on" className="text-[11px] uppercase tracking-[0.42em] text-white/74 transition hover:text-white sm:text-sm">Virtual try-on</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SignalInputSection() {
  return (
    <EditorialShell className="py-16 sm:py-20 lg:py-24">
      <div className="space-y-24">
        <div>
          <p className="text-[24px] leading-none text-[#b8b2aa] sm:text-[30px]">A feeling, a memory, a gesture</p>
          <div className="mt-10 h-px bg-[#e5dac9]" />
        </div>
        <div>
          <Kicker>A place that feels like home</Kicker>
          <p className="mt-20 text-[26px] text-[#b8b2aa] sm:text-[32px]">Real or imagined</p>
          <div className="mt-8 h-px bg-[#e5dac9]" />
        </div>
        <div>
          <Kicker>Your most personal word</Kicker>
          <p className="mt-20 text-[26px] text-[#b8b2aa] sm:text-[32px]">One word only</p>
          <div className="mt-8 h-px bg-[#e5dac9]" />
        </div>
        <Link
          href="/test"
          className="inline-flex min-h-[110px] min-w-[310px] items-center justify-center gap-6 border border-[#e1d5c3] px-10 text-[12px] uppercase tracking-[0.44em] text-[#05050a] outline-none transition duration-500 hover:border-[#05050a] focus-visible:ring-2 focus-visible:ring-[#d8ccb7] sm:min-w-[386px] sm:text-sm"
        >
          Continue <Arrow />
        </Link>
      </div>
    </EditorialShell>
  );
}

function VoiceSection() {
  const voices = [
    { number: "01", title: "Minimal", body: "" },
    { number: "02", title: "Romantic", body: "Softness held in precious metal. A feeling made permanent." },
    { number: "03", title: "Bold", body: "" },
  ];

  return (
    <EditorialShell className="py-16 sm:py-20 lg:py-24">
      <div className="min-h-[920px]">
        <Kicker>02 — Voice</Kicker>
        <p className="mt-12 text-[24px] leading-9 tracking-[0.08em] text-[#727286] sm:text-[30px]">Choose the aesthetic language of your jewel.</p>
        <div className="mt-36 border-y border-[#ece3d6]">
          {voices.map((voice) => (
            <Link
              key={voice.number}
              href="/test"
              className="grid min-h-[218px] grid-cols-[80px_1fr] items-center border-b border-[#ece3d6] outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-[#d8ccb7] sm:grid-cols-[120px_1fr_.75fr]"
            >
              <span className="text-[18px] tracking-[0.32em] text-[#747486]">{voice.number}</span>
              <span className={["font-serif text-[clamp(4.4rem,9vw,8.4rem)] leading-none", voice.body ? "text-[#040414] italic" : "text-[#f7f4ef]"].join(" ")}>
                {voice.title}
              </span>
              <span className="hidden max-w-[560px] text-right text-[24px] leading-10 tracking-[0.06em] text-[#747486] sm:block">{voice.body}</span>
            </Link>
          ))}
        </div>
      </div>
    </EditorialShell>
  );
}

function MaterialLanguageSection() {
  return (
    <EditorialShell className="flex min-h-[100svh] items-center justify-center py-24">
      <div className="text-center">
        <h2 className="font-serif text-[clamp(4.6rem,10vw,11rem)] font-normal leading-[.82] tracking-[-0.025em]">
          Identity becomes
          <br />
          <em className="italic">a material language.</em>
        </h2>
        <p className="mt-24 text-[18px] tracking-[0.36em] text-[#747486] sm:text-2xl">A Stylix ring is not purchased. It is authored.</p>
      </div>
    </EditorialShell>
  );
}

function ProcessSection() {
  const steps = [
    {
      numeral: "I",
      title: "Personal symbols",
      body: "We begin where language ends. Your memories, textures, zodiac, lifestyle and private references become the grammar of your ring.",
    },
    {
      numeral: "II",
      title: "Identity made visible",
      body: "The AI Jewelry Stylist and GPT conversation transform what you carry inside into precise form — proportion, stone, finish, weight.",
    },
  ];

  return (
    <EditorialShell className="py-20 lg:py-28">
      <div className="divide-y divide-[#ece3d6] border-y border-[#ece3d6]">
        {steps.map((step) => (
          <article key={step.numeral} className="grid min-h-[420px] content-center gap-14 py-16">
            <p className="font-serif text-2xl">{step.numeral}</p>
            <div>
              <h3 className="font-serif text-[clamp(3.2rem,5vw,5.2rem)] leading-none">{step.title}</h3>
              <p className="mt-14 max-w-[1420px] text-[24px] leading-10 tracking-[0.06em] text-[#747486] sm:text-[30px]">{step.body}</p>
            </div>
          </article>
        ))}
      </div>
    </EditorialShell>
  );
}

function InterpretationSection() {
  return (
    <EditorialShell className="py-20 lg:py-24">
      <div>
        <Kicker>03 — Interpretation</Kicker>
        <div className="mt-24 grid gap-16 lg:grid-cols-[.48fr_.52fr]">
          <div>
            <h2 className="max-w-[620px] font-serif text-[clamp(3.7rem,5.6vw,6.6rem)] font-normal leading-[.86]">
              An interpretation
              <br />
              <em className="italic">written for</em>
              <br />
              the jewel.
            </h2>
            <p className="mt-24 max-w-[720px] text-[24px] leading-[1.72] tracking-[0.06em] text-[#747486]">
              Every jewel we create arrives with a text — a poetic interpretation of your signals, written in the voice of the ring itself. Not a description. A portrait.
            </p>
            <div className="mt-28">
              <EditorialArrowLink href="/product/dione-signet-ring">See a full interpretation</EditorialArrowLink>
            </div>
          </div>
          <div className="hidden lg:block" />
        </div>
        <div className="mt-28 border border-[#efe5d8] p-8 sm:p-16">
          <div className="flex items-center justify-between gap-8 text-[13px] uppercase tracking-[0.46em] text-[#070816] sm:text-base">
            <span>Lunar Architect</span>
            <span className="text-[#747486]">Moonlight 月光</span>
          </div>
          <div className="relative mt-20 aspect-[16/8.4] overflow-hidden bg-black">
            <Image src="/products/微信图片_20260214000203_40_36.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 82vw" className="object-cover opacity-90" />
          </div>
          <blockquote className="mt-20 border-l border-[#e0d0bb] pl-8 font-serif text-[clamp(1.7rem,2.4vw,3rem)] italic leading-[1.55] text-[#eee6db]">
            &ldquo;She constructs silence the way an architect designs with light — each absence as deliberate as presence. The stone holds a room she has not yet entered.&rdquo;
          </blockquote>
          <div className="mt-20 grid border-t border-[#ece3d6] pt-14 text-[16px] tracking-[0.36em] text-[#747486] sm:grid-cols-3 sm:text-xl">
            <p>Rose Gold</p>
            <p>Round Brilliant</p>
            <p>Pave Band</p>
          </div>
          <div className="mt-16 flex flex-wrap gap-10">
            <EditorialArrowLink href="/try-on">Try your jewel</EditorialArrowLink>
            <EditorialArrowLink href="/shop">View the collection</EditorialArrowLink>
          </div>
        </div>
      </div>
    </EditorialShell>
  );
}

function AtelierFooter() {
  return (
    <footer className="bg-[#fbfaf8] text-[#070816]">
      <div className="mx-auto grid min-h-[100svh] max-w-[1510px] gap-20 px-6 py-12 sm:px-12 lg:grid-cols-[.42fr_.58fr] lg:px-[96px]">
        <div>
          <Link href="/" className="text-[22px] uppercase tracking-[0.42em]">STYLIX</Link>
          <p className="mt-16 max-w-[520px] text-[26px] leading-[1.6] tracking-[0.06em] text-[#747486]">
            A private atelier for bespoke jewellery — authored by artificial intelligence, made precious by the person who wears it.
          </p>
        </div>
        <div className="grid gap-20 sm:grid-cols-2">
          <div>
            <Kicker>Atelier</Kicker>
            <div className="mt-16 grid gap-12">
              {atelierNav.map((item) => (
                <Link key={item.href} href={item.href} className="text-[26px] tracking-[0.06em] text-[#747486] transition hover:text-[#070816]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <Kicker>Contact</Kicker>
            <div className="mt-16 grid gap-12">
              {contactNav.map((item) => (
                <Link key={item.href} href={item.href} className="text-[26px] tracking-[0.06em] text-[#747486] transition hover:text-[#070816]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function IdentityHome() {
  const { t } = useI18n();
  void t;

  return (
    <div className="relative bg-[#fbfaf8] text-[#05050a]">
      <style jsx global>{`
        .site-main {
          background: #fbfaf8;
        }
        .site-main a:active,
        .site-main button:active {
          transform: none;
        }
        .site-main [data-theme="light"] {
          --ui-text: #05050a;
        }
      `}</style>
      <HeroSection />
      <SignalInputSection />
      <VoiceSection />
      <MaterialLanguageSection />
      <ProcessSection />
      <InterpretationSection />
      <AtelierFooter />
    </div>
  );
}

useGLTF.preload("/models/composed_box_chain_46_pingankou_35.glb");
useGLTF.preload("/models/hero-ring.glb");
useGLTF.preload("/models/fupai_22.glb");
useGLTF.preload("/models/leaf_34.glb");
useGLTF.preload("/models/solitaire_ring_studio.glb");
