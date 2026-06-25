'use client';

import * as React from 'react';
import { useState } from 'react';
import { Check, Clock, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

// Status options: 'completed', 'pending', 'skipped'
const initialSessions = [
  { id: 1, date: 15, text: 'تمرینات گردن', status: 'completed' },
  { id: 2, date: 16, text: 'حرکات اصلاحی کمر', status: 'completed' },
  { id: 3, date: 17, text: 'مدیتیشن', status: 'skipped' },
  { id: 4, date: 18, text: 'تمرینات گردن', status: 'pending' },
  { id: 5, date: 19, text: 'حرکات اصلاحی کمر', status: 'pending' },
];

const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export function CorrectionalCalendar() {
  const [selectedDate, setSelectedDate] = useState(18);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(2); // خرداد
  const [sessions, setSessions] = useState(initialSessions);

  const getStatusColor = (status: string) => {
      switch (status) {
          case 'completed': return 'bg-primary text-white shadow-md border-transparent';
          case 'skipped': return 'bg-error/10 text-error border-error/30';
          case 'pending': return 'bg-surface-variant text-on-surface-variant border-outline-variant';
          default: return 'bg-white border-outline-variant/30 text-on-surface';
      }
  };

  const currentSession = sessions.find(s => s.date === selectedDate);

  return (
    <section className="mb-10 block">
        <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-bold text-on-surface">تقویم تمرینات اصلاحی</h2>
            <div className="flex bg-white/40 glass-card rounded-full p-1 border border-white/50">
                <button
                    onClick={() => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11))}
                    className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold px-2 py-0.5">{months[currentMonthIndex]} ۱۴۰۵</span>
                <button
                    onClick={() => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0))}
                    className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="glass-panel p-5 rounded-[2rem] border border-white/70 shadow-lg">
            {/* Days row */}
            <div className="flex justify-between items-center mb-6">
                {[14, 15, 16, 17, 18, 19, 20].map((date) => {
                    const sessionForDay = sessions.find(s => s.date === date);
                    const isSelected = selectedDate === date;
                    const isToday = date === 18;

                    return (
                        <div key={date} className="flex flex-col items-center gap-2">
                            <span className="text-xs font-bold text-on-surface-variant">
                                {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'][date % 7]}
                            </span>
                            <button 
                                onClick={() => setSelectedDate(date)}
                                className={cn(
                                    "w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all border-2 relative",
                                    isSelected ? "border-primary scale-110 shadow-lg" : "border-transparent",
                                    sessionForDay ? getStatusColor(sessionForDay.status) : "bg-white/50 border-white text-on-surface-variant",
                                    isToday && !isSelected && "ring-2 ring-primary/30"
                                )}
                            >
                                {date}
                                {sessionForDay && sessionForDay.status === 'completed' && (
                                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                                       <Check className="w-2.5 h-2.5" />
                                   </div>
                                )}
                                {sessionForDay && sessionForDay.status === 'skipped' && (
                                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-error text-white rounded-full flex items-center justify-center border-2 border-white">
                                       <X className="w-2.5 h-2.5" />
                                   </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="bg-surface-variant/20 rounded-2xl p-4 min-h-[90px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${selectedDate}-${currentSession?.status}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center h-full w-full"
                    >
                        {currentSession ? (
                            <>
                                <div className="flex flex-col gap-1">
                                    <h4 className="font-bold text-on-surface">{currentSession.text}</h4>
                                    <div className="flex gap-2 text-xs font-medium text-on-surface-variant items-center">
                                       <Clock className="w-3.5 h-3.5" />
                                       <span>۲۰ دقیقه</span>
                                    </div>
                                </div>
                                
                                {currentSession.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            setSessions(prev => prev.map(s =>
                                                s.date === selectedDate ? { ...s, status: 'completed' } : s
                                            ));
                                        }}
                                        className="bg-primary hover:bg-primary-dark text-white shadow-md text-sm font-bold px-4 py-2 rounded-xl border border-primary-dark transition-all active:scale-95"
                                    >
                                        شروع جلسه
                                    </button>
                                )}
                                 {currentSession.status === 'completed' && (
                                    <div className="bg-primary/10 text-primary text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1 border border-primary/20">
                                        <Check className="w-4 h-4" /> انجام شده
                                    </div>
                                )}
                                {currentSession.status === 'skipped' && (
                                    <div className="bg-error/10 text-error text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-1 border border-error/20">
                                        <X className="w-4 h-4" /> از دست رفته
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full text-center text-sm font-medium text-on-surface-variant py-2">
                                استراحت - جلسه‌ای تنظیم نشده
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    </section>
  );
}
