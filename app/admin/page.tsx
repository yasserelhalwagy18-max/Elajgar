'use client';

import React, { useState, useRef } from 'react';
import { Users, Filter, UploadCloud, Settings, LogOut, ActivitySquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const PainHeatmap3D = dynamic(() => import('@/components/PainHeatmap3D'), { ssr: false });

export default function AdminPage() {
    const router = useRouter();
    const { logout: logoutStore } = useStore();
    const { isAuthenticated, hasHydrated } = useAuthGuard();

    const [activeItem, setActiveItem] = useState('نمای کلی');

    // Weights State
    const [bmiMultiplier, setBmiMultiplier] = useState(1.2);
    const [activityIndex, setActivityIndex] = useState(0.85);
    const [showSuccessMsg, setShowSuccessMsg] = useState(false);

    // Modal State
    const [modalData, setModalData] = useState<any>(null);

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        // Wait for the persisted store to rehydrate before deciding - see useAuthGuard.
        if (!hasHydrated) return;
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [hasHydrated, isAuthenticated, router]);

    if (!hasHydrated || !isAuthenticated) return null;

    const handleLogout = () => {
        logoutStore();
        router.push('/login');
    };

    const handleApplyWeights = () => {
        const weights = { bmiMultiplier, activityIndex };
        localStorage.setItem('elajgar-health-weights', JSON.stringify(weights));
        setShowSuccessMsg(true);
        toast.success('تنظیمات ذخیره شد');
        setTimeout(() => setShowSuccessMsg(false), 3000);
    };

    const handleFileClick = (e: React.MouseEvent) => {
        if (e.target !== fileInputRef.current && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    return (
        <div className="flex min-h-screen bg-surface">
            {/* Sidebar */}
            <aside className="w-72 bg-surface-container border-e border-outline-variant card rounded-none flex flex-col pt-10 pb-6 sticky top-0 h-screen hidden md:flex">
                <div className="px-8 mb-10">
                    <h1 className="text-2xl font-black text-primary mb-1">مدیریت علاج‌گر</h1>
                    <p className="text-sm font-bold text-on-surface-variant">کنترل سیستم</p>
                </div>

                <nav className="flex-1 flex flex-col gap-2">
                    <NavItem icon={Filter} label="نمای کلی" active={activeItem === 'نمای کلی'} onClick={() => setActiveItem('نمای کلی')} />
                    <NavItem icon={Users} label="فهرست کاربران" active={activeItem === 'فهرست کاربران'} onClick={() => setActiveItem('فهرست کاربران')} />
                    <NavItem icon={Settings} label="ویرایش فرمول‌ها" active={activeItem === 'ویرایش فرمول‌ها'} onClick={() => setActiveItem('ویرایش فرمول‌ها')} />
                    <NavItem icon={UploadCloud} label="ورود محتوا" active={activeItem === 'ورود محتوا'} onClick={() => setActiveItem('ورود محتوا')} />
                </nav>

                <div className="px-8 mt-auto">
                    <button type="button" onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-on-surface-variant hover:bg-surface-variant/50 w-full transition-colors font-bold">
                        <LogOut className="w-5 h-5" /> خروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
                    <h2 className="text-3xl font-extrabold text-on-surface">نمای کلی داشبورد</h2>
                    <input
                        type="search"
                        placeholder="جستجوی سوابق..."
                        aria-label="جستجوی سوابق"
                        className="input ps-4 pe-12 w-full sm:w-80 text-sm"
                    />
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Pain Heatmap */}
                    <section className="xl:col-span-1 card p-8 rounded-3xl flex flex-col">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                            <ActivitySquare className="w-6 h-6 text-primary" />
                            مناطق درد گزارش‌شده
                        </h3>
                        <p className="text-sm text-on-surface-variant mb-6">توزیع زنده مناطق درد در میان کاربران فعال.</p>
                        <div className="flex-1 bg-surface-variant/40 rounded-2xl border border-outline-variant overflow-hidden relative">
                            <PainHeatmap3D />
                        </div>
                    </section>

                    {/* Data Table */}
                    <section className="xl:col-span-2 card p-8 rounded-3xl flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary" />
                                فهرست کاربران و گزارش‌ها
                            </h3>
                        </div>

                        <div className="flex-1 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
                            <table className="w-full">
                                <thead className="bg-surface-variant/50 text-on-surface-variant text-sm border-b border-outline-variant">
                                    <tr>
                                        <th className="p-4 font-semibold text-start">شناسه</th>
                                        <th className="p-4 font-semibold text-start">کاربر</th>
                                        <th className="p-4 font-semibold text-start">وضعیت</th>
                                        <th className="p-4 font-semibold text-start">سطح ریسک</th>
                                        <th className="p-4 font-semibold text-center">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                    <TableRow id="#1042" name="علی رضایی" status="فعال" risk="کم" onView={(data: any) => setModalData(data)} />
                                    <TableRow id="#1043" name="سارا احمدی" status="علامت‌گذاری‌شده" risk="بالا" isHighRisk onView={(data: any) => setModalData(data)} />
                                    <TableRow id="#1044" name="محمد ک." status="در انتظار" risk="متوسط" onView={(data: any) => setModalData(data)} />
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Weights Matrix */}
                    <section className="card p-8 rounded-3xl flex flex-col">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                            <Settings className="w-6 h-6 text-primary" />
                            وزن‌های الگوریتم
                        </h3>

                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-2" htmlFor="admin-bmi">ضریب BMI</label>
                                <input
                                    id="admin-bmi"
                                    type="number"
                                    value={bmiMultiplier}
                                    onChange={(e) => setBmiMultiplier(parseFloat(e.target.value))}
                                    step={0.1}
                                    className="input font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-2" htmlFor="admin-activity">شاخص فعالیت</label>
                                <input
                                    id="admin-activity"
                                    type="number"
                                    value={activityIndex}
                                    onChange={(e) => setActivityIndex(parseFloat(e.target.value))}
                                    step={0.05}
                                    className="input font-mono"
                                />
                            </div>
                        </div>

                        <button type="button" onClick={handleApplyWeights} className="btn btn-primary w-full py-4 font-bold mt-8">اعمال تغییرات</button>
                        {showSuccessMsg && (
                            <p className="text-sm text-success mt-2 text-center font-bold">تنظیمات ذخیره شد ✓</p>
                        )}
                    </section>

                    <section className="xl:col-span-2 card p-8 rounded-3xl flex flex-col min-h-[400px]">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                           <UploadCloud className="w-6 h-6 text-primary" />
                           بارگذاری محتوا
                        </h3>

                        <div onClick={handleFileClick} className="flex-1 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                            <input type="file" ref={fileInputRef} className="hidden" onClick={(e) => e.stopPropagation()} />
                            <UploadCloud className="w-12 h-12 text-primary mb-4" />
                            <p className="font-bold text-on-surface mb-2">فایل‌ها را اینجا رها کنید</p>
                            <span className="text-sm text-on-surface-variant">ویدیو یا نگاشت JSON</span>
                        </div>
                    </section>
                </div>
            </div>

            {/* Row Data Modal */}
            <Modal
                open={!!modalData}
                onClose={() => setModalData(null)}
                title="داده‌های رکورد"
                size="lg"
            >
                <pre dir="ltr" className="bg-surface p-6 rounded-2xl text-sm font-mono overflow-auto max-h-[60vh] text-on-surface-variant text-left">
                    {JSON.stringify(modalData, null, 2)}
                </pre>
            </Modal>
        </div>
    );
}

