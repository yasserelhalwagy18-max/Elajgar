'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Dumbbell, GraduationCap, User, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'خانه' },
    { href: '/nutrition', icon: Utensils, label: 'تغذیه' },
    { href: '/dashboard/education', icon: GraduationCap, label: 'آموزش' },
    { href: '/dashboard/gyms', icon: Dumbbell, label: 'باشگاه' },
    { href: '/dashboard/profile', icon: User, label: 'پروفایل' },
  ];

  return (
    <nav
      aria-label="ناوبری اصلی"
      className="fixed bottom-0 left-0 w-full z-50 rounded-t-3xl bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant shadow-floating flex flex-row justify-around items-center px-2 pt-1.5 min-h-[76px] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      {navItems.map((item) => {
        const isActive = item.href === '/dashboard' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              "flex flex-col items-center justify-center min-w-[64px] min-h-[56px] py-1.5 px-2 rounded-2xl transition-colors duration-300 relative",
              isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-primary/10 rounded-2xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={cn("relative z-10 flex items-center justify-center w-11 h-11 rounded-full", isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "")}>
              <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
            </div>
            <span className={cn("text-caption mt-0.5 font-medium z-10", isActive ? "text-primary-dark font-bold" : "text-on-surface-variant")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
