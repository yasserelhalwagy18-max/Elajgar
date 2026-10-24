'use client';

import * as React from 'react';
import { CalendarDays, Save, Settings as SettingsIcon, Target, Utensils, Weight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '@/components/admin/AdminUI';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminPatch } from '@/lib/admin-client';
import { toPersianDigits } from '@/lib/utils';

interface SettingsResponse {
  settings: {
    'health.targets': { calories: number; water: number };
    'health.weights': {
      bmi: number;
      activity: number;
      sleep: number;
      water: number;
      calories: number;
      pain: number;
    };
    'nutrition.config': {
      waterPerKgMl: number;
      defaultWaterMl: number;
      calorieAdjust: { maintain: number; cut: number; bulk: number };
      macros: {
        maintain: { protein: number; carbs: number; fat: number };
        cut: { protein: number; carbs: number; fat: number };
        bulk: { protein: number; carbs: number; fat: number };
      };
    };
    'program.steps': Array<{ offset: number; text: string; status: string }>;
  };
  definitions: Array<{ key: string; label: string }>;
}

const WEIGHT_LABELS: Record<string, string> = {
  bmi: 'شاخص توده بدنی',
  activity: 'فعالیت بدنی',
  sleep: 'خواب',
  water: 'آب',
  calories: 'کالری',
  pain: 'درد',
};

const WEIGHT_HINTS: Record<string, string> = {
  bmi: 'نسبت وضعیت بدن به قد',
  activity: 'دقیقه فعالیت در روز',
  sleep: 'ساعت خواب و کیفیت آن',
  water: 'مصرف آب روزانه',
  calories: 'کالری دریافتی روزانه',
  pain: 'شدت درد گزارش‌شده',
};

const MACRO_GROUP_LABELS: Record<string, string> = {
  maintain: 'حفظ وزن',
  cut: 'کاهش وزن',
  bulk: 'افزایش وزن',
};

const MACRO_FIELD_LABELS: Record<string, string> = {
  protein: 'پروتئین',
  carbs: 'کربوهیدرات',
  fat: 'چربی',
};

/** Parse an input value, rejecting empty, non-finite and negative numbers. */
function parseNonNegative(raw: string): number | null {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isFinite(value) && value >= 0 ? value : null;
}

/** Parse an input value, rejecting empty and non-finite numbers. */
function parseNumber(raw: string): number | null {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isFinite(value) ? value : null;
}

/** Percentages add up to 100 - tolerance for float sums like 33.3 + 33.3 + 33.4. */
function isHundred(total: number): boolean {
  return Math.abs(total - 100) < 0.001;
}

/**
 * The global settings.
 *
 * The weights and the targets are stored in the database and read by the
 * health score on every calculation. The panel used to write them into
 * `localStorage` under a key nothing read, so the "edit the formulas" screen
 * had no effect on any user's score.
 */
