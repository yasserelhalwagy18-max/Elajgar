'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { UserProfile } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WizardPage() {
  const router = useRouter();
  const { isAuthenticated, userProfile, updateUserProfile, setWizardStep } = useStore();

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

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [painZones, setPainZones] = useState<{ zone: string; intensity: number; type: string }[]>([]);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({
    duration: '',
    aggravatedByActivity: '',
    relievedByRest: '',
    injuryHistory: '',
    surgeryHistory: '',
    sleepQuality: '',
    stressLevel: '',
    sittingHoursPerDay: '',
    exerciseDaysPerWeek: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const step = userProfile?.currentWizardStep || 1;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

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
      if (painZones.length === 0) newErrors.painZones = 'حداقل یک ناحیه درد باید انتخاب شود';
    } else if (step === 6) {
      const parsedSittingHours = parseInt(questionnaireAnswers.sittingHoursPerDay);
      if (isNaN(parsedSittingHours) || parsedSittingHours < 0 || parsedSittingHours > 24) newErrors.sittingHoursPerDay = 'ساعات نشستن باید بین ۰ تا ۲۴ باشد';
      const parsedExerciseDays = parseInt(questionnaireAnswers.exerciseDaysPerWeek);
      if (isNaN(parsedExerciseDays) || parsedExerciseDays < 0 || parsedExerciseDays > 7) newErrors.exerciseDaysPerWeek = 'روزهای ورزش باید بین ۰ تا ۷ باشد';
    }

    setErrors(newErrors);

    // Auto-scroll to the first error if any
    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
         const firstErrorElement = document.querySelector('.error-message');
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

    if (step < 6) {
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
      updateUserProfile({
        painZones,
      });
    } else if (step === 6) {
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
      <div className="w-full max-w-lg p-8 rounded-2xl bg-surface-container shadow-sm border border-outline-variant relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">تکمیل پروفایل / Profile</h1>
          <span className="text-sm font-medium bg-primary-container text-on-primary-container px-3 py-1 rounded-full">
            مرحله / Step {step} از 6
          </span>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نام و نام خانوادگی / Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                className={`w-full px-4 py-2 rounded-lg bg-surface border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2`}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1 error-message">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سن / Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors({ ...errors, age: '' });
                }}
                className={`w-full px-4 py-2 rounded-lg bg-surface border ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2`}
              />
              {errors.age && <p className="text-red-500 text-xs mt-1 error-message">{errors.age}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">جنسیت / Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="male">مرد / Male</option>
                <option value="female">زن / Female</option>
              </select>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">قد (cm) / Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    if (errors.height) setErrors({ ...errors, height: '' });
                  }}
                  className={`w-full px-4 py-2 rounded-lg bg-surface border ${errors.height ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2`}
                />
                {errors.height && <p className="text-red-500 text-xs mt-1 error-message">{errors.height}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">وزن (kg) / Weight</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    if (errors.weight) setErrors({ ...errors, weight: '' });
                  }}
                  className={`w-full px-4 py-2 rounded-lg bg-surface border ${errors.weight ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2`}
                />
                {errors.weight && <p className="text-red-500 text-xs mt-1 error-message">{errors.weight}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">سطح فعالیت / Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as 'sedentary' | 'light' | 'moderate' | 'active')}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="sedentary">بدون فعالیت / Sedentary</option>
                <option value="light">سبک / Light</option>
                <option value="moderate">متوسط / Moderate</option>
                <option value="active">فعال / Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">شغل / Job</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">بیماری‌های زمینه‌ای / Underlying Diseases</label>
              <p className="text-xs text-outline mb-2">Enter بزنید تا اضافه شود / Press Enter to add</p>
              <input
                type="text"
                value={diseaseInput}
                onChange={(e) => setDiseaseInput(e.target.value)}
                onKeyDown={(e) => addTag(e, diseaseInput, setDiseaseInput, diseases, setDiseases)}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                placeholder="مثلا: دیابت / e.g. Diabetes"
              />
              <div className="flex flex-wrap gap-2">
                {diseases.map((d) => (
                  <span
                    key={d}
                    className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm"
                  >
                    {d}
                    <button
                      onClick={() => removeTag(d, diseases, setDiseases)}
                      className="text-on-secondary-container hover:text-error ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">داروهای فعلی / Current Medications</label>
              <p className="text-xs text-outline mb-2">Enter بزنید تا اضافه شود / Press Enter to add</p>
              <input
                type="text"
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => addTag(e, medInput, setMedInput, meds, setMeds)}
                className="w-full px-4 py-2 rounded-lg bg-surface border border-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                placeholder="مثلا: متفورمین / e.g. Metformin"
              />
              <div className="flex flex-wrap gap-2">
                {meds.map((m) => (
                  <span
                    key={m}
                    className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm"
                  >
                    {m}
                    <button
                      onClick={() => removeTag(m, meds, setMeds)}
                      className="text-on-secondary-container hover:text-error ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
            <Step4Terms termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} />
        )}

        {step === 5 && (
            <div className="relative">
                <Step5BodyMap painZones={painZones} setPainZones={(zones) => {
                    setPainZones(zones);
                    if (errors.painZones && zones.length > 0) setErrors({ ...errors, painZones: '' });
                }} />
                {errors.painZones && <div className="absolute bottom-4 right-0 left-0 text-center"><p className="text-red-500 text-sm font-bold bg-white/90 inline-block px-4 py-1 rounded-full shadow-md error-message">{errors.painZones}</p></div>}
            </div>
        )}

        {step === 6 && (
            <Step6Questionnaire answers={questionnaireAnswers} setAnswers={(newAnswers) => {
                setQuestionnaireAnswers(newAnswers);
                const currentErrors = { ...errors };
                if (typeof newAnswers === 'object') {
                    // Update errors if fields are filled out correctly
                    // Note: setAnswers in Step6Questionnaire passes a new object or uses a callback.
                }
            }} errors={errors} setErrors={setErrors} />
        )}

        <div className="flex justify-between mt-8 gap-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="py-2 px-6 border border-outline text-on-surface rounded-full hover:bg-surface-variant transition-colors"
            >
              قبلی / Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={nextStep}
            disabled={step === 4 && !termsAccepted}
            className={cn("py-2 px-6 rounded-full transition-colors flex items-center gap-2",
                (step === 4 && !termsAccepted) ? "bg-surface-variant text-outline cursor-not-allowed" : "bg-primary text-on-primary hover:bg-primary/90"
            )}
          >
            {step === 6 ? 'تکمیل / Finish' : 'بعدی / Next'} {step < 6 && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Step4Terms({ termsAccepted, setTermsAccepted }: { termsAccepted: boolean, setTermsAccepted: (val: boolean) => void }) {
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full items-center justify-center">
            <div className="glass-card p-8 rounded-[2rem] w-full border border-error/20 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 blur-3xl rounded-full"></div>
                 <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <ShieldAlert className="w-8 h-8 text-error" />
                 </div>
                 <h2 className="text-2xl font-bold text-on-surface mb-4 text-center">هشدار پزشکی</h2>
                 <p className="text-on-surface-variant leading-relaxed text-lg mb-8 text-center">
                    &quot;این سامانه جایگزین پزشک نیست. در صورت درد شدید یا علایم خاص به پزشک مراجعه کنید. برنامه‌ها صرفا جنبه‌ی کمکی و آموزشی برای کاهش و بهبود دردهای عضلانی‌مفصلی دارد.&quot;
                 </p>
                 
                 <label className="flex items-start gap-4 p-4 glass-panel rounded-xl cursor-pointer bg-surface-variant">
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

function Step5BodyMap({ painZones, setPainZones }: { painZones: { zone: string; intensity: number; type: string }[], setPainZones: (zones: { zone: string; intensity: number; type: string }[]) => void }) {
    const [view, setView] = useState<'front' | 'back'>('back');
    const [activeZone, setActiveZone] = useState<string | null>(null);
    const [selectedIntensity, setSelectedIntensity] = useState<number>(6);
    const [selectedType, setSelectedType] = useState<string>('تیر کشنده');

    const handleSelectZone = (zone: string) => {
        setActiveZone(zone);
        setSelectedIntensity(6);
        setSelectedType('تیر کشنده');
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full relative pb-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">نقشه درد</h2>
                <p className="text-sm text-on-surface-variant mb-6">محل درد خود را روی تصویر لمس کنید</p>

                <div className="glass-panel p-1 rounded-full inline-flex w-56 shadow-sm border-white/80 bg-surface-variant">
                    <button onClick={() => setView('front')} className={cn("flex-1 py-1.5 rounded-full text-sm font-bold transition-colors", view === 'front' ? "bg-white text-primary shadow" : "text-on-surface-variant hover:bg-white/50")}>جلو</button>
                    <button onClick={() => setView('back')} className={cn("flex-1 py-1.5 rounded-full text-sm font-bold transition-colors", view === 'back' ? "bg-white text-primary shadow" : "text-on-surface-variant hover:bg-white/50")}>پشت</button>
                </div>
            </div>

            <div className="flex-1 relative glass-card rounded-3xl border border-white/60 shadow-inner flex items-center justify-center overflow-hidden mx-4 bg-surface-variant min-h-[300px]">
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
                            <Hotspot top="45%" left="50%" onClick={() => handleSelectZone('کمر')} pulse={!painZones.length} />

                            {/* New Hotspots */}
                            <Hotspot top="40%" left="33%" onClick={() => handleSelectZone('آرنج چپ')} />
                            <Hotspot top="40%" left="67%" onClick={() => handleSelectZone('آرنج راست')} />
                            <Hotspot top="55%" left="31%" onClick={() => handleSelectZone('مچ دست چپ')} />
                            <Hotspot top="55%" left="69%" onClick={() => handleSelectZone('مچ دست راست')} />
                            <Hotspot top="55%" left="42%" onClick={() => handleSelectZone('لگن چپ')} />
                            <Hotspot top="55%" left="58%" onClick={() => handleSelectZone('لگن راست')} />
                            <Hotspot top="82%" left="44%" onClick={() => handleSelectZone('ساق پا چپ')} />
                            <Hotspot top="82%" left="56%" onClick={() => handleSelectZone('ساق پا راست')} />
                            <Hotspot top="94%" left="45%" onClick={() => handleSelectZone('مچ پا چپ')} />
                            <Hotspot top="94%" left="55%" onClick={() => handleSelectZone('مچ پا راست')} />
                        </>
                    )}
                    {view === 'front' && (
                        <>
                            <Hotspot top="30%" left="50%" onClick={() => handleSelectZone('قفسه سینه')} />
                            <Hotspot top="70%" left="42%" onClick={() => handleSelectZone('زانو چپ')} />
                            <Hotspot top="70%" left="58%" onClick={() => handleSelectZone('زانو راست')} />

                            {/* New Hotspots */}
                            <Hotspot top="40%" left="33%" onClick={() => handleSelectZone('آرنج چپ')} />
                            <Hotspot top="40%" left="67%" onClick={() => handleSelectZone('آرنج راست')} />
                            <Hotspot top="55%" left="31%" onClick={() => handleSelectZone('مچ دست چپ')} />
                            <Hotspot top="55%" left="69%" onClick={() => handleSelectZone('مچ دست راست')} />
                            <Hotspot top="55%" left="42%" onClick={() => handleSelectZone('لگن چپ')} />
                            <Hotspot top="55%" left="58%" onClick={() => handleSelectZone('لگن راست')} />
                            <Hotspot top="82%" left="44%" onClick={() => handleSelectZone('ساق پا چپ')} />
                            <Hotspot top="82%" left="56%" onClick={() => handleSelectZone('ساق پا راست')} />
                            <Hotspot top="94%" left="45%" onClick={() => handleSelectZone('مچ پا چپ')} />
                            <Hotspot top="94%" left="55%" onClick={() => handleSelectZone('مچ پا راست')} />
                        </>
                    )}
               </div>
            </div>

            {/* Popover */}
            <AnimatePresence>
                {activeZone && (
                     <motion.div 
                        initial={{ opacity: 0, y: 100 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-24 left-4 right-4 glass-panel bg-white/95 rounded-[2rem] p-6 shadow-2xl border-white z-50"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{activeZone}</h3>
                            <button onClick={() => setActiveZone(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant hover:bg-surface-variant/80">X</button>
                        </div>
                        
                        <div className="mb-6 p-4 rounded-2xl bg-white/50 border border-white/60">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">شدت درد</span>
                                <span className="text-2xl font-bold text-primary">{selectedIntensity}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={selectedIntensity}
                                onChange={(e) => setSelectedIntensity(parseInt(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-xs text-outline mt-2">
                                <span>خفیف</span>
                                <span>غیرقابل تحمل</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-sm font-medium block mb-3">نوع درد</span>
                            <div className="flex flex-wrap gap-2">
                                {['تیر کشنده', 'سوزشی', 'مبهم', 'گرفتگی', 'التهاب'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSelectedType(t)}
                                        className={cn("px-4 py-2 rounded-full text-sm transition-colors border field", t === selectedType ? "bg-primary text-white border-primary" : "bg-white/50 border-outline-variant hover:border-primary/50 text-on-surface-variant")}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => {
                            setPainZones([...painZones, { zone: activeZone as string, intensity: selectedIntensity, type: selectedType }]);
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

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-on-surface">پرسشنامه هوشمند درد</h2>
            <div className="space-y-4 overflow-y-auto pb-4 pr-2 custom-scrollbar flex-1">
                <label className="block">
                    <span className="text-sm font-medium mb-1 block">مدت زمان درد</span>
                    <input
                        type="text"
                        name="duration"
                        value={answers.duration}
                        onChange={handleChange}
                        className="field w-full"
                        placeholder="مثال: ۲ ماه"
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">تشدید با فعالیت</span>
                        <select name="aggravatedByActivity" value={answers.aggravatedByActivity} onChange={handleChange} className="field w-full">
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">تسکین با استراحت</span>
                        <select name="relievedByRest" value={answers.relievedByRest} onChange={handleChange} className="field w-full">
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">سابقه آسیب</span>
                        <select name="injuryHistory" value={answers.injuryHistory} onChange={handleChange} className="field w-full">
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">سابقه جراحی</span>
                        <select name="surgeryHistory" value={answers.surgeryHistory} onChange={handleChange} className="field w-full">
                            <option value="">انتخاب کنید</option>
                            <option value="بله">بله</option>
                            <option value="خیر">خیر</option>
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">کیفیت خواب</span>
                        <select name="sleepQuality" value={answers.sleepQuality} onChange={handleChange} className="field w-full">
                            <option value="">انتخاب کنید</option>
                            <option value="بد">بد</option>
                            <option value="متوسط">متوسط</option>
                            <option value="خوب">خوب</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium mb-1 block">سطح استرس</span>
                        <select name="stressLevel" value={answers.stressLevel} onChange={handleChange} className="field w-full">
                            <option value="">انتخاب کنید</option>
                            <option value="کم">کم</option>
                            <option value="متوسط">متوسط</option>
                            <option value="زیاد">زیاد</option>
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="block">
                        <span className="text-sm font-medium mb-1 block">ساعات نشستن در روز</span>
                        <input
                            type="number"
                            name="sittingHoursPerDay"
                            value={answers.sittingHoursPerDay}
                            onChange={handleChange}
                            className={`field w-full ${errors?.sittingHoursPerDay ? 'border-red-500 focus:ring-red-500' : ''}`}
                            min="0"
                            max="24"
                        />
                        {errors?.sittingHoursPerDay && <p className="text-red-500 text-xs mt-1 error-message">{errors.sittingHoursPerDay}</p>}
                    </div>
                    <div className="block">
                        <span className="text-sm font-medium mb-1 block">روزهای ورزش در هفته</span>
                        <input
                            type="number"
                            name="exerciseDaysPerWeek"
                            value={answers.exerciseDaysPerWeek}
                            onChange={handleChange}
                            className={`field w-full ${errors?.exerciseDaysPerWeek ? 'border-red-500 focus:ring-red-500' : ''}`}
                            min="0"
                            max="7"
                        />
                        {errors?.exerciseDaysPerWeek && <p className="text-red-500 text-xs mt-1 error-message">{errors.exerciseDaysPerWeek}</p>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
