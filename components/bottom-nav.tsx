'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Activity, Dumbbell, GraduationCap, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'خانه' },
    { href: '/dashboard/tracker', icon: Activity, label: 'فعالیت' },
    { href: '/dashboard/gyms', icon: Dumbbell, label: 'باشگاه' },
    { href: '/dashboard/education', icon: GraduationCap, label: 'آموزش' },
    { href: '/dashboard/profile', icon: User, label: 'پروفایل' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 rounded-t-[2rem] bg-white/40 backdrop-blur-[25px] border-t border-white/50 shadow-[0_-10px_40px_rgba(37,99,235,0.1)] flex flex-row-reverse justify-around items-center px-4 pb-safe pt-2 min-h-[80px]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-2 transition-transform duration-300 relative",
              isActive ? "text-primary scale-110" : "text-on-surface-variant hover:scale-105"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bg"
                className="absolute inset-0 bg-primary/10 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className={cn("relative z-10 flex items-center justify-center w-12 h-12 rounded-full", isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "")}>
                <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
            </div>
            <span className={cn("text-[11px] mt-1 font-medium z-10", isActive ? "text-primary font-bold" : "text-on-surface-variant")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
