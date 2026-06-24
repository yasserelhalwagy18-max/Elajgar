'use client';

import * as React from 'react';
import Image from 'next/image';
import { Search, MapPin, Star, Tag, CheckCircle2, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const GymMap = dynamic(() => import('@/components/GymMap'), { ssr: false });

// Mock Gym Data
const MOCK_GYMS = [
    {
        id: 'gym-1',
        name: 'مجموعه ورزشی اکسیژن',
        location: 'تهران، نیاوران',
        discount: '۳۰٪ تخفیف ویژه',
        discountCode: 'ELAJ-OXYGEN-30',
        rating: 4.8,
        desc: 'تجهیزات بدنسازی مدرن، استخر، سونا و کلاس‌های گروهی یوگا و پیلاتس.',
        imageSeed: 'gym_modern',
        tags: ['همه', 'استخر', 'کراس‌فیت'],
        isPremium: false,
    },
    {
        id: 'gym-2',
        name: 'استودیو یوگا پرانا',
        location: 'تهران، شهرک غرب',
        discount: 'پکیج‌های سلامت',
        discountCode: 'ELAJ-PRANA-VIP',
        rating: 4.9,
        desc: 'مرکز تخصصی یوگا، مدیتیشن و سلامت روان با مربیان بین‌المللی.',
        imageSeed: 'yoga_studio',
        tags: ['همه', 'یوگا'],
        isPremium: true,
    },
    {
        id: 'gym-3',
        name: 'باشگاه کراس‌فیت آلفا',
        location: 'تهران، سعادت‌آباد',
        discount: '۲۰٪ تخفیف ثبت‌نام',
        discountCode: 'ELAJ-ALPHA-20',
        rating: 4.7,
        desc: 'بزرگترین سالن کراس‌فیت با مربیان مجرب و تجهیزات استاندارد مسابقات.',
        imageSeed: 'crossfit_box',
        tags: ['همه', 'کراس‌فیت'],
        isPremium: false,
    },
    {
        id: 'gym-4',
        name: 'مجموعه آبی آرامیس',
        location: 'تهران، فرمانیه',
        discount: '۱۵٪ تخفیف آب‌درمانی',
        discountCode: 'ELAJ-ARAMIS-AQUA',
        rating: 4.6,
        desc: 'استخر قهرمانی، خدمات تخصصی آب‌درمانی و ماساژ، مناسب برای ریکاوری مفاصل.',
        imageSeed: 'swimming_pool',
        tags: ['همه', 'استخر'],
        isPremium: false,
    }
];

const FILTERS = ['همه', 'یوگا', 'استخر', 'کراس‌فیت'];

export default function GymsPage() {
    const [activeFilter, setActiveFilter] = React.useState('همه');

    const filteredGyms = React.useMemo(() => {
        return MOCK_GYMS.filter(gym => gym.tags.includes(activeFilter));
    }, [activeFilter]);

    return (
        <div className="p-6 pb-32 max-w-2xl mx-auto">
            <header className="bg-white border border-outline-variant/20 shadow-sm sticky top-0 z-40 px-6 py-5 rounded-[2rem] mb-8 mt-2">
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
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-2 mt-4">
                {FILTERS.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={cn(
                            "whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all",
                            activeFilter === filter
                                ? "bg-primary text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)]"
                                : "bg-white border border-outline-variant/20 shadow-sm text-on-surface-variant  hover:bg-white/40"
                        )}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Gym List */}
            <div className="flex flex-col gap-6 mt-4">
                {filteredGyms.map(gym => (
                    <GymCard key={gym.id} {...gym} />
                ))}
            </div>
        </div>
    );
}

function GymCard({ name, location, discount, discountCode, rating, desc, imageSeed, isPremium }: any) {
    const [isClaimed, setIsClaimed] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleClaim = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsClaimed(true);
    };

    return (
        <article
            className="bg-white rounded-[2rem] overflow-hidden relative group border border-outline-variant/20 shadow-sm transition-all hover:shadow-md cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className={cn(
                "absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm",
                isPremium ? "bg-white/90 backdrop-blur-md text-primary" : "bg-primary text-white"
            )}>
                <Tag className="w-4 h-4" />
                {discount}
            </div>

            <div className="relative h-48 w-full">
                <Image 
                    src={`https://picsum.photos/seed/${imageSeed}/600/400`}
                    alt={name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-on-surface">{name}</h2>
                    <div className="flex items-center gap-1 bg-surface/50 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-sm">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                </div>
                
                <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 leading-relaxed">
                    {desc}
                </p>

                {isExpanded && (
                    <div className="mb-4 p-4 bg-surface rounded-2xl border border-outline-variant/30 animate-in fade-in slide-in-from-top-2">
                        {isClaimed ? (
                            <div className="flex flex-col items-center text-center gap-2">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mb-1" />
                                <p className="text-sm font-medium text-on-surface-variant">کد تخفیف شما با موفقیت صادر شد!</p>
                                <div className="bg-white px-6 py-3 rounded-xl border border-dashed border-primary text-primary font-mono font-bold text-lg mt-2 w-full select-all">
                                    {discountCode}
                                </div>
                                <p className="text-xs text-outline mt-1">هنگام مراجعه به باشگاه این کد را ارائه دهید.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center gap-3">
                                <Ticket className="w-8 h-8 text-primary opacity-80" />
                                <p className="text-sm text-on-surface-variant">شما می‌توانید از تخفیف اختصاصی علاج‌گر برای این مجموعه استفاده کنید.</p>
                                <button
                                    onClick={handleClaim}
                                    className="w-full mt-2 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-sm hover:bg-primary/90 transition-colors"
                                >
                                    دریافت کد تخفیف
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className={cn(
                        "w-full py-3 rounded-xl font-bold text-sm flex justify-center items-center transition-colors",
                        isExpanded ? "bg-surface text-on-surface-variant" : "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                >
                    {isExpanded ? 'بستن' : 'مشاهده جزئیات و دریافت تخفیف'}
                </button>
            </div>
        </article>
    );
}
