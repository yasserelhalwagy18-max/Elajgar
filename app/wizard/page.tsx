'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowLeft, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BodySection } from '@/types';

type WizardData = {
    step: number;
    phone: string;
    code: string;
    fullName: string;
    age: string;
    gender: string;
    jobTitle: string;
    termsAccepted: boolean;
    painZones: { zone: BodySection, intensity: number, type: string }[];
};

const DEFAULT_DATA: WizardData = {
    step: 1, phone: '', code: '', fullName: '', age: '', gender: 'مرد', jobTitle: '', termsAccepted: false, painZones: []
};

export default function WizardPage() {
    const router = useRouter();
    const [data, setData] = useState<WizardData>(DEFAULT_DATA);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const saved = localStorage.getItem('elajgar_wizard');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.step) setData(parsed);
            } catch(e) {}
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('elajgar_wizard', JSON.stringify(data));
        }
    }, [data, isMounted]);

    const updateData = (updates: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        if (data.step === 4) {
             // Finalize
             setIsLoading(true);
             setTimeout(() => {
                 router.push('/dashboard');
             }, 2500);
        } else {
            updateData({ step: data.step + 1 });
        }
    };

    const prevStep = () => {
        if (data.step > 1) updateData({ step: data.step - 1 });
    };

    if (!isMounted) return null;

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-bold mb-4">در حال پردازش داده‌ها...</h2>
                <div className="w-full max-w-xs space-y-4">
                    <div className="h-3 bg-surface-variant rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-surface-variant rounded animate-pulse w-5/6 mx-auto"></div>
                    <div className="h-3 bg-surface-variant rounded animate-pulse w-4/6 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-surface">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between z-10 glass-panel sticky top-0 rounded-b-3xl">
                {data.step > 1 ? (
                    <button onClick={prevStep} className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                        <ChevronRight className="w-6 h-6 text-on-surface-variant" />
                    </button>
                ) : <div className="w-10"></div>}
                
                <div className="font-bold text-primary text-xl">Elajgar</div>
                
                <div className="text-sm text-on-surface-variant bg-white border border-white/50 px-3 py-1 rounded-full shadow-sm">
                    مرحله {data.step} از ۴
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
                <AnimatePresence mode="wait">
                    {data.step === 1 && <Step1Phone key="1" data={data} updateData={updateData} nextStep={nextStep} />}
                    {data.step === 2 && <Step2Profile key="2" data={data} updateData={updateData} nextStep={nextStep} />}
                    {data.step === 3 && <Step3Terms key="3" data={data} updateData={updateData} nextStep={nextStep} />}
                    {data.step === 4 && <Step4BodyMap key="4" data={data} updateData={updateData} nextStep={nextStep} />}
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- Steps ---

function Step1Phone({ data, updateData, nextStep }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full">
            <div className="text-center mb-10 mt-10">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                    <span className="text-4xl text-primary font-bold">OTP</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">تایید شماره</h2>
                <p className="text-on-surface-variant">کد پیامک شده را وارد کنید</p>
            </div>
            
            <div className="flex justify-center gap-3 mb-auto" dir="ltr">
                {[1,2,3,4,5,6].map(i => (
                    <input key={i} type="text" maxLength={1} className="w-12 h-14 text-center text-xl font-bold rounded-xl glass-input shadow-sm" defaultValue={i===1?'4':i===2?'9':''} />
                ))}
            </div>

            <button onClick={nextStep} className="btn-primary-glass w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 mt-8">
                تایید و ادامه <ArrowLeft className="w-5 h-5" />
            </button>
        </motion.div>
    );
}

