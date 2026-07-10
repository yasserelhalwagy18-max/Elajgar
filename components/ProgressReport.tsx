'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { DailyHealthData, buildHealthDataFromLogs } from '@/lib/healthScore';
import { useStore } from '@/lib/store';

export default function ProgressReport() {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const userProfile = useStore((state) => state.userProfile);

  const chartData = useMemo(() => {
    const days = timeRange === '7' ? 7 : 30;
    return buildHealthDataFromLogs(userProfile, days);
  }, [timeRange, userProfile]);

  const { data, hasEnoughData } = chartData;

  return (
    <div className="flex flex-col gap-6 mt-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-on-surface">گزارش پیشرفت</h2>

        {/* Toggle Switch */}
        <div className="flex bg-surface-variant/50 p-1 rounded-xl">
          <button
            onClick={() => setTimeRange('7')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === '7' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            ۷ روز
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === '30' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            ۱ ماه
          </button>
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="bg-white border border-outline-variant/20 p-8 rounded-3xl shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center gap-4">
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
      <div className="glass-panel p-6 rounded-[2rem] border-white/60 shadow-md">
        <h3 className="font-bold text-lg mb-4 text-on-surface">روند وزن (کیلوگرم)</h3>
        <div className="h-64 w-full dir-ltr" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--primary)' }}
                formatter={(value: any) => [`${value} kg`, 'وزن']}
              />
              <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BMI Trend */}
      <div className="glass-panel p-6 rounded-[2rem] border-white/60 shadow-md">
        <h3 className="font-bold text-lg mb-4 text-on-surface">شاخص توده بدنی (BMI)</h3>
        <div className="h-48 w-full dir-ltr" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--secondary)' }}
                formatter={(value: any) => [`${value}`, 'BMI']}
              />
              <Line type="monotone" dataKey="bmi" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pain Intensity */}
      <div className="glass-panel p-6 rounded-[2rem] border-white/60 shadow-md">
        <h3 className="font-bold text-lg mb-4 text-on-surface">شدت درد (۰-۱۰)</h3>
        <div className="h-64 w-full dir-ltr" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--error)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--error)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value: any) => [value, 'درد']}
              />
              <Area type="monotone" dataKey="pain" stroke="var(--error)" strokeWidth={3} fillOpacity={1} fill="url(#colorPain)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Activity and Calories/Water */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Activity */}
        <div className="glass-panel p-6 rounded-[2rem] border-white/60 shadow-md">
          <h3 className="font-bold text-lg mb-4 text-on-surface">فعالیت فیزیکی (دقیقه)</h3>
          <div className="h-48 w-full dir-ltr" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.5)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`${value} min`, 'فعالیت']}
                />
                <Bar dataKey="activity" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calories & Water Combo (Using Line and Bar) */}
        <div className="glass-panel p-6 rounded-[2rem] border-white/60 shadow-md">
          <h3 className="font-bold text-lg mb-4 text-on-surface">کالری و آب</h3>
          <div className="h-48 w-full dir-ltr" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--on-surface-variant)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: any, name: any) => [
                    name === 'calories' ? `${value} kcal` : `${value} L`,
                    name === 'calories' ? 'کالری' : 'آب'
                  ]}
                />
                <Line yAxisId="left" type="monotone" dataKey="calories" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
