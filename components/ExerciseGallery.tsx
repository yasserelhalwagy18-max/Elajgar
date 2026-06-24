'use client';

import * as React from 'react';
import { useState } from 'react';
import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const exercises = [
    { id: 1, title: 'کشش همسترینگ', duration: '۵ دقیقه', img: 'stretching', level: 'مبتدی', category: 'کششی', sets: 3, reps: 15, description: 'کشش عضلات پشت ران برای کاهش فشار روی کمر.' },
    { id: 2, title: 'تقویت هسته مرکزی', duration: '۱۲ دقیقه', img: 'core_workout', level: 'متوسط', category: 'تقویتی', sets: 4, reps: 20, description: 'تقویت عضلات شکم و پهلو برای حمایت از ستون فقرات.' },
    { id: 3, title: 'اصلاح قوز کمر', duration: '۸ دقیقه', img: 'posture', level: 'مبتدی', category: 'اصلاحی', sets: 3, reps: 12, description: 'تمرینات مخصوص باز کردن شانه‌ها و اصلاح وضعیت نشستن.' },
    { id: 4, title: 'راه رفتن در آب', duration: '۱۵ دقیقه', img: 'water', level: 'همه', category: 'آب درمانی', sets: 1, reps: 1, description: 'کاهش فشار روی مفاصل و تقویت عضلات با استفاده از مقاومت آب.' },
    { id: 5, title: 'کشش گربه-گاو', duration: '۴ دقیقه', img: 'yoga_relax', level: 'مبتدی', category: 'کششی', sets: 2, reps: 10, description: 'افزایش انعطاف‌پذیری ستون فقرات و کاهش تنش پشتی.' }
];

const categories = ['همه', 'کششی', 'اصلاحی', 'تقویتی', 'آب درمانی'];

export function ExerciseGallery() {
    const [activeVideo, setActiveVideo] = useState<number | null>(null);
    const [activeCategory, setActiveCategory] = useState('همه');

    const filteredExercises = activeCategory === 'همه'
        ? exercises
        : exercises.filter(ex => ex.category === activeCategory);

    const activeExerciseDetails = exercises.find(e => e.id === activeVideo);

    return (
        <section className="mb-10">
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl font-bold text-on-surface">برنامه تمرینی اختصاصی</h2>
                <span className="text-sm font-bold text-primary cursor-pointer hover:underline">مشاهده همه</span>
            </div>

            {/* Categories Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm transition-colors",
                            activeCategory === cat
                                ? "bg-primary text-white shadow-md"
                                : "glass-card border border-white/50 text-on-surface-variant hover:bg-white/50"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredExercises.map((ex) => (
                    <motion.div 
                        key={ex.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveVideo(ex.id)}
                        className="relative rounded-3xl overflow-hidden glass-panel group cursor-pointer border border-white/60 shadow-lg aspect-square"
                    >
                        <Image 
                            src={`https://picsum.photos/seed/${ex.img}/400/400`}
                            alt={ex.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(37,99,235,0.6)]">
                                 <Play className="w-5 h-5 ml-1 fill-white" />
                             </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-white font-bold text-sm leading-tight mb-1">{ex.title}</h3>
                            <div className="flex justify-between items-center text-[10px] text-white/80 font-medium">
                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">{ex.duration}</span>
                                <span>{ex.level}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Video Modal Overlay */}
            <AnimatePresence>
                {activeVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setActiveVideo(null)}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative z-10 w-full max-w-lg bg-surface rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="relative w-full aspect-video bg-black">
                                <button
                                    onClick={() => setActiveVideo(null)}
                                    className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-surface-variant/10 z-10">
                                    {/* Fake Video Player */}
                                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(37,99,235,0.6)]">
                                        <Play className="w-6 h-6 text-white ml-1 fill-white" />
                                    </div>
                                </div>

                                {/* Abstract placeholder for playing state */}
                                <Image
                                    src={`https://picsum.photos/seed/${activeExerciseDetails?.img}/800/400`}
                                    alt="Video placeholder"
                                    fill
                                    className="object-cover opacity-60 mix-blend-overlay"
                                />
                            </div>

                            {/* Exercise Details */}
                            <div className="p-6 bg-white rounded-b-[2rem]">
                                <h3 className="text-2xl font-bold text-on-surface mb-2">{activeExerciseDetails?.title}</h3>
                                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                                    {activeExerciseDetails?.description}
                                </p>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="glass-card p-3 rounded-xl text-center border border-outline-variant/30 bg-surface-variant/10">
                                        <p className="text-xs text-on-surface-variant mb-1">ست‌ها</p>
                                        <p className="font-bold text-primary">{activeExerciseDetails?.sets}</p>
                                    </div>
                                    <div className="glass-card p-3 rounded-xl text-center border border-outline-variant/30 bg-surface-variant/10">
                                        <p className="text-xs text-on-surface-variant mb-1">تکرار</p>
                                        <p className="font-bold text-primary">{activeExerciseDetails?.reps}</p>
                                    </div>
                                    <div className="glass-card p-3 rounded-xl text-center border border-outline-variant/30 bg-surface-variant/10">
                                        <p className="text-xs text-on-surface-variant mb-1">زمان</p>
                                        <p className="font-bold text-primary">{activeExerciseDetails?.duration}</p>
                                    </div>
                                </div>

                                <button className="w-full btn-primary-glass py-3 rounded-xl font-bold text-sm">
                                    شروع تمرین
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
