'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Droplet,
  HeartPulse,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader, StatusPill } from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminDelete, adminPatch, adminRequest } from '@/lib/admin-client';
import { toPersianDigits } from '@/lib/utils';
import { ADMIN_PATH } from '@/lib/admin-path';

interface UserDetail {
  id: string;
  phoneNumber: string | null;
  fullName: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  activityLevel: string | null;
  jobTitle: string | null;
  underlyingDiseases: string[] | null;
  medications: string[] | null;
  nutritionGoal: string | null;
  termsAccepted: boolean;
  currentWizardStep: number | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  painRegions: Array<{ zone: string; intensity: number; type: string }> | null;
  questionnaire: Record<string, unknown> | null;
  dailyLogs: Array<{
    id: string;
    date: string;
    waterIntake: number;
    sleepHours: number | null;
    sleepQuality: string | null;
    activityMinutes: number | null;
    weight: number | null;
    painIntensity: number | null;
    foods: Array<{ foodName: string | null; calories: number | null }>;
  }>;
  risk: { level: string; painZones: number; maxIntensity: number; reason: string };
}

const GENDER_LABELS: Record<string, string> = { MALE: 'مرد', FEMALE: 'زن' };
const ACTIVITY_LABELS: Record<string, string> = {
  SEDENTARY: 'بدون فعالیت',
  LIGHT: 'سبک',
  MODERATE: 'متوسط',
  ACTIVE: 'فعال',
};
const SLEEP_LABELS: Record<string, string> = { POOR: 'بد', FAIR: 'متوسط', GOOD: 'خوب' };

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

/**
 * A single user's record.
 *
 * The id comes from the route, so the page is a client component that reads
 * it from the params rather than a server component that awaits them.
 */
