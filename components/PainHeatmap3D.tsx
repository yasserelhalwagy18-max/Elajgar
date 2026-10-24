'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Html, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  BODY_BUCKETS,
  BODY_BUCKET_LABELS,
  BODY_BUCKET_POSITIONS,
  type BodyBucket,
} from '@/lib/body-regions';
import { toPersianDigits, cn } from '@/lib/utils';
import PainHeatmap from '@/components/PainHeatmap';

// Dynamic import for the Canvas to prevent blocking main thread
const Canvas = dynamic(() => import('@react-three/fiber').then((mod) => mod.Canvas), {
  ssr: false,
});

export interface PainRegionDatum {
  /** The coarse region id, e.g. "back". */
  id: BodyBucket | string;
  label: string;
  /** The share of users who reported this region, 0-100. */
  percentage: number;
  /** How many users reported it. */
  count?: number;
}

type PositionedRegion = PainRegionDatum & { position: [number, number, number] };

/**
 * Build the marker list from a distribution.
 */
function buildPainData(regions?: PainRegionDatum[]): PositionedRegion[] {
  if (regions && regions.length > 0) {
    return regions.map((region) => ({
      ...region,
      position: BODY_BUCKET_POSITIONS[region.id as BodyBucket] ?? [0, 0, 0],
    }));
  }

  return BODY_BUCKETS.map((bucket) => ({
    id: bucket,
    label: BODY_BUCKET_LABELS[bucket],
    percentage: 0,
    count: 0,
    position: BODY_BUCKET_POSITIONS[bucket],
  }));
}

/** Soft studio lighting matching design tokens */
function SceneLighting({ isLowPower }: { isLowPower: boolean }) {
  return (
    <>
      <ambientLight intensity={0.7} color="#f8fafc" />
      <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#dbeafe" />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.2}
        castShadow={!isLowPower}
        shadow-mapSize-width={isLowPower ? 512 : 1024}
        shadow-mapSize-height={isLowPower ? 512 : 1024}
        color="#ffffff"
      />
      {!isLowPower && (
        <directionalLight
          position={[-4, 3, -3]}
          intensity={0.4}
          color="#93c5fd"
        />
      )}
    </>
  );
}

// Map frequency (0-100) to a clean color gradient (Amber to Crimson)
function getHeatColor(frequency: number): THREE.Color {
  const colorLow = new THREE.Color(0xd97706); // amber-600
  const colorHigh = new THREE.Color(0xdc2626); // red-600
  return colorLow.clone().lerp(colorHigh, Math.min(1, Math.max(0, frequency / 100)));
}

function PlaceholderHumanoid() {
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.55,
        metalness: 0.05,
      }),
    []
  );

  useEffect(() => {
    return () => {
      bodyMaterial.dispose();
    };
  }, [bodyMaterial]);

  return (
    <group castShadow receiveShadow>
      {/* Head */}
      <mesh position={[0, 0.9, 0]} material={bodyMaterial}>
        <sphereGeometry args={[0.15, 24, 24]} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.2, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.2, 0.18, 1, 24]} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 0.6, 0]} material={bodyMaterial} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.8, 24]} />
      </mesh>
      {/* Left Arm */}
      <mesh position={[-0.4, 0.1, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.06, 0.05, 0.8, 24]} />
      </mesh>
      {/* Right Arm */}
      <mesh position={[0.4, 0.1, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.06, 0.05, 0.8, 24]} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, -0.35, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.36, 0.2, 0.18]} />
      </mesh>
      {/* Left Leg */}
      <mesh position={[-0.12, -0.85, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.08, 0.06, 0.9, 24]} />
      </mesh>
      {/* Right Leg */}
      <mesh position={[0.12, -0.85, 0]} material={bodyMaterial}>
        <cylinderGeometry args={[0.08, 0.06, 0.9, 24]} />
      </mesh>
      {/* Left Foot */}
      <mesh position={[-0.12, -1.35, 0.05]} material={bodyMaterial}>
        <boxGeometry args={[0.1, 0.1, 0.2]} />
      </mesh>
      {/* Right Foot */}
      <mesh position={[0.12, -1.35, 0.05]} material={bodyMaterial}>
        <boxGeometry args={[0.1, 0.1, 0.2]} />
      </mesh>
    </group>
  );
}

