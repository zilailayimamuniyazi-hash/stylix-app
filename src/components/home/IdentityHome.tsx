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

function HeroSection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  const { x, y } = useMouseParallax(22);
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  const roomY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const objectScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const objectOpacity = useTransform(scrollYProgress, [0, 0.82], [1, 0.3]);

  return (
    <section ref={targetRef} className="relative min-h-[100svh] overflow-hidden bg-[#070809]">
      <motion.div
        aria-hidden="true"
        style={{ y: roomY }}
        className="absolute inset-[-8%] bg-[radial-gradient(circle_at_72%_42%,rgba(210,178,116,.22),transparent_28%),radial-gradient(circle_at_28%_24%,rgba(255,244,224,.08),transparent_24%),linear-gradient(125deg,#050607_0%,#0b0c0d_46%,#15120d_100%)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,6,7,.98)_0%,rgba(5,6,7,.9)_42%,rgba(5,6,7,.24)_72%,rgba(5,6,7,.72)_100%),linear-gradient(0deg,rgba(7,8,9,.98)_0%,transparent_42%,rgba(7,8,9,.38)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-10vw] top-[7vh] h-[48svh] sm:inset-x-auto sm:right-[-10vw] sm:top-[8vh] sm:h-[78svh] sm:w-[70vw] lg:right-[-5vw] lg:w-[64vw]"
        style={{ x, y, scale: objectScale, opacity: objectOpacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_48%,rgba(199,170,112,.2),transparent_52%)] blur-2xl" />
        <HeroRingStage mouseX={x} mouseY={y} scrollProgress={scrollYProgress} />
      </motion.div>

      <div className="ui-container relative z-10 flex min-h-[100svh] items-end pb-20 pt-[48svh] sm:pt-28 lg:items-center lg:pb-20">
        <motion.div className="max-w-[820px]" variants={stagger} initial="hidden" animate="show">
          <motion.p variants={reveal} className="ui-eyebrow text-gold/80">{copy.hero.eyebrow}</motion.p>
          <motion.h1 variants={reveal} className="mt-7 max-w-[800px] font-serif text-[clamp(3.2rem,7.6vw,8.2rem)] font-normal leading-[.9] text-[#f6f1e8]">
            {copy.hero.title}
          </motion.h1>
          <motion.p variants={reveal} className="mt-8 max-w-[620px] text-[15px] leading-8 text-white/64 sm:text-base">
            {copy.hero.subtitle}
          </motion.p>
          <motion.div variants={reveal} className="mt-10 flex flex-wrap gap-3">
            <Link href="/test" className="group inline-flex min-h-12 items-center justify-center gap-3 bg-[#f5f1e8] px-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-black outline-none transition duration-500 hover:bg-white focus-visible:ring-2 focus-visible:ring-gold/50">
              {copy.hero.primaryCta}
              <span className="transition duration-500 group-hover:translate-x-1"><Arrow /></span>
            </Link>
            <PremiumLink href="/shop">{copy.hero.secondaryCta}</PremiumLink>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="pointer-events-none absolute bottom-8 right-8 z-10 hidden max-w-[280px] border-t border-white/18 pt-4 text-right lg:block" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.9, ease }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/42">{copy.hero.modelLabel}</p>
        <p className="mt-2 text-sm leading-6 text-white/56">{copy.hero.modelNote}</p>
      </motion.div>
    </section>
  );
}

