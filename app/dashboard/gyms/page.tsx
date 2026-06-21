'use client';

import * as React from 'react';
import Image from 'next/image';
import { Search, MapPin, Star, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const GymMap = dynamic(() => import('@/components/GymMap'), { ssr: false });

export default function GymsPage() {
    return (
        <div className="p-6 pb-32">
            <header className="glass-panel sticky top-0 z-40 px-6 py-5 rounded-[2rem] mb-6 shadow-sm border border-white/60 mt-2">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary tracking-tight">شبکه سلامت</h1>
                        <p className="text-sm text-on-surface-variant mt-1">باشگاه‌های شریک و تخفیف‌ها</p>
                    </div>
                    <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-outline-variant/20 hover:bg-surface-variant transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Map Section */}
            <GymMap />

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-2">
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-[0_4px_15px_rgba(37,99,235,0.3)]">
                    همه
                </button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full glass-card text-on-surface-variant font-bold text-sm border-white/60">
                    یوگا
                </button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full glass-card text-on-surface-variant font-bold text-sm border-white/60">
                    استخر
                </button>
                <button className="whitespace-nowrap px-6 py-2.5 rounded-full glass-card text-on-surface-variant font-bold text-sm border-white/60">
                    کراس‌فیت
                </button>
            </div>

            {/* Gym List */}
            <div className="flex flex-col gap-6">
                <GymCard 
                    name="مجموعه ورزشی اکسیژن"
                    location="تهران، نیاوران"
                    discount="۳۰٪ تخفیف ویژه"
                    rating={4.8}
                    desc="تجهیزات بدنسازی مدرن، استخر، سونا و کلاس‌های گروهی یوگا و پیلاتس."
                    imageSeed="gym_modern"
                />
                
                <GymCard 
                    name="استودیو یوگا پرانا"
                    location="تهران، شهرک غرب"
                    discount="پکیج‌های سلامت"
                    rating={4.9}
                    desc="مرکز تخصصی یوگا، مدیتیشن و سلامت روان با مربیان بین‌المللی."
                    imageSeed="yoga_studio"
                    isPremium
                />
            </div>
        </div>
    );
}

function GymCard({ name, location, discount, rating, desc, imageSeed, isPremium }: any) {
    return (
        <article className="glass-card rounded-[2.5rem] overflow-hidden relative group border-2 border-white/80 shadow-[0_10px_30px_rgba(37,99,235,0.08)]">
            <div className={cn(
                "absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg",
                isPremium ? "bg-white/90 backdrop-blur-md text-primary border border-primary/20" : "bg-gradient-to-r from-primary to-secondary text-white border border-white/20"
            )}>
                <Tag className="w-4 h-4" />
                {discount}
            </div>

            <div className="relative h-56 w-full">
                <Image 
                    src={`https://picsum.photos/seed/${imageSeed}/600/400`}
                    alt={name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md border border-white/40 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-on-surface">{name}</h2>
                    <div className="flex items-center gap-1 bg-surface-variant/50 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-sm">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                </div>
                
                <p className="text-on-surface-variant text-sm line-clamp-2 mb-6 leading-relaxed">
                    {desc}
                </p>

                <button className={cn(
                    "w-full py-3.5 rounded-2xl font-bold text-sm flex justify-center items-center",
                    isPremium ? "glass-panel text-primary border-primary/20" : "bg-primary-container text-on-primary-container shadow-md"
                )}>
                    مشاهده جزئیات و رزرو
                </button>
            </div>
        </article>
    );
}
