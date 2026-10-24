import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 sm:p-10 max-w-md w-full text-center flex flex-col items-center">
        {/* Simple 404 Illustration */}
        <div className="mb-6 flex items-center justify-center" aria-hidden="true">
          <svg
            className="w-40 h-28 text-primary"
            viewBox="0 0 160 112"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft decorative background circles */}
            <circle cx="80" cy="56" r="48" className="fill-primary-container/60" />
            <circle cx="36" cy="30" r="10" className="fill-secondary-container/50" />
            <circle cx="128" cy="80" r="14" className="fill-tertiary-container/40" />

            {/* Stylized 404 text and graphic */}
            <g className="stroke-primary" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              {/* First 4 */}
              <path d="M48 38L32 64H54M54 48V74" />
              {/* Central 0 - compass / pulse node */}
              <circle cx="80" cy="56" r="16" className="stroke-primary fill-surface-container" strokeWidth="5" />
              <circle cx="80" cy="56" r="5" className="fill-primary" strokeWidth="0" />
              <path d="M80 42V45M80 67V70M66 56H69M91 56H94" strokeWidth="2.5" />
              {/* Second 4 */}
              <path d="M122 38L106 64H128M128 48V74" />
            </g>
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">صفحه پیدا نشد</h1>
        <p className="text-on-surface-variant mb-8 text-base sm:text-lg leading-relaxed">
          صفحه مورد نظر شما یافت نشد یا ممکن است منتقل شده باشد.
        </p>

        <Link href="/dashboard" className="btn btn-primary w-full py-3 px-6 font-bold">
          <LayoutDashboard className="w-5 h-5" />
          <span>بازگشت به داشبورد</span>
        </Link>
      </div>
    </div>
  );
}
