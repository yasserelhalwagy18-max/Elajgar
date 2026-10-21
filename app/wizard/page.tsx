'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { UserProfile } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeDigits, toPersianDigits } from '@/lib/utils';
import { useProfileSync } from '@/hooks/use-profile-sync';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { ADMIN_PATH } from '@/lib/admin-path';
import { WIZARD_LAST_STEP } from '@/lib/wizard';

import PainHeatmap from '@/components/PainHeatmap';
export default function WizardPage() {
  const { isAuthenticated, hasHydrated } = useAuthGuard();
  const mounted = useMounted();
  const router = useRouter();
  const userProfile = useStore((state) => state.userProfile);

  // Keep the server copy of the profile in sync with the local store.
  const { isLoaded } = useProfileSync();

  // An admin has no use for the questionnaire - the panel is what they came
  // for. Sending them to the panel also saves them from answering questions
  // about their own health.
  useEffect(() => {
    if (!isLoaded) return;
    if (userProfile?.role === 'ADMIN') router.replace(ADMIN_PATH);
  }, [isLoaded, userProfile?.role, router]);

  if (!mounted || !hasHydrated) return null;
  if (!isAuthenticated) return null;

  // The wizard's form state is seeded from the profile. If the form mounted
  // before the profile arrived from the server, the seed would run against an
  // empty profile and saving the form would wipe the stored answers. So the
  // form only mounts once the profile is in.
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          role="status"
          aria-live="polite"
          className="w-full max-w-lg p-8 rounded-2xl bg-surface-container shadow-sm border border-outline-variant text-center text-on-surface-variant"
        >
          در حال بارگذاری پروفایل...
        </div>
      </div>
    );
  }

  return <WizardForm />;
}

