'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HeartPulse, Lock, Waves, Percent, Menu, X, UserPlus, Scan, ClipboardList, TrendingUp, ShieldCheck, Sparkles, AlertCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 md:px-16 pb-24 md:pb-8 relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/80 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-on-surface hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col gap-8 text-2xl font-bold text-center">
              <Link href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">اکوسیستم</Link>
              <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">خدمات</Link>
              <Link href="#gyms" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">شبکه</Link>
              <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">تماس</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="mt-4">
                <button className="btn-primary-glass px-10 py-4 rounded-full text-xl font-bold w-full">ورود / ثبت‌نام</button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <nav className="flex flex-row-reverse justify-between items-center w-full py-4 bg-white border border-outline-variant/20 shadow-sm rounded-full px-6 md:px-8 mb-16 sticky top-4 z-50">
        <div className="text-2xl font-black text-primary tracking-tight">Elajgar</div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex flex-row-reverse gap-8 text-sm font-medium">
          <Link href="#services" className="text-on-surface-variant hover:text-primary transition-colors">اکوسیستم</Link>
          <Link href="#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors">خدمات</Link>
          <Link href="#gyms" className="text-on-surface-variant hover:text-primary transition-colors">شبکه</Link>
          <Link href="#contact" className="text-on-surface-variant hover:text-primary transition-colors">تماس</Link>
        </div>

        {/* Desktop Nav CTA */}
        <Link href="/login" className="hidden md:block">
          <button className="btn-primary-glass px-8 py-2.5 rounded-full text-sm font-bold">ورود / ثبت‌نام</button>
        </Link>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-on-surface hover:text-primary transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
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
             <Link href="/login">
                <button className="btn-primary-glass px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 group">
                <span>شروع ارزیابی هوشمند و سنجش درد</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
             </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium bg-surface-variant px-3 py-1.5 rounded-full border border-outline-variant/30">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>حریم خصوصی محفوظ</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium bg-surface-variant px-3 py-1.5 rounded-full border border-outline-variant/30">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>هوش مصنوعی</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium bg-surface-variant px-3 py-1.5 rounded-full border border-outline-variant/30">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>توصیه پزشکی نیست</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 relative z-10 w-full aspect-square md:aspect-auto md:h-[500px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-tr from-surface-variant to-surface rounded-[2.5rem] overflow-hidden bg-white border border-outline-variant/20 shadow-sm flex items-center justify-center shadow-2xl shadow-primary/10 p-8"
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

      {/* How it Works Section */}
      <section id="how-it-works" className="mb-24 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-on-surface">چگونه کار می‌کند؟</h2>
          <p className="text-on-surface-variant mt-2">مسیر ساده شما به سوی سلامتی</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0"></div>

          <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4 shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">۱. ثبت‌نام</h3>
            <p className="text-sm text-on-surface-variant">اطلاعات اولیه و پروفایل خود را تکمیل کنید.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Scan className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">۲. ارزیابی درد</h3>
            <p className="text-sm text-on-surface-variant">آزمون‌های هوشمند برای شناسایی دقیق مشکلات.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4 shadow-inner">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">۳. برنامه اختصاصی</h3>
            <p className="text-sm text-on-surface-variant">دریافت تمرینات اصلاحی متناسب با شرایط شما.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center bg-white p-6 rounded-3xl border border-outline-variant/20 shadow-sm">
            <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4 shadow-inner">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">۴. پیشرفت</h3>
            <p className="text-sm text-on-surface-variant">پیگیری روند بهبود و تنظیم مجدد برنامه‌ها.</p>
          </div>
        </div>
      </section>

      {/* 3-App Hub */}
      <section id="services" className="mb-24 px-4">
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

      {/* Stats Section */}
      <section id="stats" className="mb-24 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-surface-variant rounded-3xl border border-outline-variant/20">
            <span className="text-4xl font-black text-primary mb-2">۱۲</span>
            <span className="text-sm font-medium text-on-surface-variant">مرحله ارزیابی</span>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-surface-variant rounded-3xl border border-outline-variant/20">
            <span className="text-4xl font-black text-primary mb-2">۲۴</span>
            <span className="text-sm font-medium text-on-surface-variant">نوع غذا</span>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-surface-variant rounded-3xl border border-outline-variant/20">
            <span className="text-4xl font-black text-primary mb-2" dir="ltr">۰–۱۰۰</span>
            <span className="text-sm font-medium text-on-surface-variant">امتیاز سلامت</span>
          </div>
          <div className="flex flex-col items-center justify-center p-6 bg-surface-variant rounded-3xl border border-outline-variant/20">
            <span className="text-4xl font-black text-primary mb-2">۴</span>
            <span className="text-sm font-medium text-on-surface-variant">باشگاه شریک</span>
          </div>
        </div>
      </section>

      {/* Gyms / Discount Banner */}
      <section id="gyms" className="mb-24 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-on-surface">شبکه شرکای ما</h2>
          <p className="text-on-surface-variant mt-2">علاج‌گر در بهترین باشگاه‌های سلامت</p>
        </div>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-outline-variant/20 shadow-sm bg-gradient-to-r from-primary/90 to-secondary/90 p-8 md:p-12 text-white flex flex-col md:flex-row-reverse items-center justify-between gap-8 shadow-2xl">
           <div className="relative z-10 text-right flex-1">
              <h3 className="text-3xl font-bold mb-4">بسته جامع سلامت مفاصل</h3>
              <p className="text-lg text-primary-fixed opacity-90">با تهیه اشتراک ویژه، به تمامی امکانات اکوسیستم با تخفیف ویژه دسترسی پیدا کنید و از خدمات حضوری باشگاه‌های شریک بهره‌مند شوید.</p>
           </div>
           <div className="relative z-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-inner">
              <span className="text-sm text-primary-fixed mb-1 tracking-widest font-bold">تخفیف ویژه</span>
              <span className="text-6xl font-black drop-shadow-md">۴۰٪</span>
              <Link href="/login">
                <button className="mt-6 bg-white text-primary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-xl">دریافت پیشنهاد</button>
              </Link>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mb-24 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-on-surface">نظرات کاربران</h2>
          <p className="text-on-surface-variant mt-2">داستان موفقیت و بهبودی همراهان علاج‌گر</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="flex gap-1 mb-4 text-amber-400">
              <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
            </div>
            <p className="text-on-surface-variant leading-relaxed mb-6 flex-1">
              &quot;کمردرد مزمن من با استفاده از برنامه‌های اصلاحی علاج‌گر در کمتر از دو ماه به شدت کاهش یافت. واقعاً سیستم هوشمند و دقیقی دارد!&quot;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-container text-primary rounded-full flex items-center justify-center font-bold text-lg">س</div>
              <div>
                <h4 className="font-bold text-on-surface">سارا محمدی</h4>
                <span className="text-xs text-on-surface-variant">کاربر اشتراک ویژه</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="flex gap-1 mb-4 text-amber-400">
              <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
            </div>
            <p className="text-on-surface-variant leading-relaxed mb-6 flex-1">
              &quot;ارزیابی اولیه بسیار دقیق بود و تمریناتی که به من پیشنهاد شد، کاملاً با شرایط بدنی‌ام همخوانی داشت. رابط کاربری هم بسیار ساده است.&quot;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-container text-secondary rounded-full flex items-center justify-center font-bold text-lg">ع</div>
              <div>
                <h4 className="font-bold text-on-surface">علی رضایی</h4>
                <span className="text-xs text-on-surface-variant">ورزشکار آسیب‌دیده</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-outline-variant/20 shadow-sm flex flex-col">
            <div className="flex gap-1 mb-4 text-amber-400">
              <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5" />
            </div>
            <p className="text-on-surface-variant leading-relaxed mb-6 flex-1">
              &quot;پشتیبانی عالی و تمرینات آب‌درمانی که پیشنهاد دادند، باعث شد خیلی سریع‌تر از چیزی که فکر می‌کردم به فعالیت‌های روزمره‌ام برگردم.&quot;
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-tertiary-container text-tertiary rounded-full flex items-center justify-center font-bold text-lg">م</div>
              <div>
                <h4 className="font-bold text-on-surface">مریم کریمی</h4>
                <span className="text-xs text-on-surface-variant">کاربر علاج‌گر</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer id="contact" className="border-t border-outline-variant/30 pt-12 pb-8 px-4 text-center md:text-right">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black text-primary tracking-tight mb-4">Elajgar</h3>
            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mx-auto md:mx-0">
              پلتفرم جامع هوشمند برای سلامت مفاصل، ارزیابی درد و ارائه برنامه‌های تمرینی اختصاصی با بهره‌گیری از هوش مصنوعی.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">دسترسی سریع</h4>
            <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <Link href="#how-it-works" className="hover:text-primary transition-colors">چگونه کار می‌کند؟</Link>
              <Link href="#services" className="hover:text-primary transition-colors">اکوسیستم سلامت</Link>
              <Link href="#gyms" className="hover:text-primary transition-colors">شبکه باشگاه‌ها</Link>
              <Link href="/login" className="hover:text-primary transition-colors">ورود / ثبت‌نام</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">پشتیبانی</h4>
            <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <span dir="ltr" className="text-right inline-block w-full">021 - 12345678</span>
              <span dir="ltr" className="text-right inline-block w-full">support@elajgar.com</span>
              <span className="mt-2">تهران، خیابان ولیعصر، برج نوآوری</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-outline-variant/30 text-sm text-on-surface-variant gap-4">
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">شرایط استفاده</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">حریم خصوصی</Link>
          </div>
          <p>© {new Date().getFullYear()} علاج‌گر. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
}

function HubCard({ active = false, title, desc, icon: Icon }: { active?: boolean, title: string, desc: string, icon: any }) {
    return (
        <div className={cn(
            "bg-white border border-outline-variant/20 shadow-sm p-8 rounded-[2rem] relative overflow-hidden group transition-all duration-300",
            active ? "border-2  shadow-[0_15px_40px_rgba(37,99,235,0.15)] hover:-translate-y-2 cursor-pointer bg-white/60" : "opacity-75 grayscale-[30%] cursor-not-allowed"
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
