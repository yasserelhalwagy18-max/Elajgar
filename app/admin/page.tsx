'use client';

import React, { useState, useRef } from 'react';
import { Users, Filter, UploadCloud, Dumbbell, PlaySquare, Settings, LogOut, ChevronDown, ActivitySquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

const PainHeatmap = dynamic(() => import('@/components/PainHeatmap'), { ssr: false });

export default function AdminPage() {
    const router = useRouter();
    const logoutStore = useStore((state) => state.logout);

    const [activeItem, setActiveItem] = useState('Overview');

    // Weights State
    const [bmiMultiplier, setBmiMultiplier] = useState(1.2);
    const [activityIndex, setActivityIndex] = useState(0.85);
    const [showSuccessMsg, setShowSuccessMsg] = useState(false);

    // Modal State
    const [modalData, setModalData] = useState<any>(null);

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogout = () => {
        logoutStore();
        router.push('/login');
    };

    const handleApplyWeights = () => {
        const weights = { bmiMultiplier, activityIndex };
        localStorage.setItem('elajgar-health-weights', JSON.stringify(weights));
        setShowSuccessMsg(true);
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
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-l border-white/40 shadow-2xl flex flex-col pt-10 pb-6 sticky top-0 h-screen hidden md:flex">
                <div className="px-8 mb-10">
                    <h1 className="text-3xl font-black text-primary mb-2">Elajgar Admin</h1>
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">System Controller</p>
                </div>
                
                <nav className="flex-1 flex flex-col gap-2">
                    <NavItem icon={Filter} label="Overview" active={activeItem === 'Overview'} onClick={() => setActiveItem('Overview')} />
                    <NavItem icon={Users} label="User Directory" active={activeItem === 'User Directory'} onClick={() => setActiveItem('User Directory')} />
                    <NavItem icon={Settings} label="Formula Editor" active={activeItem === 'Formula Editor'} onClick={() => setActiveItem('Formula Editor')} />
                    <NavItem icon={UploadCloud} label="Content Pipeline" active={activeItem === 'Content Pipeline'} onClick={() => setActiveItem('Content Pipeline')} />
                </nav>

                <div className="px-8 mt-auto">
                    <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 rounded-2xl text-on-surface-variant hover:bg-surface-variant/50 w-full transition-colors font-bold">
                        <LogOut className="w-5 h-5" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-extrabold text-on-surface">Dashboard Overview</h2>
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="glass-input pl-4 pr-12 py-3 rounded-full w-80 text-sm shadow-sm"
                    />
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Pain Heatmap */}
                    <section className="xl:col-span-1 glass-panel p-8 rounded-[2rem] border-white/80 shadow-xl flex flex-col">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-4">
                            <ActivitySquare className="w-6 h-6 text-primary" />
                            Reported Pain Zones
                        </h3>
                        <p className="text-sm text-on-surface-variant mb-6">Real-time heat map distribution across the active user base.</p>
                        <div className="flex-1 bg-white/40 rounded-2xl border border-white/50 overflow-hidden relative">
                            <PainHeatmap />
                        </div>
                    </section>

                    {/* Data Table */}
                    <section className="xl:col-span-2 glass-panel p-8 rounded-[2rem] border-white/80 shadow-xl flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold flex items-center gap-3">
                                <Users className="w-6 h-6 text-primary" />
                                User & Report Directory
                            </h3>
                        </div>
                        
                        <div className="flex-1 overflow-hidden rounded-2xl border border-outline-variant/30 bg-white/50">
                            <table className="w-full text-right">
                                <thead className="bg-surface-variant/50 text-on-surface-variant text-sm border-b border-outline-variant/30 text-right">
                                    <tr>
                                        <th className="p-4 font-semibold">ID</th>
                                        <th className="p-4 font-semibold">User</th>
                                        <th className="p-4 font-semibold">Status</th>
                                        <th className="p-4 font-semibold">Risk Level</th>
                                        <th className="p-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/20">
                                    <TableRow id="#1042" name="Ali Rezaei" status="Active" risk="Low" onView={(data: any) => setModalData(data)} />
                                    <TableRow id="#1043" name="Sara Ahmadi" status="Flagged" risk="High" isHighRisk onView={(data: any) => setModalData(data)} />
                                    <TableRow id="#1044" name="Mohammad K." status="Pending" risk="Medium" onView={(data: any) => setModalData(data)} />
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Weights Matrix */}
                    <section className="glass-panel p-8 rounded-[2rem] border-white/80 shadow-xl flex flex-col">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                            <Settings className="w-6 h-6 text-primary" />
                            Algorithm Weights
                        </h3>
                        
                        <div className="space-y-6 flex-1">
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-2">BMI Multiplier</label>
                                <input
                                    type="number"
                                    value={bmiMultiplier}
                                    onChange={(e) => setBmiMultiplier(parseFloat(e.target.value))}
                                    step={0.1}
                                    className="w-full h-12 px-4 rounded-xl glass-input bg-surface font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface-variant mb-2">Activity Index</label>
                                <input
                                    type="number"
                                    value={activityIndex}
                                    onChange={(e) => setActivityIndex(parseFloat(e.target.value))}
                                    step={0.05}
                                    className="w-full h-12 px-4 rounded-xl glass-input bg-surface font-mono"
                                />
                            </div>
                        </div>

                        <button onClick={handleApplyWeights} className="btn-primary-glass w-full py-4 rounded-2xl font-bold mt-8 shadow-lg">Apply Weights</button>
                        {showSuccessMsg && (
                            <p className="text-sm text-green-600 mt-2 text-center">تنظیمات ذخیره شد ✓</p>
                        )}
                    </section>

                    <section className="xl:col-span-2 glass-panel p-8 rounded-[2rem] border-white/80 shadow-xl flex flex-col min-h-[400px]">
                        <h3 className="text-xl font-bold flex items-center gap-3 mb-8">
                           <UploadCloud className="w-6 h-6 text-primary" />
                           Content Ingestion
                        </h3>
                        
                        <div onClick={handleFileClick} className="flex-1 border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                            <input type="file" ref={fileInputRef} className="hidden" onClick={(e) => e.stopPropagation()} />
                            <UploadCloud className="w-12 h-12 text-primary mb-4" />
                            <p className="font-bold text-on-surface mb-2">Drag and drop files</p>
                            <span className="text-sm text-on-surface-variant">Video or JSON mapping</span>
                        </div>
                    </section>
                </div>
            </main>

            {/* Modal Overlay */}
            <AnimatePresence>
                {modalData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setModalData(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl overflow-hidden border border-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-on-surface">Row Data</h3>
                                <button
                                    onClick={() => setModalData(null)}
                                    className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-on-surface-variant" />
                                </button>
                            </div>
                            <pre dir="ltr" className="bg-surface p-6 rounded-2xl text-sm font-mono overflow-auto max-h-[60vh] text-on-surface-variant text-left">
                                {JSON.stringify(modalData, null, 2)}
                            </pre>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function NavItem({ icon: Icon, label, active = false, onClick }: any) {
    return (
        <div onClick={onClick} className={cn(
            "flex items-center gap-4 px-8 py-4 mr-4 rounded-l-full cursor-pointer transition-all duration-300",
            active ? "bg-secondary-container text-on-secondary-container font-black shadow-inner" : "text-on-surface-variant hover:bg-surface-variant hover:-translate-x-2 font-bold"
        )}>
            <Icon className="w-5 h-5 ml-2" />
            {label}
        </div>
    );
}

function TableRow({ id, name, status, risk, isHighRisk = false, onView }: any) {
    return (
        <tr className="hover:bg-white/60 transition-colors">
            <td className="p-4 font-mono text-sm text-outline">{id}</td>
            <td className="p-4 font-bold">{name}</td>
            <td className="p-4">
                <span className={cn(
                    "px-3 py-1 text-xs font-bold rounded-full",
                    status === 'Active' ? "bg-secondary-container text-on-secondary-container" :
                    status === 'Flagged' ? "bg-error/10 text-error border border-error/20" : "bg-surface-variant text-on-surface-variant"
                )}>{status}</span>
            </td>
            <td className={cn("p-4 font-bold", isHighRisk ? "text-error" : "text-on-surface")}>{risk}</td>
            <td className="p-4 text-center">
                <button
                    onClick={() => onView({ id, name, status, risk, isHighRisk })}
                    className="text-primary font-bold text-sm hover:underline"
                >
                    View
                </button>
            </td>
        </tr>
    );
}