function WizardForm() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const userProfile = useStore((state) => state.userProfile);
  const updateUserProfile = useStore((state) => state.updateUserProfile);
  const setWizardStep = useStore((state) => state.setWizardStep);

  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [age, setAge] = useState(userProfile?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female'>(userProfile?.gender || 'male');

  const [height, setHeight] = useState(userProfile?.height?.toString() || '');
  const [weight, setWeight] = useState(userProfile?.weight?.toString() || '');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>(
    userProfile?.activityLevel || 'sedentary'
  );
  const [jobTitle, setJobTitle] = useState(userProfile?.jobTitle || '');

  const [diseaseInput, setDiseaseInput] = useState('');
  const [diseases, setDiseases] = useState<string[]>(userProfile?.underlyingDiseases || []);
  const [medInput, setMedInput] = useState('');
  const [meds, setMeds] = useState<string[]>(userProfile?.medications || []);

  // Seed the consent and the questionnaire from the stored profile. Without
  // this, re-opening the wizard at step 6 shows a blank form and saving it
  // wipes the answers the user already gave.
  const [termsAccepted, setTermsAccepted] = useState(userProfile?.termsAccepted ?? false);
  // painZones are now managed entirely by Zustand store
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({
    duration: userProfile?.questionnaireAnswers?.duration ?? '',
    aggravatedByActivity: userProfile?.questionnaireAnswers?.aggravatedByActivity ?? '',
    relievedByRest: userProfile?.questionnaireAnswers?.relievedByRest ?? '',
    injuryHistory: userProfile?.questionnaireAnswers?.injuryHistory ?? '',
    surgeryHistory: userProfile?.questionnaireAnswers?.surgeryHistory ?? '',
    sleepQuality: userProfile?.questionnaireAnswers?.sleepQuality ?? '',
    stressLevel: userProfile?.questionnaireAnswers?.stressLevel ?? '',
    sittingHoursPerDay: userProfile?.questionnaireAnswers?.sittingHoursPerDay?.toString() ?? '',
    exerciseDaysPerWeek: userProfile?.questionnaireAnswers?.exerciseDaysPerWeek?.toString() ?? ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const step = userProfile?.currentWizardStep || 1;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!fullName || fullName.length < 2) newErrors.fullName = 'نام و نام خانوادگی باید حداقل ۲ حرف باشد';
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) newErrors.age = 'سن باید بین ۱ تا ۱۲۰ باشد';
    } else if (step === 2) {
      const parsedHeight = parseInt(height);
      if (isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 250) newErrors.height = 'قد باید بین ۵۰ تا ۲۵۰ سانتی‌متر باشد';
      const parsedWeight = parseInt(weight);
      if (isNaN(parsedWeight) || parsedWeight < 10 || parsedWeight > 300) newErrors.weight = 'وزن باید بین ۱۰ تا ۳۰۰ کیلوگرم باشد';
    } else if (step === 5) {
      if ((userProfile?.painZones?.length || 0) === 0) newErrors.painZones = 'حداقل یک ناحیه درد باید انتخاب شود';
    } else if (step === WIZARD_LAST_STEP) {
      const parsedSittingHours = parseInt(questionnaireAnswers.sittingHoursPerDay);
      if (isNaN(parsedSittingHours) || parsedSittingHours < 0 || parsedSittingHours > 24) newErrors.sittingHoursPerDay = 'ساعات نشستن باید بین ۰ تا ۲۴ باشد';
      const parsedExerciseDays = parseInt(questionnaireAnswers.exerciseDaysPerWeek);
      if (isNaN(parsedExerciseDays) || parsedExerciseDays < 0 || parsedExerciseDays > 7) newErrors.exerciseDaysPerWeek = 'روزهای ورزش باید بین ۰ تا ۷ باشد';

      // The yes/no questions feed the pain analysis, and the server stores the
      // questionnaire only when it is complete. Asking for them here keeps a
      // half-answered questionnaire from being dropped.
      const required = [
        ['aggravatedByActivity', 'تشدید با فعالیت'],
        ['relievedByRest', 'تسکین با استراحت'],
        ['injuryHistory', 'سابقه آسیب'],
        ['surgeryHistory', 'سابقه جراحی'],
        ['sleepQuality', 'کیفیت خواب'],
        ['stressLevel', 'سطح استرس'],
      ] as const;

      for (const [key, label] of required) {
        if (!questionnaireAnswers[key]) {
          newErrors[key] = `لطفاً «${label}» را انتخاب کنید`;
        }
      }
    }

    setErrors(newErrors);

    // Auto-scroll to the first error of *this* step. Query the whole document
    // would scroll to an error belonging to a different step.
    if (Object.keys(newErrors).length > 0) {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        const firstErrorElement = formRef.current?.querySelector('.error-message');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (step < WIZARD_LAST_STEP) {
      saveCurrentStepData();
      setWizardStep(step + 1);
    } else {
      saveCurrentStepData();
      router.push('/dashboard');
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setWizardStep(step - 1);
    }
  };

  const saveCurrentStepData = () => {
    if (step === 1) {
      updateUserProfile({ fullName, age: parseInt(age) || 0, gender });
    } else if (step === 2) {
      updateUserProfile({
        height: parseInt(height) || 0,
        weight: parseInt(weight) || 0,
        activityLevel,
        jobTitle,
      });
    } else if (step === 3) {
      updateUserProfile({
        underlyingDiseases: diseases,
        medications: meds,
      });
    } else if (step === 4) {
      updateUserProfile({
        termsAccepted,
      });
    } else if (step === 5) {
      // Zustand already has it updated via PainHeatmap onClick
    } else if (step === WIZARD_LAST_STEP) {
      updateUserProfile({
        questionnaireAnswers: {
            ...questionnaireAnswers,
            sittingHoursPerDay: parseInt(questionnaireAnswers.sittingHoursPerDay) || 0,
            exerciseDaysPerWeek: parseInt(questionnaireAnswers.exerciseDaysPerWeek) || 0,
        }
      });
    }
  };

  const addTag = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: string,
    setInput: (v: string) => void,
    tags: string[],
    setTags: (v: string[]) => void
  ) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (tagToRemove: string, tags: string[], setTags: (v: string[]) => void) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div ref={formRef} className="w-full max-w-lg p-6 sm:p-8 rounded-3xl card relative overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">تکمیل پروفایل</h1>
          <span className="text-sm font-medium bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
            مرحله {toPersianDigits(step)} از ۶
          </span>
        </div>

        {/* Progress bar - a bare "step X of 6" badge gave no sense of how much
            was left, especially on the long pain-map step. */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={WIZARD_LAST_STEP}
          aria-valuenow={step}
          aria-label={`مرحله ${toPersianDigits(step)} از ۶`}
          className="h-1.5 w-full rounded-full bg-surface-variant overflow-hidden mb-6"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(step / WIZARD_LAST_STEP) * 100}%` }}
          />
        </div>

        {/* A minimum height keeps the card from jumping several hundred pixels
            when moving between the short and the long steps. */}
        <div className="flex-1">

        {/* AnimatePresence is required for the per-step `exit` animations to
            run - without it React unmounts each step instantly. */}
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-full-name">نام و نام خانوادگی</label>
              <input
                id="wizard-full-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                className={`input ${errors.fullName ? 'border-error' : ''}`}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'wizard-full-name-error' : undefined}
              />
              {errors.fullName && (
                <p id="wizard-full-name-error" role="alert" className="text-error text-xs mt-1 error-message">
                  {errors.fullName}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-age">سن</label>
              <input
                id="wizard-age"
                type="text"
                inputMode="numeric"
                value={age}
                onChange={(e) => {
                  setAge(normalizeDigits(e.target.value));
                  if (errors.age) setErrors({ ...errors, age: '' });
                }}
                className={`input ${errors.age ? 'border-error' : ''}`}
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? 'wizard-age-error' : undefined}
              />
              {errors.age && (
                <p id="wizard-age-error" role="alert" className="text-error text-xs mt-1 error-message">
                  {errors.age}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-gender">جنسیت</label>
                <select id="wizard-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="select"
              >
                <option value="male">مرد</option>
                <option value="female">زن</option>
              </select>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" htmlFor="wizard-height">قد (سانتی‌متر)</label>
                <input id="wizard-height"
                  type="text"
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => {
                    setHeight(normalizeDigits(e.target.value));
                    if (errors.height) setErrors({ ...errors, height: '' });
                  }}
                  className={`input ${errors.height ? 'border-error' : ''}`}
                  aria-invalid={!!errors.height}
                  aria-describedby={errors.height ? 'wizard-height-error' : undefined}
                />
                {errors.height && (
                  <p id="wizard-height-error" role="alert" className="text-error text-xs mt-1 error-message">
                    {errors.height}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" htmlFor="wizard-weight">وزن (کیلوگرم)</label>
                <input id="wizard-weight"
                  type="text"
                  inputMode="numeric"
                  value={weight}
                  onChange={(e) => {
                    setWeight(normalizeDigits(e.target.value));
                    if (errors.weight) setErrors({ ...errors, weight: '' });
                  }}
                  className={`input ${errors.weight ? 'border-error' : ''}`}
                  aria-invalid={!!errors.weight}
                  aria-describedby={errors.weight ? 'wizard-weight-error' : undefined}
                />
                {errors.weight && (
                  <p id="wizard-weight-error" role="alert" className="text-error text-xs mt-1 error-message">
                    {errors.weight}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-activity">سطح فعالیت</label>
                <select id="wizard-activity"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as 'sedentary' | 'light' | 'moderate' | 'active')}
                className="select"
              >
                <option value="sedentary">بدون فعالیت</option>
                <option value="light">سبک</option>
                <option value="moderate">متوسط</option>
                <option value="active">فعال</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-job">شغل</label>
              <input
                id="wizard-job"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="select"
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-diseases">بیماری‌های زمینه‌ای</label>
              <p className="text-xs text-on-surface-variant mb-2">نام بیماری را بنویسید و دکمهٔ افزودن را بزنید.</p>
              <div className="flex gap-2 mb-2">
                <input id="wizard-diseases"
                  type="text"
                  value={diseaseInput}
                  onChange={(e) => setDiseaseInput(e.target.value)}
                  onKeyDown={(e) => addTag(e, diseaseInput, setDiseaseInput, diseases, setDiseases)}
                  className="input"
                  placeholder="مثلا: دیابت"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!diseaseInput.trim()) return;
                    if (!diseases.includes(diseaseInput.trim())) {
                      setDiseases([...diseases, diseaseInput.trim()]);
                    }
                    setDiseaseInput('');
                  }}
                  disabled={!diseaseInput.trim()}
                  aria-label="افزودن بیماری"
                  className="btn btn-primary btn-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {diseases.map((d) => (
                  <span key={d} className="tag">
                    {d}
                    <button
                      type="button"
                      onClick={() => removeTag(d, diseases, setDiseases)}
                      aria-label={`حذف ${d}`}
                      className="w-6 h-6 -me-1 rounded-full flex items-center justify-center hover:text-error transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="wizard-meds">داروهای فعلی</label>
              <p className="text-xs text-on-surface-variant mb-2">نام دارو را بنویسید و دکمهٔ افزودن را بزنید.</p>
              <div className="flex gap-2 mb-2">
                <input id="wizard-meds"
                  type="text"
                  value={medInput}
                  onChange={(e) => setMedInput(e.target.value)}
                  onKeyDown={(e) => addTag(e, medInput, setMedInput, meds, setMeds)}
                  className="input"
                  placeholder="مثلا: متفورمین"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!medInput.trim()) return;
                    if (!meds.includes(medInput.trim())) {
                      setMeds([...meds, medInput.trim()]);
                    }
                    setMedInput('');
                  }}
                  disabled={!medInput.trim()}
                  aria-label="افزودن دارو"
                  className="btn btn-primary btn-md shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {meds.map((m) => (
                  <span key={m} className="tag">
                    {m}
                    <button
                      type="button"
                      onClick={() => removeTag(m, meds, setMeds)}
                      aria-label={`حذف ${m}`}
                      className="w-6 h-6 -me-1 rounded-full flex items-center justify-center hover:text-error transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
            >
                <Step4Terms termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} />
            </motion.div>
        )}

        {step === 5 && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative"
            >
                <Step5BodyMap errorId={errors.painZones ? 'wizard-pain-zones-error' : undefined} />
                {errors.painZones && (
                  <div className="absolute bottom-4 right-0 left-0 text-center">
                    <p id="wizard-pain-zones-error" role="alert" className="text-error text-sm font-bold bg-surface-container inline-block px-4 py-1 rounded-full shadow-md error-message">
                      {errors.painZones}
                    </p>
                  </div>
                )}
            </motion.div>
        )}

        {step === WIZARD_LAST_STEP && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-4"
            >
                <Step6Questionnaire answers={questionnaireAnswers} setAnswers={(newAnswers) => {
                    setQuestionnaireAnswers(newAnswers);
                }} errors={errors} setErrors={setErrors} />
            </motion.div>
        )}
        </AnimatePresence>
        </div>

        <div className="flex justify-between mt-8 gap-4 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary btn-md"
            >
              قبلی
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={nextStep}
            disabled={step === 4 && !termsAccepted}
            className={cn(
              "btn btn-md",
              (step === 4 && !termsAccepted) ? "btn-secondary" : "btn-primary"
            )}
          >
            {step === WIZARD_LAST_STEP ? 'تکمیل' : 'بعدی'} {step < WIZARD_LAST_STEP && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step4Terms({ termsAccepted, setTermsAccepted }: { termsAccepted: boolean, setTermsAccepted: (val: boolean) => void }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full items-center justify-center">
            <div className="card card-hover p-8 rounded-3xl w-full border border-error/20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 blur-3xl rounded-full"></div>
                 <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <ShieldAlert className="w-8 h-8 text-error" />
                 </div>
                 <h2 className="text-2xl font-bold text-on-surface mb-4 text-center">هشدار پزشکی</h2>
                 <p className="text-on-surface-variant leading-relaxed text-lg mb-8 text-center">
                    &quot;این سامانه جایگزین پزشک نیست. در صورت درد شدید یا علایم خاص به پزشک مراجعه کنید. برنامه‌ها صرفا جنبه‌ی کمکی و آموزشی برای کاهش و بهبود دردهای عضلانی‌مفصلی دارد.&quot;
                 </p>
                 
                 <label className="flex items-start gap-4 p-4 card rounded-xl cursor-pointer bg-surface-variant">
                    <input 
                        type="checkbox" 
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-6 h-6 rounded text-primary focus:ring-primary border-outline-variant bg-white"
                    />
                    <span className="font-medium text-sm">قوانین و هشدار پزشکی را می‌پذیرم.</span>
                 </label>
            </div>
        </motion.div>
    );
}

function Step5BodyMap({ errorId }: { errorId?: string }) {
    const [view, setView] = useState<'front' | 'back'>('back');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full relative pb-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">نقشه درد</h2>
                <p className="text-sm text-on-surface-variant mb-6">محل درد خود را روی تصویر لمس کنید</p>

                {/* Front / back switch - restyled to the app's light design
                    system. The previous dark "cinematic" pill clashed with
                    every other surface in the product. */}
                <div
                    role="group"
                    aria-label="نمای نقشه درد"
                    className="relative inline-flex items-center p-1 rounded-full bg-surface-variant border border-outline-variant shadow-sm w-64 mx-auto"
                >
                    {/* The sliding pill indicator */}
                    <motion.div
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-[0_4px_10px_-2px_rgba(37,99,235,0.4)] z-0"
                        initial={false}
                        animate={{
                            // The row is RTL, so "front" is the physically
                            // right-hand button. The pill must be positioned
                            // with `right`, not `left`.
                            right: view === 'front' ? '4px' : 'calc(50% + 0px)'
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />

                    <button
                        type="button"
                        onClick={() => setView('front')}
                        aria-pressed={view === 'front'}
                        className={cn(
                            "relative flex-1 py-2 rounded-full text-sm font-bold transition-colors z-10",
                            view === 'front' ? "text-white" : "text-on-surface-variant hover:text-on-surface"
                        )}
                    >
                        جلو
                    </button>
                    <button
                        type="button"
                        onClick={() => setView('back')}
                        aria-pressed={view === 'back'}
                        className={cn(
                            "relative flex-1 py-2 rounded-full text-sm font-bold transition-colors z-10",
                            view === 'back' ? "text-white" : "text-on-surface-variant hover:text-on-surface"
                        )}
                    >
                        پشت
                    </button>
                </div>
            </div>

            <div className="flex-1 w-full flex items-center justify-center">
                <PainHeatmap view={view} describedById={errorId} />
            </div>
        </motion.div>
    );
}

function Step6Questionnaire({ answers, setAnswers, errors, setErrors }: {
    answers: {
        duration: string;
        aggravatedByActivity: string;
        relievedByRest: string;
        injuryHistory: string;
        surgeryHistory: string;
        sleepQuality: string;
        stressLevel: string;
        sittingHoursPerDay: string;
        exerciseDaysPerWeek: string;
    },
    setAnswers: React.Dispatch<React.SetStateAction<{
        duration: string;
        aggravatedByActivity: string;
        relievedByRest: string;
        injuryHistory: string;
        surgeryHistory: string;
        sleepQuality: string;
        stressLevel: string;
        sittingHoursPerDay: string;
        exerciseDaysPerWeek: string;
    }>>,
    errors?: Record<string, string>,
    setErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>
}) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAnswers(prev => ({ ...prev, [name]: value }));
        if (errors && errors[name] && setErrors) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    /**
     * The numeric fields only accept digits, and a Persian keyboard types
     * Persian-Indic ones. `normalizeDigits` turns them into Latin digits so
     * `parseInt` still works. It is NOT used by `handleChange`, because that
     * also handles free text (the "how long have you had it" field), where
     * stripping spaces would ruin the answer.
     */
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setAnswers(prev => ({ ...prev, [name]: normalizeDigits(e.target.value) }));
        if (errors && errors[name] && setErrors) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-on-surface">پرسشنامه هوشمند درد</h2>
            <div className="space-y-4 overflow-y-auto pb-4 pr-2 custom-scrollbar flex-1">
                <label className="block">
                    <span className="text-sm font-medium mb-1 block">مدت زمان درد</span>
                    <input
                        id="wizard-duration"
                        type="text"
                        name="duration"
                        value={answers.duration}
                        onChange={handleChange}
                        className="input w-full"
                        placeholder="مثال: ۲ ماه"
                    />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">تشدید با فعالیت</span>
                        <select
                            id="wizard-aggravated-by-activity"
                            name="aggravatedByActivity"
                            value={answers.aggravatedByActivity}
                            onChange={handleChange}
                            aria-invalid={!!errors?.aggravatedByActivity}
                            aria-describedby={errors?.aggravatedByActivity ? 'wizard-aggravated-by-activity-error' : undefined}
                            className={`select w-full ${errors?.aggravatedByActivity ? 'border-error' : ''}`}
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                        {errors?.aggravatedByActivity && (
                            <p id="wizard-aggravated-by-activity-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.aggravatedByActivity}
                            </p>
                        )}
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">تسکین با استراحت</span>
                        <select
                            id="wizard-relieved-by-rest"
                            name="relievedByRest"
                            value={answers.relievedByRest}
                            onChange={handleChange}
                            aria-invalid={!!errors?.relievedByRest}
                            aria-describedby={errors?.relievedByRest ? 'wizard-relieved-by-rest-error' : undefined}
                            className={`select w-full ${errors?.relievedByRest ? 'border-error' : ''}`}
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                        {errors?.relievedByRest && (
                            <p id="wizard-relieved-by-rest-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.relievedByRest}
                            </p>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">سابقه آسیب</span>
                        <select
                            id="wizard-injury-history"
                            name="injuryHistory"
                            value={answers.injuryHistory}
                            onChange={handleChange}
                            aria-invalid={!!errors?.injuryHistory}
                            aria-describedby={errors?.injuryHistory ? 'wizard-injury-history-error' : undefined}
                            className={`select w-full ${errors?.injuryHistory ? 'border-error' : ''}`}
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                        {errors?.injuryHistory && (
                            <p id="wizard-injury-history-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.injuryHistory}
                            </p>
                        )}
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">سابقه جراحی</span>
                        <select
                            id="wizard-surgery-history"
                            name="surgeryHistory"
                            value={answers.surgeryHistory}
                            onChange={handleChange}
                            aria-invalid={!!errors?.surgeryHistory}
                            aria-describedby={errors?.surgeryHistory ? 'wizard-surgery-history-error' : undefined}
                            className={`select w-full ${errors?.surgeryHistory ? 'border-error' : ''}`}
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                        {errors?.surgeryHistory && (
                            <p id="wizard-surgery-history-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.surgeryHistory}
                            </p>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">کیفیت خواب</span>
                        <select
                            id="wizard-sleep-quality"
                            name="sleepQuality"
                            value={answers.sleepQuality}
                            onChange={handleChange}
                            aria-invalid={!!errors?.sleepQuality}
                            aria-describedby={errors?.sleepQuality ? 'wizard-sleep-quality-error' : undefined}
                            className={`select w-full ${errors?.sleepQuality ? 'border-error' : ''}`}
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="بد">بد</option>
                            <option value="متوسط">متوسط</option>
                            <option value="خوب">خوب</option>
                        </select>
                        {errors?.sleepQuality && (
                            <p id="wizard-sleep-quality-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.sleepQuality}
                            </p>
                        )}
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">سطح استرس</span>
                        <select
                            id="wizard-stress-level"
                            name="stressLevel"
                            value={answers.stressLevel}
                            onChange={handleChange}
                            aria-invalid={!!errors?.stressLevel}
                            aria-describedby={errors?.stressLevel ? 'wizard-stress-level-error' : undefined}
                            className={`select w-full ${errors?.stressLevel ? 'border-error' : ''}`}
                        >
                            <option value="">انتخاب کنید</option>
                            <option value="کم">کم</option>
                            <option value="متوسط">متوسط</option>
                            <option value="زیاد">زیاد</option>
                        </select>
                        {errors?.stressLevel && (
                            <p id="wizard-stress-level-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.stressLevel}
                            </p>
                        )}
                    </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">ساعات نشستن در روز</span>
                        <input
                            id="wizard-sitting-hours"
                            type="text"
                            inputMode="numeric"
                            name="sittingHoursPerDay"
                            value={answers.sittingHoursPerDay}
                            onChange={handleNumericChange}
                            aria-invalid={!!errors?.sittingHoursPerDay}
                            aria-describedby={errors?.sittingHoursPerDay ? 'wizard-sitting-hours-error' : undefined}
                            className={`input w-full ${errors?.sittingHoursPerDay ? 'border-error focus:ring-error' : ''}`}
                            min="0"
                            max="24"
                        />
                        {errors?.sittingHoursPerDay && (
                            <p id="wizard-sitting-hours-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.sittingHoursPerDay}
                            </p>
                        )}
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">روزهای ورزش در هفته</span>
                        <input
                            id="wizard-exercise-days"
                            type="text"
                            inputMode="numeric"
                            name="exerciseDaysPerWeek"
                            value={answers.exerciseDaysPerWeek}
                            onChange={handleNumericChange}
                            aria-invalid={!!errors?.exerciseDaysPerWeek}
                            aria-describedby={errors?.exerciseDaysPerWeek ? 'wizard-exercise-days-error' : undefined}
                            className={`input w-full ${errors?.exerciseDaysPerWeek ? 'border-error focus:ring-error' : ''}`}
                            min="0"
                            max="7"
                        />
                        {errors?.exerciseDaysPerWeek && (
                            <p id="wizard-exercise-days-error" role="alert" className="text-error text-xs mt-1 error-message">
                                {errors.exerciseDaysPerWeek}
                            </p>
                        )}
                    </label>
                </div>
            </div>
        </motion.div>
    );
}
