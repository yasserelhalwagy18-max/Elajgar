'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../../lib/store';
import { Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeDigits } from '../../lib/utils';

function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuthenticated, updateUserProfile, fetchUserFromServer } = useStore();

  // Where to go after a successful login. The middleware sends unauthenticated
  // visitors here with a `next` parameter.
  const nextPath = searchParams.get('next');
  const destination = nextPath && nextPath.startsWith('/') ? nextPath : '/wizard';

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const normalized = normalizeDigits(phoneNumber);
    setPhoneNumber(normalized);

    if (/^09[0-9]{9}$/.test(normalized)) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: normalized }),
        });

        const data = await res.json();

        if (res.ok) {
          setResendSeconds(60);
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

  const submitOtp = async (codeOverride?: string) => {
    const code = codeOverride ?? otp;
    setOtpError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuthenticated(true);
        updateUserProfile({ phoneNumber });

        try {
          await fetchUserFromServer();
        } catch (error) {
          console.error("Failed server synchronization:", error);
        }

        router.push(destination);
      } else {
        setOtpError(data.error || 'کد تایید نادرست است');
      }
    } catch (error) {
      setOtpError('ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    submitOtp();
  };

  useEffect(() => {
    if (step === 'otp') {
      const interval = setInterval(() => {
        setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleResend = async () => {
    if (resendSeconds > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const normalized = normalizeDigits(phoneNumber);
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalized }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('کد تایید ارسال شد');
        setResendSeconds(60);
      } else {
        setPhoneError(data.error || 'خطا در ارسال کد تایید');
      }
    } catch (error) {
      setPhoneError('ارتباط با سرور برقرار نشد');
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
                inputMode="numeric"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(normalizeDigits(e.target.value))}
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
              <div className="text-sm text-on-surface-variant mb-2" dir="ltr">{phoneNumber}</div>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]*"
                value={otp}
                onChange={(e) => {
                  const value = normalizeDigits(e.target.value);
                  setOtp(value);
                  setOtpError('');
                  if (value.length === 6 && !isLoading) {
                    submitOtp(value);
                  }
                }}
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
            {resendSeconds > 0 ? (
              <button
                type="button"
                disabled
                className="w-full py-2 px-4 text-primary/50 hover:bg-primary-container rounded-full transition-colors text-sm"
              >
                ارسال مجدد کد تا {resendSeconds} ثانیه
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="w-full py-2 px-4 text-primary hover:bg-primary-container rounded-full transition-colors text-sm"
              >
                ارسال مجدد کد
              </button>
            )}
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtpError(''); setOtp(''); setPhoneNumber(''); }}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" role="status" aria-label="در حال بارگذاری" />}>
      <LoginForm />
    </Suspense>
  );
}
