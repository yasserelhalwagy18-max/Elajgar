'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Activity,
  BookOpen,
  Dumbbell,
  TrendingUp,
  UserPlus,
  Users,
  Utensils,
  AlertTriangle,
} from 'lucide-react';
import { AdminPageHeader, StatCard, StatusPill } from '@/components/admin/AdminUI';
import { toPersianDigits } from '@/lib/utils';

const PainHeatmap3D = dynamic(() => import('@/components/PainHeatmap3D'), { ssr: false });

interface StatsResponse {
  counts: {
    users: {
      total: number;
      active: number;
      admins: number;
      newThisWeek: number;
      withPain: number;
    };
    gyms: number;
    foods: number;
    articles: { total: number; published: number };
    exercises: number;
    videos: number;
    plans: number;
    dailyLogsThisWeek: number;
  };
  pain: {
    usersWithPain: number;
    highIntensityUsers: number;
    regions: Array<{ id: string; label: string; count: number; percentage: number }>;
  };
  signupTrend: Array<{ date: string; count: number }>;
}

/**
 * The admin overview.
 *
 * Every figure comes from `/api/admin/stats`, which aggregates the database.
 * The panel used to render a hardcoded table of three made-up users and a
 * hardcoded pain distribution.
 */
export default function AdminOverviewPage() {
  const [stats, setStats] = React.useState<StatsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const controller = new AbortController();

    // The fetch is started inside the effect, but the first state update
    // happens after the await - setting state synchronously in the effect
    // body would trigger a second render before anything was fetched.
    (async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          signal: controller.signal,
          cache: 'no-store',
        });
        const body = await res.json().catch(() => null);

        if (controller.signal.aborted) return;

        if (!res.ok) {
          setError(body?.error ?? 'خطا در دریافت آمار');
          return;
        }

        setStats(body as StatsResponse);
        setError(null);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError('ارتباط با سرور برقرار نشد');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <>
        <AdminPageHeader title="نمای کلی" />
        <div className="card p-8 rounded-3xl text-error font-bold">{error}</div>
      </>
    );
  }

  const counts = stats?.counts;
  const maxSignup = Math.max(1, ...(stats?.signupTrend.map((day) => day.count) ?? [1]));

  return (
    <>
      <AdminPageHeader
        title="نمای کلی"
        description="وضعیت زنده سامانه: کاربران، محتوا و گزارش‌های درد."
        actions={
          <Link href="/admin/users" className="btn btn-primary btn-md">
            <Users className="w-4 h-4" />
            مدیریت کاربران
          </Link>
        }
      />

      {/* Counts */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="کل کاربران"
          value={toPersianDigits(counts?.users.total ?? 0)}
          hint={`${toPersianDigits(counts?.users.active ?? 0)} کاربر فعال`}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="ثبت‌نام این هفته"
          value={toPersianDigits(counts?.users.newThisWeek ?? 0)}
          hint="کاربر جدید در ۷ روز گذشته"
          icon={<UserPlus className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="باشگاه‌های شریک"
          value={toPersianDigits(counts?.gyms ?? 0)}
          hint="مجموعه‌های فعال در شبکه"
          icon={<Dumbbell className="w-5 h-5 text-secondary" />}
        />
        <StatCard
          label="بانک غذا"
          value={toPersianDigits(counts?.foods ?? 0)}
          hint="ماده غذایی ثبت‌شده"
          icon={<Utensils className="w-5 h-5 text-tertiary" />}
        />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="مطالب آموزشی"
          value={toPersianDigits(counts?.articles.total ?? 0)}
          hint={`${toPersianDigits(counts?.articles.published ?? 0)} مطلب منتشر شده`}
          icon={<BookOpen className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="تمارین"
          value={toPersianDigits(counts?.exercises ?? 0)}
          hint="برنامه تمرینی ثبت‌شده"
          icon={<Activity className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="ویدیوها"
          value={toPersianDigits(counts?.videos ?? 0)}
          hint="محتوای ویدیویی"
          icon={<BookOpen className="w-5 h-5 text-secondary" />}
        />
        <StatCard
          label="سوابق ثبت‌شده این هفته"
          value={toPersianDigits(counts?.dailyLogsThisWeek ?? 0)}
          hint="گزارش روزانه کاربران"
          icon={<TrendingUp className="w-5 h-5 text-tertiary" />}
        />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pain distribution */}
        <section className="xl:col-span-1 card p-6 rounded-3xl flex flex-col">
          <h3 className="text-lg font-bold flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-primary" />
            مناطق درد گزارش‌شده
          </h3>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
            {stats
              ? `${toPersianDigits(stats.pain.usersWithPain)} کاربر حداقل یک ناحیه درد ثبت کرده‌اند.`
              : 'در حال بارگذاری آمار...'}
          </p>

          <div className="flex-1 bg-surface-variant/40 rounded-2xl border border-outline-variant overflow-hidden">
            <PainHeatmap3D regions={stats?.pain.regions ?? []} height={420} />
          </div>
        </section>

        {/* Signup trend */}
        <section className="xl:col-span-2 card p-6 rounded-3xl">
          <h3 className="text-lg font-bold flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            ثبت‌نام‌های هفت روز گذشته
          </h3>

          <div className="flex items-end gap-2 h-40" role="img" aria-label="نمودار ثبت‌نام هفت روز گذشته">
            {(stats?.signupTrend ?? []).map((day) => {
              const height = Math.round((day.count / maxSignup) * 100);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">
                    {toPersianDigits(day.count)}
                  </span>
                  <div
                    className="w-full rounded-t-xl bg-primary/80 min-h-[4px] transition-all"
                    style={{ height: `${Math.max(height, day.count > 0 ? 8 : 4)}%` }}
                  />
                  <span className="text-[10px] text-on-surface-variant text-center leading-tight">
                    {new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short' }).format(
                      new Date(day.date),
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {isLoading && !stats && (
            <p className="text-center text-sm text-on-surface-variant mt-4">در حال بارگذاری...</p>
          )}
        </section>

        {/* Region breakdown */}
        <section className="xl:col-span-2 card p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">تفکیک نواحی درد</h3>

          <div className="space-y-3">
            {(stats?.pain.regions ?? []).map((region) => (
              <div key={region.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant w-20 shrink-0 truncate">
                  {region.label}
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-variant overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, region.percentage)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-on-surface w-16 text-end shrink-0">
                  {toPersianDigits(region.count)} کاربر
                </span>
              </div>
            ))}
          </div>

          {stats && stats.pain.highIntensityUsers > 0 && (
            <div className="mt-6 p-4 rounded-2xl bg-warning/10 border border-warning/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {toPersianDigits(stats.pain.highIntensityUsers)} کاربر شدت درد ۷ یا بالاتر گزارش کرده‌اند و
                بهتر است پیگیری شوند.
              </p>
            </div>
          )}
        </section>

        {/* Quick links */}
        <section className="card p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-4">دسترسی سریع</h3>
          <div className="flex flex-col gap-2">
            {[
              { href: '/admin/users', label: 'فهرست کاربران و گزارش‌ها' },
              { href: '/admin/gyms', label: 'مدیریت باشگاه‌های شریک' },
              { href: '/admin/foods', label: 'ویرایش بانک غذا' },
              { href: '/admin/content', label: 'محتوای آموزشی و تمرینات' },
              { href: '/admin/settings', label: 'وزن‌های الگوریتم سلامت' },
              { href: '/admin/audit', label: 'گزارش تغییرات مدیران' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant transition-colors text-sm font-bold text-on-surface"
              >
                {link.label}
                <span className="text-primary">←</span>
              </Link>
            ))}
          </div>

          {counts && counts.users.admins > 0 && (
            <div className="mt-6 pt-4 border-t border-outline-variant/30">
              <StatusPill tone="primary">
                {toPersianDigits(counts.users.admins)} مدیر فعال
              </StatusPill>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
