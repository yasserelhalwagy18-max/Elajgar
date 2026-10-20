'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface RegionData {
  id: string;
  label: string;
  view: 'front' | 'back';
  top: string;
  left: string;
}

/**
 * Marker positions, as a percentage of the artwork.
 *
 * They were measured against the actual PNGs (`body-front.png` and
 * `body-back.png`, both 1984x2136): the body occupies 1.4%..91.9% of the
 * image height, the head 1.4%..9%, the shoulders ~16%, the waist ~40%, the
 * hips ~48% and the feet ~91%. The old numbers were expressed against a
 * letterboxed container, so the dots floated far above and below the body.
 *
 * Left/right are the *person's* left and right: in the back view the
 * person's left is on the viewer's left, in the front view it is mirrored.
 */
const regionsData: RegionData[] = [
  // Front View
  { id: 'head_front', label: 'سر', view: 'front', top: '4%', left: '50%' },
  { id: 'neck_front', label: 'گردن', view: 'front', top: '10%', left: '50%' },
  { id: 'shoulders_front', label: 'شانه‌ها', view: 'front', top: '15%', left: '50%' },
  { id: 'chest', label: 'قفسه سینه', view: 'front', top: '21%', left: '50%' },
  { id: 'abdomen', label: 'شکم', view: 'front', top: '31%', left: '50%' },
  { id: 'pelvis_front', label: 'لگن', view: 'front', top: '46%', left: '50%' },
  { id: 'elbow_r_front', label: 'آرنج راست', view: 'front', top: '40%', left: '30%' },
  { id: 'elbow_l_front', label: 'آرنج چپ', view: 'front', top: '40%', left: '70%' },
  { id: 'wrist_r_front', label: 'مچ دست راست', view: 'front', top: '46%', left: '26%' },
  { id: 'wrist_l_front', label: 'مچ دست چپ', view: 'front', top: '46%', left: '74%' },
  { id: 'knee_r_front', label: 'زانو راست', view: 'front', top: '68%', left: '43%' },
  { id: 'knee_l_front', label: 'زانو چپ', view: 'front', top: '68%', left: '57%' },
  { id: 'ankle_r_front', label: 'مچ پا راست', view: 'front', top: '88%', left: '44%' },
  { id: 'ankle_l_front', label: 'مچ پا چپ', view: 'front', top: '88%', left: '56%' },

  // Back View
  { id: 'head_back', label: 'پشت سر', view: 'back', top: '4%', left: '50%' },
  { id: 'neck_back', label: 'پشت گردن', view: 'back', top: '10%', left: '50%' },
  { id: 'shoulder_l_back', label: 'شانه چپ', view: 'back', top: '16%', left: '39%' },
  { id: 'shoulder_r_back', label: 'شانه راست', view: 'back', top: '16%', left: '61%' },
  { id: 'upper_back', label: 'پشت (بالا)', view: 'back', top: '24%', left: '50%' },
  { id: 'lower_back', label: 'کمر', view: 'back', top: '33%', left: '50%' },
  { id: 'glutes', label: 'باسن', view: 'back', top: '48%', left: '50%' },
  { id: 'elbow_l_back', label: 'آرنج چپ', view: 'back', top: '40%', left: '30%' },
  { id: 'elbow_r_back', label: 'آرنج راست', view: 'back', top: '40%', left: '70%' },
  { id: 'wrist_l_back', label: 'مچ دست چپ', view: 'back', top: '46%', left: '26%' },
  { id: 'wrist_r_back', label: 'مچ دست راست', view: 'back', top: '46%', left: '74%' },
  { id: 'hamstring_l', label: 'پشت ران چپ', view: 'back', top: '60%', left: '43%' },
  { id: 'hamstring_r', label: 'پشت ران راست', view: 'back', top: '60%', left: '57%' },
  { id: 'calf_l', label: 'ساق پا چپ', view: 'back', top: '75%', left: '43%' },
  { id: 'calf_r', label: 'ساق پا راست', view: 'back', top: '75%', left: '57%' },
  { id: 'heel_l', label: 'پاشنه پا چپ', view: 'back', top: '88%', left: '44%' },
  { id: 'heel_r', label: 'پاشنه پا راست', view: 'back', top: '88%', left: '56%' },
];

