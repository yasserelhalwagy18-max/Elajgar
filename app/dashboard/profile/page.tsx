'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Bell, Droplet, Activity, ChevronLeft, User, Shield, LogOut, Database } from 'lucide-react';
import { cn, toDateKey } from '@/lib/utils';
import { motion } from 'motion/react';
import { useStore } from '../../../lib/store';
import { useRouter } from 'next/navigation';
import { useMounted } from '@/hooks/use-mounted';

export default function ProfilePage() {
    const [hydrationReminders, setHydrationReminders] = useState(true);
    const [activityReminders, setActivityReminders] = useState(false);
    const { isAuthenticated, userProfile, logout, updateUserProfile } = useStore();
    const router = useRouter();
    const [showToast, setShowToast] = useState(false);
    const toastTimerRef = React.useRef<number | null>(null);
    const mounted = useMounted();

    // Clear the pending toast timer if the component unmounts first.
    useEffect(() => {
        return () => {
            if (toastTimerRef.current !== null) {
                window.clearTimeout(toastTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // The persisted store hydrates on the client only, so the server renders
    // nothing. Wait for mount before rendering to avoid a hydration mismatch.
    if (!mounted) return null;
    if (!isAuthenticated) return null;

    const requestNotificationPermission = async (
        setter: (v: boolean) => void,
        currentValue: boolean
    ) => {
        if (!currentValue) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                // Only ask when the browser has not been asked yet - calling
                // requestPermission() again on an already-decided permission is
                // a no-op and the old code re-prompted every time.
                const permission =
                    Notification.permission === 'default'
                        ? await Notification.requestPermission()
                        : Notification.permission;

                if (permission === 'granted') {
                    setter(true);
                } else {
                    alert('دسترسی اعلان‌ها داده نشده است.');
                }
            }
        } else {
            setter(false);
        }
    };

    return (
        <div className="p-6 pb-32 min-h-screen">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-on-surface">پروفایل و تنظیمات</h1>
            </header>

            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4 border-4 border-white shadow-lg uppercase">
                    {userProfile?.fullName?.[0] || 'A'}
                </div>
                <h2 className="text-xl font-bold">{userProfile?.fullName || 'کاربر'}</h2>
                <p className="text-on-surface-variant font-medium text-sm">کاربر ویژه</p>
            </div>

            <section className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-on-surface px-2">تنظیمات اعلان‌ها</h3>
                <div className="glass-panel rounded-3xl overflow-hidden border border-white/60 shadow-sm flex flex-col gap-[1px] bg-outline-variant/20">
                    <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Droplet className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">یادآور نوشیدن آب</p>
                                <p className="text-xs text-on-surface-variant">هر ۲ ساعت</p>
                            </div>
                        </div>
                        <Switch
                            label="یادآور نوشیدن آب"
                            checked={hydrationReminders}
                            onChange={() => requestNotificationPermission(setHydrationReminders, hydrationReminders)}
                        />
                    </div>
                    <div className="bg-white/80 backdrop-blur-md p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-on-surface text-sm">یادآور فعالیت</p>
                                <p className="text-xs text-on-surface-variant">یادآوری برای تحرک</p>
                            </div>
                        </div>
                        <Switch
                            label="یادآور فعالیت"
                            checked={activityReminders}
                            onChange={() => requestNotificationPermission(setActivityReminders, activityReminders)}
                        />
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="font-bold text-lg mb-4 text-on-surface px-2">حساب کاربری</h3>
                <div className="glass-panel rounded-3xl overflow-hidden border border-white/60 shadow-sm flex flex-col gap-[1px] bg-outline-variant/20">
                    <SettingItem icon={User} label="اطلاعات فردی" />
                    <SettingItem icon={Shield} label="حریم خصوصی" />
                    <SettingItem icon={Bell} label="اعلان‌های سیستم" />
                </div>
            </section>

            <section className="mb-8">
                <button
                    onClick={() => {
                        const confirmed = window.confirm(
                            'داده نمونه برای ۷ روز گذشته ساخته می‌شود. روزهایی که داده واقعی دارند دست‌نخورده می‌مانند. ادامه می‌دهید؟'
                        );
                        if (!confirmed) return;

                        const today = new Date();
                        const mealNames = ['صبحانه', 'ناهار', 'شام', 'میان‌وعده'];

                        // Only fill in days that have no real log, so loading
                        // sample data can never destroy what the user recorded.
                        const existing = new Map(
                            (userProfile?.dailyLogs ?? []).map((log) => [log.date, log])
                        );

                        const sampleLogs = [];
                        for (let i = 0; i < 7; i++) {
                            const d = new Date(today);
                            d.setDate(today.getDate() - i);
                            const dateStr = toDateKey(d);

                            if (existing.has(dateStr)) continue;

                            const numMeals = Math.floor(Math.random() * 3) + 3; // 3 to 5 meals
                            const foods = [];
                            for (let j = 0; j < numMeals; j++) {
                                foods.push({
                                    id: crypto.randomUUID(),
                                    name: mealNames[Math.floor(Math.random() * mealNames.length)],
                                    calories: Math.floor(Math.random() * 601) + 200, // 200 to 800
                                    protein: Math.floor(Math.random() * 31) + 10,   // 10 to 40
                                    carbs: Math.floor(Math.random() * 61) + 20,     // 20 to 80
                                    fat: Math.floor(Math.random() * 26) + 5         // 5 to 30
                                });
                            }

                            const waterIntake = (Math.floor(Math.random() * 7) + 4) * 250; // 4 to 10 * 250

                            sampleLogs.push({
                                date: dateStr,
                                foods,
                                waterIntake,
                                sleepHours: Math.floor(Math.random() * 5) + 5, // 5 to 9
                                sleepQuality: ['poor', 'fair', 'good'][Math.floor(Math.random() * 3)] as 'poor' | 'fair' | 'good',
                                activityMinutes: Math.floor(Math.random() * 76) + 15 // 15 to 90
                            });
                        }

                        updateUserProfile({
                            dailyLogs: [...(userProfile?.dailyLogs ?? []), ...sampleLogs],
                        });
                        setShowToast(true);
                        toastTimerRef.current = window.setTimeout(() => setShowToast(false), 3000);
                    }}
                    className="w-full border border-primary text-primary bg-transparent rounded-2xl py-3 font-bold flex items-center justify-center gap-2"
                >
                    <Database className="w-5 h-5" />
                    بارگذاری داده نمونه
                </button>
            </section>

            <button
                onClick={() => {
                    logout();
                    router.push('/login');
                }}
                className="w-full py-4 text-error font-bold flex items-center justify-center gap-2 bg-error/10 rounded-2xl hover:bg-error/20 transition-colors"
            >
                <LogOut className="w-5 h-5" />
                خروج از حساب
            </button>

            {showToast && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-bold z-50 animate-bounce">
                    ✅ داده‌های نمونه بارگذاری شد
                </div>
            )}
        </div>
    );
}

function SettingItem({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
    // These rows are not clickable yet, so they are rendered as a static list
    // row rather than a button that does nothing.
    return (
        <div className="w-full bg-white/80 backdrop-blur-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-on-surface-variant" />
                <span className="font-bold text-on-surface text-sm">{label}</span>
            </div>
        </div>
    );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={onChange}
            className={cn(
                "w-12 h-6 rounded-full transition-colors relative shrink-0",
                checked ? "bg-primary" : "bg-outline-variant"
            )}
        >
            <motion.div 
                className={cn(
                    "w-5 h-5 bg-white rounded-full absolute top-[2px] right-[2px] shadow-sm"
                )}
                style={{
                    transform: checked ? 'translateX(-24px)' : 'translateX(0px)',
                    transition: 'transform 0.2s ease-in-out'
                }}
            />
        </button>
    );
}
