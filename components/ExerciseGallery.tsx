'use client';

import * as React from 'react';
import { Play, X, RotateCcw } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn, formatDuration, toPersianDigits } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { seedExercises } from '@/lib/education-content';

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  durationMinutes: number;
  sets: number;
  reps: number;
  emoji: string;
  accent: string;
  targetTags: string[] | null;
}

/**
 * The exercise gallery.
 *
 * The list comes from the database so an admin can add, edit and publish
 * exercises from the panel. The bundled seed is the fallback for when the
 * request fails.
 */
export function ExerciseGallery() {
    const shouldReduceMotion = useReducedMotion();
    const [exercises, setExercises] = React.useState<Exercise[]>([]);
    const [activeVideo, setActiveVideo] = React.useState<string | null>(null);
    const [activeCategory, setActiveCategory] = React.useState('همه');
    const [timeLeft, setTimeLeft] = React.useState<number | null>(null);
    // Derived rather than stored: the timer is running exactly while there is
    // time left on the clock.
    const timerActive = timeLeft !== null && timeLeft > 0;

    const userProfile = useStore((state) => state.userProfile);

    React.useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const res = await fetch('/api/content/exercises', {
                    signal: controller.signal,
                    cache: 'no-store',
                });

                if (!res.ok) throw new Error('failed');

                const data = await res.json();
                setExercises(Array.isArray(data) ? data : []);
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') return;
                setExercises(seedExercises as unknown as Exercise[]);
            }
        }

        void load();
        return () => controller.abort();
    }, []);

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

    const categories = React.useMemo(
        () => ['همه', ...Array.from(new Set(exercises.map((exercise) => exercise.category)))],
        [exercises],
    );

    const filteredExercises = activeCategory === 'همه'
        ? exercises
        : exercises.filter((exercise) => exercise.category === activeCategory);

    const activeExerciseDetails = exercises.find((exercise) => exercise.id === activeVideo);

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

    let recommendedExercises: Exercise[] = [];
    if (recommendedCategoryKeys.length > 0) {
        recommendedExercises = exercises.filter((exercise) =>
            recommendedCategoryKeys.includes(exercise.category),
        );
    } else {
        // Fallback
        recommendedExercises = exercises.slice(0, 2);
    }

    // Start the exercise: the duration comes from the record, so there is no
    // parsing of a formatted string.
    const handleStartExercise = () => {
        if (!activeExerciseDetails) return;
        setTimeLeft(activeExerciseDetails.durationMinutes * 60);
    };

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
            {recommendedExercises.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-on-surface-variant mb-3 px-1">پیشنهادی بر اساس درد شما</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 rail-fade">
                        {recommendedExercises.map((exercise) => (
                            <button
                                type="button"
                                key={`rec-${exercise.id}`}
                                onClick={() => setActiveVideo(exercise.id)}
                                className="relative min-w-[140px] w-[140px] rounded-3xl overflow-hidden card card-hover group cursor-pointer aspect-square flex-shrink-0 text-start"
                            >
                                <div className={cn('absolute inset-0 bg-gradient-to-br', exercise.accent)} aria-hidden="true" />
                                <span className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden="true">{exercise.emoji}</span>

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                                     <div className="w-10 h-10 rounded-full bg-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.6)]">
                                         <Play className="w-4 h-4 ms-0.5 fill-white" />
                                     </div>
                                </div>

                                <div className="absolute bottom-3 inset-x-3">
                                    <h3 className="text-white font-bold text-sm leading-tight mb-1">{exercise.title}</h3>
                                    <div className="flex justify-between items-center text-xs text-white/90 font-medium">
                                        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">{toPersianDigits(exercise.durationMinutes)} دقیقه</span>
                                        <span>{exercise.level}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories Filter */}
            {categories.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2 rail-fade" role="tablist" aria-label="دسته‌بندی تمرینات">
                    {categories.map((category) => {
                        const isSelected = activeCategory === category;
                        return (
                            <button
                                key={category}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => setActiveCategory(category)}
                                className={cn('chip relative overflow-hidden transition-colors', isSelected && 'text-white')}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="exercise-active-category"
                                        className="absolute inset-0 bg-primary -z-0"
                                        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.15, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10">{category}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {filteredExercises.map((exercise) => (
                    <button
                        type="button"
                        key={exercise.id}
                        onClick={() => setActiveVideo(exercise.id)}
                        className="relative rounded-3xl overflow-hidden card card-hover group cursor-pointer aspect-square text-start"
                    >
                        <div className={cn('absolute inset-0 bg-gradient-to-br', exercise.accent)} aria-hidden="true" />
                        <span className="absolute inset-0 flex items-center justify-center text-6xl" aria-hidden="true">{exercise.emoji}</span>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden="true" />

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                             <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.6)]">
                                 <Play className="w-5 h-5 ms-0.5 fill-white" />
                             </div>
                        </div>

                        <div className="absolute bottom-3 inset-x-3">
                            <h3 className="text-white font-bold text-sm leading-tight mb-1">{exercise.title}</h3>
                            <div className="flex justify-between items-center text-xs text-white/90 font-medium">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">{toPersianDigits(exercise.durationMinutes)} دقیقه</span>
                                <span>{exercise.level}</span>
                            </div>
                        </div>
                    </button>
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
                        <p className="font-bold text-primary">{toPersianDigits(activeExerciseDetails?.sets ?? 0)}</p>
                    </div>
                    <div className="card p-3 rounded-xl text-center">
                        <p className="text-xs text-on-surface-variant mb-1">تکرار</p>
                        <p className="font-bold text-primary">{toPersianDigits(activeExerciseDetails?.reps ?? 0)}</p>
                    </div>
                    <div className="card p-3 rounded-xl text-center">
                        <p className="text-xs text-on-surface-variant mb-1">زمان</p>
                        <p className="font-bold text-primary">
                            {toPersianDigits(activeExerciseDetails?.durationMinutes ?? 0)} دقیقه
                        </p>
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
