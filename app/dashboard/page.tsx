'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { Plus, Droplet, Activity, Scale, Activity as Pulse, Check, User } from 'lucide-react';
import { cn, toDateKey, toPersianDigits, formatNumber } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { calculateHealthScore } from '@/lib/healthScore';
import { useStore } from '@/lib/store';
import {
  calculateNutritionTargets,
  DEFAULT_NUTRITION_CONFIG,
} from '@/lib/nutrition-targets';
import { Modal } from '@/components/ui/Modal';
import { MacroBar } from '@/components/ui/MacroBar';

const ProgressReport = dynamic(() => import('@/components/ProgressReport'), { ssr: false });
const HydrationChart = dynamic(() => import('@/components/HydrationChart'), { ssr: false });

/** Quick-log presets carry real macro estimates - logging 350 kcal with 0g of
 *  every macro made the macro bars read 0g right next to a logged meal. */
const MEAL_PRESETS = [
  { label: 'صبحانه', calories: 350, protein: 15, carbs: 45, fat: 10, icon: '🍳' },
  { label: 'ناهار', calories: 600, protein: 35, carbs: 70, fat: 18, icon: '🥗' },
  { label: 'شام', calories: 450, protein: 30, carbs: 40, fat: 18, icon: '🍲' },
  { label: 'میان‌وعده', calories: 150, protein: 5, carbs: 20, fat: 4, icon: '🍎' },
];

