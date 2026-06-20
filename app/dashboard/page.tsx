import { redirect } from 'next/navigation';

export default function DashboardIndex() {
  // Add a redirect or a content page here. 
  // Based on the prompt, Tab 1 is Home Dashboard.
  
  return (
    <div className="p-6 pb-32">
        <header className="flex justify-between items-center mb-8 sticky top-0 pt-4 z-40 bg-surface/80 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Elajgar</h1>
                <p className="text-sm text-on-surface-variant">سلام، کاربر عزیز</p>
            </div>
            <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center shadow-lg relative border-white">
                <span className="w-3 h-3 bg-error rounded-full absolute top-0 right-0 border-2 border-white"></span>
                <span className="text-xl font-bold text-primary">A</span>
            </div>
        </header>

        {/* 3D Health Score Dial Component */}
        <section className="glass-panel p-8 rounded-[2rem] flex flex-col items-center mb-6 relative overflow-hidden border-2 border-white/60 shadow-[0_10px_40px_rgba(37,99,235,0.1)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
            <h2 className="text-xl text-on-surface font-bold z-10">شاخص سلامت شما</h2>
            <p className="text-primary font-medium text-sm mb-6 z-10">وضعیت عالی است</p>
            
            <div className="relative w-56 h-56 z-10 flex items-center justify-center mb-4">
                {/* Simulated 3D Dial with CSS */}
                <div className="absolute inset-0 rounded-full border-[16px] border-primary-fixed drop-shadow-xl"></div>
                <div className="absolute inset-0 rounded-full border-[16px] border-primary border-l-transparent border-b-transparent transform rotate-45 shadow-[inset_0_4px_10px_rgba(0,0,0,0.1)]"></div>
                <div className="w-40 h-40 bg-white/40 backdrop-blur-xl rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-primary drop-shadow-lg">۸۵</span>
                    <span className="text-sm font-bold text-on-surface-variant">از ۱۰۰</span>
                </div>
            </div>

            <button className="glass-card px-6 py-2.5 rounded-full text-primary font-bold text-sm hover:bg-white/60 transition-colors z-10 shadow-sm border-white">
                مشاهده نمودارها
            </button>
        </section>

        {/* Today's Activity Grid */}
        <section className="grid grid-cols-2 gap-4">
            {/* Calorie */}
            <div className="col-span-2 glass-card p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden border-white/60">
                 <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                 <div className="flex justify-between items-start z-10">
                    <div>
                        <h3 className="font-bold text-lg">کالری امروز</h3>
                        <p className="text-sm text-on-surface-variant">۱۲۵۰ / ۲۰۰۰ kcal</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-6 z-10">
                    {/* Simulated 3D rings */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                         <div className="absolute inset-0 rounded-full border-8 border-primary shadow-lg border-r-transparent"></div>
                         <div className="absolute inset-2 rounded-full border-8 border-secondary-container shadow-lg border-l-transparent"></div>
                         <div className="absolute inset-4 rounded-full border-8 border-outline-variant border-b-transparent"></div>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-sm font-medium">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary shadow-sm" /> پروتئین: ۴۵g</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary-container shadow-sm" /> کربوهیدرات: ۱۲۰g</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-outline-variant shadow-sm" /> چربی: ۳۰g</div>
                    </div>
                 </div>
            </div>

            {/* Hydration */}
            <div className="glass-card p-5 rounded-3xl flex flex-col relative overflow-hidden border-white/60 min-h-[160px]">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent blur-sm"></div>
                <h3 className="font-bold text-on-surface mb-1 z-10">آب مصرفی</h3>
                <p className="text-2xl font-black text-primary z-10">۱.۵ لیتر</p>
                <button className="mt-auto bg-primary text-white py-2 rounded-xl text-sm font-bold shadow-lg z-10 active:scale-95 transition-transform">+ ۲۵۰ml</button>
            </div>

            {/* Workouts */}
            <div className="glass-card p-5 rounded-3xl flex flex-col border-white/60 min-h-[160px]">
                <h3 className="font-bold text-on-surface mb-1">تمرینات</h3>
                <p className="text-2xl font-black text-primary mb-2">۴۵ دقیقه</p>
                <div className="mt-auto px-4 py-2 bg-surface-variant/50 rounded-xl text-sm font-bold flex items-center justify-center">
                    هوازی
                </div>
            </div>
        </section>
    </div>
  );
}
