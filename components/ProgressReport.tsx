'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { DailyHealthData, buildHealthDataFromLogs } from '@/lib/healthScore';
import { useStore } from '@/lib/store';
import { toPersianDigits } from '@/lib/utils';

const chartTooltipStyle = {
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 20px rgba(15,23,42,0.1)',
  fontSize: '12px',
  direction: 'rtl' as const,
};

export default function ProgressReport() {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const userProfile = useStore((state) => state.userProfile);

  const chartData = useMemo(() => {
    const days = timeRange === '7' ? 7 : 30;
    return buildHealthDataFromLogs(userProfile, days);
  }, [timeRange, userProfile]);

  const { data, hasEnoughData } = chartData;

  // The app reads right-to-left, so the time axis runs right-to-left too:
  // "today" sits on the left, the oldest day on the right.
  const rtlData = useMemo(() => [...data].reverse(), [data]);

  const weightDomain = useMemo<[number | string, number | string]>(() => {
    const values = data.map((d) => d.weight).filter((v): v is number => v !== null);
    if (values.length === 0) return [0, 1];
    return [Math.min(...values) - 2, Math.max(...values) + 2];
  }, [data]);

  const bmiDomain = useMemo<[number | string, number | string]>(() => {
    const values = data.map((d) => d.bmi).filter((v): v is number => v !== null);
    if (values.length === 0) return [0, 1];
    return [Math.min(...values) - 1, Math.max(...values) + 1];
  }, [data]);

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">گزارش پیشرفت</h2>

        {/* Toggle Switch */}
        <div
          role="group"
          aria-label="بازه زمانی گزارش"
          className="flex bg-surface-variant/50 p-1 rounded-xl border border-outline-variant/50"
        >
          <button
            type="button"
            onClick={() => setTimeRange('7')}
            aria-pressed={timeRange === '7'}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === '7' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            ۷ روز
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30')}
            aria-pressed={timeRange === '30'}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === '30' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            ۱ ماه
          </button>
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="card p-8 rounded-3xl flex flex-col items-center justify-center min-h-[300px] text-center gap-4">
          <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center text-on-surface-variant/50 mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-on-surface-variant font-medium text-lg max-w-sm">
            هنوز داده کافی ندارید. بعد از چند روز استفاده، نمودار نمایش داده می‌شود.
          </p>
        </div>
      ) : (
        <>
          {/* Weight Trend */}
          <figure className="card p-6 rounded-3xl">
            <figcaption className="font-bold text-lg mb-4 text-on-surface">روند وزن (کیلوگرم)</figcaption>
            <div className="h-64 w-full" dir="ltr" role="img" aria-label="نمودار روند وزن">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rtlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={weightDomain} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--color-primary)' }}
                    formatter={(value: any) => [`${toPersianDigits(value)} کیلوگرم`, 'وزن']}
                  />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </figure>

          {/* BMI Trend */}
          <figure className="card p-6 rounded-3xl">
            <figcaption className="font-bold text-lg mb-4 text-on-surface">شاخص توده بدنی (BMI)</figcaption>
            <div className="h-48 w-full" dir="ltr" role="img" aria-label="نمودار شاخص توده بدنی">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rtlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={bmiDomain} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelStyle={{ fontWeight: 'bold', color: 'var(--color-secondary)' }}
                    formatter={(value: any) => [toPersianDigits(value), 'شاخص توده بدنی']}
                  />
                  <Line type="monotone" dataKey="bmi" stroke="var(--color-secondary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </figure>

          {/* Pain Intensity */}
          <figure className="card p-6 rounded-3xl">
            <figcaption className="font-bold text-lg mb-4 text-on-surface">شدت درد (۰-۱۰)</figcaption>
            <div className="h-64 w-full" dir="ltr" role="img" aria-label="نمودار شدت درد">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rtlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: any) => [toPersianDigits(value), 'شدت درد']}
                  />
                  <Area type="monotone" dataKey="pain" stroke="var(--color-error)" strokeWidth={3} fillOpacity={1} fill="url(#colorPain)" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </figure>

          {/* Grid for Activity and Calories/Water */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Physical Activity */}
            <figure className="card p-6 rounded-3xl">
              <figcaption className="font-bold text-lg mb-4 text-on-surface">فعالیت فیزیکی (دقیقه)</figcaption>
              <div className="h-48 w-full" dir="ltr" role="img" aria-label="نمودار فعالیت فیزیکی">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rtlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(37,99,235,0.08)' }}
                      contentStyle={chartTooltipStyle}
                      formatter={(value: any) => [`${toPersianDigits(value)} دقیقه`, 'فعالیت']}
                    />
                    <Bar dataKey="activity" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </figure>

            {/* Calories & Water Combo (Using Line and Bar) */}
            <figure className="card p-6 rounded-3xl">
              <figcaption className="font-bold text-lg mb-4 text-on-surface">کالری و آب</figcaption>
              <div className="h-48 w-full" dir="ltr" role="img" aria-label="نمودار کالری و آب">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rtlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 4]} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(value: any, name: any) => [
                        name === 'calories' ? `${toPersianDigits(value)} کالری` : `${toPersianDigits(value)} لیتر`,
                        name === 'calories' ? 'کالری' : 'آب'
                      ]}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="calories" stroke="var(--color-tertiary)" strokeWidth={2} dot={false} connectNulls />
                    <Line yAxisId="right" type="monotone" dataKey="water" stroke="var(--color-water)" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </figure>
          </div>
        </>
      )}
    </div>
  );
}
