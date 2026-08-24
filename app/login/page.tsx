'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuthenticated, updateUserProfile, fetchUserFromServer } = useStore();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    if (/^09[0-9]{9}$/.test(phoneNumber)) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber }),
        });

        const data = await res.json();

        if (res.ok) {
          setStep('otp');
          toast.success('کد تایید ارسال شد');
        } else {
          setPhoneError(data.error || 'خطا در ارسال کد تایید');
        }
      } catch (error) {
        setPhoneError('ارتباط با سرور برقرار نشد');
      } finally {
        setIsLoading(false);
      }
    } else {
      setPhoneError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuthenticated(true);
        updateUserProfile({ phoneNumber });

        try {
          await fetchUserFromServer(phoneNumber);
        } catch (error) {
          console.error("Failed server synchronization:", error);
        }

        router.push('/wizard');
      } else {
        setOtpError(data.error || 'کد تایید نادرست است');
      }
    } catch (error) {
      setOtpError('ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-surface-container shadow-sm border border-outline-variant glass-panel">
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
                disabled={isLoading}
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-primary-glass"
            >
              {isLoading ? 'در حال ارسال...' : 'ارسال کد'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="otp">
                کد تایید
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setOtpError(''); }}
                placeholder="123456"
                className={`w-full px-4 py-2 rounded-lg bg-surface border ${otpError ? 'border-red-500 focus:ring-red-500' : 'border-outline focus:ring-primary'} text-on-surface focus:outline-none focus:ring-2 text-center tracking-widest`}
                dir="ltr"
                required
                disabled={isLoading}
              />
              {otpError && (
                <p className="text-red-500 text-xs mt-1 text-center">{otpError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!!otpError || isLoading}
              className="w-full py-2 px-4 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-primary-glass"
            >
              {isLoading ? 'در حال بررسی...' : 'تایید'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtpError(''); setOtp(''); }}
              disabled={isLoading}
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
