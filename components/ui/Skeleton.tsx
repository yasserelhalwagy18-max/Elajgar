import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Reusable placeholder block with shimmer animation.
 * Automatically disabled under prefers-reduced-motion.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('shimmer rounded-lg', className)}
      {...props}
    />
  );
}

export default Skeleton;
