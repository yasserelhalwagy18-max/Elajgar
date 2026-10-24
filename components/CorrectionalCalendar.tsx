'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Check, Clock, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { toDateKey } from '@/lib/utils';

type SessionStatus = 'completed' | 'pending' | 'skipped';

interface Session {
    id: number;
    /** Local calendar day key, YYYY-MM-DD. */
    date: string;
    text: string;
    status: SessionStatus;
}

/** A step of the daily program, as it comes from the database. */
interface SessionTemplate {
    offset: number;
    text: string;
    status: SessionStatus;
}

const DEFAULT_SESSION_TEMPLATES: SessionTemplate[] = [
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
 *
 * The *parsing* formatters force the `latn` numbering system. The `fa-IR`
 * locale defaults to Persian digits, so `formatToParts` returns e.g. "۲۸"
 * - and `Number("۲۸")` is `NaN`. With NaN the `while (day !== 1)` loops
 * below never terminate and the component hangs the page in an infinite
 * loop. The display formatters keep the Persian digits.
 */
const persianFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

/** Display formatters - these keep the Persian digits. */
const displayDayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { day: 'numeric' });
const displayYearFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' });

const weekdayFormatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'short' });

/** A Persian month is never longer than 31 days - the guard keeps a broken
 *  calendar lookup from turning into an infinite loop. */
const MAX_MONTH_SCAN_DAYS = 40;

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
    // Persian months are 29-31 days, so this loop is short. The counter is a
    // safety net: if the calendar data ever came back in an unexpected shape
    // the loop must still terminate.
    let guard = 0;
    while (persianParts(cursor).day !== 1 && guard < MAX_MONTH_SCAN_DAYS) {
        cursor.setDate(cursor.getDate() - 1);
        guard++;
    }
    return cursor;
}

/** Number of days in the Persian month containing `date`. */
function daysInPersianMonth(date: Date): number {
    const first = firstDayOfPersianMonth(date);
    const next = new Date(first);
    next.setDate(first.getDate() + 1);
    let guard = 0;
    while (persianParts(next).day !== 1 && guard < MAX_MONTH_SCAN_DAYS) {
        next.setDate(next.getDate() + 1);
        guard++;
    }
    return Math.round((next.getTime() - first.getTime()) / 86_400_000);
}

/** Midnight of the given date. */
function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * The Saturday that starts the Persian week containing `date`.
 *
 * The Persian week starts on Saturday, which is `getDay() === 6` in the
 * JavaScript calendar.
 */
function startOfWeek(date: Date): Date {
    const d = startOfDay(date);
    const daysSinceSaturday = (d.getDay() + 1) % 7;
    d.setDate(d.getDate() - daysSinceSaturday);
    return d;
}

/** Add (or subtract) months, clamping to the last day of the target month. */
function addMonths(date: Date, delta: number): Date {
    const target = new Date(date);
    const day = target.getDate();
    target.setDate(1);
    target.setMonth(target.getMonth() + delta);
    const monthLength = daysInPersianMonth(target);
    target.setDate(Math.min(day, monthLength));
    return target;
}

