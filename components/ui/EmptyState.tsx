import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type EmptyStateVariant = 'pain' | 'food' | 'daily' | 'subscription' | 'generic';

export interface EmptyStateProps {
  className?: string;
  variant?: EmptyStateVariant;
  illustration?: React.ReactNode;
  message: string;
  action: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

function Illustration({ variant }: { variant: EmptyStateVariant }) {
  switch (variant) {
    case 'pain':
      return (
        <svg
          className="w-14 h-14 text-primary"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="28" cy="28" r="24" className="fill-primary-container" />
          <circle cx="28" cy="28" r="16" className="stroke-primary/30" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="28" cy="28" r="8" className="fill-primary/20 stroke-primary" strokeWidth="2" />
          <path d="M28 12V18M28 38V44M12 28H18M38 28H44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'food':
      return (
        <svg
          className="w-14 h-14 text-tertiary"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="28" cy="28" r="24" className="fill-tertiary-container" />
          <circle cx="28" cy="28" r="12" className="stroke-tertiary" strokeWidth="2" />
          <path d="M19 22V34M16 22V27M22 22V27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M37 22V34M37 22C39 24 39 28 37 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'daily':
      return (
        <svg
          className="w-14 h-14 text-primary"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="28" cy="28" r="24" className="fill-primary-container" />
          <rect x="18" y="18" width="20" height="22" rx="4" className="stroke-primary" strokeWidth="2" />
          <path d="M24 14V18M32 14V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 24H38" stroke="currentColor" strokeWidth="2" />
          <circle cx="28" cy="32" r="2" fill="currentColor" />
        </svg>
      );
    case 'subscription':
      return (
        <svg
          className="w-14 h-14 text-secondary"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="28" cy="28" r="24" className="fill-secondary-container" />
          <path
            d="M28 16L36 20V27C36 33 32.5 38 28 40C23.5 38 20 33 20 27V20L28 16Z"
            className="stroke-secondary fill-secondary/15"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M25 28L27.5 30.5L32 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg
          className="w-14 h-14 text-primary"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="28" cy="28" r="24" className="fill-primary-container" />
          <path d="M20 32C20 28 24 24 28 24C32 24 36 28 36 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="28" cy="20" r="3" fill="currentColor" />
        </svg>
      );
  }
}

/**
 * Reusable empty state with a small inline SVG illustration,
 * one Persian sentence, and a single primary button.
 */
export function EmptyState({
  className,
  variant = 'generic',
  illustration,
  message,
  action,
}: EmptyStateProps) {
  const content = (
    <div
      role="region"
      aria-label={message}
      className={cn(
        'card p-6 sm:p-8 rounded-3xl text-center flex flex-col items-center justify-center',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-center">
        {illustration ?? <Illustration variant={variant} />}
      </div>

      <p className="text-sm sm:text-base text-on-surface-variant font-medium text-center max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {action.href ? (
        <Link href={action.href} className="btn btn-primary btn-md">
          {action.label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={action.onClick}
          className="btn btn-primary btn-md"
        >
          {action.label}
        </button>
      )}
    </div>
  );

  return content;
}

export default EmptyState;
