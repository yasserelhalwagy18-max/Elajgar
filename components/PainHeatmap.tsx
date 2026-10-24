'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { BODY_REGIONS, type BodyRegion } from '@/lib/body-regions';

type RegionData = BodyRegion;
const regionsData: RegionData[] = BODY_REGIONS;

export default function PainHeatmap({ view }: { view: 'front' | 'back' }) {
  const userProfile = useStore((state) => state.userProfile);
  const toggleRegion = useStore((state) => state.toggleRegion);
  const selectedZones = userProfile?.painZones?.map((z) => z.zone) || [];

  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0, transform: 'translate(-50%, -100%)' });
  const shouldReduceMotion = useReducedMotion();

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
        className="relative w-full max-w-[420px] mx-auto min-h-[380px] aspect-[1984/2136] rounded-3xl overflow-hidden card border border-white/60 bg-surface-variant/30 flex items-center justify-center shadow-inner"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <Image
            src={view === 'front' ? '/body-front.png' : '/body-back.png'}
            alt={view === 'front' ? 'آناتومی جلو' : 'آناتومی پشت'}
            fill
            sizes="(max-width: 640px) 320px, 400px"
            className="object-contain opacity-90"
            priority
          />
        </div>

        {/* Markers overlay - 28px touch targets (meets WCAG 2.2 24px target size) with sufficient spacing */}
        <div className="absolute inset-0 w-full h-full">
          <div className="relative w-full h-full">
            {activeRegions.map((region) => {
              const isSelected = selectedZones.includes(region.label); // we use label for state matching existing logic

              return (
                <button
                  key={region.id}
                  type="button"
                  style={{ top: region.top, left: region.left, transform: 'translate(-50%, -50%)' }}
                  className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform z-10 hover:scale-110 active:scale-95"
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
                      'w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all',
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
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
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
