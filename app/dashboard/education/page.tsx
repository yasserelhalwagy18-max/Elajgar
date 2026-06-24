'use client';

import * as React from 'react';
import Image from 'next/image';
import { Lock, Play, Verified } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorrectionalCalendar } from '@/components/CorrectionalCalendar';
import { ExerciseGallery } from '@/components/ExerciseGallery';
import { SmartAnalysis } from '@/components/SmartAnalysis';
import { EducationalContent } from '@/components/EducationalContent';

export default function EducationPage() {
    return (
        <div className="p-6 pb-32">
            <header className="mb-6 sticky top-0 pt-4 z-40 bg-surface/80 backdrop-blur-md">
                <h1 className="text-2xl font-bold text-on-surface mb-4">آموزش و تحلیل هوشمند</h1>
                
                {/* Horizontal scroll tags */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    <span className="whitespace-nowrap px-4 py-2 rounded-full bg-primary text-white font-bold text-sm shadow-md">کمر درد</span>
                    <span className="whitespace-nowrap px-4 py-2 rounded-full glass-card border-white/50 text-sm font-medium text-on-surface-variant">اصلاح وضعیت</span>
                    <span className="whitespace-nowrap px-4 py-2 rounded-full glass-card border-white/50 text-sm font-medium text-on-surface-variant">کاهش التهاب</span>
                    <span className="whitespace-nowrap px-4 py-2 rounded-full glass-card border-white/50 text-sm font-medium text-on-surface-variant">تغذیه</span>
                </div>
            </header>

            <SmartAnalysis />
            <CorrectionalCalendar />
            <ExerciseGallery />
            <EducationalContent />

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
                            <button className="btn-primary-glass w-full py-4 rounded-full font-bold text-[15px] shadow-lg">
                                ارتقا به ویژه و بازگشایی
                            </button>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
