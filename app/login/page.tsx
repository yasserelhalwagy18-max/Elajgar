'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../../lib/store';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeDigits, toPersianDigits } from '../../lib/utils';
import { OTP_CODE_LENGTH } from '../../lib/otp';

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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand + back link - the login screen used to be a bare card on an
            empty page with no way back to the landing page. */}
        <div className="flex items-center justify-between mb-6 px-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به خانه
          </Link>
          <span className="text-xl font-black text-primary tracking-tight">علاج‌گر</span>
        </div>

        <div className="w-full p-8 rounded-3xl card">
          <h1 className="text-2xl font-bold mb-2 text-center text-primary">
            {step === 'phone' ? 'ورود یا ثبت‌نام' : 'تایید شماره'}
          </h1>
          <p className="text-sm text-on-surface-variant text-center mb-6">
            {step === 'phone'
              ? 'شماره موبایل خود را وارد کنید تا کد تایید برایتان ارسال شود.'
              : `کد ${toPersianDigits(OTP_CODE_LENGTH)} رقمی ارسال‌شده به شمارهٔ شما را وارد کنید.`}
          </p>

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
                  autoComplete="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(normalizeDigits(e.target.value))}
                  placeholder="09123456789"
                  aria-invalid={!!phoneError}
                  aria-describedby={phoneError ? 'phone-error' : undefined}
                  className={`input text-left ${phoneError ? 'border-error' : ''}`}
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                {phoneError && (
                  <p id="phone-error" role="alert" className="text-error text-xs mt-1">{phoneError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5"
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
                <div className="text-sm text-on-surface-variant mb-2" dir="ltr">{toPersianDigits(phoneNumber)}</div>
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
                  aria-invalid={!!otpError}
                  aria-describedby={otpError ? 'otp-error' : undefined}
                  className={`input text-center tracking-widest ${otpError ? 'border-error' : ''}`}
                  dir="ltr"
                  required
                  disabled={isLoading}
                />
                {otpError && (
                  <p id="otp-error" role="alert" className="text-error text-xs mt-1 text-center">{otpError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!!otpError || isLoading}
                className="btn btn-primary w-full py-2.5"
              >
                {isLoading ? 'در حال بررسی...' : 'تایید'}
              </button>

              {/* The countdown is a status message, not a disabled button -
                  a dimmed button reads as broken. */}
              {resendSeconds > 0 ? (
                <p className="text-center text-sm text-on-surface-variant" role="status">
                  ارسال مجدد کد تا {toPersianDigits(resendSeconds)} ثانیه دیگر
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="btn btn-ghost btn-md w-full"
                >
                  ارسال مجدد کد
                </button>
              )}

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtpError(''); setOtp(''); setPhoneNumber(''); }}
                disabled={isLoading}
                className="btn btn-ghost btn-md w-full"
              >
                تغییر شماره
              </button>
            </form>
          )}

          <p className="flex items-center justify-center gap-2 text-xs text-on-surface-variant mt-6 pt-5 border-t border-outline-variant">
            <ShieldCheck className="w-4 h-4 text-primary" />
            اطلاعات شما رمزنگاری و محرمانه نگهداری می‌شود.
          </p>
        </div>
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
