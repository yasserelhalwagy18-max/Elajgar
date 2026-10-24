import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconBadgeVariant =
  | 'hydration'
  | 'calories'
  | 'pain'
  | 'education'
  | 'gyms'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'success'
  | 'warning';

export type IconBadgeSize = 16 | 20 | 24;

export interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  variant?: IconBadgeVariant;
  size?: IconBadgeSize;
}

const variantStyles: Record<IconBadgeVariant, { container: string; icon: string }> = {
  hydration: {
    container: 'bg-water-container text-water',
    icon: 'text-water',
  },
  calories: {
    container: 'bg-primary-container text-primary',
    icon: 'text-primary',
  },
  pain: {
    container: 'bg-error-container text-error',
    icon: 'text-error',
  },
  education: {
    container: 'bg-secondary-container text-secondary',
    icon: 'text-secondary',
  },
  gyms: {
    container: 'bg-secondary-container text-secondary',
    icon: 'text-secondary',
  },
  primary: {
    container: 'bg-primary-container text-primary',
    icon: 'text-primary',
  },
  secondary: {
    container: 'bg-secondary-container text-secondary',
    icon: 'text-secondary',
  },
  error: {
    container: 'bg-error-container text-error',
    icon: 'text-error',
  },
  success: {
    container: 'bg-success-container text-success',
    icon: 'text-success',
  },
  warning: {
    container: 'bg-warning-container text-warning',
    icon: 'text-warning',
  },
};

const sizeStyles: Record<
  IconBadgeSize,
  { container: string; iconClass: string; iconSize: number }
> = {
  16: {
    container: 'w-7 h-7',
    iconClass: 'w-4 h-4',
    iconSize: 16,
  },
  20: {
    container: 'w-9 h-9',
    iconClass: 'w-5 h-5',
    iconSize: 20,
  },
  24: {
    container: 'w-11 h-11',
    iconClass: 'w-6 h-6',
    iconSize: 24,
  },
};

export function IconBadge({
  icon: Icon,
  variant = 'primary',
  size = 20,
  className,
  ...props
}: IconBadgeProps) {
  const vStyle = variantStyles[variant] ?? variantStyles.primary;
  const sStyle = sizeStyles[size] ?? sizeStyles[20];

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0 transition-colors',
        vStyle.container,
        sStyle.container,
        className
      )}
      {...props}
    >
      <Icon
        className={cn(sStyle.iconClass, vStyle.icon)}
        size={sStyle.iconSize}
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </div>
  );
}
