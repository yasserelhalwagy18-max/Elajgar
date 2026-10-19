'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Check, Clock, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toDateKey } from '@/lib/utils';

type SessionStatus = 'completed' | 'pending' | 'skipped';

interface Session {
  id: number;
  /** Local calendar day key, YYYY-MM-DD. */
  date: string;
  text: string;
  status: SessionStatus;
}

const SESSION_TEMPLATES: { offset: number; text: string; status: SessionStatus }[] = [
  { offset: -4, text: 'تمرینات گردن', status: 'completed' },
  { offset: -3, text: 'حرکات اصلاحی کمر', status: 'completed' },
  { offset: -2, text: 'مدیتیشن', status: 'skipped' },
  { offset: -1, text: 'تمرینات گردن', status: 'pending' },
  { offset: 0, text: 'حرکات اصلاحی کمر', status: 'pending' },
];

/**
 * The Persian (Jalali) calendar is derived with `Intl` rather than a date
 * library: the browser already knows how to convert, and this keeps the
 * dependency list unchanged.
 */
const persianFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const persianDayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' });

const persianMonthFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { month: 'long' });

const persianYearFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' });

const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' });

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

/** Parse the Persian parts of a date out of the Intl output. */
function persianParts(date: Date) {
  const parts = persianFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return {
    year: Number(get('year')),
    month: get('month'),
    day: Number(get('day')),
  };
}

/** Find the Gregorian date of the 1st of the Persian month containing `date`. */
function firstDayOfPersianMonth(date: Date): Date {
  const cursor = new Date(date);
  cursor.setHours(0, 0, 0, 0);
  // Persian months are 29-31 days, so this loop is short.
  while (persianParts(cursor).day !== 1) {
    cursor.setDate(cursor.getDate() - 1);
  }
  return cursor;
}

/** Number of days in the Persian month containing `date`. */
function daysInPersianMonth(date: Date): number {
  const first = firstDayOfPersianMonth(date);
  const next = new Date(first);
  next.setDate(first.getDate() + 1);
  while (persianParts(next).day !== 1) {
    next.setDate(next.getDate() + 1);
  }
  return Math.round((next.getTime() - first.getTime()) / 86_400_000);
}

export function CorrectionalCalendar() {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const todayParts = useMemo(() => persianParts(today), [today]);
  const todayMonthIndex = Math.max(0, PERSIAN_MONTHS.indexOf(todayParts.month));

  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string>(toDateKey(today));

  const [sessions, setSessions] = useState<Session[]>(() =>
    SESSION_TEMPLATES.map((template, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() + template.offset);
      return {
        id: index + 1,
        date: toDateKey(date),
        text: template.text,
        status: template.status,
      };
    })
  );

  // The month being displayed: `monthOffset` steps back and forth from the
  // current Persian month.
  const anchor = useMemo(() => {
    const first = firstDayOfPersianMonth(today);
    const monthsInYear = 12;
    const totalOffset = monthOffset;

    // Step whole months at a time, then correct for the differing month
    // lengths by walking to the 1st of the target month.
    const target = new Date(first);
    target.setDate(1);
    target.setMonth(target.getMonth() + totalOffset);
    return firstDayOfPersianMonth(target);
  }, [today, monthOffset]);

  const anchorParts = persianParts(anchor);
  const monthIndex = Math.max(0, PERSIAN_MONTHS.indexOf(anchorParts.month));
  const monthLength = daysInPersianMonth(anchor);

  // Show a seven day window containing today when the current month is
  // displayed, otherwise the first week of the month.
  const windowStart = useMemo(() => {
    const dayOffset = monthOffset === 0 ? todayParts.day - 1 : 0;
    return Math.min(Math.max(dayOffset, 0), Math.max(0, monthLength - 7));
  }, [monthOffset, todayParts.day, monthLength]);

  const week = useMemo(() => {
    const days: { key: string; label: string; weekday: string; date: Date }[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(anchor);
      date.setDate(anchor.getDate() + windowStart + i);
      days.push({
        key: toDateKey(date),
        label: String(persianDayFormatter.format(date)),
        weekday: weekdayFormatter.format(date),
        date,
      });
    }
    return days;
  }, [anchor, windowStart]);

  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-white shadow-md border-transparent';
      case 'skipped':
        return 'bg-error/10 text-error border-error/30';
      case 'pending':
        return 'bg-surface-variant text-on-surface-variant border-outline-variant';
      default:
        return 'bg-white border-outline-variant/30 text-on-surface';
    }
  };

  const currentSession = sessions.find((s) => s.date === selectedKey);

  const changeMonth = (delta: number) => {
    setMonthOffset((prev) => prev + delta);
    // Select the first visible day of the new month.
    const first = firstDayOfPersianMonth(today);
    const target = new Date(first);
    target.setDate(1);
    target.setMonth(target.getMonth() + monthOffset + delta);
    const normalized = firstDayOfPersianMonth(target);
    setSelectedKey(toDateKey(normalized));
  };

  return (
    <section className="mb-10 block">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl font-bold text-on-surface">تقویم تمرینات اصلاحی</h2>
        <div className="flex bg-white/40 glass-card rounded-full p-1 border border-white/50">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="ماه قبل"
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold px-2 py-0.5">
            {PERSIAN_MONTHS[monthIndex]} {persianYearFormatter.format(anchor)}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="ماه بعد"
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 rounded-[2rem] border border-white/70 shadow-lg">
        {/* Days row */}
        <div className="flex justify-between items-center mb-6">
          {week.map((day) => {
            const sessionForDay = sessions.find((s) => s.date === day.key);
            const isSelected = selectedKey === day.key;
            const isToday = day.key === toDateKey(today);

            return (
              <div key={day.key} className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-on-surface-variant">{day.weekday}</span>
                <button
                  type="button"
                  onClick={() => setSelectedKey(day.key)}
                  aria-pressed={isSelected}
                  aria-label={`${day.weekday} ${day.label}${sessionForDay ? ` - ${sessionForDay.text}` : ''}`}
                  className={cn(
                    'w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all border-2 relative',
                    isSelected ? 'border-primary scale-110 shadow-lg' : 'border-transparent',
                    sessionForDay
                      ? getStatusColor(sessionForDay.status)
                      : 'bg-white/50 border-white text-on-surface-variant',
                    isToday && !isSelected && 'ring-2 ring-primary/30'
                  )}
                >
                  {day.label}
                  {sessionForDay?.status === 'completed' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {sessionForDay?.status === 'skipped' && (
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
              key={`${selectedKey}-${currentSession?.status}`}
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
                      type="button"
                      onClick={() => {
                        setSessions((prev) =>
                          prev.map((s) =>
                            s.date === selectedKey ? { ...s, status: 'completed' } : s
                          )
                        );
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
