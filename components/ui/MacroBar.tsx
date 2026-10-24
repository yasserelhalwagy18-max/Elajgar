'use client';

import { cn, formatNumber } from '@/lib/utils';

export type MacroKey = 'protein' | 'carbs' | 'fat';

/**
 * The single source of truth for macro colours.
 *
 * The dashboard used `primary/secondary/tertiary` while the nutrition page
 * used raw `blue-500/green-500/orange-500` for the exact same three macros -
 * the same data was rendered in two different colour languages.
 */
export const MACRO_COLOR: Record<MacroKey, string> = {
  protein: 'var(--color-primary)',
  carbs: 'var(--color-secondary)',
  fat: 'var(--color-primary-dark)',
};

export const MACRO_LABEL: Record<MacroKey, string> = {
  protein: 'پروتئین',
  carbs: 'کربوهیدرات',
  fat: 'چربی',
};

export interface MacroBarProps {
  macro: MacroKey;
  current: number;
  target: number;
  /** Hide the "current/target" caption (used in the compact dashboard card). */
  compact?: boolean;
  className?: string;
}

/**
 * A progress bar for one macronutrient.
 *
 * Shows the target, and switches to the warning colour when the user goes
 * over it - previously there was no way to tell from the bar alone whether
 * you were under or over.
 */
export function MacroBar({ macro, current, target, compact = false, className }: MacroBarProps) {
  const ratio = target > 0 ? current / target : 0;
  const percentage = Math.min(ratio * 100, 100);
  const isOver = ratio > 1;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-on-surface flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: MACRO_COLOR[macro] }}
            aria-hidden="true"
          />
          {MACRO_LABEL[macro]}
        </span>
        <span className={cn('font-medium tabular-nums', isOver ? 'text-error' : 'text-on-surface-variant')}>
          {formatNumber(current)}
          {compact ? '' : ` / ${formatNumber(target)}`}
          <span className="text-[10px]"> گرم</span>
        </span>
      </div>

      <div
        className="h-2 w-full rounded-full bg-surface-variant overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.round(current)}
        aria-label={`${MACRO_LABEL[macro]}: ${formatNumber(current)} از ${formatNumber(target)} گرم`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: isOver ? 'var(--color-error)' : MACRO_COLOR[macro],
          }}
        />
      </div>
    </div>
  );
}

export default MacroBar;
