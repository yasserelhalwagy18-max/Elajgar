'use client';

import * as React from 'react';
import { useState } from 'react';
import { Play, X, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn, formatDuration } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';

const exercises = [
    { id: 1, title: 'کشش همسترینگ', duration: '۵ دقیقه', level: 'مبتدی', category: 'کششی', sets: 3, reps: 15, emoji: '🧘', accent: 'from-primary/70 to-secondary/70', description: 'کشش عضلات پشت ران برای کاهش فشار روی کمر.' },
    { id: 2, title: 'تقویت هسته مرکزی', duration: '۱۲ دقیقه', level: 'متوسط', category: 'تقویتی', sets: 4, reps: 20, emoji: '💪', accent: 'from-tertiary/70 to-primary/70', description: 'تقویت عضلات شکم و پهلو برای حمایت از ستون فقرات.' },
    { id: 3, title: 'اصلاح قوز کمر', duration: '۸ دقیقه', level: 'مبتدی', category: 'اصلاحی', sets: 3, reps: 12, emoji: '🧍', accent: 'from-water/70 to-secondary/70', description: 'تمرینات مخصوص باز کردن شانه‌ها و اصلاح وضعیت نشستن.' },
    { id: 4, title: 'راه رفتن در آب', duration: '۱۵ دقیقه', level: 'همه', category: 'آب درمانی', sets: 1, reps: 1, emoji: '🏊', accent: 'from-water/80 to-primary/70', description: 'کاهش فشار روی مفاصل و تقویت عضلات با استفاده از مقاومت آب.' },
    { id: 5, title: 'کشش گربه-گاو', duration: '۴ دقیقه', level: 'مبتدی', category: 'کششی', sets: 2, reps: 10, emoji: '🐈', accent: 'from-secondary/70 to-tertiary/70', description: 'افزایش انعطاف‌پذیری ستون فقرات و کاهش تنش پشت‌بند.' },
    { id: 6, title: 'کشش عضلات در آب', duration: '۱۵ دقیقه', level: 'همه', category: 'آب درمانی', sets: 2, reps: 10, emoji: '🌊', accent: 'from-water/70 to-secondary/70', description: 'کشش ملایم عضلات در آب برای افزایش انعطاف‌پذیری و کاهش درد.' }
];

const categories = ['همه', 'کششی', 'اصلاحی', 'تقویتی', 'آب درمانی'];

