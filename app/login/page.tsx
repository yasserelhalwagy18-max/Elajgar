'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { Info } from 'lucide-react';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const router = useRouter();
  const { setAuthenticated, updateUserProfile } = useStore();

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    if (/^09[0-9]{9}$/.test(phoneNumber)) {
      // Simulate sending OTP
      setStep('otp');
    } else {
      setPhoneError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '1234') { // Simulated OTP check
      setAuthenticated(true);
      updateUserProfile({ phoneNumber });
      router.push('/wizard');
    } else {
      alert('کد تایید نادرست است / Invalid OTP. Use 1234');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container shadow-sm border border-outline-variant">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">
          {step === 'phone' ? 'ورود / Login' : 'تایید شماره / Verify Phone'}
        </h1>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">
                شماره موبایل / Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                className={`w-full px-4 py-2 rounded-lg bg-surface border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2 text-left`}
                dir="ltr"
                required
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors"
            >
              ارسال کد / Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <div className="bg-amber-100 text-amber-900 rounded-xl p-3 flex items-center justify-center gap-2 text-sm font-medium">
              <Info className="w-5 h-5" />
              <span>نسخه دمو: کد تأیید ۱۲۳۴ است</span>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="otp">
                کد تایید / Verification Code (1234)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                className="w-full px-4 py-2 rounded-lg bg-surface border border-outline text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest"
                dir="ltr"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors"
            >
              تایید / Verify
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full py-2 px-4 text-primary hover:bg-primary-container rounded-full transition-colors text-sm"
            >
              تغییر شماره / Change Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
