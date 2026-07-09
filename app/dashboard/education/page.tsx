'use client';

import * as React from 'react';
import Image from 'next/image';
import { Lock, Play, Verified, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { CorrectionalCalendar } from '@/components/CorrectionalCalendar';
import { ExerciseGallery } from '@/components/ExerciseGallery';
import { SmartAnalysis } from '@/components/SmartAnalysis';
import { EducationalContent } from '@/components/EducationalContent';

export default function EducationPage() {
    const tags = ['همه', 'آب درمانی', 'تغذیه', 'اصلاح وضعیت', 'سلامت مفاصل', 'سبک زندگی'];
    const [activeTag, setActiveTag] = useState('همه');
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    return (
        <div className="p-6 pb-32">
            <header className="mb-6 sticky top-0 pt-4 z-40 bg-surface/80 backdrop-blur-md">
                <h1 className="text-2xl font-bold text-on-surface mb-4">آموزش و تحلیل هوشمند</h1>
                
                {/* Horizontal scroll tags */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors",
                                activeTag === tag
                                    ? "bg-primary text-white shadow-md"
                                    : "glass-card border border-white/50 text-on-surface-variant hover:bg-white/50"
                            )}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </header>

            <SmartAnalysis />
            <CorrectionalCalendar />
            <ExerciseGallery />
            <EducationalContent activeTag={activeTag} />

            {/* Premium Locked Content */}
            <section className="relative mt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Verified className="w-6 h-6 text-tertiary-container" />
                    پکیج تخصصی توانبخشی
                </h2>
                
                <div className="glass-panel rounded-[2rem] p-4 relative overflow-hidden min-h-[350px] border border-white/60 shadow-xl bg-white/40">
                    
                    {/* Blurred List Items */}
                    <div className="space-y-4 opacity-50 blur-[4px]">
                        {[1,2,3].map(i => (
                             <div key={i} className="flex gap-4 p-2 bg-surface-variant/30 rounded-2xl items-center">
                                 <div className="w-24 h-16 bg-surface-variant rounded-xl border border-white/20"></div>
                                 <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-outline-variant/30 rounded w-3/4"></div>
                                    <div className="h-3 bg-outline-variant/30 rounded w-1/2"></div>
                                 </div>
                             </div>
                        ))}
                    </div>

                    {/* Paywall Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-t from-surface via-surface/80 to-surface/20 z-10 backdrop-blur-[2px]">
                        <div className="glass-card rounded-[2rem] p-8 text-center border-t-2 border-secondary-container shadow-2xl w-full max-w-sm">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-on-surface mb-2">دسترسی به پکیج کامل</h3>
                            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                                شامل ۸ ویدیوی تخصصی، برنامه تمرینی اختصاصی و پشتیبانی مستقیم.
                            </p>
                            <button onClick={() => setShowPremiumModal(true)} className="btn-primary-glass w-full py-4 rounded-full font-bold text-[15px] shadow-lg">
                                ارتقا به ویژه و بازگشایی
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* 3-Tier Premium Modal */}
            <AnimatePresence>
                {showPremiumModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setShowPremiumModal(false)}
                        ></motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative z-10 w-full max-w-2xl bg-surface rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 p-6 flex flex-col"
                        >
                            <button
                                onClick={() => setShowPremiumModal(false)}
                                aria-label="بستن"
                                className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface hover:bg-surface-variant/80 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-2xl font-bold text-center text-on-surface mb-6 mt-4">پلن‌های اشتراک ویژه</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Base Tier */}
                                <div className="glass-card border-2 border-white/40 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                                    <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-[10px] font-bold py-1 px-10 rotate-45 z-10">به زودی</div>
                                    <h3 className="text-lg font-bold text-on-surface mb-2">پایه</h3>
                                    <p className="text-sm text-on-surface-variant mb-4">دسترسی محدود به ویدیوها</p>
                                    <div className="text-xl font-bold text-primary mb-6 mt-auto">۹۹,۰۰۰ <span className="text-sm font-normal text-on-surface-variant">تومان / ماه</span></div>
                                    <button disabled className="w-full bg-surface-variant text-on-surface-variant py-2 rounded-xl font-bold cursor-not-allowed">خرید</button>
                                </div>

                                {/* Pro Tier */}
                                <div className="glass-card border-2 border-primary rounded-2xl p-6 relative overflow-hidden flex flex-col shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                                    <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-[10px] font-bold py-1 px-10 rotate-45 z-10">به زودی</div>
                                    <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">حرفه‌ای <Verified className="w-4 h-4 text-primary" /></h3>
                                    <p className="text-sm text-on-surface-variant mb-4">دسترسی کامل + تمرینات اختصاصی</p>
                                    <div className="text-xl font-bold text-primary mb-6 mt-auto">۱۹۹,۰۰۰ <span className="text-sm font-normal text-on-surface-variant">تومان / ماه</span></div>
                                    <button disabled className="w-full bg-surface-variant text-on-surface-variant py-2 rounded-xl font-bold cursor-not-allowed">خرید</button>
                                </div>

                                {/* Org Tier */}
                                <div className="glass-card border-2 border-white/40 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                                    <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-[10px] font-bold py-1 px-10 rotate-45 z-10">به زودی</div>
                                    <h3 className="text-lg font-bold text-on-surface mb-2">سازمانی</h3>
                                    <p className="text-sm text-on-surface-variant mb-4">پشتیبانی اختصاصی و مشاوره</p>
                                    <div className="text-xl font-bold text-primary mb-6 mt-auto">۴۹۹,۰۰۰ <span className="text-sm font-normal text-on-surface-variant">تومان / ماه</span></div>
                                    <button disabled className="w-full bg-surface-variant text-on-surface-variant py-2 rounded-xl font-bold cursor-not-allowed">خرید</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
