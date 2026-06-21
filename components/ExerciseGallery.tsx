'use client';

import * as React from 'react';
import { useState } from 'react';
import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const exercises = [
    { id: 1, title: 'کشش همسترینگ', duration: '۵ دقیقه', img: 'stretching', level: 'مبتدی' },
    { id: 2, title: 'تقویت هسته مرکزی', duration: '۱۲ دقیقه', img: 'core_workout', level: 'متوسط' },
    { id: 3, title: 'اصلاح قوز کمر', duration: '۸ دقیقه', img: 'posture', level: 'مبتدی' },
    { id: 4, title: 'یوگای ریلکسیشن', duration: '۱۵ دقیقه', img: 'yoga_relax', level: 'همه' },
];

export function ExerciseGallery() {
    const [activeVideo, setActiveVideo] = useState<number | null>(null);

    return (
        <section className="mb-10">
            <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="text-xl font-bold text-on-surface">گالری تمرینات</h2>
                <span className="text-sm font-bold text-primary cursor-pointer hover:underline">مشاهده همه</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {exercises.map((ex) => (
                    <motion.div 
                        key={ex.id}
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
                            className="relative z-10 w-full max-w-lg aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/20"
                        >
                            <button 
                                onClick={() => setActiveVideo(null)}
                                className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-surface-variant/10">
                                {/* Fake Video Player */}
                                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(37,99,235,0.6)]">
                                    <Play className="w-8 h-8 text-white ml-1 fill-white" />
                                </div>
                                <p className="text-white font-bold tracking-wide">در حال بارگذاری ویدیو...</p>
                            </div>
                            
                            {/* Abstract placeholder for playing state */}
                            <Image 
                                src={`https://picsum.photos/seed/${exercises.find(e => e.id === activeVideo)?.img}/800/400`}
                                alt="Video placeholder"
                                fill
                                className="object-cover opacity-40 mix-blend-overlay"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
