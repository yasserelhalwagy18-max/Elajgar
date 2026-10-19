'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { Plus, X, Droplet, Activity, Scale, Activity as Pulse, Moon, User } from 'lucide-react';
import { cn, toDateKey } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { calculateHealthScore, DailyHealthData } from '@/lib/healthScore';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

const ProgressReport = dynamic(() => import('@/components/ProgressReport'), { ssr: false });
const HydrationChart = dynamic(() => import('@/components/HydrationChart'), { ssr: false });

export default function DashboardIndex() {
  const router = useRouter();
  // Subscribe to individual slices so an unrelated store update (e.g. adding
  // water) does not re-render the whole dashboard.
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const userProfile = useStore((state) => state.userProfile);
  const addWater = useStore((state) => state.addWater);
  const logDailyMetrics = useStore((state) => state.logDailyMetrics);
  const logFood = useStore((state) => state.logFood);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  // Close any open dialog with the Escape key, and lock background scrolling
  // while one is open.
  const anyModalOpen = isLogModalOpen || isSleepModalOpen || showDisclaimer;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsLogModalOpen(false);
      setIsSleepModalOpen(false);
      setShowDisclaimer(false);
    };

    if (!anyModalOpen) return;

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [anyModalOpen]);

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
  const todayDate = toDateKey();
  const todayLog = userProfile?.dailyLogs?.find(l => l.date === todayDate) || { foods: [], waterIntake: 0, activityMinutes: 0, sleepHours: 0, sleepQuality: 'fair' as const };

  // Calculations
  const waterTarget = userProfile?.weight ? Math.round(userProfile.weight * 30) : 2000;
  const waterAmountMl = todayLog.waterIntake || 0;
  const waterAmountLiters = (waterAmountMl / 1000).toFixed(1);

  const consumedCalories = todayLog.foods?.reduce((acc: number, food: any) => acc + food.calories, 0) || 0;
  const consumedProtein = todayLog.foods?.reduce((acc: number, food: any) => acc + food.protein, 0) || 0;
  const consumedCarbs = todayLog.foods?.reduce((acc: number, food: any) => acc + food.carbs, 0) || 0;
  const consumedFat = todayLog.foods?.reduce((acc: number, food: any) => acc + food.fat, 0) || 0;

  // Target calories
  let targetCalories = 2000;
  if (userProfile?.weight && userProfile?.height && userProfile?.age && userProfile?.gender) {
    let bmr = userProfile.gender === 'male'
      ? 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5
      : 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;

    let multiplier = 1.2;
    if (userProfile?.activityLevel === 'light') multiplier = 1.375;
    else if (userProfile?.activityLevel === 'moderate') multiplier = 1.55;
    else if (userProfile?.activityLevel === 'active') multiplier = 1.725;

    let tdee = bmr * multiplier;
    if (userProfile?.nutritionGoal === 'کاهش وزن') tdee -= 500;
    else if (userProfile?.nutritionGoal === 'افزایش وزن') tdee += 500;

    targetCalories = Math.round(tdee);
  }

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
    activity: todayLog.activityMinutes || 0,
    calories: consumedCalories,
    water: waterAmountMl / 1000,
    sleepHours: todayLog.sleepHours || 0,
    sleepQuality: todayLog.sleepQuality || ('fair' as const),
  };
  // Score against the user's own targets so the score agrees with the goal
  // shown right next to it.
  const targetScore = calculateHealthScore({
    ...healthData,
    targets: { calories: targetCalories, water: waterTarget / 1000 },
  });
  const count = useMotionValue(0);
  const roundedCount = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    // Animate score from 0 to target
    const animation = animate(count, targetScore, {
      duration: 2,
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

  if (!isAuthenticated) return null;
  if (!mounted) return null;

  const handleAcceptDisclaimer = () => {
    if (disclaimerAccepted) {
      localStorage.setItem('elajgar-disclaimer-seen', 'true');
      setShowDisclaimer(false);
    }
  };

  const handleQuickLog = (label: string, amount: number) => {
    logFood(todayDate, {
        id: crypto.randomUUID(),
        name: label,
        calories: amount,
        protein: 0,
        carbs: 0,
        fat: 0,
    });
    setIsLogModalOpen(false);
  };

  const handleDrinkWater = () => {
    addWater(todayDate, 250);

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

    logDailyMetrics(todayDate, {
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

  return (
    <div className="p-6 pb-32">
        <header className="flex justify-between items-center mb-8 sticky top-0 pt-4 z-40 bg-surface/80 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Elajgar</h1>
                <p className="text-sm text-on-surface-variant">سلام، {userProfile?.fullName?.trim().split(/\s+/)[0] || 'کاربر عزیز'}</p>
            </div>
            <Link href="/dashboard/profile" className="w-12 h-12 rounded-full bg-white border border-outline-variant/20 shadow-sm flex items-center justify-center shadow-lg relative border-white transition-transform hover:scale-105">
                {userProfile?.fullName?.trim() ? (
                    <span className="text-xl font-bold text-primary">{userProfile.fullName.trim().charAt(0)}</span>
                ) : (
                    <User className="w-6 h-6 text-primary" />
                )}
            </Link>
        </header>

        {/* 3D Health Score Dial Component */}
        <section className="bg-white border border-outline-variant/20 shadow-sm p-8 rounded-[2rem] flex flex-col items-center mb-8 relative overflow-hidden border-2  shadow-[0_10px_40px_rgba(37,99,235,0.1)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
            <h2 className="text-xl text-on-surface font-bold z-10">شاخص سلامت شما</h2>
            <p className="text-primary font-medium text-sm mb-8 z-10">{getStatusText(targetScore)}</p>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 1, type: 'spring' }}
                className="relative w-56 h-56 z-10 flex items-center justify-center mb-4"
            >
                <svg className="absolute inset-0 w-56 h-56" viewBox="0 0 100 100">
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
                            transition={{ duration: 2, ease: "easeOut" }}
                        />
                    </g>
                </svg>
                <div className="w-40 h-40 bg-white rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center">
                    <motion.span className="text-6xl font-black text-primary">{roundedCount}</motion.span>
                    <span className="text-sm font-bold text-on-surface-variant">از ۱۰۰</span>
                </div>
            </motion.div>
        </section>

        {/* Quick Metrics Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col items-center justify-center text-center ">
              <Scale className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">وزن</p>
              <p className="text-lg font-bold text-on-surface">{weight || '-'} <span className="text-xs font-normal">kg</span></p>
            </div>
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col items-center justify-center text-center ">
              <Activity className="w-6 h-6 text-secondary mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">شاخص توده بدنی</p>
              <p className="text-lg font-bold text-on-surface">{bmi || '-'}</p>
            </div>
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col items-center justify-center text-center ">
              <Pulse className="w-6 h-6 text-error mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">وضعیت درد</p>
              <p className="text-lg font-bold text-error">{hasPainData ? `${averagePain.toFixed(1)} / 10` : <span className="text-xs font-normal text-on-surface-variant">ثبت نشده</span>}</p>
            </div>
        </section>

        {/* Today's Activity Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Calorie */}
            <div className="col-span-1 md:col-span-2 bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col gap-6 relative overflow-hidden ">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                 <div className="flex justify-between items-start z-10 w-full">
                    <div>
                        <h3 className="font-bold text-lg">کالری امروز</h3>
                        {consumedCalories > 0 && <p className="text-sm text-on-surface-variant font-mono">{consumedCalories} / {targetCalories} kcal</p>}
                    </div>
                    {/* Quick Log Action */}
                    <button 
                        onClick={() => setIsLogModalOpen(true)}
                        aria-label="ثبت سریع غذا"
                        className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors shadow-sm"
                    >
                         <Plus className="w-5 h-5" />
                    </button>
                 </div>
                 
                 {consumedCalories === 0 ? (
                    <div className="flex flex-col items-center justify-center z-10 py-4 gap-3">
                        <span className="text-on-surface-variant font-medium">کالری ثبت نشده</span>
                        <button
                            onClick={() => setIsLogModalOpen(true)}
                            className="btn-primary-glass text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> ثبت غذا
                        </button>
                    </div>
                 ) : (
                    <div className="flex items-center gap-6 z-10">
                        <div className="w-full flex flex-col gap-2">
                            {(() => {
                                const proteinCals = consumedProtein * 4;
                                const carbsCals = consumedCarbs * 4;
                                const fatCals = consumedFat * 9;
                                const total = proteinCals + carbsCals + fatCals;
                                if (total === 0) {
                                    return <div className="h-3 w-full rounded-full bg-surface-variant" />;
                                }
                                return (
                                    <div className="flex h-3 w-full rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${(proteinCals / total) * 100}%` }} />
                                        <div className="h-full bg-secondary" style={{ width: `${(carbsCals / total) * 100}%` }} />
                                        <div className="h-full bg-tertiary" style={{ width: `${(fatCals / total) * 100}%` }} />
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="flex flex-col gap-2 text-sm font-medium">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary shadow-sm" /> پروتئین: {Math.round(consumedProtein)}g</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary shadow-sm" /> کربوهیدرات: {Math.round(consumedCarbs)}g</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-tertiary shadow-sm" /> چربی: {Math.round(consumedFat)}g</div>
                        </div>
                    </div>
                 )}
            </div>

            {/* Hydration */}
            <div className="col-span-1 md:col-span-2 bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col relative overflow-hidden  min-h-[160px]">
                <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent blur-sm"></div>
                <div className="flex justify-between items-start z-10 w-full mb-2">
                    <div>
                        <h3 className="font-bold text-on-surface mb-1">آب مصرفی</h3>
                        {waterAmountMl > 0 && (
                            <>
                                <p className="text-2xl font-black text-primary">{waterAmountLiters} لیتر</p>
                                <p className="text-xs text-on-surface-variant font-mono">{waterAmountMl} / {waterTarget} ml</p>
                            </>
                        )}
                    </div>
                </div>
                
                {waterAmountMl === 0 ? (
                    <div className="flex flex-col items-center justify-center z-10 py-6 gap-3">
                        <span className="text-on-surface-variant font-medium">آبی ثبت نشده</span>
                        <button
                            onClick={handleDrinkWater}
                            className="btn-primary-glass text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:opacity-90"
                        >
                            <Plus className="w-4 h-4" /> ۲۵۰ml
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="w-full z-10" dir="ltr">
                            <HydrationChart />
                        </div>
                        <button
                            onClick={handleDrinkWater}
                            className="absolute bottom-4 left-4 btn-primary-glass text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm z-10 hover:opacity-90 flex items-center justify-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> ۲۵۰ml
                        </button>
                    </>
                )}

                {/* Sub-animation on click */}
                <AnimatePresence>
                    {showWaterConf && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 2 }}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-primary pointer-events-none"
                        >
                            <Droplet className="w-12 h-12 fill-primary/30" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Workouts */}
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col min-h-[160px]">
                <h3 className="font-bold text-on-surface mb-1">تمرینات</h3>
                {todayLog.activityMinutes ? (
                    <>
                        <p className="text-2xl font-black text-primary mb-2">{todayLog.activityMinutes} دقیقه</p>
                        <div className="mt-auto px-4 py-2 bg-surface-variant/50 rounded-xl text-sm font-bold flex items-center justify-center">
                            ثبت شده
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-grow gap-3 mt-4">
                        <span className="text-on-surface-variant font-medium">فعالیتی ثبت نشده</span>
                        <button
                            onClick={() => {
                                const el = document.getElementById('sleep-activity-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="btn-primary-glass text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:opacity-90"
                        >
                            <Activity className="w-4 h-4" /> ثبت فعالیت
                        </button>
                    </div>
                )}
            </div>

            {/* Sleep Card */}
            <div id="sleep-activity-section" className="col-span-1 md:col-span-2 glass-panel p-4 rounded-2xl flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-on-surface">خواب و فعالیت</h3>
                    <div className="text-sm text-on-surface-variant font-mono">ثبت روزانه</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="daily-sleep-hours" className="block text-xs font-bold mb-1 text-on-surface-variant">ساعت خواب</label>
                        <input id="daily-sleep-hours" type="number" step="0.5" min="0" max="24" value={sleepHours} onChange={e => setSleepHours(parseFloat(e.target.value) || 0)} aria-invalid={!!sleepError} className={`w-full bg-white/50 border-none rounded-xl py-2 px-3 text-center outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${sleepError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {sleepError && <span className="text-xs text-error mt-1">{sleepError}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="daily-activity-minutes" className="block text-xs font-bold mb-1 text-on-surface-variant">فعالیت (دقیقه)</label>
                        <input id="daily-activity-minutes" type="number" min="0" max="1440" value={activityMinutes} onChange={e => setActivityMinutes(parseFloat(e.target.value) || 0)} aria-invalid={!!activityError} className={`w-full bg-white/50 border-none rounded-xl py-2 px-3 text-center outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${activityError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {activityError && <span className="text-xs text-error mt-1">{activityError}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="daily-weight" className="block text-xs font-bold mb-1 text-on-surface-variant">وزن امروز (کیلوگرم)</label>
                        <input id="daily-weight" type="number" step="0.1" min="20" max="300" inputMode="decimal" value={dailyWeight} onChange={e => setDailyWeight(e.target.value)} placeholder={userProfile?.weight ? String(userProfile.weight) : '—'} aria-invalid={!!weightError} className={`w-full bg-white/50 border-none rounded-xl py-2 px-3 text-center outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${weightError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
                        {weightError && <span className="text-xs text-error mt-1">{weightError}</span>}
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="daily-pain" className="block text-xs font-bold mb-1 text-on-surface-variant">شدت درد امروز (۰-۱۰)</label>
                        <input id="daily-pain" type="number" step="1" min="0" max="10" inputMode="numeric" value={dailyPain} onChange={e => setDailyPain(e.target.value)} placeholder="—" aria-invalid={!!painError} className={`w-full bg-white/50 border-none rounded-xl py-2 px-3 text-center outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm ${painError ? 'ring-2 ring-error/50 bg-error/5' : ''}`} />
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
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${sleepQuality === quality ? 'bg-primary text-white shadow-md' : 'bg-surface-variant/50 hover:bg-surface-variant text-on-surface'}`}
                            >
                                {quality === 'good' ? 'خوب' : quality === 'fair' ? 'متوسط' : 'بد'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSaveSleepActivity}
                    disabled={hasValidationError}
                    className={`btn-primary-glass text-white w-full py-3 rounded-2xl font-bold shadow-sm mt-2 flex justify-center items-center gap-2 ${hasValidationError ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    ثبت <Plus className="w-4 h-4" />
                </button>
            </div>
        </section>

        {/* Progress Report Section */}
        <ProgressReport />

        {/* Medical Disclaimer Modal Overlay */}
        <AnimatePresence>
            {showDisclaimer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pb-4 sm:pb-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-on-surface/50 backdrop-blur-md"
                    ></motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="disclaimer-title"
                        className="relative z-10 w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl border"
                    >
                        <h3 id="disclaimer-title" className="text-xl font-bold text-on-surface mb-4">توجه مهم</h3>
                        <p className="text-on-surface-variant mb-6 leading-relaxed">
                            این اپلیکیشن جایگزین پزشک نیست و تشخیص قطعی ارائه نمی‌دهد.
                        </p>

                        <div className="flex items-center gap-3 mb-6">
                            <input
                                type="checkbox"
                                id="disclaimer-checkbox"
                                className="w-5 h-5 accent-primary rounded cursor-pointer"
                                checked={disclaimerAccepted}
                                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                            />
                            <label htmlFor="disclaimer-checkbox" className="text-sm font-medium text-on-surface cursor-pointer select-none">
                                متوجه شدم
                            </label>
                        </div>

                        <button
                            onClick={handleAcceptDisclaimer}
                            disabled={!disclaimerAccepted}
                            className={`w-full py-3 rounded-2xl font-bold shadow-sm flex justify-center items-center transition-all ${disclaimerAccepted ? 'btn-primary-glass text-white' : 'bg-surface-variant text-on-surface-variant/50 cursor-not-allowed'}`}
                        >
                            تأیید و ادامه
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Quick Log Modal Overlay */}
        <AnimatePresence>
            {isLogModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pb-4 sm:pb-0">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsLogModalOpen(false)}
                        className="absolute inset-0 bg-on-surface/20 backdrop-blur-md"
                    ></motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="quick-log-title"
                        className="relative z-10 w-full max-w-sm glass-popover bg-white/80 rounded-[2rem] p-6 shadow-2xl border "
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 id="quick-log-title" className="text-xl font-bold text-on-surface">ثبت سریع وعده</h3>
                            <button 
                                onClick={() => setIsLogModalOpen(false)}
                                aria-label="بستن"
                                className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center hover:bg-surface-variant transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <MealLogButton label="صبحانه" calories={350} onClick={() => handleQuickLog('صبحانه', 350)} icon="🍳" />
                            <MealLogButton label="ناهار" calories={600} onClick={() => handleQuickLog('ناهار', 600)} icon="🥗" />
                            <MealLogButton label="شام" calories={450} onClick={() => handleQuickLog('شام', 450)} icon="🍲" />
                            <MealLogButton label="میان‌وعده" calories={150} onClick={() => handleQuickLog('میان‌وعده', 150)} icon="🍎" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

    </div>

  );
}

function MealLogButton({ label, calories, onClick, icon }: any) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center justify-between w-full p-6 bg-white border border-outline-variant/20 shadow-sm hover:bg-white/60 transition-colors rounded-xl border  group"
        >
            <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="font-bold text-on-surface">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-on-surface-variant">{calories} kcal</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
}