export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<SettingsResponse['settings'] | null>(null);
  const [weights, setWeights] = React.useState<Record<string, string>>({});
  const [targets, setTargets] = React.useState({ calories: '', water: '' });
  const [nutrition, setNutrition] = React.useState({
    waterPerKgMl: '',
    defaultWaterMl: '',
    maintainAdjust: '',
    cutAdjust: '',
    bulkAdjust: '',
  });
  const [macros, setMacros] = React.useState<Record<string, Record<string, string>>>({});
  const [programSteps, setProgramSteps] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/admin/settings', { signal: controller.signal, cache: 'no-store' });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          setError(body?.error ?? 'خطا در دریافت تنظیمات');
          return;
        }

        const data = body as SettingsResponse;
        setSettings(data.settings);
        setWeights(
          Object.fromEntries(
            Object.entries(data.settings['health.weights']).map(([key, value]) => [
              key,
              String(value),
            ]),
          ),
        );
        setTargets({
          calories: String(data.settings['health.targets'].calories),
          water: String(data.settings['health.targets'].water),
        });

        const nutritionConfig = data.settings['nutrition.config'];
        setNutrition({
          waterPerKgMl: String(nutritionConfig.waterPerKgMl),
          defaultWaterMl: String(nutritionConfig.defaultWaterMl),
          maintainAdjust: String(nutritionConfig.calorieAdjust.maintain),
          cutAdjust: String(nutritionConfig.calorieAdjust.cut),
          bulkAdjust: String(nutritionConfig.calorieAdjust.bulk),
        });

        setMacros(
          Object.fromEntries(
            Object.entries(nutritionConfig.macros).map(([bucket, split]) => [
              bucket,
              {
                protein: String(split.protein),
                carbs: String(split.carbs),
                fat: String(split.fat),
              },
            ]),
          ),
        );

        setProgramSteps(
          (data.settings['program.steps'] ?? [])
            .map((step) => `${step.offset}|${step.text}|${step.status}`)
            .join('\n'),
        );

        setError(null);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        setError('ارتباط با سرور برقرار نشد');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsedWeights: Record<string, number> = {};
    for (const [key, raw] of Object.entries(weights)) {
      const value = parseNonNegative(raw);
      if (value === null) {
        toast.error(`وزن «${WEIGHT_LABELS[key] ?? key}» باید عددی غیرمنفی باشد`);
        return;
      }
      parsedWeights[key] = value;
    }
    if (!isHundred(Object.values(parsedWeights).reduce((sum, value) => sum + value, 0))) {
      toast.error('مجموع وزن‌های امتیاز سلامت باید ۱۰۰ باشد');
      return;
    }

    const targetCalories = parseNonNegative(targets.calories);
    const targetWater = parseNonNegative(targets.water);
    if (targetCalories === null || targetCalories <= 0) {
      toast.error('هدف کالری روزانه باید عددی مثبت باشد');
      return;
    }
    if (targetWater === null || targetWater <= 0) {
      toast.error('هدف آب روزانه باید عددی مثبت باشد');
      return;
    }

    const waterPerKgMl = parseNonNegative(nutrition.waterPerKgMl);
    const defaultWaterMl = parseNonNegative(nutrition.defaultWaterMl);
    const maintainAdjust = parseNumber(nutrition.maintainAdjust);
    const cutAdjust = parseNumber(nutrition.cutAdjust);
    const bulkAdjust = parseNumber(nutrition.bulkAdjust);
    if (waterPerKgMl === null || defaultWaterMl === null) {
      toast.error('اهداف آب باید عددی غیرمنفی باشند');
      return;
    }
    if (maintainAdjust === null || cutAdjust === null || bulkAdjust === null) {
      toast.error('تغییر کالری باید عدد معتبر باشد');
      return;
    }

    const macroPayload: Record<string, Record<string, number>> = {};
    for (const [bucket, split] of Object.entries(macros)) {
      const parsedSplit: Record<string, number> = {};
      for (const [field, raw] of Object.entries(split)) {
        const value = parseNonNegative(raw);
        if (value === null) {
          toast.error(
            `سهم «${MACRO_FIELD_LABELS[field] ?? field}» در «${MACRO_GROUP_LABELS[bucket] ?? bucket}» باید عددی غیرمنفی باشد`,
          );
          return;
        }
        parsedSplit[field] = value;
      }
      if (!isHundred(Object.values(parsedSplit).reduce((sum, value) => sum + value, 0))) {
        toast.error(
          `مجموع سهم‌های «${MACRO_GROUP_LABELS[bucket] ?? bucket}» باید ۱۰۰ درصد باشد`,
        );
        return;
      }
      macroPayload[bucket] = parsedSplit;
    }

    setIsSaving(true);

    const steps = programSteps
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [offset, text, status] = line.split('|').map((part) => part.trim());
        return { offset: Number(offset), text, status };
      });

    const payload = {
      'health.weights': parsedWeights,
      'health.targets': {
        calories: targetCalories,
        water: targetWater,
      },
      'nutrition.config': {
        waterPerKgMl,
        defaultWaterMl,
        calorieAdjust: {
          maintain: maintainAdjust,
          cut: cutAdjust,
          bulk: bulkAdjust,
        },
        macros: macroPayload,
      },
      'program.steps': steps,
    };

    const result = await adminPatch<SettingsResponse>('/api/admin/settings', payload);

    if (result.ok && result.data) {
      setSettings(result.data.settings);
      toast.success('تنظیمات ذخیره شد و از این پس برای همه کاربران اعمال می‌شود');
    } else {
      toast.error(result.error ?? 'ذخیره انجام نشد');
    }

    setIsSaving(false);
  };

  if (error) {
    return (
      <>
        <AdminPageHeader title="تنظیمات" />
        <div className="card p-8 rounded-3xl text-error font-bold">{error}</div>
      </>
    );
  }

  if (isLoading || !settings) {
    return (
      <>
        <AdminPageHeader title="تنظیمات" />
        <div
          role="status"
          aria-live="polite"
          aria-label="در حال بارگذاری"
          className="card p-12 rounded-3xl flex flex-col items-center gap-4"
        >
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </>
    );
  }

  const totalWeight = Object.values(weights).reduce((sum, value) => sum + (Number(value) || 0), 0);

  return (
    <>
      <AdminPageHeader
        title="تنظیمات سامانه"
        description="این مقادیر در پایگاه داده ذخیره می‌شوند و در امتیاز سلامت همه کاربران اعمال می‌شوند."
      />

      <form onSubmit={save} className="flex flex-col gap-6 max-w-4xl">
        {/* Weights */}
        <section className="card rounded-3xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <Weight className="w-5 h-5 text-primary" />
            وزن مؤلفه‌های امتیاز سلامت
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            هر مؤلفه سهمی از امتیاز ۱۰۰ دارد. مقدار بیشتر یعنی اهمیت بیشتر آن مؤلفه در امتیاز
            نهایی. مجموع وزن‌ها باید دقیقاً ۱۰۰ باشد.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="p-4 rounded-2xl bg-surface-variant/40">
                <label
                  className="block text-sm font-bold text-on-surface mb-1"
                  htmlFor={`weight-${key}`}
                >
                  {WEIGHT_LABELS[key] ?? key}
                </label>
                <p className="text-[11px] text-on-surface-variant mb-3">{WEIGHT_HINTS[key]}</p>
                <input
                  id={`weight-${key}`}
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={value}
                  onChange={(event) => setWeights({ ...weights, [key]: event.target.value })}
                  className="input font-mono"
                />
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-on-surface-variant">
            مجموع وزن‌ها: <span className="tabular-nums font-bold">{toPersianDigits(totalWeight)}</span>
          </p>
        </section>

        {/* Targets */}
        <section className="card rounded-3xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-primary" />
            اهداف پیش‌فرض روزانه
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            این اهداف زمانی استفاده می‌شوند که هدف اختصاصی کاربر مشخص نشده باشد. هدف هر کاربر بر
            اساس وزن و فعالیت بدنی خودش محاسبه می‌شود.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="target-calories">
                کالری روزانه (کیلوکالری)
              </label>
              <input
                id="target-calories"
                type="number"
                min="1"
                max="20000"
                value={targets.calories}
                onChange={(event) => setTargets({ ...targets, calories: event.target.value })}
                className="input font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="target-water">
                آب روزانه (لیتر)
              </label>
              <input
                id="target-water"
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                value={targets.water}
                onChange={(event) => setTargets({ ...targets, water: event.target.value })}
                className="input font-mono"
              />
            </div>
          </div>
        </section>

        {/* Nutrition */}
        <section className="card rounded-3xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <Utensils className="w-5 h-5 text-primary" />
            اهداف تغذیه‌ای
          </h3>
          <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
            این مقادیر هم در صفحه تغذیه و هم در داشبورد استفاده می‌شوند. محاسبه پایه انرژی بر پایه
            فرمول Mifflin-St Jeor است و با ضریب فعالیت کاربر ضرب می‌شود.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="nutrition-water-per-kg">
                آب به ازای هر کیلوگرم (میلی‌لیتر)
              </label>
              <input
                id="nutrition-water-per-kg"
                type="number"
                min="10"
                max="100"
                value={nutrition.waterPerKgMl}
                onChange={(event) =>
                  setNutrition({ ...nutrition, waterPerKgMl: event.target.value })
                }
                className="input font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1" htmlFor="nutrition-water-default">
                هدف پیش‌فرض آب (میلی‌لیتر)
              </label>
              <input
                id="nutrition-water-default"
                type="number"
                min="500"
                max="10000"
                value={nutrition.defaultWaterMl}
                onChange={(event) =>
                  setNutrition({ ...nutrition, defaultWaterMl: event.target.value })
                }
                className="input font-mono"
              />
            </div>
          </div>

          <h4 className="text-sm font-bold mb-3">تغییر کالری بر اساس هدف</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {(
              [
                ['maintainAdjust', 'حفظ وزن / سلامت عمومی'],
                ['cutAdjust', 'کاهش وزن'],
                ['bulkAdjust', 'افزایش وزن'],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1" htmlFor={`nutrition-${field}`}>
                  {label}
                </label>
                <input
                  id={`nutrition-${field}`}
                  type="number"
                  min="-2000"
                  max="2000"
                  value={nutrition[field]}
                  onChange={(event) => setNutrition({ ...nutrition, [field]: event.target.value })}
                  className="input font-mono"
                />
              </div>
            ))}
          </div>

          <h4 className="text-sm font-bold mb-3">سهم درشت‌ماکروها (درصد)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['maintain', 'cut', 'bulk'] as const).map((bucket) => (
              <div key={bucket} className="p-4 rounded-2xl bg-surface-variant/40">
                <p className="text-xs font-bold text-on-surface-variant mb-3">
                  {bucket === 'maintain' ? 'حفظ وزن' : bucket === 'cut' ? 'کاهش وزن' : 'افزایش وزن'}
                </p>
                {(['protein', 'carbs', 'fat'] as const).map((field) => (
                  <div key={field} className="mb-2">
                    <label className="block text-[11px] text-on-surface-variant mb-1" htmlFor={`macro-${bucket}-${field}`}>
                      {field === 'protein' ? 'پروتئین' : field === 'carbs' ? 'کربوهیدرات' : 'چربی'}
                    </label>
                    <input
                      id={`macro-${bucket}-${field}`}
                      type="number"
                      min="0"
                      max="100"
                      value={macros[bucket]?.[field] ?? ''}
                      onChange={(event) =>
                        setMacros({
                          ...macros,
                          [bucket]: {
                            ...macros[bucket],
                            [field]: event.target.value,
                          },
                        })
                      }
                      className="input font-mono"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-on-surface-variant">
            مجموع سهم هر گروه باید ۱۰۰ درصد باشد.
          </p>
        </section>

        {/* The daily program */}
        <section className="card rounded-3xl p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-primary" />
            مراحل برنامه تمرینی
          </h3>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
            هر خط یک مرحله است، به این قالب:{' '}
            <span className="font-mono" dir="ltr">
              offset| متن | وضعیت
            </span>
            . عدد offset نسبت به امروز است ( منفی یعنی روزهای گذشته) و وضعیت یکی از{' '}
            <span className="font-mono" dir="ltr">completed</span>،{' '}
            <span className="font-mono" dir="ltr">pending</span> یا{' '}
            <span className="font-mono" dir="ltr">skipped</span> است.
          </p>
          <textarea
            value={programSteps}
            onChange={(event) => setProgramSteps(event.target.value)}
            rows={6}
            className="input font-mono leading-loose"
            dir="ltr"
          />
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={isSaving} className="btn btn-primary btn-lg px-8">
            <Save className="w-5 h-5" />
            {isSaving ? 'در حال ذخیره...' : 'ذخیره و اعمال برای همه کاربران'}
          </button>
        </div>
      </form>
    </>
  );
}
