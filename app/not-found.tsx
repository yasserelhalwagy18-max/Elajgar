import Link from 'next/link';
import { FileQuestion, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
        <div className="bg-primary-container p-6 rounded-full mb-6">
          <FileQuestion className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">صفحه پیدا نشد</h1>
        <p className="text-on-surface-variant mb-8 text-base sm:text-lg">
          صفحه مورد نظر شما یافت نشد یا ممکن است منتقل شده باشد.
        </p>

        <Link href="/dashboard" className="btn btn-primary w-full py-3 px-6">
          <LayoutDashboard className="w-5 h-5" />
          <span>بازگشت به داشبورد</span>
        </Link>
      </div>
    </div>
  );
}