export default function PainHeatmap({ view }: { view: 'front' | 'back' }) {
  const userProfile = useStore((state) => state.userProfile);
  const toggleRegion = useStore((state) => state.toggleRegion);
  const selectedZones = userProfile?.painZones?.map((z) => z.zone) || [];

  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0, transform: 'translate(-50%, -100%)' });

  const activeRegions = regionsData.filter((r) => r.view === view);

  const handleHover = (_e: React.MouseEvent, region: RegionData | null) => {
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
        transform: finalTransform,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative w-full max-w-[420px] mx-auto aspect-[1984/2136] rounded-3xl overflow-hidden card border border-white/60 bg-surface-variant/30 flex items-center justify-center shadow-inner"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <Image
            src={view === 'front' ? '/body-front.png' : '/body-back.png'}
            alt={view === 'front' ? 'آناتومی جلو' : 'آناتومی پشت'}
            fill
            className="object-contain opacity-90"
            priority
          />
        </div>

        {/* Markers overlay - the hit area is a full 44px target while the
            visible dot stays small, so neighbouring regions stay readable. */}
        <div className="absolute inset-0 w-full h-full">
          <div className="relative w-full h-full">
            {activeRegions.map((region) => {
              const isSelected = selectedZones.includes(region.label); // we use label for state matching existing logic

              return (
                <button
                  key={region.id}
                  type="button"
                  style={{ top: region.top, left: region.left, transform: 'translate(-50%, -50%)' }}
                  className="absolute w-11 h-11 rounded-full flex items-center justify-center transition-transform z-10 hover:scale-110 active:scale-95"
                  onClick={() => toggleRegion(region.label)}
                  onMouseEnter={(e) => handleHover(e, region)}
                  onMouseLeave={(e) => handleHover(e, null)}
                  onFocus={() => setHoveredRegion(region)}
                  onBlur={() => setHoveredRegion(null)}
                  aria-pressed={isSelected}
                  aria-label={region.label}
                >
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full transition-all',
                      isSelected
                        ? 'scale-125 border-2 border-error shadow-[0_0_15px_rgba(220,38,38,0.8)] bg-error/30'
                        : 'border border-primary/50 bg-white/40 shadow-[0_0_8px_rgba(37,99,235,0.3)] hover:scale-125 hover:border-primary hover:bg-white/60 hover:shadow-[0_0_12px_rgba(37,99,235,0.5)]'
                    )}
                  />
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
              className="absolute z-50 px-3 py-1.5 rounded-lg backdrop-blur-md bg-on-surface/90 border border-white/10 shadow-2xl pointer-events-none"
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

      {/* Accessible + precise alternative to tapping the image.
          The body map is a small target on a phone; this list is the reliable
          way to pick a region, and it is also what a screen reader reads. */}
      <div className="w-full">
        <p className="text-xs text-on-surface-variant font-medium mb-2 text-center">
          یا ناحیه درد را از فهرست انتخاب کنید
        </p>
        <ul className="flex flex-wrap gap-2 justify-center">
          {activeRegions.map((region) => {
            const isSelected = selectedZones.includes(region.label);
            return (
              <li key={`chip-${region.id}`}>
                <button
                  type="button"
                  onClick={() => toggleRegion(region.label)}
                  aria-pressed={isSelected}
                  className={cn(
                    'px-3 py-2 rounded-full text-xs font-bold border transition-colors',
                    isSelected
                      ? 'bg-error/10 text-error border-error/30'
                      : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                  )}
                >
                  {region.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
