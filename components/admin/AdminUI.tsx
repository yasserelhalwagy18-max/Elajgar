'use client';

import * as React from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, Loader2, Search, X } from 'lucide-react';
import { cn, toPersianDigits } from '@/lib/utils';

/**
 * The heading of an admin section.
 */
export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-extrabold text-on-surface">{title}</h2>
        {description && (
          <p className="text-sm text-on-surface-variant mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </header>
  );
}

/**
 * A search field with a clear button.
 */
export function AdminSearch({
  value,
  onChange,
  placeholder = 'جستجو...',
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label: string;
}) {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search className="w-5 h-5 text-on-surface-variant absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="input ps-11 pe-10 w-full text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="پاک کردن جستجو"
          className="absolute top-1/2 -translate-y-1/2 end-3 text-on-surface-variant hover:text-on-surface"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/** A filter chip. */
export function AdminFilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="chip"
    >
      {children}
    </button>
  );
}

export interface AdminColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  /** Extra classes for the cell. */
  className?: string;
}

/**
 * The table of a list.
 *
 * It renders its own loading, error and empty states, because a list that
 * silently shows nothing is indistinguishable from a broken panel.
 */
export function AdminTable<T>({
  columns,
  items,
  rowKey,
  isLoading,
  error,
  emptyMessage = 'موردی برای نمایش وجود ندارد',
  onRowClick,
}: {
  columns: AdminColumn<T>[];
  items: T[];
  rowKey: (item: T) => string;
  isLoading: boolean;
  error: string | null;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}) {
  if (error) {
    return (
      <div className="card p-8 rounded-3xl flex items-center gap-3 text-error">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <span className="font-bold">{error}</span>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="card p-12 rounded-3xl flex flex-col items-center gap-3 text-on-surface-variant" aria-busy="true">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-bold">در حال دریافت اطلاعات...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="card p-12 rounded-3xl flex flex-col items-center gap-3 text-on-surface-variant">
        <Inbox className="w-6 h-6 opacity-60" />
        <span className="text-sm font-bold">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl border border-outline-variant bg-surface-container ${isLoading ? 'opacity-60 transition-opacity' : ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-surface-variant/50 text-on-surface-variant text-sm border-b border-outline-variant">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="p-4 font-semibold text-start whitespace-nowrap">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {items.map((item) => (
              <tr
                key={rowKey(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={cn(
                  'transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-surface-variant/50' : 'hover:bg-surface-variant/30',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className={cn('p-4 text-sm', column.className)}>
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * The pagination controls.
 */
export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
      <p className="text-xs text-on-surface-variant font-medium">
        نمایش {toPersianDigits(from)} تا {toPersianDigits(to)} از {toPersianDigits(total)} مورد
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="صفحه قبل"
            className="icon-btn bg-surface-container border border-outline-variant disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-on-surface-variant px-2">
            {toPersianDigits(page)} / {toPersianDigits(totalPages)}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="صفحه بعد"
            className="icon-btn bg-surface-container border border-outline-variant disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

/** A small labelled number. */
export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card rounded-3xl p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-on-surface-variant">{label}</span>
        {icon}
      </div>
      <span className="text-3xl font-black text-on-surface">{value}</span>
      {hint && <span className="text-xs text-on-surface-variant">{hint}</span>}
    </div>
  );
}

/** A coloured status pill. */
export function StatusPill({
  tone,
  children,
}: {
  tone: 'success' | 'error' | 'warning' | 'neutral' | 'primary';
  children: React.ReactNode;
}) {
  const tones = {
    success: 'bg-success-container text-success',
    error: 'bg-error/10 text-error border border-error/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    neutral: 'bg-surface-variant text-on-surface-variant',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <span className={cn('px-3 py-1 text-xs font-bold rounded-full inline-block', tones[tone])}>
      {children}
    </span>
  );
}
