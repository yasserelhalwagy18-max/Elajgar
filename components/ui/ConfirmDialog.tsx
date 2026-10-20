'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  tone?: 'default' | 'danger';
}

/**
 * A styled confirmation dialog.
 *
 * `window.confirm` renders an OS-level, LTR dialog with browser-localised
 * buttons that ignores the app's design language entirely.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  tone = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-md">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={tone === 'danger' ? 'btn btn-danger btn-md' : 'btn btn-primary btn-md'}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full bg-warning-container flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-warning" />
        </div>
        <div className="text-sm text-on-surface-variant leading-relaxed">{message}</div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