export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [user, setUser] = React.useState<UserDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  // Refresh after a change. The first render fetches the record separately,
  // so this is only called from event handlers.
  const reload = React.useCallback(async () => {
    const result = await adminRequest<UserDetail>(`/api/admin/users/${id}`);

    if (result.ok && result.data) {
      setUser(result.data);
      setError(null);
    }
  }, [id]);

  React.useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${id}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const body = await res.json().catch(() => null);

        if (controller.signal.aborted) return;

        if (!res.ok) {
          setError(body?.error ?? 'پرونده کاربر یافت نشد');
          return;
        }

        setUser(body as UserDetail);
        setError(null);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError('ارتباط با سرور برقرار نشد');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  const toggleRole = async () => {
    if (!user) return;
    setBusy(true);
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const result = await adminPatch(`/api/admin/users/${user.id}`, { role: nextRole });

    if (result.ok) {
      toast.success(nextRole === 'ADMIN' ? 'به مدیر ارتقا یافت' : 'دسترسی مدیریتی لغو شد');
      void reload();
    } else {
      toast.error(result.error ?? 'تغییر نقش انجام نشد');
    }

    setBusy(false);
  };

  const toggleActive = async () => {
    if (!user) return;
    setBusy(true);
    const result = await adminPatch(`/api/admin/users/${user.id}`, { isActive: !user.isActive });

    if (result.ok) {
      toast.success(user.isActive ? 'حساب غیرفعال شد' : 'حساب فعال شد');
      void reload();
    } else {
      toast.error(result.error ?? 'تغییر وضعیت انجام نشد');
    }

    setBusy(false);
  };

  const confirmDelete = async () => {
    if (!user) return;
    setBusy(true);
    const result = await adminDelete(`/api/admin/users/${user.id}`);

    if (result.ok) {
      toast.success('حساب کاربر حذف شد');
      router.push(`${ADMIN_PATH}/users`);
      return;
    }

    toast.error(result.error ?? 'حذف انجام نشد');
    setBusy(false);
  };

  if (error) {
    return (
      <>
        <AdminPageHeader title="پرونده کاربر" />
        <div className="card p-8 rounded-3xl text-error font-bold">{error}</div>
      </>
    );
  }

  if (isLoading || !user) {
    return (
      <>
        <AdminPageHeader title="پرونده کاربر" />
        <div
          role="status"
          aria-live="polite"
          aria-label="در حال بارگذاری"
          className="card p-12 rounded-3xl flex flex-col items-center gap-4"
        >
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={user.fullName?.trim() || 'بدون نام'}
        description={`شماره موبایل: ${user.phoneNumber ?? '—'}`}
        actions={
          <>
            <Link href={`${ADMIN_PATH}/users`} className="btn btn-secondary btn-md">
              <ArrowRight className="w-4 h-4" />
              بازگشت به فهرست
            </Link>
            <button
              type="button"
              onClick={toggleRole}
              disabled={busy}
              className="btn btn-secondary btn-md"
            >
              <ShieldCheck className="w-4 h-4" />
              {user.role === 'ADMIN' ? 'لغو دسترسی مدیریتی' : 'ارتقا به مدیر'}
            </button>
            <button
              type="button"
              onClick={toggleActive}
              disabled={busy}
              className="btn btn-secondary btn-md"
            >
              {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {user.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              disabled={busy}
              className="btn btn-danger btn-md"
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary */}
        <section className="card rounded-3xl p-6 lg:col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-black shrink-0">
              {(user.fullName?.trim() || 'ک').charAt(0)}
            </div>
            <div className="flex flex-col gap-1">
              <StatusPill tone={user.role === 'ADMIN' ? 'primary' : 'neutral'}>
                {user.role === 'ADMIN' ? 'مدیر' : 'کاربر'}
              </StatusPill>
              <StatusPill tone={user.isActive ? 'success' : 'error'}>
                {user.isActive ? 'فعال' : 'غیرفعال'}
              </StatusPill>
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <Row label="سن" value={user.age ? toPersianDigits(user.age) : '—'} />
            <Row label="جنسیت" value={user.gender ? GENDER_LABELS[user.gender] ?? user.gender : '—'} />
            <Row
              label="قد / وزن"
              value={
                user.height || user.weight
                  ? `${user.height ? toPersianDigits(user.height) : '—'} سانتی‌متر / ${user.weight ? toPersianDigits(user.weight) : '—'} کیلوگرم`
                  : '—'
              }
            />
            <Row
              label="سطح فعالیت"
              value={user.activityLevel ? ACTIVITY_LABELS[user.activityLevel] ?? user.activityLevel : '—'}
            />
            <Row label="هدف تغذیه‌ای" value={user.nutritionGoal ?? '—'} />
            <Row label="شغل" value={user.jobTitle ?? '—'} />
            <Row label="عضویت از" value={formatDate(user.createdAt)} />
            <Row label="آخرین ورود" value={formatDate(user.lastLoginAt)} />
            <Row
              label="مرحله پرسشنامه"
              value={user.currentWizardStep !== null ? toPersianDigits(user.currentWizardStep) : '—'}
            />
          </dl>

          <div className="pt-4 border-t border-outline-variant/30">
            <p className="text-xs font-bold text-on-surface-variant mb-2">بیماری‌های زمینه‌ای</p>
            {user.underlyingDiseases?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {user.underlyingDiseases.map((disease) => (
                  <StatusPill key={disease} tone="warning">
                    {disease}
                  </StatusPill>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">ثبت نشده</p>
            )}

            <p className="text-xs font-bold text-on-surface-variant mb-2 mt-4">داروها</p>
            {user.medications?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {user.medications.map((medication) => (
                  <StatusPill key={medication} tone="neutral">
                    {medication}
                  </StatusPill>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">ثبت نشده</p>
            )}
          </div>
        </section>

        {/* Pain + questionnaire */}
        <section className="card rounded-3xl p-6 lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <HeartPulse className="w-5 h-5 text-primary" />
              نواحی درد گزارش‌شده
            </h3>

            {user.painRegions?.length ? (
              <div className="space-y-2">
                {user.painRegions.map((zone, index) => (
                  <div
                    key={`${zone.zone}-${index}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface-variant/40"
                  >
                    <span className="text-sm font-bold">{zone.zone}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant">{zone.type}</span>
                      <span className="text-sm font-black text-primary">
                        {toPersianDigits(zone.intensity)}/۱۰
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">کاربر ناحیه دردی ثبت نکرده است.</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">پرسشنامه</h3>
            {user.questionnaire ? (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Row label="مدت زمان درد" value={String(user.questionnaire.duration ?? '—')} />
                <Row
                  label="با فعالیت بدتر می‌شود"
                  value={String(user.questionnaire.aggravatedByActivity ?? '—')}
                />
                <Row label="با استراحت بهتر می‌شود" value={String(user.questionnaire.relievedByRest ?? '—')} />
                <Row label="سابقه آسیب‌دیدگی" value={String(user.questionnaire.injuryHistory ?? '—')} />
                <Row label="سابقه جراحی" value={String(user.questionnaire.surgeryHistory ?? '—')} />
                <Row
                  label="کیفیت خواب"
                  value={
                    user.questionnaire.sleepQuality
                      ? SLEEP_LABELS[String(user.questionnaire.sleepQuality)] ??
                        String(user.questionnaire.sleepQuality)
                      : '—'
                  }
                />
                <Row label="سطح استرس" value={String(user.questionnaire.stressLevel ?? '—')} />
                <Row
                  label="ساعت نشستن روزانه"
                  value={
                    user.questionnaire.sittingHoursPerDay !== undefined
                      ? toPersianDigits(Number(user.questionnaire.sittingHoursPerDay))
                      : '—'
                  }
                />
                <Row
                  label="روزهای ورزش در هفته"
                  value={
                    user.questionnaire.exerciseDaysPerWeek !== undefined
                      ? toPersianDigits(Number(user.questionnaire.exerciseDaysPerWeek))
                      : '—'
                  }
                />
              </dl>
            ) : (
              <p className="text-sm text-on-surface-variant">پرسشنامه تکمیل نشده است.</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-surface-variant/40">
            <p className="text-xs font-bold text-on-surface-variant mb-1">سطح ریسک</p>
            <p className="text-sm font-black text-on-surface">{user.risk.reason}</p>
          </div>
        </section>

        {/* Daily logs */}
        <section className="card rounded-3xl p-6 lg:col-span-3">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-primary" />
            سوابق روزانه
          </h3>

          {user.dailyLogs.length === 0 ? (
            <p className="text-sm text-on-surface-variant">سابقه‌ای ثبت نشده است.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-surface-variant/50 text-on-surface-variant text-sm border-b border-outline-variant">
                  <tr>
                    <th className="p-3 text-start font-semibold">تاریخ</th>
                    <th className="p-3 text-start font-semibold">آب</th>
                    <th className="p-3 text-start font-semibold">خواب</th>
                    <th className="p-3 text-start font-semibold">فعالیت</th>
                    <th className="p-3 text-start font-semibold">وزن</th>
                    <th className="p-3 text-start font-semibold">درد</th>
                    <th className="p-3 text-start font-semibold">غذا</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {user.dailyLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 text-xs tabular-nums">
                        {new Intl.DateTimeFormat('fa-IR').format(new Date(log.date))}
                      </td>
                      <td className="p-3 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Droplet className="w-4 h-4 text-primary" />
                          {toPersianDigits(log.waterIntake)} میلی‌لیتر
                        </span>
                      </td>
                      <td className="p-3 text-xs">
                        {log.sleepHours ? `${toPersianDigits(log.sleepHours)} ساعت` : '—'}
                      </td>
                      <td className="p-3 text-xs">
                        {log.activityMinutes ? toPersianDigits(log.activityMinutes) : '—'} دقیقه
                      </td>
                      <td className="p-3 text-xs">{log.weight ? toPersianDigits(log.weight) : '—'}</td>
                      <td className="p-3 text-xs">{log.painIntensity ?? '—'}</td>
                      <td className="p-3 text-xs text-on-surface-variant">
                        {log.foods.length > 0
                          ? log.foods.map((food) => food.foodName).filter(Boolean).join('، ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        title="حذف کاربر"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            با حذف کاربر <strong>{user.phoneNumber}</strong> تمام سوابق روزانه، نواحی درد و پرسشنامه
            او نیز حذف می‌شود. این عمل قابل بازگشت نیست.
          </>
        }
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="font-bold text-on-surface text-end">{value}</dd>
    </div>
  );
}
