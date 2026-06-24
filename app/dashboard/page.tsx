'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'motion/react';
import { Plus, X, Droplet, Activity, Scale, Activity as Pulse } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { mockData7Days } from '@/lib/healthScore';

const ProgressReport = dynamic(() => import('@/components/ProgressReport'), { ssr: false });
const HydrationChart = dynamic(() => import('@/components/HydrationChart'), { ssr: false });

export default function DashboardIndex() {
  // Use today's data from mockData7Days
  const todayData = mockData7Days[mockData7Days.length - 1];

  // States
  const [calories, setCalories] = useState(todayData.calories);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(todayData.water); // Liters
  const [showWaterConf, setShowWaterConf] = useState(false);

  // Animated health score counter
  const targetScore = todayData.healthScore || 0;
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

  // Request Notification Permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleQuickLog = (amount: number) => {
    setCalories(prev => Math.min(prev + amount, 3000));
    setIsLogModalOpen(false);
  };

  const handleDrinkWater = () => {
    setWaterAmount(prev => +(prev + 0.25).toFixed(2));
    
    // Show confirmation animation
    setShowWaterConf(true);
    setTimeout(() => setShowWaterConf(false), 2000);

    // Schedule notification (Simulated with setTimeout for 2 hours, using 2 secs for demo here)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      // For real app: 2 * 60 * 60 * 1000
      // We will trigger a notification immediately to demonstrate, and set a "simulated" timer
      setTimeout(() => {
        if('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          // If in PWA context
        } else {
            // Standard browser notification
            new Notification("وقت آب خوردنه!", {
              body: "شما ۲ ساعت پیش آب نوشیدید. برای حفظ سلامتی یک لیوان دیگر بنوشید.",
              icon: "/icon.png" // placeholder
            });
        }
      }, 5000); // Demo: 5 seconds instead of 2 hours
    }
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
                <p className="text-sm text-on-surface-variant">سلام، کاربر عزیز</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white border border-outline-variant/20 shadow-sm flex items-center justify-center shadow-lg relative border-white">
                <span className="w-3 h-3 bg-error rounded-full absolute top-0 right-0 border-2 border-white"></span>
                <span className="text-xl font-bold text-primary">A</span>
            </div>
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
                {/* Simulated 3D Dial with CSS */}
                <div className="absolute inset-0 rounded-full border-[16px] border-primary-fixed drop-shadow-xl"></div>
                <motion.div 
                    initial={{ rotate: -135 }}
                    animate={{ rotate: 45 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border-[16px] border-primary border-l-transparent border-b-transparent shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]"
                ></motion.div>
                <div className="w-40 h-40 bg-white/40 backdrop-blur-xl rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center">
                    <motion.span className="text-6xl font-black text-primary drop-shadow-lg">{roundedCount}</motion.span>
                    <span className="text-sm font-bold text-on-surface-variant">از ۱۰۰</span>
                </div>
            </motion.div>
        </section>

        {/* Quick Metrics Grid */}
        <section className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col items-center justify-center text-center ">
              <Scale className="w-6 h-6 text-primary mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">وزن</p>
              <p className="text-lg font-bold text-on-surface">{todayData.weight} <span className="text-xs font-normal">kg</span></p>
            </div>
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col items-center justify-center text-center ">
              <Activity className="w-6 h-6 text-secondary mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">شاخص توده بدنی</p>
              <p className="text-lg font-bold text-on-surface">{todayData.bmi}</p>
            </div>
            <div className="bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col items-center justify-center text-center ">
              <Pulse className="w-6 h-6 text-error mb-2" />
              <p className="text-xs text-on-surface-variant mb-1">وضعیت درد</p>
              <p className="text-lg font-bold text-error">{todayData.pain} <span className="text-xs font-normal">/ 10</span></p>
            </div>
        </section>

        {/* Today's Activity Grid */}
        <section className="grid grid-cols-2 gap-6">
            {/* Calorie */}
            <div className="col-span-2 bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col gap-6 relative overflow-hidden ">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                 <div className="flex justify-between items-start z-10 w-full">
                    <div>
                        <h3 className="font-bold text-lg">کالری امروز</h3>
                        <p className="text-sm text-on-surface-variant font-mono">{calories} / 2000 kcal</p>
                    </div>
                    {/* Quick Log Action */}
                    <button 
                        onClick={() => setIsLogModalOpen(true)}
                        className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors shadow-sm"
                    >
                         <Plus className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-6 z-10">
                    {/* Simulated 3D rings */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                         <div className="absolute inset-0 rounded-full border-8 border-primary shadow-lg border-r-transparent transition-all duration-500" style={{ transform: `rotate(${Math.min(calories / 2000 * 360, 360)}deg)` }}></div>
                         <div className="absolute inset-2 rounded-full border-8 border-secondary-container shadow-lg border-l-transparent"></div>
                         <div className="absolute inset-4 rounded-full border-8 border-outline-variant border-b-transparent"></div>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-sm font-medium">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary shadow-sm" /> پروتئین: {Math.round(calories * 0.03)}g</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary-container shadow-sm" /> کربوهیدرات: {Math.round(calories * 0.1)}g</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-outline-variant shadow-sm" /> چربی: {Math.round(calories * 0.02)}g</div>
                    </div>
                 </div>
            </div>

            {/* Hydration */}
            <div className="col-span-2 bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col relative overflow-hidden  min-h-[160px]">
                <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent blur-sm"></div>
                <div className="flex justify-between items-start z-10 w-full mb-2">
                    <div>
                        <h3 className="font-bold text-on-surface mb-1">آب مصرفی</h3>
                        <p className="text-2xl font-black text-primary">{waterAmount} لیتر</p>
                    </div>
                    <button 
                        onClick={handleDrinkWater}
                        className="btn-primary-glass text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm z-10 hover:opacity-90 flex items-center justify-center gap-1"
                    >
                        <Plus className="w-4 h-4" /> ۲۵۰ml
                    </button>
                </div>
                
                <div className="w-full dir-ltr z-10" dir="ltr">
                    <HydrationChart />
                </div>

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
            <div className="col-span-2 bg-white border border-outline-variant/20 shadow-sm p-6 rounded-3xl flex flex-col  min-h-[160px]">
                <h3 className="font-bold text-on-surface mb-1">تمرینات</h3>
                <p className="text-2xl font-black text-primary mb-2">{todayData.activity} دقیقه</p>
                <div className="mt-auto px-4 py-2 bg-surface-variant/50 rounded-xl text-sm font-bold flex items-center justify-center">
                    هوازی
                </div>
            </div>
        </section>

        {/* Progress Report Section */}
        <ProgressReport />

        {/* Quick Log Modal Overlay */}
        <AnimatePresence>
            {isLogModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4 pb-4 sm:pb-0">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="absolute inset-0 bg-on-surface/20 backdrop-blur-md"
                        onClick={() => setIsLogModalOpen(false)}
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 100 }}
                        className="relative z-10 w-full max-w-sm glass-popover bg-white/80 rounded-[2rem] p-6 shadow-2xl border "
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-on-surface">ثبت سریع وعده</h3>
                            <button 
                                onClick={() => setIsLogModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center hover:bg-surface-variant transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <MealLogButton label="صبحانه" calories={350} onClick={() => handleQuickLog(350)} icon="🍳" />
                            <MealLogButton label="ناهار" calories={600} onClick={() => handleQuickLog(600)} icon="🥗" />
                            <MealLogButton label="شام" calories={450} onClick={() => handleQuickLog(450)} icon="🍲" />
                            <MealLogButton label="میان‌وعده" calories={150} onClick={() => handleQuickLog(150)} icon="🍎" />
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
