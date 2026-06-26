'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface RegionData {
  id: string;
  label: string;
  view: 'front' | 'back';
  top: string;
  left: string;
}

const regionsData: RegionData[] = [
  // Front View
  { id: 'head_front', label: 'سر', view: 'front', top: '7%', left: '50%' },
  { id: 'neck_front', label: 'گردن', view: 'front', top: '15%', left: '50%' },
  { id: 'shoulders_front', label: 'شانه‌ها', view: 'front', top: '22%', left: '50%' },
  { id: 'chest', label: 'قفسه سینه', view: 'front', top: '30%', left: '50%' },
  { id: 'abdomen', label: 'شکم', view: 'front', top: '45%', left: '50%' },
  { id: 'elbow_l_front', label: 'آرنج چپ', view: 'front', top: '42%', left: '33%' },
  { id: 'elbow_r_front', label: 'آرنج راست', view: 'front', top: '42%', left: '67%' },
  { id: 'wrist_l_front', label: 'مچ دست چپ', view: 'front', top: '56%', left: '26%' },
  { id: 'wrist_r_front', label: 'مچ دست راست', view: 'front', top: '56%', left: '74%' },
  { id: 'pelvis_front', label: 'لگن', view: 'front', top: '55%', left: '50%' },
  { id: 'knee_l_front', label: 'زانو چپ', view: 'front', top: '72%', left: '42%' },
  { id: 'knee_r_front', label: 'زانو راست', view: 'front', top: '72%', left: '58%' },
  { id: 'ankle_l_front', label: 'مچ پا چپ', view: 'front', top: '93%', left: '42%' },
  { id: 'ankle_r_front', label: 'مچ پا راست', view: 'front', top: '93%', left: '58%' },

  // Back View
  { id: 'head_back', label: 'پشت سر', view: 'back', top: '8%', left: '50%' },
  { id: 'neck_back', label: 'پشت گردن', view: 'back', top: '16%', left: '50%' },
  { id: 'shoulder_l_back', label: 'شانه چپ', view: 'back', top: '23%', left: '35%' },
  { id: 'shoulder_r_back', label: 'شانه راست', view: 'back', top: '23%', left: '65%' },
  { id: 'upper_back', label: 'پشت (بالا)', view: 'back', top: '30%', left: '50%' },
  { id: 'lower_back', label: 'کمر', view: 'back', top: '48%', left: '50%' },
  { id: 'elbow_l_back', label: 'آرنج چپ', view: 'back', top: '42%', left: '31%' },
  { id: 'elbow_r_back', label: 'آرنج راست', view: 'back', top: '42%', left: '69%' },
  { id: 'wrist_l_back', label: 'مچ دست چپ', view: 'back', top: '56%', left: '24%' },
  { id: 'wrist_r_back', label: 'مچ دست راست', view: 'back', top: '56%', left: '76%' },
  { id: 'glutes', label: 'باسن', view: 'back', top: '58%', left: '50%' },
  { id: 'hamstring_l', label: 'پشت ران چپ', view: 'back', top: '68%', left: '42%' },
  { id: 'hamstring_r', label: 'پشت ران راست', view: 'back', top: '68%', left: '58%' },
  { id: 'calf_l', label: 'ساق پا چپ', view: 'back', top: '82%', left: '42%' },
  { id: 'calf_r', label: 'ساق پا راست', view: 'back', top: '82%', left: '58%' },
  { id: 'heel_l', label: 'پاشنه پا چپ', view: 'back', top: '95%', left: '42%' },
  { id: 'heel_r', label: 'پاشنه پا راست', view: 'back', top: '95%', left: '58%' },
];

export default function PainHeatmap({ view }: { view: 'front' | 'back' }) {
    const { userProfile, toggleRegion } = useStore();
    const selectedZones = userProfile?.painZones?.map(z => z.zone) || [];

    const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0, transform: 'translate(-50%, -100%)' });

    const activeRegions = regionsData.filter(r => r.view === view);

    const handleHover = (e: React.MouseEvent, region: RegionData | null) => {
        if (!region) {
            setHoveredRegion(null);
            return;
        }

        setHoveredRegion(region);

        if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();

            // Extract percentage values
            const topPercent = parseFloat(region.top);
            const leftPercent = parseFloat(region.left);

            // Calculate exact pixel position relative to the container
            const topPx = (topPercent / 100) * containerRect.height;
            const leftPx = (leftPercent / 100) * containerRect.width;

            let finalTransform = 'translate(-50%, -100%)';
            let finalTop = topPx - 15; // default position above the marker
            let finalLeft = leftPx;

            // Simple Edge Detection
            // RTL means we should be careful about left/right shifts
            if (leftPercent < 20) {
                 finalTransform = 'translate(0%, -50%)';
                 finalTop = topPx;
                 finalLeft = leftPx + 20;
            } else if (leftPercent > 80) {
                 finalTransform = 'translate(-100%, -50%)';
                 finalTop = topPx;
                 finalLeft = leftPx - 20;
            }

            // Top edge detection
            if (topPercent < 10) {
                 finalTransform = 'translate(-50%, 0%)';
                 finalTop = topPx + 20;
                 finalLeft = leftPx;
            }

            setTooltipStyle({
                top: finalTop,
                left: finalLeft,
                transform: finalTransform
            });
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-[400px] mx-auto aspect-[1/2] rounded-3xl overflow-hidden glass-card border border-white/60 bg-surface-variant/30 flex items-center justify-center shadow-inner"
        >
            <div className="absolute inset-0 w-full h-full pointer-events-none">
                 <Image
                    src={view === 'front' ? '/body-front.png' : '/body-back.png'}
                    alt={view === 'front' ? 'آناتومی جلو' : 'آناتومی پشت'}
                    fill
                    className="object-contain p-4 opacity-90"
                    priority
                 />
            </div>

            {/* Markers overlay */}
            <div className="absolute inset-0 w-full h-full p-4">
                <div className="relative w-full h-full">
                    {activeRegions.map((region) => {
                        const isSelected = selectedZones.includes(region.label); // we use label for state matching existing logic

                        return (
                            <button
                                key={region.id}
                                style={{ top: region.top, left: region.left, transform: 'translate(-50%, -50%)' }}
                                className={cn(
                                    "absolute w-5 h-5 rounded-full flex items-center justify-center transition-all z-10",
                                    isSelected
                                        ? "scale-125 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] bg-red-500/30"
                                        : "border border-primary/50 bg-white/40 shadow-[0_0_8px_rgba(37,99,235,0.3)] hover:scale-125 hover:border-primary hover:bg-white/60 hover:shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                                )}
                                onClick={() => toggleRegion(region.label)}
                                onMouseEnter={(e) => handleHover(e, region)}
                                onMouseLeave={(e) => handleHover(e, null)}
                                aria-label={region.label}
                            >
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    isSelected ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,1)]" : "bg-primary"
                                )}></div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Tooltip */}
            <AnimatePresence>
                {hoveredRegion && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 px-3 py-1.5 rounded-lg backdrop-blur-md bg-slate-900/90 border border-white/10 shadow-2xl pointer-events-none"
                        style={{
                            top: `${tooltipStyle.top}px`,
                            left: `${tooltipStyle.left}px`,
                            transform: tooltipStyle.transform,
                        }}
                    >
                        <span className="text-white text-sm font-bold whitespace-nowrap">{hoveredRegion.label}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
