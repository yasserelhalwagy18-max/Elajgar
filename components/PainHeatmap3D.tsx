'use client';

import React, { Suspense, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFrame } from '@react-three/fiber';
import { Html, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  BODY_BUCKETS,
  BODY_BUCKET_LABELS,
  BODY_BUCKET_POSITIONS,
  type BodyBucket,
} from '@/lib/body-regions';
import { toPersianDigits } from '@/lib/utils';

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
 *
 * The panel passes the real distribution; when there is no data the markers
 * are all at zero rather than showing made-up numbers.
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

function SceneLighting() {
    return (
        <>
            <ambientLight intensity={0.2} color="#ffffff" />
            <directionalLight
                position={[5, 5, 5]}
                intensity={1.5}
                castShadow
                color="#f0f0f0"
            />
            <directionalLight
                position={[-5, 5, 5]}
                intensity={0.5}
                color="#a0a0a0"
            />
            <spotLight
                position={[0, 5, 10]}
                angle={0.3}
                penumbra={1}
                intensity={2}
                castShadow
                color="#ffffff"
            />
            <spotLight
                position={[0, -5, -5]}
                angle={0.5}
                penumbra={0.5}
                intensity={1}
                color="#ffffff"
            />
        </>
    );
}

// Map frequency (0-100) to a cinematic color gradient (Amber to Crimson)
function getHeatColor(frequency: number): THREE.Color {
    // Subtle amber for low frequency
    const colorLow = new THREE.Color(0xd97706); // amber-600
    // Deep crimson for high frequency
    const colorHigh = new THREE.Color(0x991b1b); // red-800

    return colorLow.clone().lerp(colorHigh, frequency / 100);
}

function PlaceholderHumanoid() {
    // Basic standard material for the body.
    // Memoised and disposed explicitly: a material passed via the `material`
    // prop is NOT auto-disposed by react-three-fiber, so creating it during
    // render would leak GPU resources on every re-render.
    const bodyMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: 0xe0e0e0,
                roughness: 0.4,
                metalness: 0.1,
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
                <sphereGeometry args={[0.15, 32, 32]} />
            </mesh>
            {/* Torso */}
            <mesh position={[0, 0.2, 0]} material={bodyMaterial}>
                <cylinderGeometry args={[0.2, 0.18, 1, 32]} />
            </mesh>
            {/* Shoulders */}
            <mesh position={[0, 0.6, 0]} material={bodyMaterial} rotation={[0, 0, Math.PI / 2]}>
                 <cylinderGeometry args={[0.1, 0.1, 0.8, 32]} />
            </mesh>
            {/* Left Arm */}
            <mesh position={[-0.4, 0.1, 0]} material={bodyMaterial}>
                <cylinderGeometry args={[0.06, 0.05, 0.8, 32]} />
            </mesh>
            {/* Right Arm */}
            <mesh position={[0.4, 0.1, 0]} material={bodyMaterial}>
                <cylinderGeometry args={[0.06, 0.05, 0.8, 32]} />
            </mesh>
            {/* Pelvis */}
            <mesh position={[0, -0.35, 0]} material={bodyMaterial}>
                <boxGeometry args={[0.36, 0.2, 0.18]} />
            </mesh>
            {/* Left Leg */}
            <mesh position={[-0.12, -0.85, 0]} material={bodyMaterial}>
                <cylinderGeometry args={[0.08, 0.06, 0.9, 32]} />
            </mesh>
            {/* Right Leg */}
            <mesh position={[0.12, -0.85, 0]} material={bodyMaterial}>
                <cylinderGeometry args={[0.08, 0.06, 0.9, 32]} />
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

function Marker({ data }: { data: PositionedRegion }) {
    const [hovered, setHovered] = useState(false);

    const color = useMemo(() => getHeatColor(data.percentage), [data.percentage]);

    // Scale intensity and size slightly on hover
    const targetIntensity = hovered ? (data.percentage / 100) * 3 + 1 : (data.percentage / 100) * 2;
    const targetScale = hovered ? 1.3 : 1;

    // Restore the cursor if the component unmounts while the marker is hovered.
    useEffect(() => {
        return () => {
            if (hovered) document.body.style.cursor = 'auto';
        };
    }, [hovered]);

    return (
        <group position={data.position}>
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
                <sphereGeometry args={[0.04, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={targetIntensity + 1}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            <pointLight color={color} intensity={targetIntensity} distance={0.5} decay={2} />

            {hovered && (
                <Html center distanceFactor={4} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
                    <div
                        dir="rtl"
                        className="bg-on-surface/90 backdrop-blur-md border border-white/10 text-white rounded-lg px-4 py-2 shadow-2xl min-w-max transform transition-all"
                        style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="font-bold text-sm mb-1">{data.label}</div>
                        <div className="text-xs text-white/80 flex items-center gap-2">
                            <span>گزارش‌ها:</span>
                            <span className="font-mono text-white font-bold">
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

export default function PainHeatmap3D({
  modelUrl,
  regions,
  height = 500,
}: {
  modelUrl?: string;
  /** The regions to draw. Without them every marker is at zero. */
  regions?: PainRegionDatum[];
  height?: number;
}) {
    const painData = useMemo(() => buildPainData(regions), [regions]);
    const hasData = painData.some((region) => region.percentage > 0);

    return (
        <div className="w-full relative rounded-3xl overflow-hidden card" style={{ height }}>
            <Canvas
                shadows
                camera={{ position: [0, 0, 4], fov: 45 }}
                gl={{ alpha: true, antialias: true }}
                style={{ background: 'transparent' }}
            >
                <SceneLighting />
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={2}
                    maxDistance={6}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 1.5}
                />

                <Suspense fallback={<Html center><div className="text-primary animate-pulse font-bold bg-surface-container/90 px-4 py-2 rounded-full backdrop-blur-sm">در حال بارگذاری 3D...</div></Html>}>
                    <Center>
                        <group position={[0, 0.2, 0]}>
                            {/* Base Model */}
                            {modelUrl ? (
                                // Here you would load the GLTF model. For now, we fallback to placeholder.
                                // <primitive object={useGLTF(modelUrl).scene} />
                                <PlaceholderHumanoid />
                            ) : (
                                <PlaceholderHumanoid />
                            )}

                            {/* Pain Markers */}
                            {painData.map((data) => (
                                <Marker key={data.id} data={data} />
                            ))}
                        </group>
                    </Center>
                </Suspense>
            </Canvas>

            {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-on-surface/80 backdrop-blur-sm text-white text-sm font-bold px-5 py-3 rounded-2xl text-center">
                        هنوز هیچ کاربری ناحیه دردی ثبت نکرده است
                    </div>
                </div>
            )}

            <div className="absolute bottom-4 right-4 pointer-events-none">
                <div className="text-xs text-white/80 bg-on-surface/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    برای چرخش مدل را بکشید
                </div>
            </div>
        </div>
    );
}
