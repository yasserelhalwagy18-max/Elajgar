'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Lock, Verified, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { CorrectionalCalendar } from '@/components/CorrectionalCalendar';
import { ExerciseGallery } from '@/components/ExerciseGallery';
import { SmartAnalysis } from '@/components/SmartAnalysis';
import { EducationalContent } from '@/components/EducationalContent';
import { useStore } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';

export default function EducationPage() {
    const router = useRouter();
    const { isAuthenticated, hasHydrated } = useAuthGuard();
    const mounted = useMounted();

    const tags = ['همه', 'آب درمانی', 'تغذیه', 'اصلاح وضعیت', 'سلامت مفاصل', 'سبک زندگی'];
    const [activeTag, setActiveTag] = useState('همه');
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
    // Wait for the persisted store to rehydrate before deciding - see useAuthGuard.
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

    if (!mounted) return null;
    if (!hasHydrated || !isAuthenticated) return null;

    return (
        <div className="p-6 pb-28">
            <header className="mb-6 sticky top-0 pt-4 z-40 bg-surface/85 backdrop-blur-md">
                <h1 className="text-2xl font-bold text-on-surface mb-4">آموزش و تحلیل هوشمند</h1>

                {/* Horizontal scroll tags - the chip component keeps the active
                    state identical to every other filter rail in the app. */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 rail-fade">
                    {tags.map((tag) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => setActiveTag(tag)}
                            aria-pressed={activeTag === tag}
                            className="chip"
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
                    <Verified className="w-6 h-6 text-tertiary" />
                    پکیج تخصصی توانبخشی
                </h2>

                <div className="card rounded-3xl p-4 relative overflow-hidden min-h-[350px]">

                    {/* Blurred List Items */}
                    <div className="space-y-4 opacity-50 blur-[4px]" aria-hidden="true">
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
                        <div className="card rounded-3xl p-8 text-center border-t-2 border-secondary-container w-full max-w-sm">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-on-surface mb-2">دسترسی به پکیج کامل</h3>
                            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                                شامل ۸ ویدیوی تخصصی، برنامه تمرینی اختصاصی و پشتیبانی مستقیم.
                            </p>
                            <button type="button" onClick={() => setShowPremiumModal(true)} className="btn btn-primary w-full py-4 font-bold">
                                ارتقا به ویژه و بازگشایی
                            </button>
                        </div>
                    </div>

                </div>
            </section>

            {/* 3-Tier Premium Modal */}
            <Modal
                open={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                title="پلن‌های اشتراک ویژه"
                size="xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Base Tier */}
                    <div className="card rounded-2xl p-6 relative overflow-hidden flex flex-col border border-outline-variant">
                        <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-xs font-bold py-1 px-10 rotate-45 z-10">به زودی</div>
                        <h3 className="text-lg font-bold text-on-surface mb-2">پایه</h3>
                        <p className="text-sm text-on-surface-variant mb-4">دسترسی محدود به ویدیوها</p>
                        <div className="text-xl font-bold text-primary mb-6 mt-auto">۹۹,۰۰۰ <span className="text-sm font-normal text-on-surface-variant">تومان / ماه</span></div>
                        <button type="button" disabled className="btn btn-secondary btn-md w-full">خرید</button>
                    </div>

                    {/* Pro Tier */}
                    <div className="card rounded-2xl p-6 relative overflow-hidden flex flex-col border-2 border-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                        <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-xs font-bold py-1 px-10 rotate-45 z-10">به زودی</div>
                        <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">حرفه‌ای <Verified className="w-4 h-4 text-primary" /></h3>
                        <p className="text-sm text-on-surface-variant mb-4">دسترسی کامل + تمرینات اختصاصی</p>
                        <div className="text-xl font-bold text-primary mb-6 mt-auto">۱۹۹,۰۰۰ <span className="text-sm font-normal text-on-surface-variant">تومان / ماه</span></div>
                        <button type="button" disabled className="btn btn-secondary btn-md w-full">خرید</button>
                    </div>

                    {/* Org Tier */}
                    <div className="card rounded-2xl p-6 relative overflow-hidden flex flex-col border border-outline-variant">
                        <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-xs font-bold py-1 px-10 rotate-45 z-10">به زودی</div>
                        <h3 className="text-lg font-bold text-on-surface mb-2">سازمانی</h3>
                        <p className="text-sm text-on-surface-variant mb-4">پشتیبانی اختصاصی و مشاوره</p>
                        <div className="text-xl font-bold text-primary mb-6 mt-auto">۴۹۹,۰۰۰ <span className="text-sm font-normal text-on-surface-variant">تومان / ماه</span></div>
                        <button type="button" disabled className="btn btn-secondary btn-md w-full">خرید</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