function Step2Profile({ data, updateData, nextStep }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full pb-8">
            <h2 className="text-2xl font-bold mb-8">اطلاعات پایه</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2 ml-2">نام و نام خانوادگی</label>
                    <input 
                        className="w-full h-14 px-4 rounded-xl glass-input shadow-sm focus:bg-white" 
                        placeholder="مثلا: علی رضایی" 
                        value={data.fullName}
                        onChange={e => updateData({fullName: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2 ml-2">سن</label>
                        <input 
                            type="number"
                            className="w-full h-14 px-4 rounded-xl glass-input shadow-sm focus:bg-white" 
                            placeholder="سال"
                            value={data.age}
                            onChange={e => updateData({age: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2 ml-2">جنسیت</label>
                        <select 
                            className="w-full h-14 px-4 rounded-xl glass-input shadow-sm bg-transparent focus:bg-white"
                            value={data.gender}
                            onChange={e => updateData({gender: e.target.value})}
                        >
                            <option>مرد</option>
                            <option>زن</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2 ml-2">شغل فعلی</label>
                    <input 
                        className="w-full h-14 px-4 rounded-xl glass-input shadow-sm focus:bg-white" 
                        placeholder="مثلا: برنامه نویس"
                        value={data.jobTitle}
                        onChange={e => updateData({jobTitle: e.target.value})}
                    />
                </div>
            </div>

            <button onClick={nextStep} className="btn-primary-glass w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 mt-auto">
                ادامه <ArrowLeft className="w-5 h-5" />
            </button>
        </motion.div>
    );
}

function Step3Terms({ data, updateData, nextStep }: any) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full items-center justify-center">
            <div className="glass-card p-8 rounded-[2rem] w-full border border-error/20 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 blur-3xl rounded-full"></div>
                 <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-error" />
                 </div>
                 <h2 className="text-2xl font-bold text-on-surface mb-4">هشدار پزشکی</h2>
                 <p className="text-on-surface-variant leading-relaxed text-lg mb-8">
                    "این سامانه جایگزین پزشک نیست. در صورت درد شدید یا علایم خاص به پزشک مراجعه کنید. برنامه‌ها صرفا جنبه‌ی کمکی و آموزشی برای کاهش و بهبود دردهای عضلانی‌مفصلی دارد."
                 </p>
                 
                 <label className="flex items-start gap-4 p-4 glass-panel rounded-xl cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={data.termsAccepted}
                        onChange={e => updateData({termsAccepted: e.target.checked})}
                        className="mt-1 w-6 h-6 rounded text-primary focus:ring-primary border-outline-variant bg-white"
                    />
                    <span className="font-medium">قوانین و هشدار پزشکی را می‌پذیرم.</span>
                 </label>
            </div>

            <button 
                onClick={nextStep} 
                disabled={!data.termsAccepted}
                className={cn(
                    "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 mt-8 transition-all",
                    data.termsAccepted ? "btn-primary-glass" : "bg-surface-variant text-outline cursor-not-allowed"
                )}
            >
                پذیرش و شروع ارزیابی <ArrowLeft className="w-5 h-5" />
            </button>
        </motion.div>
    );
}

function Step4BodyMap({ data, updateData, nextStep }: any) {
    const [view, setView] = useState<'front' | 'back'>('back');
    const [activeZone, setActiveZone] = useState<string | null>(null);

    const handleSelectZone = (zone: string) => {
        setActiveZone(zone);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full relative pb-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">نقشه درد</h2>
                <p className="text-sm text-on-surface-variant mb-6">محل درد خود را روی تصویر لمس کنید</p>

                <div className="glass-panel p-1 rounded-full inline-flex w-56 shadow-sm border-white/80">
                    <button onClick={() => setView('front')} className={cn("flex-1 py-1.5 rounded-full text-sm font-bold transition-colors", view === 'front' ? "bg-white text-primary shadow" : "text-on-surface-variant hover:bg-white/50")}>جلو</button>
                    <button onClick={() => setView('back')} className={cn("flex-1 py-1.5 rounded-full text-sm font-bold transition-colors", view === 'back' ? "bg-white text-primary shadow" : "text-on-surface-variant hover:bg-white/50")}>پشت</button>
                </div>
            </div>

            <div className="flex-1 relative glass-card rounded-3xl border border-white/60 shadow-inner flex items-center justify-center overflow-hidden mx-4">
               {/* Extremely Simplified Vector representation since we can't load complex SVG externally easily without URLs */}
               <div className="relative w-48 h-full min-h-[300px] flex justify-center py-8">
                    {/* Abstract silhouette */}
                    <svg viewBox="0 0 100 250" className="w-full h-full drop-shadow-2xl opacity-80" fill="none" stroke="#d8dadc" strokeWidth="2">
                        <path d="M50 10 C55 10, 60 15, 60 25 C60 35, 55 40, 50 40 C45 40, 40 35, 40 25 C40 15, 45 10, 50 10 M35 45 L65 45 L80 100 L70 100 L60 60 L60 140 L55 240 L45 240 L40 140 L40 60 L30 100 L20 100 L35 45" fill="rgba(255,255,255,0.7)"/>
                    </svg>

                    {/* Hotspots */}
                    {view === 'back' && (
                        <>
                            <Hotspot top="12%" left="50%" onClick={() => handleSelectZone('گردن')} />
                            <Hotspot top="25%" left="35%" onClick={() => handleSelectZone('شانه چپ')} />
                            <Hotspot top="25%" left="65%" onClick={() => handleSelectZone('شانه راست')} />
                            <Hotspot top="45%" left="50%" onClick={() => handleSelectZone('کمر')} pulse={!data.painZones.length} />
                        </>
                    )}
                    {view === 'front' && (
                        <>
                            <Hotspot top="30%" left="50%" onClick={() => handleSelectZone('قفسه سینه')} />
                            <Hotspot top="70%" left="42%" onClick={() => handleSelectZone('زانو چپ')} />
                            <Hotspot top="70%" left="58%" onClick={() => handleSelectZone('زانو راست')} />
                        </>
                    )}
               </div>
            </div>

            <button onClick={nextStep} className="btn-primary-glass w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 mt-6">
                تحلیل نهایی <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Popover */}
            <AnimatePresence>
                {activeZone && (
                     <motion.div 
                        initial={{ opacity: 0, y: 100 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-24 left-4 right-4 glass-panel bg-white/80 rounded-[2rem] p-6 shadow-2xl border-white"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{activeZone}</h3>
                            <button onClick={() => setActiveZone(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant hover:bg-surface-variant/80">X</button>
                        </div>
                        
                        <div className="mb-6 p-4 rounded-2xl bg-white/50 border border-white/60">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">شدت درد</span>
                                <span className="text-2xl font-bold text-primary">6</span>
                            </div>
                            <input type="range" min="1" max="10" defaultValue="6" className="w-full accent-primary" />
                            <div className="flex justify-between text-xs text-outline mt-2">
                                <span>خفیف</span>
                                <span>غیرقابل تحمل</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-sm font-medium block mb-3">نوع درد</span>
                            <div className="flex flex-wrap gap-2">
                                {['تیر کشنده', 'سوزشی', 'مبهم', 'گرفتگی'].map(t => (
                                    <button key={t} className={cn("px-4 py-2 rounded-full text-sm transition-colors border field", t === 'تیر کشنده' ? "bg-primary text-white border-primary" : "bg-white/50 border-outline-variant hover:border-primary/50 text-on-surface-variant")}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => {
                            updateData({ painZones: [...data.painZones, { zone: activeZone as any, intensity: 6, type: 'تیر کشنده' }]});
                            setActiveZone(null);
                        }} className="w-full py-3 bg-surface-container hover:bg-surface-variant rounded-xl font-bold transition-colors">تایید و ثبت</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function Hotspot({ top, left, onClick, pulse = false }: { top: string, left: string, onClick: () => void, pulse?: boolean }) {
    return (
        <button 
            onClick={onClick}
            style={{ top, left, transform: 'translate(-50%, -50%)' }}
            className={cn("absolute w-6 h-6 rounded-full border-2 border-primary bg-white/50 flex items-center justify-center shadow-[0_0_10px_rgba(37,99,235,0.4)] hover:scale-125 transition-transform z-10", pulse && "animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.8)] border-4")}
        >
            <div className="w-2 h-2 bg-primary rounded-full"></div>
        </button>
    )
}