function NavItem({
    icon: Icon,
    label,
    active = false,
    onClick,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={cn(
                "flex items-center gap-4 px-8 py-4 me-4 rounded-e-full cursor-pointer transition-all duration-300 text-start",
                active ? "bg-secondary-container text-on-secondary-container font-black" : "text-on-surface-variant hover:bg-surface-variant hover:-translate-x-1 font-bold"
            )}
        >
            <Icon className="w-5 h-5 me-2" />
            {label}
        </button>
    );
}

function TableRow({
    id,
    name,
    status,
    risk,
    isHighRisk = false,
    onView,
}: {
    id: string;
    name: string;
    status: string;
    risk: string;
    isHighRisk?: boolean;
    onView: (data: { id: string; name: string; status: string; risk: string; isHighRisk: boolean }) => void;
}) {
    return (
        <tr className="hover:bg-surface-variant/50 transition-colors">
            <td className="p-4 font-mono text-sm text-outline">{id}</td>
            <td className="p-4 font-bold">{name}</td>
            <td className="p-4">
                <span className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full",
                    status === 'فعال' ? "bg-success-container text-success" :
                    status === 'علامت‌گذاری‌شده' ? "bg-error/10 text-error border border-error/20" : "bg-surface-variant text-on-surface-variant"
                )}>{status}</span>
            </td>
            <td className={cn("p-4 font-bold", isHighRisk ? "text-error" : "text-on-surface")}>{risk}</td>
            <td className="p-4 text-center">
                <button
                    type="button"
                    onClick={() => onView({ id, name, status, risk, isHighRisk })}
                    className="text-primary font-bold text-sm hover:underline"
                >
                    مشاهده
                </button>
            </td>
        </tr>
    );
}
