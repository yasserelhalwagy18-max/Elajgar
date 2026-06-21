'use client';

import * as React from 'react';
import { useState } from 'react';
import { Bell, Droplet, Activity, ChevronLeft, User, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function ProfilePage() {
    const [hydrationReminders, setHydrationReminders] = useState(true);
    const [activityReminders, setActivityReminders] = useState(false);

    const requestNotificationPermission = async (type: 'hydration' | 'activity', setter: (v: boolean) => void, currentValue: boolean) => {
        if (!currentValue) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                const permission = await Notification.requestPermission();
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
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4 border-4 border-white shadow-lg">
                    A
                </div>
                <h2 className="text-xl font-bold">علی رضایی</h2>
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
                            checked={hydrationReminders} 
                            onChange={() => requestNotificationPermission('hydration', setHydrationReminders, hydrationReminders)} 
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
                            checked={activityReminders} 
                            onChange={() => requestNotificationPermission('activity', setActivityReminders, activityReminders)} 
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

            <button className="w-full py-4 text-error font-bold flex items-center justify-center gap-2 bg-error/10 rounded-2xl hover:bg-error/20 transition-colors">
                <LogOut className="w-5 h-5" />
                خروج از حساب
            </button>
        </div>
    );
}

function SettingItem({ icon: Icon, label }: any) {
    return (
        <button className="w-full bg-white/80 backdrop-blur-md p-4 flex items-center justify-between hover:bg-white transition-colors active:bg-surface-variant">
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-on-surface-variant" />
                <span className="font-bold text-on-surface text-sm">{label}</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-outline" />
        </button>
    );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button 
            onClick={onChange}
            className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
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
