'use client';

import Link from 'next/link';
import { FileQuestion, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel p-10 rounded-3xl max-w-md w-full text-center flex flex-col items-center">
        <div className="bg-primary-container p-6 rounded-full mb-6">
          <FileQuestion className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-3xl font-bold text-on-surface mb-2">صفحه پیدا نشد!</h1>
        <p className="text-on-surface-variant mb-8 text-lg">
          متاسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد یا منتقل شده است.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link href="/" className="btn-primary-glass flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2">
            <ArrowRight className="w-5 h-5" />
            <span>بازگشت به خانه</span>
          </Link>
          <Link href="/dashboard" className="btn-secondary flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            <span>داشبورد</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
