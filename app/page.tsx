'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HeartPulse, Lock, Waves, Menu, X, UserPlus, Scan, ClipboardList, TrendingUp, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { cn, toPersianDigits } from '@/lib/utils';

const BRAND = 'علاج‌گر';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // The numbers on this page come from the database. They used to be typed
  // in by hand, which meant the page claimed there were 24 foods while the
  // database held more than two hundred.
  const [stats, setStats] = React.useState({
    gyms: 0,
    foods: 0,
    articles: 0,
    exercises: 0,
    users: 0,
    plans: 0,
    bestDiscount: 0,
  });

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/stats', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) return;

        const data = await res.json();
        setStats((previous) => ({ ...previous, ...data }));
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  // Close the mobile menu with Escape.
  React.useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 md:px-16 pb-24 md:pb-8 relative">
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="منوی اصلی"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-surface/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="بستن منو"
              className="absolute top-6 end-6 icon-btn"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col gap-8 text-2xl font-bold text-center">
              <Link href="#services" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">اکوسیستم</Link>
              <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">چگونه کار می‌کند؟</Link>
              <Link href="#gyms" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">شبکه</Link>
              <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface hover:text-primary transition-colors">تماس</Link>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary px-10 py-4 text-xl font-bold w-full text-center">ورود / ثبت‌نام</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <nav className="flex flex-row justify-between items-center w-full py-4 bg-surface-container border border-outline-variant card rounded-full px-6 md:px-8 mb-16 sticky top-4 z-50">
        <div className="text-2xl font-black text-primary tracking-tight">{BRAND}</div>

        {/* Desktop Nav Links - `py-2` gives them a 33px tap target instead of
            a 17px line of text. */}
        <div className="hidden md:flex flex-row gap-2 text-sm font-medium">
          <Link href="#services" className="inline-flex items-center py-2 px-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-container transition-colors">اکوسیستم</Link>
          <Link href="#how-it-works" className="inline-flex items-center py-2 px-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-container transition-colors">چگونه کار می‌کند؟</Link>
          <Link href="#gyms" className="inline-flex items-center py-2 px-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-container transition-colors">شبکه</Link>
          <Link href="#contact" className="inline-flex items-center py-2 px-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary-container transition-colors">تماس</Link>
        </div>

        {/* Desktop Nav CTA */}
        <Link href="/login" className="hidden md:block btn btn-primary btn-md font-bold text-center">ورود / ثبت‌نام</Link>

        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="باز کردن منو"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          className="md:hidden icon-btn"
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Hero */}
      <section className="relative w-full flex flex-col md:flex-row items-center justify-between gap-12 mb-24 md:min-h-[70vh]">
        <div className="flex-1 text-start z-10 flex flex-col gap-6 items-start">
          <div className="inline-block bg-primary/10 text-primary-dark px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
            پیشگام در سلامت دیجیتال
          </div>
          <h1 className="text-4xl md:text-6xl text-on-surface leading-tight font-extrabold">
            {BRAND}:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">هوش مصنوعی</span><br />
            برای سلامت مفاصل و عضلات شما
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl">
            با ترکیب دانش پزشکی و فناوری پیشرفته، مسیر بهبودی خود را هوشمندانه و دقیق طی کنید.
          </p>
          <div className="flex mt-8 w-full sm:w-auto">
             <Link href="/login" className="btn btn-primary px-8 py-4 text-lg font-bold w-full sm:w-auto group">
                <span>شروع ارزیابی هوشمند و سنجش درد</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
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
            className="absolute inset-0 rounded-4xl overflow-hidden bg-surface-container border border-outline-variant card flex items-center justify-center p-8"
          >
             <div className="relative w-full h-full">
                 <Image
                     src="/body-front.png"
                     alt="نقشه بدن برای ثبت نقاط درد"
                     fill
                     className="object-contain"
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
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0" aria-hidden="true"></div>

          {[
            { icon: UserPlus, title: '۱. ثبت‌نام', body: 'اطلاعات اولیه و پروفایل خود را تکمیل کنید.' },
            { icon: Scan, title: '۲. ارزیابی درد', body: 'آزمون‌های هوشمند برای شناسایی دقیق مشکلات.' },
            { icon: ClipboardList, title: '۳. برنامه اختصاصی', body: 'دریافت تمرینات اصلاحی متناسب با شرایط شما.' },
            { icon: TrendingUp, title: '۴. پیشرفت', body: 'پیگیری روند بهبود و تنظیم مجدد برنامه‌ها.' },
          ].map((step) => (
            <div key={step.title} className="relative z-10 flex flex-col items-center text-center card p-6 rounded-3xl">
              <div className="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2">{step.title}</h3>
              <p className="text-sm text-on-surface-variant">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3-App Hub */}
      <section id="services" className="mb-24 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-on-surface">اکوسیستم سلامت {BRAND}</h2>
          <p className="text-on-surface-variant mt-2">یکپارچگی در مسیر درمان</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <HubCard
                active
                href="/login"
                title={BRAND}
                desc="ارزیابی هوشمند و سنجش دقیق درد با استفاده از الگوریتم‌های پیشرفته."
                icon={HeartPulse}
            />
            {/* These two unlock with a subscription. When there is no plan on
                sale they stay "coming soon" - the state comes from the
                database, not from a hard-coded ribbon. */}
            <HubCard
                available={stats.plans > 0}
                href={stats.plans > 0 ? '/login' : undefined}
                title="برنامه تمرینات اصلاحی"
                desc="برنامه‌های تمرینی شخصی‌سازی شده بر اساس ارزیابی‌های اولیه."
                icon={Lock}
            />
            <HubCard
                available={stats.plans > 0}
                href={stats.plans > 0 ? '/login' : undefined}
                title="آب‌درمانی تخصصی"
                desc="پروتکل‌های درمانی در آب برای تسریع روند بهبودی مفاصل."
                icon={Waves}
            />
        </div>
      </section>

      {/* Stats Section - the numbers come from the database */}
      <section id="stats" className="mb-24 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: toPersianDigits(stats.foods), label: 'نوع غذا' },
            { value: '۰–۱۰۰', label: 'امتیاز سلامت' },
            { value: toPersianDigits(stats.gyms), label: 'باشگاه شریک' },
            { value: toPersianDigits(stats.articles), label: 'مطلب آموزشی' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center justify-center p-6 bg-surface-variant rounded-3xl border border-outline-variant/20">
              <span className="text-4xl font-black text-primary mb-2" dir="ltr">{stat.value}</span>
              <span className="text-sm font-medium text-on-surface-variant">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Gyms / Discount Banner */}
      <section id="gyms" className="mb-24 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-on-surface">شبکه شرکای ما</h2>
          <p className="text-on-surface-variant mt-2">{BRAND} در بهترین باشگاه‌های سلامت</p>
        </div>
         <div className="relative overflow-hidden rounded-4xl bg-gradient-to-l from-primary to-secondary p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
           <div className="relative z-10 text-start flex-1">
              <h3 className="text-3xl font-bold mb-4">بسته جامع سلامت مفاصل</h3>
              <p className="text-lg text-white/90">
                با تهیه اشتراک ویژه، به تمامی امکانات اکوسیستم با تخفیف ویژه دسترسی پیدا کنید و از خدمات حضوری باشگاه‌های شریک بهره‌مند شوید.
              </p>
           </div>
           <div className="relative z-10 flex flex-col items-center justify-center bg-white/15 backdrop-blur-md p-8 rounded-3xl border border-white/30">
              <span className="text-sm text-white/90 mb-1 tracking-widest font-bold">تخفیف ویژه</span>
              <span className="text-6xl font-black drop-shadow-md">{toPersianDigits(stats.bestDiscount)}٪</span>
              <Link href="/login" className="btn mt-6 bg-surface-container text-primary font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-xl text-center">
                دریافت پیشنهاد
              </Link>
           </div>
         </div>
      </section>

        {/* Footer */}
      <footer id="contact" className="border-t border-outline-variant/30 pt-12 pb-8 px-4 text-center md:text-start">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-black text-primary tracking-tight mb-4">{BRAND}</h3>
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
          <p>© {new Date().getFullYear()} {BRAND}. تمامی حقوق محفوظ است.</p>
        </div>
      </footer>
    </div>
  );
}

