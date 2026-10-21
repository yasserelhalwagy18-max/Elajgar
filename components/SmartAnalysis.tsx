'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { AlertCircle, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { BODY_REGIONS, type BodyBucket } from '@/lib/body-regions';

/**
 * The advice for each family of region.
 *
 * The key is the **bucket**, not the label: the heatmap stores the label
 * ("زانو راست", "شانه چپ", "شانه‌ها"), and a switch on the label missed most
 * of them, so every user fell through to the generic line. The bucket is the
 * stable grouping the body map already uses.
 *
 * The wording stays deliberately general. This is guidance for the user's own
 * next step, not a diagnosis and not a treatment plan.
 */
const ADVICE_BY_BUCKET: Partial<Record<BodyBucket, string>> = {
  neck: 'ارتفاع مانیتور و گوشی را با چشم هم‌تراز کنید و از قرار دادن گوشی بین شانه و گوش خودداری کنید.',
  shoulders: 'از بالا بردن مکرر دست خودداری کنید و سعی کنید روی شانه دردناک نخوابید.',
  back: 'از بلند کردن اجسام سنگین و خم شدن ناگهانی خودداری کنید و هنگام نشستن از پشتی مناسب استفاده کنید.',
  knees_l: 'از بالا و پایین رفتن مکرر از پله‌ها و چمباتمه زدن بپرهیزید و وزن خود را در محدوده متناسب با قدتان نگه دارید.',
  knees_r: 'از بالا و پایین رفتن مکرر از پله‌ها و چمباتمه زدن بپرهیزید و وزن خود را در محدوده متناسب با قدتان نگه دارید.',
  hips: 'هنگام نشستن طولانی، هر نیم ساعت بلند شوید و کمی راه بروید.',
  chest: 'نفس عمیق و آرام را تمرین کنید و از فشار روی قفسه سینه خودداری کنید.',
  arms_l: 'از بلند کردن بار سنگین با دست دردناک خودداری کنید.',
  arms_r: 'از بلند کردن بار سنگین با دست دردناک خودداری کنید.',
  feet_l: 'کفش راحت و مناسب بپوشید و مدت زیاد روی پای خود نایستید.',
  feet_r: 'کفش راحت و مناسب بپوشید و مدت زیاد روی پای خود نایستید.',
};

const GENERIC_ADVICE = 'مراقب حرکات مربوط به این ناحیه باشید و به آن فشار نیاورید.';

/** The bucket a stored zone label belongs to. */
function bucketFor(label: string): BodyBucket | undefined {
  return BODY_REGIONS.find((region) => region.label === label)?.bucket;
}

export function SmartAnalysis() {
  const userProfile = useStore((state) => state.userProfile);

  const painZones = userProfile?.painZones ?? [];
  const hasData = painZones.length > 0;

  if (!hasData) {
    return (
      <div className="mb-8 card p-6 rounded-3xl text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-surface-variant/50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-on-surface-variant" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-on-surface mb-2">اطلاعات شما کامل نیست</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          برای دریافت تحلیل هوشمند و هشدارهای پزشکی اختصاصی، لطفا پروفایل و پرسشنامه خود را تکمیل کنید.
        </p>
        <Link
          href="/wizard"
          className="btn btn-primary px-6 py-2 rounded-full font-bold text-sm inline-block"
        >
          تکمیل اطلاعات
        </Link>
      </div>
    );
  }

  /**
   * The advice, one line per reported region.
   *
   * The region label is looked up in `BODY_REGIONS` so that the advice is
   * picked by the family the region belongs to, not by an exact string match
   * on the label - which is what used to make almost every zone fall through
   * to the generic line.
   */
  const warnings = painZones.map((zone) => {
    const bucket = bucketFor(zone.zone);
    return (bucket && ADVICE_BY_BUCKET[bucket]) ?? GENERIC_ADVICE;
  });

  const vulnerableZones = painZones.map((z) => z.zone).join('، ') || 'نامشخص';

  // Generate probable causes
  const probableCauses: string[] = [];

  const hasBackPain = painZones.some((z) => bucketFor(z.zone) === 'back');
  if (
    hasBackPain &&
    userProfile?.questionnaireAnswers?.sittingHoursPerDay &&
    userProfile.questionnaireAnswers.sittingHoursPerDay > 8
  ) {
    probableCauses.push('احتمال ضعف عضلات مرکزی و فشار ناشی از نشستن طولانی وجود دارد.');
  }

  const sleepQuality = userProfile?.questionnaireAnswers?.sleepQuality;
  const stressLevel = userProfile?.questionnaireAnswers?.stressLevel;
  if (sleepQuality === 'بد' || sleepQuality === 'poor' || stressLevel === 'زیاد' || stressLevel === 'high') {
    probableCauses.push('کیفیت پایین خواب یا استرس بالا می‌تواند باعث افزایش تنش عضلانی و کند شدن روند بهبودی شود.');
  }

  const exerciseDays = userProfile?.questionnaireAnswers?.exerciseDaysPerWeek;
  if (exerciseDays !== undefined && exerciseDays < 2) {
    probableCauses.push('عدم فعالیت فیزیکی کافی ممکن است منجر به ضعف عضلانی و تشدید درد شود.');
  }

  return (
    <div className="mb-8 card p-6 rounded-3xl border-2 border-error/20 bg-error/5 relative overflow-hidden">
      <div className="absolute top-0 start-0 w-32 h-32 bg-error/10 rounded-full blur-2xl" aria-hidden="true" />

      <div className="flex items-center gap-3 mb-4 z-10 relative">
        <div className="p-2 bg-error/20 rounded-xl text-error">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">تحلیل و هشدارهای پزشکی</h2>
      </div>

      {/* The disclaimer sits on the surface itself, not only in the one-time
          modal at the start of the app: this is the screen that reads like a
          diagnosis, so it has to say what it is on the screen. */}
      <p className="z-10 relative mb-4 text-xs leading-5 text-on-surface-variant bg-surface-container/70 border border-outline-variant/50 rounded-xl p-3">
        این تحلیل بر پایهٔ پاسخ‌هایی است که خودتان در برنامه ثبت کرده‌اید. این بخش
        <strong className="text-on-surface"> تشخیص پزشکی نیست</strong> و جایگزین معاینه و نظر پزشک
        نمی‌شود. اگر درد شدید یا ناگهانی دارید، یا دردتان بیش از دو هفته طول کشیده است،
        به پزشک مراجعه کنید.
      </p>

      <div className="z-10 relative space-y-4">
        <div className="bg-surface-container/70 p-4 rounded-2xl border border-outline-variant/50">
          <div className="flex items-center gap-2 mb-2 text-error font-bold text-sm">
            <ShieldAlert className="w-4 h-4" aria-hidden="true" />
            <span>نواحی آسیب‌پذیر شما:</span>
          </div>
          <p className="text-on-surface font-medium">{vulnerableZones}</p>
        </div>

        {probableCauses.length > 0 && (
          <div className="bg-warning/10 p-4 rounded-2xl border border-warning/30">
            <div className="flex items-center gap-2 mb-2 text-warning-strong font-bold text-sm">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>دلایل احتمالی:</span>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-on-surface">
              {probableCauses.map((cause) => (
                <li key={cause} className="leading-relaxed">{cause}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="font-bold text-sm text-on-surface-variant flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            توصیه‌های مراقبتی اختصاصی:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-on-surface">
            {warnings.map((warning, index) => (
              <li key={`${painZones[index]?.zone}-${index}`} className="leading-relaxed">{warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
