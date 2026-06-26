'use client';

import React, { Suspense, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useFrame } from '@react-three/fiber';
import { Html, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Dynamic import for the Canvas to prevent blocking main thread
const Canvas = dynamic(() => import('@react-three/fiber').then((mod) => mod.Canvas), {
  ssr: false,
});

interface PainData {
  id: string;
  label: string;
  frequency: number;
  position: [number, number, number];
}

const painData3D: PainData[] = [
  { id: 'head', label: 'سر', frequency: 15, position: [0, 0.9, 0.1] },
  { id: 'neck', label: 'گردن', frequency: 45, position: [0, 0.65, 0.05] },
  { id: 'shoulders', label: 'شانه‌ها', frequency: 65, position: [0, 0.45, 0.1] },
  { id: 'chest', label: 'قفسه سینه', frequency: 20, position: [0, 0.25, 0.15] },
  { id: 'back', label: 'کمر', frequency: 85, position: [0, 0.05, -0.15] },
  { id: 'arms_l', label: 'دست چپ', frequency: 30, position: [-0.4, 0.1, 0] },
  { id: 'arms_r', label: 'دست راست', frequency: 30, position: [0.4, 0.1, 0] },
  { id: 'hips', label: 'لگن', frequency: 40, position: [0, -0.3, 0.1] },
  { id: 'knees_l', label: 'زانو چپ', frequency: 75, position: [-0.2, -0.8, 0.12] },
  { id: 'knees_r', label: 'زانو راست', frequency: 70, position: [0.2, -0.8, 0.12] },
  { id: 'feet_l', label: 'پای چپ', frequency: 25, position: [-0.2, -1.3, 0.1] },
  { id: 'feet_r', label: 'پای راست', frequency: 25, position: [0.2, -1.3, 0.1] },
];

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
    // Basic standard material for the body
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        roughness: 0.4,
        metalness: 0.1,
    });

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

function Marker({ data }: { data: PainData }) {
    const [hovered, setHovered] = useState(false);

    const color = useMemo(() => getHeatColor(data.frequency), [data.frequency]);

    // Scale intensity and size slightly on hover
    const targetIntensity = hovered ? (data.frequency / 100) * 3 + 1 : (data.frequency / 100) * 2;
    const targetScale = hovered ? 1.3 : 1;

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
                        className="bg-slate-900/90 backdrop-blur-md border border-white/10 text-white rounded-lg px-4 py-2 shadow-2xl min-w-max transform transition-all"
                        style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="font-bold text-sm mb-1">{data.label}</div>
                        <div className="text-xs text-slate-300 flex items-center gap-2">
                            <span>گزارش‌ها:</span>
                            <span className="font-mono text-primary font-bold">%{data.frequency}</span>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

export default function PainHeatmap3D({ modelUrl }: { modelUrl?: string }) {
    return (
        <div className="w-full h-[500px] relative rounded-xl overflow-hidden glass-card border border-white/20">
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

                <Suspense fallback={<Html center><div className="text-primary animate-pulse font-bold bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">در حال بارگذاری 3D...</div></Html>}>
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
                            {painData3D.map((data) => (
                                <Marker key={data.id} data={data} />
                            ))}
                        </group>
                    </Center>
                </Suspense>
            </Canvas>

            <div className="absolute bottom-4 right-4 pointer-events-none">
                <div className="text-xs text-slate-400 bg-slate-900/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                    برای چرخش مدل را بکشید
                </div>
            </div>
        </div>
    );
}