function IdentityInputSection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  const [active, setActive] = useState(0);
  const objectMap: StageVariant[] = ["pendant", "ring", "leaf", "charm", "signature", "hero"];

  return (
    <RoomShell className="py-24 lg:py-32">
      <div className="ui-container relative z-10">
        <motion.div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }}>
          <div>
            <motion.p variants={reveal} className="ui-eyebrow">{copy.identityInput.eyebrow}</motion.p>
            <motion.h2 variants={reveal} className="mt-6 max-w-2xl font-serif text-[clamp(2.5rem,5vw,5.8rem)] font-normal leading-[.98]">
              {copy.identityInput.title}
            </motion.h2>
          </div>
          <motion.p variants={reveal} className="max-w-xl text-[15px] leading-8 text-white/56">
            {copy.identityInput.subtitle}
          </motion.p>
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[.92fr_1.08fr] lg:items-stretch">
          <motion.div
            className="relative min-h-[640px] overflow-hidden border border-white/12 bg-[#0b0c0e]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.85, ease }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(199,170,112,.22),transparent_38%)]" />
            <ThreeStage variant={objectMap[active]} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-8 hidden rounded-full border border-gold/20 sm:block">
              {copy.identityInput.facets.map((facet, index) => {
                const angle = (index / copy.identityInput.facets.length) * Math.PI * 2 - Math.PI / 2;
                const left = 50 + Math.cos(angle) * 43;
                const top = 50 + Math.sin(angle) * 43;
                return (
                  <motion.span
                    key={facet.label}
                    className="absolute h-2 w-2 rounded-full bg-gold/80 shadow-[0_0_24px_rgba(199,170,112,.75)]"
                    style={{ left: `${left}%`, top: `${top}%` }}
                    animate={{ scale: active === index ? 1.65 : 1, opacity: active === index ? 1 : 0.42 }}
                    transition={{ duration: 0.65, ease }}
                  />
                );
              })}
            </div>
            <div className="absolute left-7 right-7 top-7 flex items-center justify-between border-b border-white/14 pb-5">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/48">{copy.identityInput.hint}</p>
              <p className="font-serif text-2xl text-gold/90">0{active + 1}</p>
            </div>
            <motion.div
              key={copy.identityInput.facets[active].label}
              className="absolute bottom-7 left-7 right-7"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
            >
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold/68">{copy.identityInput.facets[active].label}</p>
              <p className="mt-4 font-serif text-[clamp(2.2rem,4.8vw,5.2rem)] leading-none text-white">{copy.identityInput.facets[active].value}</p>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/56">{copy.identityInput.facets[active].effect}</p>
            </motion.div>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            {copy.identityInput.facets.map((facet, index) => (
              <motion.button
                key={facet.label}
                type="button"
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onClick={() => setActive(index)}
                className={"group relative min-h-[188px] overflow-hidden border p-6 text-left outline-none transition duration-500 focus-visible:ring-2 focus-visible:ring-gold/50 " + (active === index ? "border-gold/48 bg-[#171411]" : "border-white/10 bg-white/[0.035] hover:border-white/24 hover:bg-white/[0.06]")}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.04, ease }}
              >
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(199,170,112,.16),transparent_34%)] opacity-0 transition duration-700 group-hover:opacity-100" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold/62">{facet.label}</span>
                <span className="mt-5 block font-serif text-2xl text-white">{facet.value}</span>
                <span className="mt-5 block text-sm leading-6 text-white/44">{facet.effect}</span>
                <span className={"absolute bottom-5 right-5 h-2 w-2 rounded-full transition duration-500 " + (active === index ? "bg-gold shadow-[0_0_24px_rgba(199,170,112,.8)]" : "bg-white/22")} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </RoomShell>
  );
}

function ProcessingSection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  const variants: StageVariant[] = ["charm", "leaf", "ring"];

  return (
    <RoomShell className="py-24 lg:py-32">
      <div className="ui-container relative z-10">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-20 hidden h-44 w-44 -translate-x-1/2 rounded-full border border-gold/18 md:block"
          initial={{ opacity: 0, scale: 0.78 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 1.2, ease }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold/70" />
          <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/45" />
          <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/35" />
          <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold/55" />
        </motion.div>
        <motion.div className="mx-auto max-w-3xl text-center" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }}>
          <motion.p variants={reveal} className="ui-eyebrow">{copy.processing.eyebrow}</motion.p>
          <motion.h2 variants={reveal} className="mt-6 font-serif text-[clamp(2.45rem,5vw,5.8rem)] font-normal leading-[.98]">{copy.processing.title}</motion.h2>
          <motion.p variants={reveal} className="mx-auto mt-7 max-w-2xl text-[15px] leading-8 text-white/56">{copy.processing.subtitle}</motion.p>
        </motion.div>
        <div className="mx-auto mt-14 grid max-w-6xl gap-6 lg:grid-cols-3">
          {copy.processing.steps.map((step, index) => (
            <motion.article
              key={step.label}
              className="group relative min-h-[520px] overflow-hidden border border-white/12 bg-black/24"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.75, delay: index * 0.1, ease }}
              whileHover={{ y: -10 }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(199,170,112,.22),transparent_34%)] opacity-70 transition duration-700 group-hover:opacity-100" />
              <ThreeStage variant={variants[index]} />
              <div className="absolute left-6 right-6 top-6 flex items-center justify-between border-b border-white/14 pb-4">
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold/68">{step.label}</p>
                <p className="font-serif text-3xl text-white/32">0{index + 1}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#08090a] via-[#08090a]/88 to-transparent p-6 pt-28">
                <h3 className="font-serif text-[clamp(2rem,3vw,3.6rem)] font-normal leading-none">{step.title}</h3>
                <p className="mt-5 text-sm leading-7 text-white/54">{step.body}</p>
                <motion.div className="mt-7 h-px bg-gradient-to-r from-gold/80 to-transparent" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.25 + index * 0.12, ease }} style={{ transformOrigin: "left" }} />
              </div>
            </motion.article>
          ))}
        </div>
        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.18em] text-white/32">{copy.processing.disclaimer}</p>
      </div>
    </RoomShell>
  );
}