function Marker({ data, isLowPower }: { data: PositionedRegion; isLowPower: boolean }) {
  const [hovered, setHovered] = useState(false);
  const hasPain = data.percentage > 0;

  const color = useMemo(() => getHeatColor(data.percentage), [data.percentage]);
  const targetScale = hovered ? 1.25 : 1;

  useEffect(() => {
    return () => {
      if (hovered) document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <group position={data.position}>
      {hasPain ? (
        <>
          {/* Inner core marker */}
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHovered(false);
              document.body.style.cursor = 'auto';
            }}
            scale={targetScale}
          >
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={hovered ? 2.5 : 1.5}
              roughness={0.2}
            />
          </mesh>

          {/* Subtle outer glow on painful zones */}
          {!isLowPower && (
            <mesh scale={targetScale * 1.5}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={hovered ? 0.45 : 0.22}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          )}

          <pointLight
            color={color}
            intensity={hovered ? 1.2 : 0.6}
            distance={0.4}
            decay={2}
          />
        </>
      ) : (
        <mesh scale={0.75}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={0x94a3b8} opacity={0.35} transparent />
        </mesh>
      )}

      {hovered && (
        <Html center distanceFactor={4} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
          <div
            dir="rtl"
            className="card bg-surface-container/95 backdrop-blur-md border border-outline-variant text-on-surface rounded-2xl px-3.5 py-2 shadow-floating min-w-max text-start"
          >
            <div className="font-bold text-xs text-primary mb-0.5">{data.label}</div>
            <div className="text-xs text-on-surface-variant flex items-center gap-1.5 tabular-nums">
              <span>گزارش‌ها:</span>
              <span className="font-bold text-on-surface">
                {data.count !== undefined
                  ? `${toPersianDigits(data.count)} کاربر`
                  : `${toPersianDigits(data.percentage)}٪`}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function checkIsLowPower(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as any;
  const isWeakCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
  const isWeakMem = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
  return Boolean(isWeakCpu || isWeakMem);
}

export default function PainHeatmap3D({
  modelUrl,
  regions,
  height = 500,
}: {
  modelUrl?: string;
  regions?: PainRegionDatum[];
  height?: number;
}) {
  const [webGLAvailable] = useState(() => checkWebGLSupport());
  const [isLowPower] = useState(() => checkIsLowPower());
  const [viewMode, setViewMode] = useState<'3d' | '2d'>(() => {
    const hasWebGL = checkWebGLSupport();
    const lowPower = checkIsLowPower();
    return !hasWebGL || lowPower ? '2d' : '3d';
  });
  const [twoDView, setTwoDView] = useState<'front' | 'back'>('front');

  const painData = useMemo(() => buildPainData(regions), [regions]);
  const hasData = painData.some((region) => region.percentage > 0);

  return (
    <div
      className="w-full relative rounded-3xl overflow-hidden card bg-gradient-to-b from-surface via-surface-container to-surface-variant/30 flex flex-col"
      style={{ height }}
    >
      {/* Top Controls: 3D / 2D Toggle and Clean Color Intensity Legend */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
        {/* Visible View Mode Toggle */}
        <div className="pointer-events-auto flex items-center bg-surface-container/90 backdrop-blur-md p-1 rounded-2xl border border-outline-variant shadow-resting">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            disabled={!webGLAvailable}
            title={!webGLAvailable ? 'WebGL در این دستگاه پشتیبانی نمی‌شود' : 'نمایش سه‌بعدی'}
            className={cn(
              'px-3 py-1 text-xs font-bold rounded-xl transition-all',
              viewMode === '3d'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            ۳بعدی
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={cn(
              'px-3 py-1 text-xs font-bold rounded-xl transition-all',
              viewMode === '2d'
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            ۲بعدی
          </button>
        </div>

        {/* Clean Intensity Colors Legend */}
        <div className="pointer-events-auto card bg-surface-container/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-outline-variant shadow-resting flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between gap-3 text-[10px] font-bold text-on-surface-variant leading-none">
            <span>کم</span>
            <span className="font-medium text-[9px]">شدت درد</span>
            <span>زیاد</span>
          </div>
          <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 shadow-inner" />
        </div>
      </div>

      {viewMode === '3d' && webGLAvailable ? (
        <>
          <Canvas
            shadows={!isLowPower}
            camera={{ position: [0, 0, 4], fov: 45 }}
            dpr={isLowPower ? 1 : [1, 2]}
            gl={{ alpha: true, antialias: !isLowPower }}
            style={{ background: 'transparent' }}
          >
            <SceneLighting isLowPower={isLowPower} />
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={2}
              maxDistance={6}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 1.5}
            />

            <Suspense
              fallback={
                <Html center>
                  <div className="text-primary animate-pulse font-bold bg-surface-container/90 px-4 py-2 rounded-full backdrop-blur-sm border border-outline-variant text-xs">
                    در حال بارگذاری ۳بعدی...
                  </div>
                </Html>
              }
            >
              <Center>
                <group position={[0, 0.2, 0]}>
                  {modelUrl ? (
                    <PlaceholderHumanoid />
                  ) : (
                    <PlaceholderHumanoid />
                  )}

                  {/* Pain Markers with subtle glow */}
                  {painData.map((data) => (
                    <Marker key={data.id} data={data} isLowPower={isLowPower} />
                  ))}
                </group>
              </Center>
            </Suspense>
          </Canvas>

          {!hasData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="card bg-surface-container/90 backdrop-blur-sm text-on-surface text-xs font-bold px-4 py-2.5 rounded-2xl border border-outline-variant shadow-raised text-center">
                هنوز هیچ کاربری ناحیه دردی ثبت نکرده است
              </div>
            </div>
          )}

          <div className="absolute bottom-3 right-3 pointer-events-none z-10">
            <div className="text-[11px] text-on-surface-variant bg-surface-container/80 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant/60 shadow-resting">
              برای چرخش مدل را بکشید
            </div>
          </div>
        </>
      ) : (
        /* Fallback to 2D PainHeatmap */
        <div className="w-full h-full flex flex-col items-center justify-center pt-14 pb-4 px-4 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTwoDView('front')}
              className={cn(
                'px-3 py-1 text-xs font-bold rounded-xl transition-all',
                twoDView === 'front'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'
              )}
            >
              نمای جلو
            </button>
            <button
              type="button"
              onClick={() => setTwoDView('back')}
              className={cn(
                'px-3 py-1 text-xs font-bold rounded-xl transition-all',
                twoDView === 'back'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-variant text-on-surface-variant hover:text-on-surface'
              )}
            >
              نمای پشت
            </button>
          </div>
          <div className="w-full max-w-[280px]">
            <PainHeatmap view={twoDView} />
          </div>
        </div>
      )}
    </div>
  );
}
