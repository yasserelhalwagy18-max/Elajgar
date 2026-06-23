'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '@/lib/store';
import { searchFoods, FoodItem } from '@/lib/food-service';
import { Search, Plus, Droplet, Target, Utensils, X, Check } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function NutritionPage() {
  const { userProfile, updateUserProfile, logFood, addWater } = useStore();
  const [goalModalOpen, setGoalModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Get current date string (YYYY-MM-DD)
  const todayDate = new Date().toISOString().split('T')[0];
  const todayLog = userProfile?.dailyLogs?.find((log) => log.date === todayDate) || { foods: [], waterIntake: 0 };

  // Nutrition calculations (Mifflin-St Jeor)
  const calculateRequirements = () => {
    let bmr = 2000; // default fallback
    if (userProfile?.weight && userProfile?.height && userProfile?.age && userProfile?.gender) {
      if (userProfile.gender === 'male') {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
      } else {
        bmr = 10 * userProfile.weight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
      }
    }

    // Activity multiplier
    let multiplier = 1.2; // sedentary
    if (userProfile?.activityLevel === 'light') multiplier = 1.375;
    else if (userProfile?.activityLevel === 'moderate') multiplier = 1.55;
    else if (userProfile?.activityLevel === 'active') multiplier = 1.725;

    let tdee = bmr * multiplier;

    // Apply goal modifier
    if (userProfile?.nutritionGoal === 'کاهش وزن') tdee -= 500;
    else if (userProfile?.nutritionGoal === 'افزایش وزن') tdee += 500;

    const targetCalories = Math.round(tdee);

    // Macro ratios (Balanced preset: 30% Protein, 40% Carbs, 30% Fat)
    // 1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal
    let targetProtein = Math.round((targetCalories * 0.3) / 4);
    let targetCarbs = Math.round((targetCalories * 0.4) / 4);
    let targetFat = Math.round((targetCalories * 0.3) / 9);

    if (userProfile?.nutritionGoal === 'کاهش وزن') {
       // High protein, lower carb for weight loss
       targetProtein = Math.round((targetCalories * 0.4) / 4);
       targetCarbs = Math.round((targetCalories * 0.3) / 4);
    } else if (userProfile?.nutritionGoal === 'افزایش وزن') {
       // Higher carb for weight gain
       targetCarbs = Math.round((targetCalories * 0.5) / 4);
       targetProtein = Math.round((targetCalories * 0.25) / 4);
       targetFat = Math.round((targetCalories * 0.25) / 9);
    }

    return { targetCalories, targetProtein, targetCarbs, targetFat };
  };

  const { targetCalories, targetProtein, targetCarbs, targetFat } = calculateRequirements();

  // Water requirements: 30-35ml per kg of body weight
  const waterTarget = userProfile?.weight ? Math.round(userProfile.weight * 30) : 2000;
  const waterGlasses = Math.ceil(waterTarget / 250);

  // Current intake
  const consumedCalories = todayLog.foods.reduce((acc, food) => acc + food.calories, 0);
  const consumedProtein = todayLog.foods.reduce((acc, food) => acc + food.protein, 0);
  const consumedCarbs = todayLog.foods.reduce((acc, food) => acc + food.carbs, 0);
  const consumedFat = todayLog.foods.reduce((acc, food) => acc + food.fat, 0);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    const results = await searchFoods(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddFood = (food: FoodItem) => {
    logFood(todayDate, food);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Run initial search
  React.useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      setIsSearching(true);
      const results = await searchFoods('');
      if (active) {
        setSearchResults(results);
        setIsSearching(false);
      }
    };
    fetchInitial();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <header className="mb-8 relative z-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-primary">تغذیه و رژیم</h1>
          <p className="text-on-surface-variant font-medium mt-1">مدیریت کالری و آب</p>
        </div>
      </header>

      {/* Goal Selector */}
      <section className="glass-panel p-5 rounded-[2rem] mb-6 flex justify-between items-center">
        <div>
            <h3 className="text-sm font-bold text-on-surface-variant">هدف فعلی شما</h3>
            <p className="text-lg font-black text-primary flex items-center gap-2">
                <Target className="w-5 h-5" />
                {userProfile?.nutritionGoal || 'انتخاب نشده'}
            </p>
        </div>
        <button
            onClick={() => setGoalModalOpen(true)}
            className="btn-secondary px-4 py-2 rounded-xl text-sm font-bold"
        >
            تغییر هدف
        </button>
      </section>

      {/* Macros Overview */}
      <section className="glass-panel p-6 rounded-[2rem] mb-6 relative overflow-hidden">
         <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            خلاصه روزانه
         </h2>
         <div className="flex justify-between items-center mb-6">
             <div className="text-center">
                 <p className="text-sm text-on-surface-variant">مصرف شده</p>
                 <p className="text-2xl font-black text-primary">{consumedCalories}</p>
             </div>
             <div className="relative w-24 h-24 flex items-center justify-center">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-variant/50" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={`${(consumedCalories / targetCalories) * 251} 251`} className="text-primary transition-all duration-1000" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-sm font-bold text-on-surface">{targetCalories - consumedCalories}</span>
                     <span className="text-[10px] text-on-surface-variant">باقیمانده</span>
                 </div>
             </div>
             <div className="text-center">
                 <p className="text-sm text-on-surface-variant">هدف</p>
                 <p className="text-2xl font-black text-on-surface">{targetCalories}</p>
             </div>
         </div>

         <div className="grid grid-cols-3 gap-4">
             <MacroBar label="پروتئین" current={consumedProtein} target={targetProtein} color="bg-blue-500" />
             <MacroBar label="کربوهیدرات" current={consumedCarbs} target={targetCarbs} color="bg-green-500" />
             <MacroBar label="چربی" current={consumedFat} target={targetFat} color="bg-orange-500" />
         </div>
      </section>

      {/* Food Search and Log */}
      <section className="glass-panel p-6 rounded-[2rem] mb-6">
        <h2 className="font-bold text-lg mb-4">ثبت غذا</h2>
        <div className="relative mb-4">
            <input
                type="text"
                placeholder="جستجوی غذا..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/50 border-none rounded-2xl py-3 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary outline-none backdrop-blur-sm"
            />
            <Search className="w-5 h-5 text-on-surface-variant absolute top-1/2 right-3 transform -translate-y-1/2" />
        </div>

        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
            {isSearching ? (
                <p className="text-sm text-center text-on-surface-variant py-4">در حال جستجو...</p>
            ) : searchResults.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 glass-card rounded-xl border border-white/50">
                    <div>
                        <p className="font-bold text-sm text-on-surface">{food.name}</p>
                        <p className="text-xs text-on-surface-variant">{food.calories} کالری | P:{food.protein} C:{food.carbs} F:{food.fat}</p>
                    </div>
                    <button
                        onClick={() => handleAddFood(food)}
                        className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </section>

      {/* Water Tracker */}
      <section className="glass-panel p-6 rounded-[2rem] mb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
         <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-blue-500" />
                    مصرف آب
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">{todayLog.waterIntake} / {waterTarget} ml</p>
            </div>
            <button
                onClick={() => addWater(todayDate, 250)}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 text-white"
            >
                <Plus className="w-4 h-4" /> ۱ لیوان (۲۵۰ml)
            </button>
         </div>

         <div className="flex flex-wrap gap-2 relative z-10">
             {Array.from({ length: waterGlasses }).map((_, i) => (
                 <div
                    key={i}
                    className={`w-8 h-12 rounded-b-xl rounded-t-sm border-2 ${i < Math.floor(todayLog.waterIntake / 250) ? 'bg-blue-500 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-blue-200 bg-transparent'}`}
                 />
             ))}
         </div>
      </section>

      {/* Goal Selection Modal */}
      <AnimatePresence>
        {goalModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
                    onClick={() => setGoalModalOpen(false)}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-sm glass-popover bg-white/90 rounded-[2rem] p-6 shadow-2xl z-10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">انتخاب هدف</h3>
                        <button onClick={() => setGoalModalOpen(false)} className="p-2 rounded-full bg-surface-variant/50">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {['کاهش وزن', 'حفظ وزن', 'افزایش وزن'].map((goal) => (
                            <button
                                key={goal}
                                onClick={() => {
                                    updateUserProfile({ nutritionGoal: goal as any });
                                    setGoalModalOpen(false);
                                }}
                                className={`flex justify-between items-center p-4 rounded-xl border transition-all ${userProfile?.nutritionGoal === goal ? 'border-primary bg-primary/10' : 'border-transparent bg-white/50'}`}
                            >
                                <span className="font-bold">{goal}</span>
                                {userProfile?.nutritionGoal === goal && <Check className="w-5 h-5 text-primary" />}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function MacroBar({ label, current, target, color }: { label: string, current: number, target: number, color: string }) {
    const percentage = Math.min((current / target) * 100, 100) || 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-on-surface">{label}</span>
                <span className="text-on-surface-variant">{current}/{target}g</span>
            </div>
            <div className="h-2 w-full bg-surface-variant/50 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}