function ResultAndTryOnSection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const objectX = useTransform(scrollYProgress, [0, 1], ["-5%", "6%"]);

  return (
    <RoomShell tone="light" className="py-24 lg:py-32">
      <div ref={ref} className="ui-container relative z-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }} className="relative z-10">
          <motion.p variants={reveal} className="ui-eyebrow text-[#8a7144]">{copy.result.eyebrow}</motion.p>
          <motion.h2 variants={reveal} className="mt-6 font-serif text-[clamp(2.5rem,4.8vw,5.6rem)] font-normal leading-[.98]">{copy.result.title}</motion.h2>
          <motion.div variants={reveal} className="mt-9 space-y-3">
            {[
              [copy.result.profileLabel, copy.result.profileName],
              [copy.result.luckyElementLabel, copy.result.luckyElement],
              [copy.result.categoryLabel, copy.result.category],
              [copy.result.reasonLabel, copy.result.reason],
              [copy.result.occasionLabel, copy.result.occasion],
            ].map(([label, value]) => (
              <motion.div
                key={label}
                className="group flex items-baseline justify-between gap-6 border-t border-black/14 py-4"
                whileHover={{ x: 8 }}
                transition={{ duration: 0.5, ease }}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] text-black/42">{label}</p>
                <p className="max-w-[62%] text-right font-serif text-2xl leading-tight transition duration-500 group-hover:text-[#8a7144]">{value}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={reveal} className="mt-8">
            <PremiumLink href="/test" variant="light">{copy.result.cta}</PremiumLink>
          </motion.div>
        </motion.div>

        <motion.div className="relative overflow-hidden bg-[#111316] text-white" initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-120px" }} transition={{ duration: 0.85, ease }}>
          <div className="relative aspect-[4/5] min-h-[520px]">
            <motion.div className="absolute inset-0" style={{ y: imageY }}>
              <Image src="/tryon/aurora-necklace/worn-reference.png" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-74" />
            </motion.div>
            <motion.div aria-hidden="true" className="absolute right-[-12%] top-[6%] h-[48%] w-[58%]" style={{ x: objectX }}>
              <ThreeStage variant="pendant" />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,9,10,.86),transparent_45%)]" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <p className="ui-eyebrow">{copy.tryOn.eyebrow}</p>
              <h3 className="mt-4 font-serif text-[clamp(2rem,3.2vw,3.8rem)] leading-tight">{copy.tryOn.title}</h3>
              <p className="mt-5 max-w-lg text-sm leading-7 text-white/62">{copy.tryOn.body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {copy.tryOn.labels.map((label) => (
                  <span key={label} className="border border-white/18 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white/60">{label}</span>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <PremiumLink href="/try-on">{copy.tryOn.cta}</PremiumLink>
                <span className="text-xs text-white/38">{copy.tryOn.note}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </RoomShell>
  );
}

function ObjectStudySection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1.04, 0.96]);
  const recommendedPiece = copy.jewelry.pieces[1];

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-[#0b0c0e] text-[#f4f0e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_64%_44%,rgba(199,170,112,.2),transparent_32%),linear-gradient(180deg,#0b0c0e_0%,#15120d_52%,#070809_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="ui-container relative grid min-h-screen items-center gap-10 py-20 lg:grid-cols-[.82fr_1.18fr]">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }} className="z-10 max-w-xl">
          <motion.p variants={reveal} className="ui-eyebrow text-gold/78">{copy.hero.modelLabel}</motion.p>
          <motion.h2 variants={reveal} className="mt-6 font-serif text-[clamp(2.8rem,5.6vw,6.6rem)] font-normal leading-[.92]">{copy.processing.steps[2].title}</motion.h2>
          <motion.div variants={reveal} className="mt-9 border-y border-white/14 py-7">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/38">{recommendedPiece.meta}</p>
            <h3 className="mt-4 font-serif text-[clamp(2.1rem,3.4vw,4rem)] leading-none">{recommendedPiece.name}</h3>
            <p className="mt-5 text-[15px] leading-8 text-white/58">{recommendedPiece.relevance}</p>
          </motion.div>
          <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-3">
            <PremiumLink href="/try-on">{copy.tryOn.cta}</PremiumLink>
            <PremiumLink href={productAssets[1].href}>{copy.jewelry.viewObject}</PremiumLink>
          </motion.div>
        </motion.div>
        <motion.div style={{ y, scale }} className="relative min-h-[520px] overflow-hidden border border-white/12 bg-[#0b0c0e] lg:min-h-[720px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(199,170,112,.2),transparent_38%)]" />
          <RecommendationStage />
        </motion.div>
      </div>
    </section>
  );
}

