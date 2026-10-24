'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  /** Rendered under the title and wired up as the dialog description. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  /** Hide the default close button (for blocking consent dialogs). */
  hideCloseButton?: boolean;
  /** Clicking the backdrop closes the dialog. */
  dismissable?: boolean;
  className?: string;
}

/**
 * An accessible modal dialog.
 *
 * The previous implementation rendered `role="dialog" aria-modal="true"`
 * but never moved focus into the dialog, never trapped Tab, and never
 * restored focus on close - so keyboard users could tab straight through the
 * overlay into the page behind it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideCloseButton = false,
  dismissable = true,
  className,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  // Move focus into the dialog on open and restore it on close.
  React.useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = window.setTimeout(() => {
      const node = dialogRef.current;
      if (!node) return;
      const first = node.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node).focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open]);

  // Escape to close + Tab trapped inside the dialog.
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const node = dialogRef.current;
      if (!node) return;

      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

      if (focusables.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Lock background scrolling while the dialog is open.
  React.useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissable ? onClose : undefined}
            className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative z-10 w-full rounded-3xl bg-surface-container border border-outline-variant shadow-floating flex flex-col max-h-[90vh] outline-none',
              SIZE_CLASSES[size],
              className
            )}
          >
            {(title || !hideCloseButton) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2 shrink-0">
                {title ? (
                  <h2 id={titleId} className="text-xl font-bold text-on-surface">
                    {title}
                  </h2>
                ) : (
                  <span />
                )}

                {!hideCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="بستن"
                    className="icon-btn -mt-1 -me-1 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {description && (
              <p id={descriptionId} className="px-6 pb-2 text-sm text-on-surface-variant leading-relaxed">
                {description}
              </p>
            )}

            <div className="px-6 py-4 overflow-y-auto flex-1 min-h-0">{children}</div>

            {footer && (
              <div className="px-6 pb-6 pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
