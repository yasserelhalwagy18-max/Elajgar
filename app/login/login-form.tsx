'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { ArrowRight, ShieldCheck, KeyRound, MessageSquare, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeDigits, toPersianDigits } from '../../lib/utils';
import { OTP_CODE_LENGTH } from '../../lib/otp';
import { destinationFor } from '../../lib/destination';

/**
 * The login screen.
 *
 * There are three ways in:
 *
 * - an SMS code, which is how everybody signs in the first time;
 * - a password, for a user who has set one, so they do not have to wait for
 *   a code every time;
 * - after the first SMS sign-in, the user is asked whether they want to set
 *   a password.
 *
 * The page that renders this is a server component: it sends an
 * already signed-in user onward before this form is ever shown.
 */
function LoginForm({ nextPath }: { nextPath: string | null }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'password' | 'set-password'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const { signIn, fetchUserFromServer } = useStore();

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const normalized = normalizeDigits(phoneNumber);
    if (!normalized) {
      setPhoneError('شماره موبایل را وارد کنید');
    } else if (!/^09[0-9]{9}$/.test(normalized)) {
      setPhoneError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    } else {
      setPhoneError('');
    }
  };

  const handleOtpBlur = () => {
    setTouched((prev) => ({ ...prev, otp: true }));
    const normalized = normalizeDigits(otp);
    if (!normalized) {
      setOtpError('کد تایید را وارد کنید');
    } else if (normalized.length !== OTP_CODE_LENGTH) {
      setOtpError(`کد تایید باید ${toPersianDigits(OTP_CODE_LENGTH)} رقم باشد`);
    } else {
      setOtpError('');
    }
  };

  const handleLoginPhoneBlur = () => {
    setTouched((prev) => ({ ...prev, loginPhone: true }));
    const normalized = normalizeDigits(phoneNumber);
    if (!normalized) {
      setPhoneError('شماره موبایل را وارد کنید');
    } else if (!/^09[0-9]{9}$/.test(normalized)) {
      setPhoneError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
    } else {
      setPhoneError('');
    }
  };

  const handleLoginPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, loginPassword: true }));
    if (!password) {
      setPasswordError('رمز عبور را وارد کنید');
    } else {
      setPasswordError('');
    }
  };

  const handleSetPasswordBlur = () => {
    setTouched((prev) => ({ ...prev, setPassword: true }));
    if (!password) {
      setPasswordError('رمز عبور را وارد کنید');
    } else if (password.length < 8) {
      setPasswordError('رمز عبور باید حداقل ۸ کاراکتر باشد');
    } else {
      setPasswordError('');
    }
  };

  const isPhoneValid = touched.phone && /^09[0-9]{9}$/.test(normalizeDigits(phoneNumber)) && !phoneError;
  const isOtpValid = touched.otp && normalizeDigits(otp).length === OTP_CODE_LENGTH && !otpError;
  const isLoginPhoneValid = touched.loginPhone && /^09[0-9]{9}$/.test(normalizeDigits(phoneNumber)) && !phoneError;
  const isLoginPasswordValid = touched.loginPassword && !!password && !passwordError;
  const isSetPasswordValid = touched.setPassword && password.length >= 8 && !passwordError;

  /**
   * Finish the sign-in: tell the store who the user is, pull their profile
   * and go where they were headed.
   */
  const completeSignIn = async (knownProfile?: {
    role?: string;
    currentWizardStep?: number | null;
  }) => {
    signIn(phoneNumber);

    try {
      await fetchUserFromServer();
    } catch (error) {
      console.error('Failed server synchronization:', error);
    }

    // The store now holds the profile the server sent, so the role and the
    // step are known even when the caller did not read them.
    const profile = knownProfile ?? useStore.getState().userProfile;

    router.push(destinationFor({
      role: profile?.role,
      currentWizardStep: profile?.currentWizardStep,
      nextPath,
    }));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, phone: true }));
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
        // `signIn` replaces the persisted profile instead of merging into it,
        // so a second user signing in on the same device never inherits the
        // first one's data.
        signIn(phoneNumber);

        let profile: { hasPassword?: boolean; role?: string; currentWizardStep?: number | null } | null = null;
        try {
          const me = await fetch('/api/user', { cache: 'no-store' });
          if (me.ok) profile = await me.json();
        } catch (error) {
          console.error('Failed to read the profile:', error);
        }

        // A user without a password is offered one, so they do not have to
        // wait for a code every time from now on.
        if (profile && !profile.hasPassword) {
          setStep('set-password');
          setIsLoading(false);
          return;
        }

        await completeSignIn(profile ?? undefined);
      } else {
        setOtpError(data.error || 'کد تایید نادرست است');
      }
    } catch (error) {
      setOtpError('ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitOtp();
  };

  /** Sign in with the password the user set earlier. */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, loginPhone: true, loginPassword: true }));
    setPasswordError('');

    const normalized = normalizeDigits(phoneNumber);
    setPhoneNumber(normalized);

    if (!/^09[0-9]{9}$/.test(normalized)) {
      setPasswordError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود');
      return;
    }
    if (!password) {
      setPasswordError('رمز عبور را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: normalized, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('خوش آمدید');
        await completeSignIn();
      } else {
        setPasswordError(data.error || 'شماره موبایل یا رمز عبور درست نیست');
      }
    } catch (error) {
      setPasswordError('ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  /** Save the password the user chose after their first sign-in. */
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((prev) => ({ ...prev, setPassword: true }));
    setPasswordError('');

    if (password.length < 8) {
      setPasswordError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('رمز عبور ذخیره شد');
        await completeSignIn();
      } else {
        setPasswordError(data.error || 'ذخیره رمز عبور ناموفق بود');
      }
    } catch (error) {
      setPasswordError('ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
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
        // The resend happens on the OTP step, where only otpError is shown.
        setOtpError(data.error || 'خطا در ارسال کد تایید');
      }
    } catch (error) {
      setOtpError('ارتباط با سرور برقرار نشد');
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    step === 'phone'
      ? 'ورود یا ثبت‌نام'
      : step === 'otp'
        ? 'تایید شماره'
        : step === 'password'
          ? 'ورود با رمز عبور'
          : 'رمز عبور بسازید';

  const subtitle =
    step === 'phone'
      ? 'شماره موبایل خود را وارد کنید تا کد تایید برایتان ارسال شود.'
      : step === 'otp'
        ? `کد ${toPersianDigits(OTP_CODE_LENGTH)} رقمی ارسال‌شده به شمارهٔ شما را وارد کنید.`
        : step === 'password'
          ? 'شماره موبایل و رمز عبور خود را وارد کنید.'
          : 'برای ورودهای بعدی یک رمز عبور بسازید. این کار اختیاری است.';

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
          <h1 className="text-2xl font-bold mb-2 text-center text-primary">{title}</h1>
          <p className="text-sm text-on-surface-variant text-center mb-6">{subtitle}</p>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">
                  شماره موبایل
                </label>
                <div className="relative" dir="ltr">
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = normalizeDigits(e.target.value);
                      setPhoneNumber(val);
                      if (touched.phone && /^09[0-9]{9}$/.test(val)) {
                        setPhoneError('');
                      }
                    }}
                    onBlur={handlePhoneBlur}
                    placeholder="09123456789"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? 'phone-error' : undefined}
                    className={`input text-left ${isPhoneValid ? 'pe-10 border-success/60 focus:border-success' : ''} ${phoneError ? 'border-error' : ''}`}
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  {isPhoneValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {phoneError && (
                  <p id="phone-error" role="alert" className="text-error text-xs mt-1">{phoneError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>در حال ارسال...</span>
                  </>
                ) : (
                  'ارسال کد'
                )}
              </button>

              {/* A user who has a password does not have to wait for a code. */}
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <span className="h-px flex-1 bg-outline-variant" />
                یا
                <span className="h-px flex-1 bg-outline-variant" />
              </div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => { setStep('password'); setPhoneError(''); setPasswordError(''); }}
                className="btn btn-ghost btn-md w-full"
              >
                <KeyRound className="w-4 h-4" />
                ورود با رمز عبور
              </button>
            </form>
          ) : step === 'otp' ? (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="otp">
                  کد تایید
                </label>
                <div className="text-sm text-on-surface-variant mb-2" dir="ltr">{toPersianDigits(phoneNumber)}</div>
                <div className="relative" dir="ltr">
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={OTP_CODE_LENGTH}
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => {
                      const value = normalizeDigits(e.target.value);
                      setOtp(value);
                      setOtpError('');
                      if (value.length === OTP_CODE_LENGTH && !isLoading) {
                        submitOtp(value);
                      }
                    }}
                    onBlur={handleOtpBlur}
                    placeholder="123456"
                    aria-invalid={!!otpError}
                    aria-describedby={otpError ? 'otp-error' : undefined}
                    className={`input text-center tracking-widest ${isOtpValid ? 'pe-10 border-success/60 focus:border-success' : ''} ${otpError ? 'border-error' : ''}`}
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  {isOtpValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {otpError && (
                  <p id="otp-error" role="alert" className="text-error text-xs mt-1 text-center">{otpError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!!otpError || isLoading}
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>در حال بررسی...</span>
                  </>
                ) : (
                  'تایید'
                )}
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
          ) : step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="login-phone">
                  شماره موبایل
                </label>
                <div className="relative" dir="ltr">
                  <input
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = normalizeDigits(e.target.value);
                      setPhoneNumber(val);
                      if (touched.loginPhone && /^09[0-9]{9}$/.test(val)) {
                        setPhoneError('');
                      }
                    }}
                    onBlur={handleLoginPhoneBlur}
                    placeholder="09123456789"
                    aria-invalid={!!phoneError}
                    aria-describedby={phoneError ? 'login-phone-error' : undefined}
                    className={`input text-left ${isLoginPhoneValid ? 'pe-10 border-success/60 focus:border-success' : ''} ${phoneError ? 'border-error' : ''}`}
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  {isLoginPhoneValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {phoneError && (
                  <p id="login-phone-error" role="alert" className="text-error text-xs mt-1">{phoneError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="login-password">
                  رمز عبور
                </label>
                <div className="relative" dir="ltr">
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value) setPasswordError('');
                    }}
                    onBlur={handleLoginPasswordBlur}
                    placeholder="••••••••"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'login-password-error' : undefined}
                    className={`input text-left ${isLoginPasswordValid ? 'pe-10 border-success/60 focus:border-success' : ''} ${passwordError ? 'border-error' : ''}`}
                    dir="ltr"
                    required
                    disabled={isLoading}
                  />
                  {isLoginPasswordValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {passwordError && (
                  <p id="login-password-error" role="alert" className="text-error text-xs mt-1">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>در حال ورود...</span>
                  </>
                ) : (
                  'ورود'
                )}
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setPasswordError(''); setPhoneError(''); setPassword(''); }}
                disabled={isLoading}
                className="btn btn-ghost btn-md w-full"
              >
                <MessageSquare className="w-4 h-4" />
                ورود با کد تایید
              </button>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="flex flex-col gap-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-success-container text-success">
                <Check className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="text-sm leading-6">
                  شماره شما تایید شد. یک رمز عبور بسازید تا از این پس بدون
                  انتظار برای پیامک وارد شوید.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="new-password">
                  رمز عبور جدید
                </label>
                <div className="relative" dir="ltr">
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value.length >= 8) setPasswordError('');
                    }}
                    onBlur={handleSetPasswordBlur}
                    placeholder="حداقل ۸ کاراکتر"
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'new-password-error' : undefined}
                    className={`input text-left ${isSetPasswordValid ? 'pe-10 border-success/60 focus:border-success' : ''} ${passwordError ? 'border-error' : ''}`}
                    dir="ltr"
                    required
                    minLength={8}
                    disabled={isLoading}
                  />
                  {isSetPasswordValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {passwordError && (
                  <p id="new-password-error" role="alert" className="text-error text-xs mt-1">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>در حال ذخیره...</span>
                  </>
                ) : (
                  'ذخیره و ورود'
                )}
              </button>
              <button
                type="button"
                onClick={async () => { await completeSignIn(); }}
                disabled={isLoading}
                className="btn btn-ghost btn-md w-full"
              >
                فعلاً رد کن
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

export default function LoginPage({ nextPath }: { nextPath: string | null }) {
  return <LoginForm nextPath={nextPath} />;
}
