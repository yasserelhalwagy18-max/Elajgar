'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { AlertCircle, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

export function SmartAnalysis() {
  const { userProfile } = useStore();

  const hasData = userProfile?.painZones && userProfile.painZones.length > 0;

  if (!hasData) {
    return (
      <div className="mb-8 glass-panel p-6 rounded-[2rem] border border-white/60 shadow-lg text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-surface-variant/50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-on-surface-variant" />
        </div>
        <h3 className="text-lg font-bold text-on-surface mb-2">اطلاعات شما کامل نیست</h3>
        <p className="text-sm text-on-surface-variant mb-4">
          برای دریافت تحلیل هوشمند و هشدارهای پزشکی اختصاصی، لطفا پروفایل و پرسشنامه خود را تکمیل کنید.
        </p>
        <button className="btn-primary-glass px-6 py-2 rounded-full font-bold text-sm">
          تکمیل اطلاعات
        </button>
      </div>
    );
  }

  // Generate simulated analysis based on pain zones
  const warnings = userProfile?.painZones?.map(zone => {
    switch(zone.zone) {
      case 'back':
      case 'کمر':
        return 'از بلند کردن اجسام سنگین و خم شدن ناگهانی خودداری کنید. در هنگام نشستن از پشتی مناسب استفاده کنید.';
      case 'knee':
      case 'زانو':
        return 'از بالا و پایین رفتن مکرر از پله‌ها و چمباتمه زدن بپرهیزید. وزن خود را کنترل کنید.';
      case 'neck':
      case 'گردن':
        return 'زاویه دید خود را با مانیتور و گوشی تنظیم کنید. از قرار دادن گوشی بین شانه و گوش خودداری کنید.';
      case 'shoulder':
      case 'شانه':
        return 'از حرکات بالای سر مکرر پرهیز کنید. سعی کنید روی شانه دردناک نخوابید.';
      default:
        return `مراقب حرکات مربوط به ناحیه ${zone.zone} باشید و به آن فشار نیاورید.`;
    }
  }) || [];

  const vulnerableZones = userProfile?.painZones?.map(z => z.zone).join('، ') || 'نامشخص';

  // Generate probable causes
  const probableCauses: string[] = [];

  const hasBackPain = userProfile?.painZones?.some(z => z.zone === 'back' || z.zone === 'کمر');
  if (hasBackPain && userProfile?.questionnaireAnswers?.sittingHoursPerDay && userProfile.questionnaireAnswers.sittingHoursPerDay > 8) {
    probableCauses.push("احتمال ضعف عضلات مرکزی و فشار ناشی از نشستن طولانی وجود دارد.");
  }

  const sleepQuality = userProfile?.questionnaireAnswers?.sleepQuality;
  const stressLevel = userProfile?.questionnaireAnswers?.stressLevel;
  if (sleepQuality === 'بد' || sleepQuality === 'poor' || stressLevel === 'زیاد' || stressLevel === 'high') {
    probableCauses.push("کیفیت پایین خواب یا استرس بالا می‌تواند باعث افزایش تنش عضلانی و کند شدن روند بهبودی شود.");
  }

  const exerciseDays = userProfile?.questionnaireAnswers?.exerciseDaysPerWeek;
  if (exerciseDays !== undefined && exerciseDays < 2) {
    probableCauses.push("عدم فعالیت فیزیکی کافی ممکن است منجر به ضعف عضلانی و تشدید درد شود.");
  }

  return (
    <div className="mb-8 glass-panel p-6 rounded-[2rem] border-2 border-error/20 bg-error/5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-error/10 rounded-full blur-2xl"></div>

      <div className="flex items-center gap-3 mb-4 z-10 relative">
        <div className="p-2 bg-error/20 rounded-xl text-error">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-on-surface">تحلیل هوشمند و هشدارهای پزشکی</h2>
      </div>

      <div className="z-10 relative space-y-4">
        <div className="bg-white/60 p-4 rounded-2xl border border-white/50">
          <div className="flex items-center gap-2 mb-2 text-error font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>نواحی آسیب‌پذیر شما:</span>
          </div>
          <p className="text-on-surface font-medium">{vulnerableZones}</p>
        </div>

        {probableCauses.length > 0 && (
          <div className="bg-warning/10 p-4 rounded-2xl border border-warning/30">
            <div className="flex items-center gap-2 mb-2 text-warning font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>دلایل احتمالی:</span>
            </div>
            <ul className="list-disc list-inside space-y-2 text-sm text-on-surface">
              {probableCauses.map((cause, index) => (
                <li key={index} className="leading-relaxed">{cause}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-bold text-sm text-on-surface-variant flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" />
             توصیه‌های مراقبتی اختصاصی:
          </h4>
          <ul className="list-disc list-inside space-y-2 text-sm text-on-surface">
            {warnings.map((warning, index) => (
              <li key={index} className="leading-relaxed">{warning}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
