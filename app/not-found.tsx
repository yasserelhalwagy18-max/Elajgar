'use client';

import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-surface">
      <FileQuestion className="w-32 h-32 text-primary mb-6 animate-pulse" strokeWidth={1.5} />
      <h1 className="text-4xl font-bold text-on-surface mb-2">۴۰۴ - صفحه پیدا نشد</h1>
      <p className="text-lg text-on-surface/70 mb-8 text-center max-w-md">
        متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/"
          className="flex-1 bg-primary text-on-primary py-3 px-6 rounded-2xl font-medium text-center hover:opacity-90 transition-opacity"
        >
          بازگشت به خانه
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 bg-surface-variant text-on-surface-variant py-3 px-6 rounded-2xl font-medium text-center hover:opacity-90 transition-opacity"
        >
          داشبورد
        </Link>
      </div>
    </div>
  );
}
