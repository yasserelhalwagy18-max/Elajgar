'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Dumbbell, GraduationCap, User, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useReducedMotion } from 'motion/react';

export function BottomNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

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
      className="fixed bottom-0 left-0 w-full z-50 rounded-t-3xl bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant shadow-floating flex flex-row justify-around items-center px-2 pt-2 min-h-[72px] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center min-w-[48px] min-h-[48px] sm:min-w-[64px] py-1.5 px-2 rounded-2xl transition-colors duration-200 relative select-none',
              isActive ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Sliding background pill indicator between tabs */}
            {isActive && (
              <motion.div
                layoutId="bottom-nav-active-pill"
                className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20 -z-0"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', bounce: 0.15, duration: 0.45 }
                }
              />
            )}

            {/* Sliding icon bubble indicator */}
            <div className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full">
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-bubble"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/30 -z-0"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', bounce: 0.15, duration: 0.45 }
                  }
                />
              )}
              <Icon
                className={cn(
                  'w-6 h-6 relative z-10 transition-colors duration-200',
                  isActive ? 'text-white' : 'text-on-surface-variant'
                )}
                strokeWidth={1.75}
              />
            </div>

            <span
              className={cn(
                'text-caption mt-0.5 font-medium z-10',
                isActive ? 'text-primary-dark font-bold' : 'text-on-surface-variant'
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