export function ExerciseGallery() {
    const [activeVideo, setActiveVideo] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState('همه');
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    // Derived rather than stored: the timer is running exactly while there is
    // time left on the clock.
    const timerActive = timeLeft !== null && timeLeft > 0;

    const userProfile = useStore((state) => state.userProfile);

    // Timer logic.
    // The interval is deliberately *not* dependent on `timeLeft`: depending on
    // it would tear the interval down and recreate it on every tick. The
    // countdown is driven by a functional update, which keeps the updater
    // pure - calling setState inside another setState's updater fires the side
    // effect twice under React StrictMode.
    React.useEffect(() => {
        if (!timerActive) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive]);

    // Restarting: allow the finished exercise to be started again.
    const handleStartExercise = () => {
        if (!activeExerciseDetails) return;

        // Parse Persian string to numbers (e.g. '۵ دقیقه')
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        let englishStr = '';
        for (const char of activeExerciseDetails.duration) {
            const index = persianDigits.indexOf(char);
            if (index !== -1) {
                englishStr += index;
            } else if (/\d/.test(char)) {
                englishStr += char;
            }
        }

        const minutes = parseInt(englishStr, 10);
        if (!isNaN(minutes)) {
            setTimeLeft(minutes * 60);
        }
    };

    const filteredExercises = activeCategory === 'همه'
        ? exercises
        : exercises.filter(ex => ex.category === activeCategory);

    const activeExerciseDetails = exercises.find(e => e.id === activeVideo);

    // Determine recommended exercises based on pain zones
    let recommendedCategoryKeys: string[] = [];
    if (userProfile?.painZones && userProfile.painZones.length > 0) {
        userProfile.painZones.forEach(zone => {
            if (zone.zone === 'back' || zone.zone === 'کمر') {
                recommendedCategoryKeys.push('تقویتی', 'اصلاحی');
            } else if (zone.zone === 'neck' || zone.zone === 'گردن') {
                recommendedCategoryKeys.push('اصلاحی', 'کششی');
            } else if (zone.zone === 'knee' || zone.zone === 'زانو') {
                recommendedCategoryKeys.push('آب درمانی', 'کششی');
            }
        });
    }

    let recommendedExercises = [];
    if (recommendedCategoryKeys.length > 0) {
        recommendedExercises = exercises.filter(ex => recommendedCategoryKeys.includes(ex.category));
        // Remove duplicates and limit to a few
        recommendedExercises = Array.from(new Set(recommendedExercises)).slice(0, 4);
    } else {
        // Fallback
        recommendedExercises = exercises.slice(0, 2);
    }

    return (
        <section className="mb-10">
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl font-bold text-on-surface">برنامه تمرینی اختصاصی</h2>
                {activeCategory !== 'همه' && (
                    <button
                        type="button"
                        onClick={() => setActiveCategory('همه')}
                        className="text-sm font-bold text-primary cursor-pointer hover:underline"
                    >
                        نمایش همه
                    </button>
                )}
            </div>

            {/* Recommended Exercises based on pain */}
            <div className="mb-6">
                <h3 className="text-sm font-bold text-on-surface-variant mb-3 px-1">پیشنهادی بر اساس درد شما</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 rail-fade">
                    {recommendedExercises.map((ex) => (
                        <motion.button
                            type="button"
                            key={`rec-${ex.id}`}
                            layout
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveVideo(ex.id)}
                            className="relative min-w-[140px] w-[140px] rounded-3xl overflow-hidden card card-hover group cursor-pointer aspect-square flex-shrink-0 text-start"
                        >
                            <div className={cn('absolute inset-0 bg-gradient-to-br', ex.accent)} aria-hidden="true" />
                            <span className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden="true">{ex.emoji}</span>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />

                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                 <div className="w-10 h-10 rounded-full bg-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.6)]">
                                     <Play className="w-4 h-4 ms-0.5 fill-white" />
                                 </div>
                            </div>

                            <div className="absolute bottom-3 left-3 right-3">
                                <h3 className="text-white font-bold text-sm leading-tight mb-1">{ex.title}</h3>
                                <div className="flex justify-between items-center text-xs text-white/90 font-medium">
                                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">{ex.duration}</span>
                                    <span>{ex.level}</span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2 rail-fade">
                {categories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        aria-pressed={activeCategory === cat}
                        className="chip"
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredExercises.map((ex) => (
                    <motion.button
                        type="button"
                        key={ex.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveVideo(ex.id)}
                        className="relative rounded-3xl overflow-hidden card card-hover group cursor-pointer aspect-square text-start"
                    >
                        <div className={cn('absolute inset-0 bg-gradient-to-br', ex.accent)} aria-hidden="true" />
                        <span className="absolute inset-0 flex items-center justify-center text-6xl" aria-hidden="true">{ex.emoji}</span>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                             <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.6)]">
                                 <Play className="w-5 h-5 ms-0.5 fill-white" />
                             </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-white font-bold text-sm leading-tight mb-1">{ex.title}</h3>
                            <div className="flex justify-between items-center text-xs text-white/90 font-medium">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">{ex.duration}</span>
                                <span>{ex.level}</span>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Video Modal */}
            <Modal
                open={activeVideo !== null}
                onClose={() => { setActiveVideo(null); setTimeLeft(null); }}
                title={activeExerciseDetails?.title}
                size="md"
            >
                {/* Fake Video Player */}
                <div className="relative w-full aspect-video bg-surface-variant rounded-2xl overflow-hidden mb-5">
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(37,99,235,0.6)]">
                            <Play className="w-6 h-6 text-white ms-1 fill-white" />
                        </div>
                        <span className="text-xs text-on-surface-variant">ویدیوی تمرین به‌زودی منتشر می‌شود</span>
                    </div>
                </div>

                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                    {activeExerciseDetails?.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="card p-3 rounded-xl text-center">
                        <p className="text-xs text-on-surface-variant mb-1">ست‌ها</p>
                        <p className="font-bold text-primary">{activeExerciseDetails?.sets}</p>
                    </div>
                    <div className="card p-3 rounded-xl text-center">
                        <p className="text-xs text-on-surface-variant mb-1">تکرار</p>
                        <p className="font-bold text-primary">{activeExerciseDetails?.reps}</p>
                    </div>
                    <div className="card p-3 rounded-xl text-center">
                        <p className="text-xs text-on-surface-variant mb-1">زمان</p>
                        <p className="font-bold text-primary">{activeExerciseDetails?.duration}</p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={timeLeft === null || timeLeft === 0 ? handleStartExercise : undefined}
                    disabled={timeLeft !== null && timeLeft > 0}
                    className={cn(
                        "btn w-full py-3 font-bold",
                        timeLeft === null || timeLeft === 0 ? "btn-primary" : "btn-secondary"
                    )}
                >
                    {timeLeft === null ? "شروع تمرین" :
                     timeLeft === 0 ? <><RotateCcw className="w-4 h-4" /> پایان یافت - شروع دوباره</> :
                     formatDuration(timeLeft)}
                </button>
            </Modal>
        </section>
    );
}