export function CorrectionalCalendar() {
    const shouldReduceMotion = useReducedMotion();
    const today = useMemo(() => startOfDay(new Date()), []);

    const [selectedDate, setSelectedDate] = useState<Date>(today);

    // The program steps come from the database, so an admin can change the
    // daily routine from the panel.
    const [templates, setTemplates] = useState<SessionTemplate[]>(DEFAULT_SESSION_TEMPLATES);

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const res = await fetch('/api/content/program', {
                    signal: controller.signal,
                    cache: 'no-store',
                });
                if (!res.ok) return;

                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setTemplates(data);
                }
            } catch (error) {
                if ((error as Error)?.name === 'AbortError') return;
            }
        }

        void load();
        return () => controller.abort();
    }, []);

    // The status the user set for a day, on top of the program. Keeping the
    // overrides separate means the sessions can be derived instead of being
    // copied into state whenever the program changes.
    const [statusOverrides, setStatusOverrides] = useState<Record<string, SessionStatus>>({});

    const sessions = useMemo<Session[]>(
        () =>
            templates.map((template, index) => {
                const date = new Date(today);
                date.setDate(today.getDate() + template.offset);
                const key = toDateKey(date);

                return {
                    id: index + 1,
                    date: key,
                    text: template.text,
                    status: statusOverrides[key] ?? template.status,
                };
            }),
        [templates, statusOverrides, today],
    );

    const selectedKey = toDateKey(selectedDate);
    const selectedParts = persianParts(selectedDate);
    const monthIndex = Math.max(0, PERSIAN_MONTHS.indexOf(selectedParts.month));

    // The visible week - the seven days that contain the selected day.
    const week = useMemo(() => {
        const start = startOfWeek(selectedDate);
        const days: { key: string; label: string; weekday: string; date: Date }[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            days.push({
                key: toDateKey(date),
                label: displayDayFormatter.format(date),
                weekday: weekdayFormatter.format(date),
                date,
            });
        }
        return days;
    }, [selectedDate]);

    const currentSession = sessions.find((s) => s.date === selectedKey);

    // The session status tints the day, it does not fill it: a solid fill made
    // a completed day look exactly like the selected day.
    const getStatusColor = (status: SessionStatus) => {
        switch (status) {
            case 'completed':
                return 'bg-primary/10 text-primary-dark border-primary/30';
            case 'skipped':
                return 'bg-error/10 text-error-strong border-error/30';
            case 'pending':
                return 'bg-surface-variant text-on-surface-variant border-outline-variant';
            default:
                return 'bg-surface-container border-outline-variant/30 text-on-surface';
        }
    };

    return (
        <section className="mb-10 block">
            <div className="flex justify-between items-end mb-4 px-1 gap-3">
                <h2 className="text-xl font-bold text-on-surface">تقویم تمرینات اصلاحی</h2>

                <div className="flex items-center gap-2">
                    {/* Week navigation - the calendar used to jump a whole
                        month at a time, so the days in between were
                        unreachable. */}
                    <div className="flex bg-surface-container card rounded-full p-1 border border-outline-variant">
                        <button
                            type="button"
                            onClick={() => setSelectedDate((prev) => {
                                const d = new Date(prev);
                                d.setDate(d.getDate() - 7);
                                return d;
                            })}
                            aria-label="هفته قبل"
                            className="icon-btn !w-8 !h-8 rounded-full"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold px-2 whitespace-nowrap">
                            {PERSIAN_MONTHS[monthIndex]} {displayYearFormatter.format(selectedDate)}
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedDate((prev) => {
                                const d = new Date(prev);
                                d.setDate(d.getDate() + 7);
                                return d;
                            })}
                            aria-label="هفته بعد"
                            className="icon-btn !w-8 !h-8 rounded-full"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Month navigation */}
                    <div className="flex bg-surface-container card rounded-full p-1 border border-outline-variant">
                        <button
                            type="button"
                            onClick={() => setSelectedDate((prev) => addMonths(prev, -1))}
                            aria-label="ماه قبل"
                            className="icon-btn !w-8 !h-8 rounded-full"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedDate((prev) => addMonths(prev, 1))}
                            aria-label="ماه بعد"
                            className="icon-btn !w-8 !h-8 rounded-full"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="card p-5 rounded-3xl">
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
                                    onClick={() => setSelectedDate(day.date)}
                                    aria-pressed={isSelected}
                                    aria-label={`${day.weekday} ${day.label}${sessionForDay ? ` - ${sessionForDay.text}` : ''}`}
                                    className={cn(
                                        'w-11 h-11 rounded-xl font-bold flex items-center justify-center transition-all border-2 relative',
                                        // Selection is a ring + scale, so it stays
                                        // readable on top of any session tint.
                                        isSelected ? 'border-primary scale-105 shadow-md ring-2 ring-primary/25' : 'border-transparent',
                                        sessionForDay
                                            ? getStatusColor(sessionForDay.status)
                                            : 'bg-surface-container/60 border-outline-variant/40 text-on-surface-variant',
                                        isToday && !isSelected && 'ring-2 ring-primary/30'
                                    )}
                                >
                                    {day.label}
                                    {sessionForDay?.status === 'completed' && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-surface-container">
                                            <Check className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                    {sessionForDay?.status === 'skipped' && (
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-error text-white rounded-full flex items-center justify-center border-2 border-surface-container">
                                            <X className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-surface-variant/30 rounded-2xl p-4 min-h-[90px] relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${selectedKey}-${currentSession?.status}`}
                            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: 10 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                            className="flex justify-between items-center h-full w-full"
                        >
                            {currentSession ? (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-bold text-on-surface">{currentSession.text}</h3>
                                        <div className="flex gap-2 text-xs font-medium text-on-surface-variant items-center">
                                            <Clock className="w-4 h-4" />
                                            <span>۲۰ دقیقه</span>
                                        </div>
                                    </div>

                                    {currentSession.status === 'pending' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStatusOverrides((prev) => ({
                                                    ...prev,
                                                    [selectedKey]: 'completed',
                                                }));
                                            }}
                                            className="btn btn-primary btn-sm shadow-md"
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
