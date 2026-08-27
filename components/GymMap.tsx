'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { MapPin, Star, Percent, Construction } from 'lucide-react';
import { Gym } from '@prisma/client';

const gymCategoryLabels: Record<string, string> = {
    YOGA: 'یوگا',
    POOL: 'استخر',
    CROSSFIT: 'کراس‌فیت',
    MARTIAL_ARTS: 'هنرهای رزمی',
    GENERAL: 'عمومی'
};

export default function GymMap() {
    const [gyms, setGyms] = useState<Gym[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGyms() {
            try {
                const res = await fetch('/api/gyms');
                if (!res.ok) throw new Error('خطا در دریافت اطلاعات باشگاه‌ها');
                const data = await res.json();
                setGyms(data);
            } catch (err: any) {
                setError(err.message || 'مشکلی پیش آمد');
            } finally {
                setLoading(false);
            }
        }
        fetchGyms();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card animate-pulse h-32"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card text-center text-red-500 mb-6 p-6">
                {error}
            </div>
        );
    }

    if (gyms.length === 0) {
        return (
            <div className="glass-card text-center text-on-surface-variant mb-6 p-6">
                هیچ باشگاهی یافت نشد.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 mb-6">
            {gyms.map((gym) => (
                <div key={gym.id} className="glass-card relative overflow-hidden">
                    {/* Placeholder Badge */}
                    {gym.isPlaceholder && (
                        <div className="absolute top-3 left-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                            <Construction size={12} />
                            <span>نمونه (بزودی)</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-on-surface">{gym.name}</h3>
                            <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                {gym.rating} <Star size={14} className="fill-yellow-700" />
                            </div>
                        </div>

                        {/* Location */}
                        <p className="text-sm text-on-surface-variant flex items-center gap-1.5">
                            <MapPin size={16} className="text-primary shrink-0" />
                            <span className="truncate">{gym.location}</span>
                        </p>

                        {/* Footer: Category & Discount */}
                        <div className="flex justify-between items-center mt-1 border-t border-white/40 pt-3">
                            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                                {gymCategoryLabels[gym.category] || gym.category}
                            </span>

                            {gym.discountPercentage > 0 && (
                                <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 flex items-center gap-1">
                                    <Percent size={12} />
                                    {gym.discountPercentage}٪ تخفیف
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