export default function DashboardIndex() {
  // Subscribe to individual slices so an unrelated store update (e.g. adding
  // water) does not re-render the whole dashboard.
  const { isAuthenticated, hasHydrated } = useAuthGuard();
  const userProfile = useStore((state) => state.userProfile);
  const addWater = useStore((state) => state.addWater);
  const logDailyMetrics = useStore((state) => state.logDailyMetrics);
  const logFood = useStore((state) => state.logFood);

  const mounted = useMounted();

  // States
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [showWaterConf, setShowWaterConf] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Sleep & Activity Modal state
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<'poor' | 'fair' | 'good'>('fair');
  const [activityMinutes, setActivityMinutes] = useState<number>(0);
  const [dailyWeight, setDailyWeight] = useState<string>('');
  const [dailyPain, setDailyPain] = useState<string>('');

  // Timers that must be cancelled on unmount.
  const waterConfTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const disclaimerTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (waterConfTimerRef.current) clearTimeout(waterConfTimerRef.current);
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
      if (disclaimerTimerRef.current) clearTimeout(disclaimerTimerRef.current);
    };
  }, []);

  // Validation messages are pure derived state - compute them during render
  // instead of driving them from an effect that queues timers.
  const sleepError =
    sleepHours < 0 || sleepHours > 24 ? 'مقدار خواب باید بین ۰ تا ۲۴ باشد' : null;
  const activityError =
    activityMinutes < 0 || activityMinutes > 1440
      ? 'مقدار فعالیت باید بین ۰ تا ۱۴۴۰ باشد'
      : null;
  const weightError =
    dailyWeight.trim() !== '' &&
    (!Number.isFinite(Number(dailyWeight)) || Number(dailyWeight) < 20 || Number(dailyWeight) > 300)
      ? 'وزن باید بین ۲۰ تا ۳۰۰ کیلوگرم باشد'
      : null;
  const painError =
    dailyPain.trim() !== '' &&
    (!Number.isFinite(Number(dailyPain)) || Number(dailyPain) < 0 || Number(dailyPain) > 10)
      ? 'شدت درد باید بین ۰ تا ۱۰ باشد'
      : null;

  const hasValidationError = !!(sleepError || activityError || weightError || painError);

  // Date and logs
  // The dashboard can show any of the last 14 days, so a user can review and
  // correct what they logged yesterday instead of being locked into "today".
  const todayDate = toDateKey();
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const isToday = selectedDate === todayDate;
  const dayLog = userProfile?.dailyLogs?.find(l => l.date === selectedDate) || { foods: [], waterIntake: 0, activityMinutes: 0, sleepHours: 0, sleepQuality: 'fair' as const, weight: 0, painIntensity: 0 };

  const dateOptions = React.useMemo(() => {
    const options: { key: string; weekday: string; day: string; month: string }[] = [];
    const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' });
    const dayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' });
    const monthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'short' });

    // Newest first: the strip is RTL, so the first item is the rightmost one
    // - today must be visible without scrolling.
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      options.push({
        key: toDateKey(d),
        weekday: weekdayFormatter.format(d),
        day: dayFormatter.format(d),
        month: monthFormatter.format(d),
      });
    }
    return options;
  }, []);

  // Calculations
  // The nutrition targets come from the shared calculation, so this screen
  // and the nutrition screen always agree.
  const nutritionConfig = userProfile?.nutritionConfig ?? DEFAULT_NUTRITION_CONFIG;

  const { calories: targetCalories, protein: targetProtein, carbs: targetCarbs, fat: targetFat, waterMl: waterTarget } =
    calculateNutritionTargets(nutritionConfig, {
      weight: userProfile?.weight,
      height: userProfile?.height,
      age: userProfile?.age,
      gender: userProfile?.gender,
      activityLevel: userProfile?.activityLevel,
      nutritionGoal: userProfile?.nutritionGoal,
    });

  const waterAmountMl = dayLog.waterIntake || 0;
  const waterAmountLiters = (waterAmountMl / 1000).toFixed(1);

  const consumedCalories = dayLog.foods?.reduce((acc: number, food: any) => acc + food.calories, 0) || 0;
  const consumedProtein = dayLog.foods?.reduce((acc: number, food: any) => acc + food.protein, 0) || 0;
  const consumedCarbs = dayLog.foods?.reduce((acc: number, food: any) => acc + food.carbs, 0) || 0;
  const consumedFat = dayLog.foods?.reduce((acc: number, food: any) => acc + food.fat, 0) || 0;

  const weight = userProfile?.weight || 0;
  const bmi = (userProfile?.weight && userProfile?.height) ? parseFloat((userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)) : 0;

  let averagePain = 0;
  let hasPainData = false;
  if (userProfile?.painZones && userProfile.painZones.length > 0) {
    hasPainData = true;
    averagePain = userProfile.painZones.reduce((sum, z) => sum + z.intensity, 0) / userProfile.painZones.length;
  }

  // Real Health Score
  const healthData = {
    weight,
    bmi,
    pain: averagePain,
    activity: dayLog.activityMinutes || 0,
    calories: consumedCalories,
    water: waterAmountMl / 1000,
    sleepHours: dayLog.sleepHours || 0,
    sleepQuality: dayLog.sleepQuality || ('fair' as const),
  };

  /**
   * Has the user recorded anything for this day at all?
   *
   * Without this the score is worked out from zeros, so a brand new user
   * opens the app and is told their health is "unfavourable" - a number
   * that means nothing, and a poor first impression. A day with nothing in
   * it gets an empty state instead.
   */
  const hasDayData =
    consumedCalories > 0 ||
    waterAmountMl > 0 ||
    (dayLog.sleepHours ?? 0) > 0 ||
    (dayLog.activityMinutes ?? 0) > 0 ||
    (dayLog.weight ?? 0) > 0 ||
    (dayLog.painIntensity ?? 0) > 0;
  // Score against the user's own targets so the score agrees with the goal
  // shown right next to it.
  const targetScore = calculateHealthScore({
    ...healthData,
    targets: { calories: targetCalories, water: waterTarget / 1000 },
    // The component weights are global and set by an admin.
    weights: userProfile?.healthWeights,
  });
  const count = useMotionValue(0);
  // Render the score with Persian digits, matching the rest of the UI.
  const roundedCount = useTransform(count, (latest) => toPersianDigits(Math.round(latest)));

  // Animate the score from its previous value, not from zero - counting up
  // from 0 every time a glass of water was logged made the dial feel broken.
  const previousScoreRef = useRef<number | null>(null);
  useEffect(() => {
    const previous = previousScoreRef.current;
    previousScoreRef.current = targetScore;

    if (previous === null) {
      count.set(0);
    } else if (previous !== targetScore) {
      count.set(previous);
    } else {
      return;
    }

    const animation = animate(count, targetScore, {
      duration: 1.2,
      ease: 'easeOut'
    });

    return animation.stop;
  }, [count, targetScore]);

  // Medical Disclaimer logic
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const seen = localStorage.getItem('elajgar-disclaimer-seen');
      if (!seen) {
        disclaimerTimerRef.current = setTimeout(() => setShowDisclaimer(true), 0);
      }
    }
  }, [mounted]);

  if (!hasHydrated || !isAuthenticated) return null;
  if (!mounted) return null;

  const handleAcceptDisclaimer = () => {
    if (disclaimerAccepted) {
      localStorage.setItem('elajgar-disclaimer-seen', 'true');
      setShowDisclaimer(false);
    }
  };

  const handleQuickLog = (preset: (typeof MEAL_PRESETS)[number]) => {
    logFood(selectedDate, {
        id: crypto.randomUUID(),
        name: preset.label,
        calories: preset.calories,
        protein: preset.protein,
        carbs: preset.carbs,
        fat: preset.fat,
    });
    setIsLogModalOpen(false);
  };

  const handleDrinkWater = () => {
    addWater(selectedDate, 250);

    // Show confirmation animation
    setShowWaterConf(true);
    if (waterConfTimerRef.current) clearTimeout(waterConfTimerRef.current);
    waterConfTimerRef.current = setTimeout(() => setShowWaterConf(false), 2000);

    // Hydration reminder. Notification.requestPermission() is async, so the
    // permission must be awaited before checking it - reading it synchronously
    // right after the call always returned 'default' and the first click never
    // notified.
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const scheduleReminder = () => {
        if (Notification.permission !== 'granted') return;
        if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
        notificationTimerRef.current = setTimeout(async () => {
          // The Notification constructor is desktop-only; mobile browsers
          // require a service worker registration to show one.
          const registration =
            'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;

          if (registration) {
            await registration.showNotification('وقت آب خوردنه!', {
              body: 'شما ۲ ساعت پیش آب نوشیدید. برای حفظ سلامتی یک لیوان دیگر بنوشید.',
              icon: '/icon.svg',
            });
          } else {
            new Notification('وقت آب خوردنه!', {
              body: 'شما ۲ ساعت پیش آب نوشیدید. برای حفظ سلامتی یک لیوان دیگر بنوشید.',
              icon: '/icon.svg',
            });
          }
        }, 5000);
      };

      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') scheduleReminder();
        });
      } else {
        scheduleReminder();
      }
    }
  };

  const handleSaveSleepActivity = () => {
    const parsedWeight = dailyWeight.trim() === '' ? undefined : Number(dailyWeight);
    const parsedPain = dailyPain.trim() === '' ? undefined : Number(dailyPain);

    logDailyMetrics(selectedDate, {
      sleepHours,
      sleepQuality,
      activityMinutes,
      ...(parsedWeight !== undefined && Number.isFinite(parsedWeight)
        ? { weight: parsedWeight }
        : {}),
      ...(parsedPain !== undefined && Number.isFinite(parsedPain)
        ? { painIntensity: parsedPain }
        : {}),
    });
    setIsSleepModalOpen(false);
  };

  // Determine status text based on health score
  const getStatusText = (score: number) => {
    if (score >= 85) return "وضعیت عالی است";
    if (score >= 70) return "وضعیت خوب است";
    if (score >= 50) return "نیاز به توجه";
    return "وضعیت نامطلوب";
  };

  /**
   * Take the user to one of the logging cards.
   *
   * The empty-day prompt sits above all of them, so a prompt that only
   * talked about the cards further down the page left the user to hunt for
   * the buttons. Every shortcut in the prompt scrolls to the card it names
   * and puts the cursor on the button that does the job, so one more press
   * is enough.
   */
  const scrollToLogSection = (id: string, focusId?: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (focusId) {
      document.getElementById(focusId)?.focus({ preventScroll: true });
    }
  };

  const todayLabel = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const caloriesOver = consumedCalories > targetCalories;
  const selectedOption = dateOptions.find((o) => o.key === selectedDate);
  /** "today" vs "that day" - the cards read differently once a past day is selected. */
  const dayWord = isToday ? 'امروز' : 'آن روز';

  return (
    <div className="p-6 pb-28">
        <header className="flex justify-between items-center mb-4 sticky top-0 pt-4 z-40 bg-surface/85 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">علاج‌گر</h1>
                <p className="text-sm text-on-surface-variant">سلام، {userProfile?.fullName?.trim().split(/\s+/)[0] || 'کاربر عزیز'}</p>
            </div>
            <Link href="/dashboard/profile" aria-label="پروفایل کاربر" className="w-12 h-12 rounded-full bg-surface-container border border-outline-variant card flex items-center justify-center transition-transform hover:scale-105">
                {userProfile?.fullName?.trim() ? (
                    <span className="text-xl font-bold text-primary">{userProfile.fullName.trim().charAt(0)}</span>
                ) : (
                    <User className="w-6 h-6 text-primary" />
                )}
            </Link>
        </header>

        {/* Date strip - lets the user review and correct a past day instead of
            being locked into whatever "today" is. */}
        <div className="flex items-center gap-2 mb-8">
            <div
                className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-1 rail-fade"
                role="group"
                aria-label="انتخاب روز"
            >
                {dateOptions.map((option) => {
                    const isSelected = option.key === selectedDate;
                    const hasData = Boolean(userProfile?.dailyLogs?.some((l) => l.date === option.key));
                    return (
                        <button
                            key={option.key}
                            type="button"
                            onClick={() => setSelectedDate(option.key)}
                            aria-pressed={isSelected}
                            aria-current={option.key === todayDate ? 'date' : undefined}
                            title={`${option.weekday} ${option.day} ${option.month}`}
                            className={cn(
                                'shrink-0 w-14 min-h-[64px] rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-colors',
                                isSelected
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary/40'
                            )}
                        >
                            <span className={cn('text-[11px] font-medium', isSelected ? 'text-white' : 'text-on-surface-variant')}>
                                {option.weekday}
                            </span>
                            <span className={cn('text-base font-bold leading-none', isSelected && 'text-white')}>
                                {option.day}
                            </span>
                            <span
                                className={cn(
                                    'w-1.5 h-1.5 rounded-full mt-0.5',
                                    hasData ? (isSelected ? 'bg-white' : 'bg-primary') : 'bg-transparent'
                                )}
                                aria-hidden="true"
                            />
                        </button>
                    );
                })}
            </div>

            {!isToday && (
                <button
                    type="button"
                    onClick={() => setSelectedDate(todayDate)}
                    className="btn btn-secondary btn-sm shrink-0"
                >
                    امروز
                </button>
            )}
        </div>

        {isToday ? (
            <p className="text-xs text-on-surface-variant mb-6 -mt-4">{todayLabel}</p>
        ) : (
            <p className="text-xs text-on-surface-variant mb-6 -mt-4">
                در حال مشاهده و ویرایش{' '}
                <span className="font-bold text-primary">
                    {selectedOption?.weekday} {selectedOption?.day} {selectedOption?.month}
                </span>
            </p>
        )}

        {/* Health Score Dial */}
        <section className="card p-8 rounded-3xl flex flex-col items-center mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl mix-blend-multiply" aria-hidden="true"></div>
            <h2 className="text-xl text-on-surface font-bold z-10">شاخص سلامت شما</h2>
            <p className="text-primary font-medium text-sm mb-8 z-10">
                {hasDayData ? getStatusText(targetScore) : 'هنوز برای این روز چیزی ثبت نشده'}
            </p>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, type: 'spring' }}
                className="relative w-56 h-56 z-10 flex items-center justify-center mb-4"
            >
                <svg className="absolute inset-0 w-56 h-56" viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="50" r="42" stroke="var(--color-primary-fixed)" strokeWidth={9} fill="none" />
                    <g transform="rotate(-90 50 50)">
                        <motion.circle
                            cx={50}
                            cy={50}
                            r={42}
                            stroke="var(--color-primary)"
                            strokeWidth={9}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 42}
                            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - targetScore / 100) }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                    </g>
                </svg>
                <div className="w-40 h-40 bg-surface-container rounded-full border-4 border-surface-container shadow-2xl flex flex-col items-center justify-center">
                    {hasDayData ? (
                        <>
                            <motion.span className="text-6xl font-black text-primary" aria-live="polite">
                                {roundedCount}
                            </motion.span>
                            <span className="text-sm font-bold text-on-surface-variant">
                                {toPersianDigits(100)}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-5xl font-black text-on-surface-variant/40" aria-hidden="true">—</span>
                            <span className="text-sm font-bold text-on-surface-variant mt-1">بدون امتیاز</span>
                        </>
                    )}
                </div>
            </motion.div>

            {/* A day with nothing in it gets a prompt instead of a number.
                The prompt carries the buttons itself - they used to sit on
                the cards further down the page, so the instruction pointed
                at something the user had to go and find. */}
            {!hasDayData && (
                <div className="z-10 mt-2 w-full max-w-sm flex flex-col items-center gap-4">
                    <p className="text-sm text-on-surface-variant text-center">
                        برای دیدن شاخص سلامت، غذای روز و آب و فعالیت و خواب این روز را ثبت کنید.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => scrollToLogSection('calorie-section', 'log-food-button')}
                            className="btn btn-primary btn-sm"
                        >
                            <Plus className="w-4 h-4" /> ثبت غذا
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToLogSection('water-section', 'log-water-button')}
                            className="btn btn-secondary btn-sm"
                        >
                            <Droplet className="w-4 h-4" /> ثبت آب
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToLogSection('sleep-activity-section', 'daily-sleep-hours')}
                            className="btn btn-secondary btn-sm"
                        >
                            <Activity className="w-4 h-4" /> ثبت خواب و فعالیت
                        </button>
                    </div>
                </div>
            )}
        </section>

        {/* Quick Metrics Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
              <Scale className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">وزن</p>
              <p className="text-lg font-bold text-on-surface">{weight ? toPersianDigits(weight) : '-'} <span className="text-xs font-normal">کیلوگرم</span></p>
            </div>
            <div className="card p-6 rounded-3xl flex flex-col items-center justify-center text-center">
              <Activity className="w-6 h-6 text-secondary mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">شاخص توده بدنی</p>
              <p className="text-lg font-bold text-on-surface">{bmi ? toPersianDigits(bmi) : '-'}</p>
            </div>
            <div className="card p-6 rounded-3xl flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1">
              <Pulse className="w-6 h-6 text-error mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">وضعیت درد</p>
              <p className="text-lg font-bold text-error">{hasPainData ? `${toPersianDigits(averagePain.toFixed(1))} / ۱۰` : <span className="text-xs font-normal text-on-surface-variant">ثبت نشده</span>}</p>
            </div>
        </section>

        {/* Today's Activity Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Calorie */}
            <div id="calorie-section" className="col-span-1 md:col-span-2 card p-6 rounded-3xl flex flex-col gap-6 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" aria-hidden="true"></div>
                 <div className="flex justify-between items-start z-10 w-full">
                    <div>
                        <h3 className="font-bold text-lg">کالری {dayWord}</h3>
                        <p className={`text-sm font-mono mt-0.5 ${caloriesOver ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                            {formatNumber(consumedCalories)} / {formatNumber(targetCalories)} کالری
                        </p>
                    </div>
                    {/* Quick Log Action */}
                    <button
                        type="button"
                        onClick={() => setIsLogModalOpen(true)}
                        aria-label="ثبت سریع غذا"
                        className="icon-btn bg-primary/10 text-primary hover:bg-primary/20"
                    >
                         <Plus className="w-5 h-5" />
                    </button>
                 </div>

                 {/* Calorie progress */}
                 <div className="z-10">
                    <div className="h-3 w-full rounded-full bg-surface-variant overflow-hidden">
                       <div
                         className="h-full rounded-full transition-all duration-700"
                         style={{
                           width: `${Math.min((consumedCalories / Math.max(targetCalories, 1)) * 100, 100)}%`,
                           background: caloriesOver ? 'var(--color-error)' : 'var(--color-primary)',
                         }}
                       />
                    </div>
                    {caloriesOver && (
                      <p className="text-xs text-error font-bold mt-2">
                        {formatNumber(consumedCalories - targetCalories)} کالری بیشتر از هدف ثبت شده است.
                      </p>
                    )}
                 </div>

                 {consumedCalories === 0 ? (
                    <div className="flex flex-col items-center justify-center z-10 py-2 gap-3">
                        <span className="text-on-surface-variant font-medium">کالری ثبت نشده</span>
                        <button
                            id="log-food-button"
                            type="button"
                            onClick={() => setIsLogModalOpen(true)}
                            className="btn btn-primary btn-md"
                        >
                            <Plus className="w-4 h-4" /> ثبت غذا
                        </button>
                    </div>
                 ) : (
                    <div className="z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <MacroBar macro="protein" current={consumedProtein} target={targetProtein} />
                        <MacroBar macro="carbs" current={consumedCarbs} target={targetCarbs} />
                        <MacroBar macro="fat" current={consumedFat} target={targetFat} />
                    </div>
                 )}
            </div>

            {/* Hydration */}
            <div id="water-section" className="col-span-1 md:col-span-2 card p-6 rounded-3xl flex flex-col relative overflow-hidden min-h-[160px]">
                <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-water/10 to-transparent blur-sm" aria-hidden="true"></div>
                <div className="flex justify-between items-start z-10 w-full mb-2">
                    <div>
                        <h3 className="font-bold text-on-surface mb-1">آب مصرفی</h3>
                        {waterAmountMl > 0 ? (
                            <>
                                <p className="text-2xl font-black text-water">{toPersianDigits(waterAmountLiters)} لیتر</p>
                                <p className="text-xs text-on-surface-variant font-mono">{formatNumber(waterAmountMl)} / {formatNumber(waterTarget)} میلی‌لیتر</p>
                            </>
                        ) : (
                            <p className="text-sm text-on-surface-variant">هنوز آبی ثبت نشده</p>
                        )}
                    </div>
                </div>

                {waterAmountMl > 0 && (
                    <div className="w-full z-10">
                        <HydrationChart />
                    </div>
                )}

                {/* The action sits in its own row so it can never overlap the chart. */}
                <div className="flex justify-end z-10 mt-2">
                    <button
                        id="log-water-button"
                        type="button"
                        onClick={handleDrinkWater}
                        className="btn btn-primary btn-sm"
                    >
                        <Plus className="w-4 h-4" /> ۲۵۰ میلی‌لیتر
                    </button>
                </div>

                {/* Sub-animation on click */}
                <AnimatePresence>
                    {showWaterConf && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 2 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-water pointer-events-none"
                        >
                            <Droplet className="w-12 h-12 fill-water/30" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Workouts */}
            <div className="card p-6 rounded-3xl flex flex-col min-h-[160px]">
                <h3 className="font-bold text-on-surface mb-1">تمرینات</h3>
                {dayLog.activityMinutes ? (
                    <>
                        <p className="text-2xl font-black text-primary mb-2">{toPersianDigits(dayLog.activityMinutes)} دقیقه</p>
                        <div className="mt-auto px-4 py-2 bg-surface-variant/50 rounded-xl text-sm font-bold flex items-center justify-center">
                            ثبت شده
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-grow gap-3 mt-4">
                        <span className="text-on-surface-variant font-medium">فعالیتی ثبت نشده</span>
                        <button
                            type="button"
                            onClick={() => scrollToLogSection('sleep-activity-section', 'daily-sleep-hours')}
                            className="btn btn-primary btn-md"
                        >
                            <Activity className="w-4 h-4" /> ثبت خواب و فعالیت
                        </button>
                    </div>
                )}
            </div>

            {/* Sleep & Activity Card */}
            <div id="sleep-activity-section" className="col-span-1 md:col-span-1 card p-4 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-on-surface">خواب و فعالیت</h3>
                    <div className="text-xs text-on-surface-variant">ثبت روزانه</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                        <label htmlFor="daily-sleep-hours" className="block text-xs font-bold mb-1 text-on-surface-variant">ساعت خواب</label>
                        <input id="daily-sleep-hours" type="number" step="0.5" min="0" max="24" value={sleepHours} onChange={e => setSleepHours(parseFloat(e.target.value) || 0)} aria-invalid={!!sleepError} className={`input text-center ${sleepError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {sleepError && <span className="text-xs text-error mt-1">{sleepError}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="daily-activity-minutes" className="block text-xs font-bold mb-1 text-on-surface-variant">فعالیت (دقیقه)</label>
                        <input id="daily-activity-minutes" type="number" min="0" max="1440" value={activityMinutes} onChange={e => setActivityMinutes(parseFloat(e.target.value) || 0)} aria-invalid={!!activityError} className={`input text-center ${activityError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {activityError && <span className="text-xs text-error mt-1">{activityError}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="daily-weight" className="block text-xs font-bold mb-1 text-on-surface-variant">وزن امروز (کیلوگرم)</label>
                        <input id="daily-weight" type="number" step="0.1" min="20" max="300" inputMode="decimal" value={dailyWeight} onChange={e => setDailyWeight(e.target.value)} placeholder={userProfile?.weight ? toPersianDigits(String(userProfile.weight)) : '—'} aria-invalid={!!weightError} className={`input text-center ${weightError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {weightError && <span className="text-xs text-error mt-1">{weightError}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="daily-pain" className="block text-xs font-bold mb-1 text-on-surface-variant">شدت درد امروز (۰-۱۰)</label>
                        <input id="daily-pain" type="number" step="1" min="0" max="10" inputMode="numeric" value={dailyPain} onChange={e => setDailyPain(e.target.value)} placeholder="—" aria-invalid={!!painError} className={`input text-center ${painError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {painError && <span className="text-xs text-error mt-1">{painError}</span>}
                    </div>
                </div>

                <div>
                    <span id="sleep-quality-label" className="block text-xs font-bold mb-1 text-on-surface-variant text-center">کیفیت خواب</span>
                    <div role="radiogroup" aria-labelledby="sleep-quality-label" className="flex justify-center gap-2">
                        {(['good', 'fair', 'poor'] as const).map((quality) => (
                            <button
                                key={quality}
                                type="button"
                                role="radio"
                                aria-checked={sleepQuality === quality}
                                onClick={() => setSleepQuality(quality)}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
                                    sleepQuality === quality
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface-variant/60 hover:bg-surface-variant text-on-surface'
                                )}
                            >
                                {quality === 'good' ? 'خوب' : quality === 'fair' ? 'متوسط' : 'بد'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSaveSleepActivity}
                    disabled={hasValidationError}
                    className="btn btn-primary w-full py-3 font-bold"
                >
                    <Check className="w-4 h-4" /> ذخیره
                </button>
            </div>
        </section>

        {/* Progress Report Section */}
        <ProgressReport />

        {/* Medical Disclaimer */}
        <Modal
            open={showDisclaimer}
            onClose={() => setShowDisclaimer(false)}
            title="توجه مهم"
            dismissable={false}
            hideCloseButton
            size="sm"
            footer={
                <button
                    type="button"
                    onClick={handleAcceptDisclaimer}
                    disabled={!disclaimerAccepted}
                    className={cn('btn w-full py-3', disclaimerAccepted ? 'btn-primary' : 'btn-secondary')}
                >
                    تأیید و ادامه
                </button>
            }
        >
            <p className="text-on-surface-variant leading-relaxed">
                این اپلیکیشن جایگزین پزشک نیست و تشخیص قطعی ارائه نمی‌دهد.
            </p>

            <label className="flex items-center gap-3 mt-5 cursor-pointer select-none">
                <input
                    type="checkbox"
                    id="disclaimer-checkbox"
                    className="w-5 h-5 accent-primary rounded cursor-pointer"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                />
                <span className="text-sm font-medium text-on-surface">متوجه شدم</span>
            </label>
        </Modal>

        {/* Quick Log Modal */}
        <Modal
            open={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            title="ثبت سریع وعده"
            description="یک وعده‌ی متعارف انتخاب کنید؛ کالری و درشت‌مغذی‌های تخمینی آن ثبت می‌شود."
            size="sm"
        >
            <div className="flex flex-col gap-3">
                {MEAL_PRESETS.map((preset) => (
                    <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleQuickLog(preset)}
                        className="flex items-center justify-between w-full p-4 card card-hover rounded-xl text-start"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">{preset.icon}</span>
                            <span className="font-bold text-on-surface">{preset.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-on-surface-variant">{formatNumber(preset.calories)} کالری</span>
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Plus className="w-4 h-4" />
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </Modal>

    </div>

  );
}
