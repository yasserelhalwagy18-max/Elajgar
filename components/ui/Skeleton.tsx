'use client';

/**
 * One shimmering placeholder block.
 *
 * Matches the skeleton style of `app/dashboard/loading.tsx`
 * (`bg-outline-variant` + `animate-pulse`).
 */
export function Skeleton({ className = 'h-4 w-32' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-outline-variant/30 ${className}`} />;
}

export default Skeleton;
