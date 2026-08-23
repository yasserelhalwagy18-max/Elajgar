'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { Info } from 'lucide-react';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const router = useRouter();
  const { setAuthenticated, updateUserProfile, fetchUserFromServer, saveUserToServer } = useStore();

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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (otp === '1234') { // Simulated OTP check
      setAuthenticated(true);
      updateUserProfile({ phoneNumber });

      try {
        await fetchUserFromServer(phoneNumber);

        // Ensure userProfile gets synchronized if it wasn't found in DB
        // Note: the component state doesn't update synchronously here,
        // but saveUserToServer takes current user profile info, or just the phone number at minimum.
        // We will call saveUserToServer to ensure a record exists.
        // Actually, we can check if fetch successfully got the user by making another fetch request or relying on the DB upsert in backend.
        // Wait, store.fetchUserFromServer doesn't return anything.
        // Let's just blindly call saveUserToServer({ phoneNumber }) and let the upsert handle it if it doesn't exist.
        await saveUserToServer({ phoneNumber });
      } catch (error) {
        console.error("Failed server synchronization:", error);
      }

      router.push('/wizard');
    } else {
      setOtpError('کد تایید نادرست است');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container shadow-sm border border-outline-variant">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary">
          {step === 'phone' ? 'ورود' : 'تایید شماره'}
        </h1>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">
                شماره موبایل
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
              ارسال کد
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
                کد تایید (۱۲۳۴)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setOtpError(''); }}
                placeholder="1234"
                className={`w-full px-4 py-2 rounded-lg bg-surface border ${otpError ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2 text-center tracking-widest`}
                dir="ltr"
                required
              />
              {otpError && (
                <p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!!otpError}
              className="w-full py-2 px-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              تایید
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtpError(''); setOtp(''); }}
              className="w-full py-2 px-4 text-primary hover:bg-primary-container rounded-full transition-colors text-sm"
            >
              تغییر شماره
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
