'use client';

import * as React from 'react';
import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '@/lib/store';
import { toDateKey, formatPersianNumber } from '@/lib/utils';
import { Droplet } from 'lucide-react';
import { IconBadge } from '@/components/ui/IconBadge';

function HydrationTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0]?.value;

  return (
    <div className="card p-2.5 shadow-raised border border-outline-variant bg-surface-container text-on-surface text-xs rounded-2xl space-y-0.5">
      <p className="font-bold text-water">{label}</p>
      <p className="tabular-nums font-bold text-on-surface">
        {formatPersianNumber(value)}{' '}
        <span className="font-normal text-on-surface-variant text-[11px]">لیتر</span>
      </p>
    </div>
  );
}

export default function HydrationChart() {
  const userProfile = useStore((state) => state.userProfile);

  const chartData = useMemo(() => {
    if (!userProfile) return { data: [], hasEnoughData: false };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const generatedData: { day: string; amount: number }[] = [];
    let validEntriesCount = 0;

    const formatter = new Intl.DateTimeFormat('fa-IR', { weekday: 'long' });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      // Local calendar day - must match the key used when writing logs.
      const dateStr = toDateKey(d);

      const dayLabel = formatter.format(d);

      const log = userProfile.dailyLogs?.find((l) => l.date === dateStr);

      if (log) {
        validEntriesCount++;
      }

      const amount = log?.waterIntake ? Number((log.waterIntake / 1000).toFixed(1)) : 0;

      generatedData.push({ day: dayLabel, amount });
    }

    return { data: generatedData, hasEnoughData: validEntriesCount >= 3 };
  }, [userProfile]);

  const { data: activeData, hasEnoughData } = chartData;

  // The app reads right-to-left, so the newest day sits on the left
  const rtlData = useMemo(() => [...activeData].reverse(), [activeData]);

  const yMax = useMemo(() => {
    const maxAmount = Math.max(...activeData.map((d) => d.amount), 0);
    return Math.max(3, Math.ceil(maxAmount));
  }, [activeData]);

  if (!hasEnoughData) {
    return (
      <div className="flex flex-col items-center justify-center h-[150px] mt-4 text-center gap-2">
        <IconBadge variant="hydration" icon={Droplet} size={20} />
        <p className="text-on-surface-variant text-xs">
          هنوز داده کافی ندارید. بعد از چند روز استفاده، نمودار نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-[150px] mt-4 relative"
      dir="ltr"
      role="img"
      aria-label="نمودار مصرف آب هفت روز گذشته"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rtlData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="hydration-area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-water)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--color-water)" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--color-outline-variant)"
            opacity={0.35}
          />
          <XAxis
            dataKey="day"
            tick={{
              fill: 'var(--color-on-surface-variant)',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatPersianNumber(v)}
          />
          <YAxis
            domain={[0, yMax]}
            tick={{
              fill: 'var(--color-on-surface-variant)',
              fontSize: 11,
              fontFamily: 'var(--font-sans)',
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatPersianNumber(v)}
          />
          <Tooltip content={<HydrationTooltip />} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="var(--color-water)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#hydration-area-gradient)"
            dot={{
              r: 3.5,
              strokeWidth: 2,
              fill: 'var(--color-surface-container)',
              stroke: 'var(--color-water)',
            }}
            activeDot={{
              r: 5,
              stroke: 'var(--color-water)',
              strokeWidth: 2,
              fill: 'var(--color-surface-container)',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