function JewelrySection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  return (
    <RoomShell className="py-24 lg:py-32">
      <div className="ui-container relative z-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-120px" }}>
            <motion.p variants={reveal} className="ui-eyebrow">{copy.jewelry.eyebrow}</motion.p>
            <motion.h2 variants={reveal} className="mt-5 font-serif text-[clamp(2.55rem,4.6vw,5.4rem)] font-normal leading-[.96]">{copy.jewelry.title}</motion.h2>
          </motion.div>
          <PremiumLink href="/shop">{copy.jewelry.cta}</PremiumLink>
        </div>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {copy.jewelry.pieces.map((piece, index) => (
            <motion.div key={piece.name} initial={{ opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: index * 0.08, ease }}>
              <Link href={productAssets[index].href} className="group block outline-none focus-visible:ring-2 focus-visible:ring-gold/50">
                <motion.div
                  className="relative min-h-[620px] overflow-hidden border border-white/12 bg-[#0b0c0e]"
                  whileHover={{ y: -12, scale: 1.012 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(199,170,112,.22),transparent_38%),linear-gradient(180deg,transparent,rgba(0,0,0,.92))]" />
                  <ThreeStage variant={productAssets[index].variant} />
                  <div className="absolute left-6 right-6 top-6 flex items-start justify-between border-b border-white/14 pb-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">{piece.meta}</p>
                      <h3 className="mt-3 font-serif text-[clamp(2rem,3vw,3.5rem)] font-normal leading-none">{piece.name}</h3>
                    </div>
                    <span className="mt-2 transition duration-500 group-hover:translate-x-1"><Arrow /></span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 border-t border-white/14 pt-5 opacity-76 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gold/72">{copy.jewelry.revealLabel}</p>
                    <p className="mt-4 text-sm leading-7 text-white/68">{piece.relevance}</p>
                    <div className="mt-5 flex items-end justify-between gap-5">
                      <p className="font-serif text-2xl">{piece.price}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-gold/70">{copy.jewelry.viewObject}</p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </RoomShell>
  );
}

function AtelierDailySection({ copy }: { copy: ReturnType<typeof useI18n>["t"]["home"]["redesign"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["-6%", "8%"]);

  return (
    <RoomShell tone="light" className="py-24 lg:py-32">
      <div ref={ref} className="ui-container relative z-10 grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:items-stretch">
        <motion.div className="relative min-h-[700px] overflow-hidden border border-black/12 bg-[#f6f1e8] p-8 lg:p-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-120px" }} transition={{ duration: 0.8, ease }}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(199,170,112,.2),transparent_32%)]" />
          <div className="absolute right-[-8%] top-[5%] h-[46%] w-[58%] opacity-80">
            <ThreeStage variant="signature" />
          </div>
          <div className="relative z-10 flex min-h-[620px] max-w-xl flex-col justify-end">
          <p className="ui-eyebrow text-[#8a7144]">{copy.atelier.eyebrow}</p>
          <h2 className="mt-6 font-serif text-[clamp(2.4rem,4.4vw,5rem)] font-normal leading-[.98]">{copy.atelier.title}</h2>
          <p className="mt-7 max-w-xl text-[15px] leading-8 text-black/58">{copy.atelier.body}</p>
          <div className="mt-8 grid gap-3">
            {copy.atelier.points.map((point) => (
              <motion.p key={point} className="border-t border-black/14 pt-3 text-sm text-black/64" whileHover={{ x: 8, color: "#8a7144" }} transition={{ duration: 0.45, ease }}>{point}</motion.p>
            ))}
          </div>
          <div className="mt-9">
            <PremiumLink href="/vip-atelier" variant="light">{copy.atelier.cta}</PremiumLink>
          </div>
          </div>
        </motion.div>
        <motion.div className="relative min-h-[700px] overflow-hidden border border-black/12 bg-[#111316] p-8 text-white lg:p-12" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-120px" }} transition={{ duration: 0.8, delay: 0.08, ease }}>
          <motion.div className="absolute inset-0" style={{ y: portraitY }}>
            <Image src="/identity-portrait/jewelry/09-moonlight/cover.png" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-42" />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(8,9,10,.92),rgba(8,9,10,.34))]" />
          <div className="absolute right-[-18%] top-[-4%] h-[44%] w-[64%] opacity-80">
            <ThreeStage variant="leaf" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-end">
            <p className="ui-eyebrow">{copy.daily.eyebrow}</p>
            <h2 className="mt-6 font-serif text-[clamp(2.2rem,4vw,4.8rem)] font-normal leading-[.98]">{copy.daily.title}</h2>
            <p className="mt-7 max-w-xl text-[15px] leading-8 text-white/60">{copy.daily.body}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <motion.div className="border border-white/14 p-4 backdrop-blur-[1px]" whileHover={{ y: -6, borderColor: "rgba(199,170,112,.55)" }} transition={{ duration: 0.45, ease }}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">{copy.daily.luckyColorLabel}</p>
                <p className="mt-2 font-serif text-2xl">{copy.daily.luckyColor}</p>
              </motion.div>
              <motion.div className="border border-white/14 p-4 backdrop-blur-[1px]" whileHover={{ y: -6, borderColor: "rgba(199,170,112,.55)" }} transition={{ duration: 0.45, ease }}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/38">{copy.daily.luckyJewelryLabel}</p>
                <p className="mt-2 font-serif text-2xl">{copy.daily.luckyJewelry}</p>
              </motion.div>
            </div>
            <div className="mt-9">
              <PremiumLink href="/daily">{copy.daily.cta}</PremiumLink>
            </div>
          </div>
        </motion.div>
      </div>
    </RoomShell>
  );
}

