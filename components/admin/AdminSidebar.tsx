'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ActivitySquare,
  BadgeCheck,
  BookOpen,
  ClipboardList,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  Utensils,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { ADMIN_PATH } from '@/lib/admin-path';

interface NavEntry {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Only match the exact path, for the overview. */
  exact?: boolean;
}

const NAV_ENTRIES: NavEntry[] = [
  { href: ADMIN_PATH, label: 'نمای کلی', icon: LayoutDashboard, exact: true },
  { href: `${ADMIN_PATH}/users`, label: 'کاربران', icon: Users },
  { href: `${ADMIN_PATH}/gyms`, label: 'باشگاه‌ها', icon: Dumbbell },
  { href: `${ADMIN_PATH}/foods`, label: 'بانک غذا', icon: Utensils },
  { href: `${ADMIN_PATH}/content`, label: 'محتوا', icon: BookOpen },
  { href: `${ADMIN_PATH}/plans`, label: 'پلن‌های اشتراک', icon: CreditCard },
  { href: `${ADMIN_PATH}/subscriptions`, label: 'اشتراک‌ها و پرداخت‌ها', icon: BadgeCheck },
  { href: `${ADMIN_PATH}/settings`, label: 'تنظیمات', icon: Settings },
  { href: `${ADMIN_PATH}/audit`, label: 'گزارش تغییرات', icon: ScrollText },
];

function isActive(pathname: string, entry: NavEntry): boolean {
  if (entry.exact) return pathname === entry.href;
  return pathname === entry.href || pathname.startsWith(`${entry.href}/`);
}

/**
 * The admin navigation.
 *
 * Every entry is a real route. The old panel kept its sections in one page
 * and toggled a state variable, so all four "tabs" showed the same content.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useStore((state) => state.logout);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    // The cookie has to be gone before the user is sent to the login screen,
    // or the server sends them straight back into the app.
    await logout();
    router.push('/login');
  };

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="ناوبری مدیریت">
      {NAV_ENTRIES.map((entry) => {
        const active = isActive(pathname, entry);
        return (
          <Link
            key={entry.href}
            href={entry.href}
            onClick={() => setIsOpen(false)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors duration-200 font-bold text-sm',
              active
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-variant hover:-translate-x-1',
            )}
          >
            <entry.icon className="w-5 h-5 shrink-0" />
            <span>{entry.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="px-4 mb-8">
      <Link href={ADMIN_PATH} className="block">
        <h1 className="text-xl font-black text-primary mb-1">پنل مدیریت</h1>
        <p className="text-xs font-bold text-on-surface-variant">کنترل سیستم علاج‌گر</p>
      </Link>
    </div>
  );

  const footer = (
    <div className="mt-auto pt-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-variant/50 transition-colors font-bold text-sm mb-1"
      >
        <ActivitySquare className="w-5 h-5" />
        بازگشت به اپلیکیشن
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface-variant hover:bg-surface-variant/50 w-full transition-colors font-bold text-sm"
      >
        <LogOut className="w-5 h-5" />
        خروج
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-surface-container border-b border-outline-variant">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="باز کردن منوی مدیریت"
          aria-expanded={isOpen}
          className="icon-btn"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-black text-primary">پنل مدیریت</span>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 bg-surface-container border-e border-outline-variant flex-col py-8 px-4 sticky top-0 h-screen overflow-y-auto">
        {brand}
        {nav}
        {footer}
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-surface-container border-e border-outline-variant flex flex-col py-8 px-4 overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="بستن منو"
              className="icon-btn absolute top-4 start-4"
            >
              <X className="w-5 h-5" />
            </button>
            {brand}
            {nav}
            {footer}
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
