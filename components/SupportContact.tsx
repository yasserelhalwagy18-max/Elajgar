'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * The one support channel that exists today.
 *
 * Audit #23: the mailto: link is the only route to support - and account
 * deletion («حذف حساب») is documented to go through it - yet on a browser
 * without a default mail client the link does nothing at all. Until an
 * in-app form exists, the raw address is rendered as selectable text next
 * to the link and a copy button puts it on the clipboard, so a user stuck
 * on a shared or misconfigured device can still reach support by pasting
 * the address anywhere they like. When the client provides a phone or
 * Telegram handle, it plugs into the same helper.
 */
export const SUPPORT_EMAIL = 'support@elajgar.com';

/** The mailto: URL every support entry point uses. Kept here so the subject
    line cannot drift between the landing footer and the profile screen - the
    original encoded subject decoded to garbled Persian («سراست پشتبشانی»). */
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('پشتیبانی علاج‌گر')}`;

/**
 * The clipboard API is only exposed on secure contexts, so a panel opened
 * from plain http (or an old browser) has no navigator.clipboard at all.
 * This is the classic textarea + execCommand fallback for those cases; it
 * runs synchronously off the user's click, which is also the only context
 * where Safari allows a copy at all.
 */
function legacyCopy(text: string): boolean {
  let textarea: HTMLTextAreaElement | null = null;
  try {
    textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    if (textarea) textarea.remove();
  }
}

/**
 * An icon button that copies `value` to the clipboard.
 *
 * Feedback is both visual (the icon flips to a checkmark for two seconds)
 * and announced through a toast, because a click that changed nothing
 * silently is indistinguishable from a broken button.
 */
export function CopyContactButton({
  value = SUPPORT_EMAIL,
  className = '',
}: {
  value?: string;
  /** Extra classes, e.g. to shrink the touch target inside a dense row. */
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = React.useCallback(async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        ok = true;
      } else {
        ok = legacyCopy(value);
      }
    } catch {
      // Clipboard permission denied or the API rejected - try the fallback.
      ok = legacyCopy(value);
    }

    if (ok) {
      setCopied(true);
      toast.success(value === SUPPORT_EMAIL ? 'نشانی پشتیبانی کپی شد' : 'کپی شد');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } else {
      // The address is rendered as text next to this button, so hand-copying
      // is the honest remaining route - say so instead of failing quietly.
      toast.error('کپی نشد — نشانی را دستی انتخاب و کپی کنید');
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'کپی شد' : `کپی نشانی ${value}`}
      title={copied ? 'کپی شد' : `کپی نشانی ${value}`}
      className={`icon-btn shrink-0 ${className}`}
    >
      {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-[18px] h-[18px]" />}
    </button>
  );
}