export function IdentityHome() {
  const { t } = useI18n();
  const copy = t.home.redesign;
  const homeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: homeRef, offset: ["start start", "end end"] });
  const backgroundWash = useTransform(
    scrollYProgress,
    [0, 0.18, 0.38, 0.58, 0.78, 1],
    [
      "radial-gradient(circle at 72% 18%, rgba(199,170,112,.12), transparent 28%)",
      "radial-gradient(circle at 64% 34%, rgba(199,170,112,.16), transparent 30%)",
      "radial-gradient(circle at 50% 38%, rgba(255,244,224,.12), transparent 30%)",
      "radial-gradient(circle at 58% 42%, rgba(199,170,112,.18), transparent 34%)",
      "radial-gradient(circle at 42% 50%, rgba(199,170,112,.12), transparent 32%)",
      "radial-gradient(circle at 34% 64%, rgba(255,244,224,.08), transparent 28%)",
    ]
  );

  return (
    <div ref={homeRef} className="relative bg-[#08090a] text-[#f4f0e8]">
      <style jsx global>{`
        .site-main {
          background: #08090a;
        }
        .site-main a:active,
        .site-main button:active {
          transform: none;
        }
      `}</style>
      <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" style={{ background: backgroundWash }} />
      <SharedStoryLayer progress={scrollYProgress} />
      <div className="relative z-[2]">
        <HeroSection copy={copy} />
        <IdentityInputSection copy={copy} />
        <ProcessingSection copy={copy} />
        <ResultAndTryOnSection copy={copy} />
        <ObjectStudySection copy={copy} />
        <JewelrySection copy={copy} />
        <AtelierDailySection copy={copy} />
      </div>
    </div>
  );
}

useGLTF.preload("/models/composed_box_chain_46_pingankou_35.glb");
useGLTF.preload("/models/hero-ring.glb");
useGLTF.preload("/models/fupai_22.glb");
useGLTF.preload("/models/leaf_34.glb");
useGLTF.preload("/models/solitaire_ring_studio.glb");