function HubCard({
  active = false,
  available = false,
  title,
  desc,
  icon: Icon,
  href,
}: {
  active?: boolean;
  /** The feature is available (there is a plan on sale). */
  available?: boolean;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}) {
    const content = (
        <>
            {!active && (
                /* The old overlay blurred the whole card and repeated the icon,
                   which made the locked cards look broken rather than
                   deliberately unavailable. The badge sits in the corner so it
                   never overlaps the card copy. */
                <div className="absolute inset-0 bg-surface/35 backdrop-blur-[1px] z-20">
                    <span className="absolute top-4 left-4 text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant shadow-sm">
                        {available ? 'با اشتراک ویژه' : 'به زودی'}
                    </span>
                </div>
            )}
            {active && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" aria-hidden="true"></div>}

            <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl", active ? "bg-primary/10" : "bg-surface-variant")}>
                    <Icon className={cn("w-8 h-8", active ? "text-primary" : "text-on-surface-variant")} />
                </div>
                {active && <span className="bg-primary text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-md">فعال</span>}
            </div>

            <h3 className="text-xl font-bold text-on-surface mb-3">{title}</h3>
            <p className="text-on-surface-variant text-base leading-relaxed mb-6">{desc}</p>

            {active && (
                <div className="flex items-center text-primary font-bold text-sm gap-2 transition-all group-hover:gap-3">
                    <span>ورود به سامانه</span>
                    <ArrowLeft className="w-4 h-4" />
                </div>
            )}
        </>
    );

    const cardClass = cn(
        "bg-surface-container border border-outline-variant card p-8 rounded-3xl relative overflow-hidden group transition-all duration-300",
        active
            ? "border-2 border-primary shadow-[0_15px_40px_rgba(37,99,235,0.15)] hover:-translate-y-2 cursor-pointer"
            : available
              ? "opacity-90 hover:-translate-y-1 cursor-pointer"
              : "opacity-90 cursor-not-allowed"
    );

    if (!href) {
        return <div className={cardClass}>{content}</div>;
    }

    return (
        <Link href={href} className={cardClass}>
            {content}
        </Link>
    );
}
