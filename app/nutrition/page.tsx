'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { searchFoods, FoodItem, getAllFoods } from '@/lib/food-service';
import { Search, Plus, Droplet, Target, Utensils, Check, Sparkles, Trash2 } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { toDateKey, toPersianDigits, formatNumber } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useProfileSync } from '@/hooks/use-profile-sync';
import {
  calculateNutritionTargets,
  DEFAULT_NUTRITION_CONFIG,
} from '@/lib/nutrition-targets';
import { Modal } from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MacroBar } from '@/components/ui/MacroBar';

export default function NutritionPage() {
  const { isAuthenticated, hasHydrated } = useAuthGuard();
  // The nutrition screen is a top-level route, so it is not covered by the
  // dashboard layout's sync. Without this it would read the targets from the
  // persisted store and never see a change an admin made to the settings.
  useProfileSync();
  const userProfile = useStore((state) => state.userProfile);
  const updateUserProfile = useStore((state) => state.updateUserProfile);
  const logFood = useStore((state) => state.logFood);
  const removeFood = useStore((state) => state.removeFood);
  const addWater = useStore((state) => state.addWater);
  const clearAndSetFoods = useStore((state) => state.clearAndSetFoods);
  const mounted = useMounted();
  const [goalModalOpen, setGoalModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<FoodItem[]>([]);
  /** The query the currently displayed results belong to. */
  const [resolvedQuery, setResolvedQuery] = React.useState<string | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = React.useState(false);
  const [planError, setPlanError] = React.useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = React.useState<{ foods: FoodItem[]; calories: number } | null>(null);

  // Get current date string (YYYY-MM-DD) - local calendar day
  const todayDate = toDateKey();
  const todayLog = userProfile?.dailyLogs?.find((log) => log.date === todayDate) || { foods: [], waterIntake: 0 };

  // Nutrition calculations (Mifflin-St Jeor). The calculation lives in one
  // place - `lib/nutrition-targets.ts` - so this screen and the dashboard can
  // never disagree, and an admin can change the numbers.
  const nutritionConfig = userProfile?.nutritionConfig ?? DEFAULT_NUTRITION_CONFIG;

  const {
    calories: targetCalories,
    protein: targetProtein,
    carbs: targetCarbs,
    fat: targetFat,
    waterMl: waterTarget,
  } = calculateNutritionTargets(nutritionConfig, {
    weight: userProfile?.weight,
    height: userProfile?.height,
    age: userProfile?.age,
    gender: userProfile?.gender,
    activityLevel: userProfile?.activityLevel,
    nutritionGoal: userProfile?.nutritionGoal,
  });
  const waterGlasses = Math.ceil(waterTarget / 250);

  // Current intake
  // `todayLog.foods` can be undefined when the profile was merged from a
  // server response that had no logs - guard it rather than throwing.
  const todayFoods = todayLog.foods ?? [];
  const consumedCalories = todayFoods.reduce((acc, food) => acc + food.calories, 0);
  const consumedProtein = todayFoods.reduce((acc, food) => acc + food.protein, 0);
  const consumedCarbs = todayFoods.reduce((acc, food) => acc + food.carbs, 0);
  const consumedFat = todayFoods.reduce((acc, food) => acc + food.fat, 0);

  const isOverCalorieTarget = consumedCalories > targetCalories;
  const remainingCalories = targetCalories - consumedCalories;

  // Debounce the search box: without it every keystroke fired a request.
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    searchFoods(debouncedQuery, controller.signal)
      .then((results) => {
        if (cancelled) return;
        setSearchResults(results);
        setResolvedQuery(debouncedQuery);
      })
      .catch(() => {
        if (cancelled) return;
        setSearchResults([]);
        setResolvedQuery(debouncedQuery);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery]);

  // Derived, not stored: we are still searching until the results for the
  // exact text in the box have arrived.
  const isSearching = resolvedQuery !== searchQuery;

  const handleAddFood = (food: FoodItem) => {
    logFood(todayDate, food);
    setSearchQuery('');
    // Without this the item simply disappeared from the search results and
    // nothing said that it had been recorded.
    toast.success(`«${food.name}» به وعده‌های امروز اضافه شد`);
  };

  /** Take a logged food back out. */
  const handleRemoveFood = (food: FoodItem) => {
    removeFood(todayDate, food.id);
    toast(`«${food.name}» از وعده‌های امروز حذف شد`, { icon: null });
  };

  const handleGenerateMealPlan = async () => {
    if (isGeneratingPlan) return;
    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const allFoods = await getAllFoods();
      if (allFoods.length === 0) {
        setPlanError('دریافت لیست غذاها ناموفق بود. لطفاً دوباره تلاش کنید.');
        return;
      }

      const minCalories = targetCalories * 0.9;
      const maxCalories = targetCalories * 1.1;

      let bestCombination: FoodItem[] = [];
      let bestCalories = 0;
      let bestDiff = Number.POSITIVE_INFINITY;

      // Helper to shuffle array
      const shuffle = (array: FoodItem[]) => {
        let currentIndex = array.length;
        let temporaryValue, randomIndex;
        const newArray = [...array];
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = newArray[currentIndex];
          newArray[currentIndex] = newArray[randomIndex];
          newArray[randomIndex] = temporaryValue;
        }
        return newArray;
      };

      // Try a fixed number of random combinations
      const ATTEMPTS = 100;
      for (let i = 0; i < ATTEMPTS; i++) {
        const shuffled = shuffle(allFoods);
        let currentCombination: FoodItem[] = [];
        let currentCalories = 0;

        for (const food of shuffled) {
          // Stop as soon as we are inside the target band.
          if (currentCalories >= minCalories && currentCalories <= maxCalories) {
            currentCombination.push(food);
            currentCalories += food.calories;
            break;
          }

          if (currentCalories + food.calories <= maxCalories) {
            currentCombination.push(food);
            currentCalories += food.calories;
          }
        }

        // Track the closest match as a fallback
        const currentDiff = Math.abs(currentCalories - targetCalories);
        if (currentCombination.length > 0 && currentDiff < bestDiff) {
          bestCombination = currentCombination;
          bestCalories = currentCalories;
          bestDiff = currentDiff;
        }
      }

      if (bestCombination.length === 0) {
        setPlanError('نتوانستیم یک برنامه غذایی مناسب پیدا کنیم. لطفاً بعداً دوباره تلاش کنید.');
        return;
      }

      // Replacing the day's log destroys what the user already recorded, so
      // ask first - with a dialog that matches the rest of the app.
      setConfirmPlan({ foods: bestCombination, calories: bestCalories });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      setPlanError('دریافت برنامه غذایی با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const applyMealPlan = () => {
    if (!confirmPlan) return;
    clearAndSetFoods(todayDate, confirmPlan.foods);
    setConfirmPlan(null);
  };

  // The persisted store hydrates on the client only: wait for the client
  // render so the server and first client render match.
  if (!mounted) return null;
  if (!hasHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen pb-28 px-4 pt-6 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-primary">تغذیه و رژیم</h1>
        <p className="text-on-surface-variant font-medium mt-1">مدیریت کالری و آب</p>
      </header>

      {/* Goal Selector */}
      <section className="card p-5 rounded-3xl mb-6 flex flex-col gap-4">
        <div className="flex justify-between items-center gap-3">
            <div>
                <h2 className="text-sm font-bold text-on-surface-variant">هدف فعلی شما</h2>
                <p className="text-lg font-black text-primary flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {userProfile?.nutritionGoal || 'انتخاب نشده'}
                </p>
            </div>
            <button
                type="button"
                onClick={() => setGoalModalOpen(true)}
                className="btn btn-secondary btn-sm shrink-0"
            >
                تغییر هدف
            </button>
        </div>

        <button
            type="button"
            onClick={handleGenerateMealPlan}
            disabled={isGeneratingPlan}
            aria-busy={isGeneratingPlan}
            className="btn btn-primary w-full py-3 font-bold"
        >
            <Sparkles className={`w-5 h-5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            {isGeneratingPlan ? 'در حال محاسبه...' : 'پیشنهاد رژیم امروز'}
        </button>
        {planError && (
            <p role="alert" className="mt-2 text-sm text-error text-center">{planError}</p>
        )}
      </section>

      {/* Macros Overview */}
      <section className="card p-6 rounded-3xl mb-6 relative overflow-hidden">
         <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            خلاصه روزانه
         </h2>

         <div className="flex justify-between items-center mb-6 gap-3">
             <div className="text-center">
                 <p className="text-sm text-on-surface-variant">مصرف شده</p>
                 <p className={`text-2xl font-black ${isOverCalorieTarget ? 'text-error' : 'text-primary'}`}>
                   {formatNumber(consumedCalories)}
                 </p>
             </div>

             <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                 <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                    <circle cx="48" cy="48" r="40" strokeWidth="8" fill="transparent" className="text-surface-variant" />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min((consumedCalories / Math.max(targetCalories, 1)) * 251, 251)} 251`}
                      className={isOverCalorieTarget ? 'text-error' : 'text-primary'}
                      style={{ transition: 'stroke-dasharray 0.8s ease, stroke 0.3s ease' }}
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className={`text-base font-black ${isOverCalorieTarget ? 'text-error' : 'text-on-surface'}`}>
                       {formatNumber(Math.abs(remainingCalories))}
                     </span>
                     <span className="text-[11px] text-on-surface-variant">
                       {isOverCalorieTarget ? 'کالری اضافه' : 'باقیمانده'}
                     </span>
                 </div>
             </div>

             <div className="text-center">
                 <p className="text-sm text-on-surface-variant">هدف</p>
                 <p className="text-2xl font-black text-on-surface">{formatNumber(targetCalories)}</p>
             </div>
         </div>

         {isOverCalorieTarget && (
           <p className="text-xs text-error font-bold mb-4 text-center">
             از هدف کالری روزانه عبور کرده‌اید.
           </p>
         )}

         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <MacroBar macro="protein" current={consumedProtein} target={targetProtein} />
             <MacroBar macro="carbs" current={consumedCarbs} target={targetCarbs} />
             <MacroBar macro="fat" current={consumedFat} target={targetFat} />
         </div>
      </section>

      {/* Food Search and Log */}
      <section className="card p-6 rounded-3xl mb-6">
        <h2 className="font-bold text-lg mb-4">ثبت غذا</h2>
        <div className="relative mb-4">
            <input
                type="search"
                placeholder="جستجوی غذا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="جستجوی غذا"
                className="input pr-11"
            />
            <Search className="w-5 h-5 text-on-surface-variant absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="max-h-72 overflow-y-auto ps-2 pe-1 custom-scrollbar flex flex-col gap-2">
            {isSearching ? (
                <p className="text-sm text-center text-on-surface-variant py-4" role="status">در حال جستجو...</p>
            ) : searchResults.length === 0 ? (
                <p className="text-sm text-center text-on-surface-variant py-4">غذایی با این نام پیدا نشد.</p>
            ) : (
                searchResults.map((food) => (
                    <div key={food.id} className="flex items-center justify-between p-3 card card-hover rounded-xl">
                        <div>
                            <p className="font-bold text-sm text-on-surface">{food.name}</p>
                            <p className="text-xs text-on-surface-variant">
                              {formatNumber(food.calories)} کالری • پروتئین {toPersianDigits(food.protein)} • کربوهیدرات {toPersianDigits(food.carbs)} • چربی {toPersianDigits(food.fat)}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleAddFood(food)}
                            aria-label={`افزودن ${food.name}`}
                            className="icon-btn bg-primary/10 text-primary hover:bg-primary hover:text-white shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ))
            )}
        </div>
      </section>

      {/* What was actually logged today.
          Without this the nutrition page showed only the totals, so a user
          could not see what they had eaten or take a mistake back. */}
      <section className="card p-6 rounded-3xl mb-6">
        <h2 className="font-bold text-lg mb-1">غذاهای امروز</h2>
        <p className="text-xs text-on-surface-variant mb-4">
          {toPersianDigits(todayFoods.length)} مورد ثبت‌شده
        </p>

        {todayFoods.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">
            هنوز چیزی برای امروز ثبت نکرده‌اید.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayFoods.map((food) => (
              <li
                key={food.id}
                className="flex items-center justify-between gap-3 p-3 card rounded-xl"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-on-surface truncate">{food.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {formatNumber(food.calories)} کالری
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFood(food)}
                  aria-label={`حذف ${food.name} از وعده‌های امروز`}
                  className="icon-btn shrink-0 hover:text-error hover:bg-error/10"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Water Tracker */}
      <section className="card p-6 rounded-3xl mb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-water/10 rounded-full blur-2xl" aria-hidden="true"></div>
         <div className="flex justify-between items-center mb-6 relative z-10 gap-3">
            <div>
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-water" />
                    مصرف آب
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  {formatNumber(todayLog.waterIntake || 0)} / {formatNumber(waterTarget)} میلی‌لیتر
                </p>
            </div>
            <button
                type="button"
                onClick={() => addWater(todayDate, 250)}
                className="btn btn-primary btn-sm bg-water hover:bg-water-hover shrink-0"
            >
                <Plus className="w-4 h-4" /> یک لیوان
            </button>
         </div>

         {/* Each glass fills proportionally, so a partially-finished last glass
             is visible instead of looking empty while you are on target. */}
         <div className="flex flex-wrap gap-2 relative z-10" role="img" aria-label={`${formatNumber(todayLog.waterIntake || 0)} از ${formatNumber(waterTarget)} میلی‌لیتر آب مصرف شده`}>
             {Array.from({ length: waterGlasses }).map((_, i) => {
               const fill = Math.max(0, Math.min(1, (todayLog.waterIntake || 0) / 250 - i));
               return (
                 <div
                   key={i}
                   className="w-8 h-12 rounded-b-xl rounded-t-sm border-2 border-water/40 bg-surface-variant/40 relative overflow-hidden"
                 >
                   <div
                     className="absolute bottom-0 inset-x-0 bg-water transition-all duration-500"
                     style={{ height: `${fill * 100}%` }}
                   />
                 </div>
               );
             })}
         </div>

         <p className="text-xs text-on-surface-variant mt-3 relative z-10">
           {toPersianDigits(Math.floor((todayLog.waterIntake || 0) / 250))} لیوان کامل از {toPersianDigits(waterGlasses)} لیوان
         </p>
      </section>

      {/* Goal Selection Modal */}
      <Modal
        open={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        title="انتخاب هدف"
        size="sm"
      >
        <div className="flex flex-col gap-2">
            {['کاهش وزن', 'حفظ وزن', 'افزایش وزن', 'سلامت عمومی'].map((goal) => (
                <button
                    key={goal}
                    type="button"
                    onClick={() => {
                        updateUserProfile({ nutritionGoal: goal as any });
                        setGoalModalOpen(false);
                    }}
                    aria-pressed={userProfile?.nutritionGoal === goal}
                    className={`flex justify-between items-center p-4 rounded-xl border transition-all ${
                        userProfile?.nutritionGoal === goal
                            ? 'border-primary bg-primary/10 text-primary-dark font-bold'
                            : 'border-outline-variant bg-surface-container text-on-surface hover:border-primary/40'
                    }`}
                >
                    <span className="font-bold">{goal}</span>
                    {userProfile?.nutritionGoal === goal && <Check className="w-5 h-5 text-primary" />}
                </button>
            ))}
        </div>
      </Modal>

      {/* Confirm replacing today's log */}
      <ConfirmDialog
        open={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        onConfirm={applyMealPlan}
        title="جایگزینی وعده‌های امروز"
        confirmLabel="بله، جایگزین کن"
        message={
          <>
            برنامه غذایی پیشنهادی حدود{' '}
            <span className="font-bold text-on-surface">{formatNumber(confirmPlan?.calories ?? 0)}</span> کالری دارد و
            وعده‌های ثبت‌شده امروز را جایگزین می‌کند.
          </>
        }
      />

      <BottomNav />
    </div>
  );
}
