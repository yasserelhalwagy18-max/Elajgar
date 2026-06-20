'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowLeft, HeartPulse, Lock, Waves, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 md:px-16 pb-24 md:pb-8">
      {/* Top Nav */}
      <nav className="hidden md:flex flex-row-reverse justify-between items-center w-full py-4 glass-panel rounded-full px-8 mb-16 sticky top-4 z-50">
        <div className="text-2xl font-black text-primary tracking-tight">Elajgar</div>
        <div className="flex flex-row-reverse gap-8 text-sm font-medium">
          <Link href="#" className="text-primary font-bold border-b-2 border-primary pb-1">اکوسیستم</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">خدمات</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">شبکه</Link>
          <Link href="#" className="text-on-surface-variant hover:text-primary transition-colors">تماس</Link>
        </div>
        <Link href="/wizard">
          <button className="btn-primary-glass px-8 py-2.5 rounded-full text-sm font-bold">ورود / ثبت‌نام</button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative w-full flex flex-col md:flex-row-reverse items-center justify-between gap-12 mb-24 md:min-h-[70vh]">
        <div className="flex-1 text-right z-10 flex flex-col gap-6 items-end">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20 backdrop-blur-md">
            پیشگام در سلامت دیجیتال
          </div>
          <h1 className="text-4xl md:text-6xl text-on-surface leading-tight font-extrabold">
            علاج‌گر:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary-container">هوش مصنوعی</span><br />
            برای سلامت مفاصل و عضلات شما
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl">
            با ترکیب دانش پزشکی و فناوری پیشرفته، مسیر بهبودی خود را هوشمندانه و دقیق طی کنید.
          </p>
          <div className="flex mt-8 gap-4">
             <Link href="/wizard">
                <button className="btn-primary-glass px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 group">
                <span>شروع ارزیابی هوشمند و سنجش درد</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
             </Link>
          </div>
        </div>
        
        <div className="flex-1 relative z-10 w-full aspect-square md:aspect-auto md:h-[500px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-tr from-surface-variant to-surface rounded-[2.5rem] overflow-hidden glass-panel flex items-center justify-center shadow-2xl shadow-primary/10 p-8"
          >
             <div className="relative w-full h-full">
                <Image 
                    src="https://picsum.photos/seed/elajgar/800/800" 
                    alt="3D Medical Illustration"
                    fill
                    className="object-contain opacity-90 drop-shadow-2xl mix-blend-multiply"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
             </div>
          </motion.div>
        </div>
      </section>

      {/* 3-App Hub */}
      <section className="mb-24 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-on-surface">اکوسیستم سلامت علاج‌گر</h2>
          <p className="text-on-surface-variant mt-2">یکپارچگی در مسیر درمان</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HubCard 
                active 
                title="علاج‌گر" 
                desc="ارزیابی هوشمند و سنجش دقیق درد با استفاده از الگوریتم‌های پیشرفته."
                icon={HeartPulse}
            />
            <HubCard 
                title="برنامه تمرینات اصلاحی" 
                desc="برنامه‌های تمرینی شخصی‌سازی شده بر اساس ارزیابی‌های اولیه."
                icon={Lock}
            />
            <HubCard 
                title="آب‌درمانی تخصصی" 
                desc="پروتکل‌های درمانی در آب برای تسریع روند بهبودی مفاصل."
                icon={Waves}
            />
        </div>
      </section>

      {/* Discount Banner */}
      <section className="mb-24 relative overflow-hidden rounded-[2.5rem] glass-card bg-gradient-to-r from-primary/90 to-secondary/90 p-8 md:p-12 text-white flex flex-col md:flex-row-reverse items-center justify-between gap-8 shadow-2xl">
         <div className="relative z-10 text-right flex-1">
            <h3 className="text-3xl font-bold mb-4">بسته جامع سلامت مفاصل</h3>
            <p className="text-lg text-primary-fixed opacity-90">با تهیه اشتراک ویژه، به تمامی امکانات اکوسیستم با تخفیف ویژه دسترسی پیدا کنید.</p>
         </div>
         <div className="relative z-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-inner">
            <span className="text-sm text-primary-fixed mb-1 tracking-widest font-bold">تخفیف ویژه</span>
            <span className="text-6xl font-black drop-shadow-md">۴۰٪</span>
            <button className="mt-6 bg-white text-primary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-xl">دریافت پیشنهاد</button>
         </div>
      </section>
      
    </div>
  );
}

function HubCard({ active = false, title, desc, icon: Icon }: { active?: boolean, title: string, desc: string, icon: any }) {
    return (
        <div className={cn(
            "glass-panel p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-300",
            active ? "border-2 border-primary/50 shadow-[0_15px_40px_rgba(37,99,235,0.15)] hover:-translate-y-2 cursor-pointer bg-white/60" : "opacity-75 grayscale-[30%] cursor-not-allowed"
        )}>
            {!active && (
                <div className="absolute inset-0 bg-surface/30 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
                    <div className="bg-white/80 p-3 rounded-full shadow-lg mb-2"><Icon className="w-6 h-6 text-outline" /></div>
                    <span className="text-sm font-bold text-outline bg-white/80 px-3 py-1 rounded-full">به زودی</span>
                </div>
            )}
            {active && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>}
            
            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl", active ? "bg-primary/10" : "bg-surface-variant")}>
                    <Icon className={cn("w-8 h-8", active ? "text-primary" : "text-on-surface-variant")} />
                </div>
                {active && <span className="bg-primary text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md">فعال</span>}
            </div>
            
            <h3 className="text-xl font-bold text-on-surface mb-3">{title}</h3>
            <p className="text-on-surface-variant text-base leading-relaxed mb-6">{desc}</p>
            
            {active && (
                <div className="flex items-center text-primary font-bold text-sm group-hover:gap-3 gap-2 transition-all">
                    <span>ورود به سامانه</span>
                    <ArrowLeft className="w-4 h-4" />
                </div>
            )}
        </div>
    );
}
