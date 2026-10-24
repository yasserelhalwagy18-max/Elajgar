'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, CreditCard, Lock, ShieldCheck, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatNumber, toPersianDigits } from '@/lib/utils';
import { adminRequest } from '@/lib/admin-client';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useMounted } from '@/hooks/use-mounted';
import { Skeleton } from '@/components/ui/Skeleton';

interface Plan {
  key: string;
  title: string;
  price: number;
  description: string | null;
  features: string[];
  durationDays: number;
}

/**
 * The checkout page.
 *
 * The gateway is a **mock**: no card data is sent anywhere and no money
 * moves. The form is here so the whole flow - plan, checkout, confirmation,
 * subscription - can be exercised end to end before a real gateway is
 * wired in. Swapping in a real provider means replacing the two calls in
 * `handlePay` and nothing else.
 */
export default function CheckoutPage() {
  const params = useParams<{ planKey: string }>();
  const router = useRouter();
  const planKey = params.planKey;
  const { isAuthenticated, hasHydrated } = useAuthGuard();
  const mounted = useMounted();

  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isPaying, setIsPaying] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
  const [expiresAt, setExpiresAt] = React.useState<string | null>(null);

  const [cardNumber, setCardNumber] = React.useState('');
  const [cardHolder, setCardHolder] = React.useState('');
  const [expiry, setExpiry] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [formError, setFormError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const handleCardNumberBlur = () => {
    setTouched((prev) => ({ ...prev, cardNumber: true }));
    const clean = cardNumber.replace(/\s/g, '');
    if (!clean) {
      setFieldErrors((prev) => ({ ...prev, cardNumber: 'شماره کارت را وارد کنید' }));
    } else if (clean.length < 12) {
      setFieldErrors((prev) => ({ ...prev, cardNumber: 'شماره کارت را کامل وارد کنید' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleCardHolderBlur = () => {
    setTouched((prev) => ({ ...prev, cardHolder: true }));
    if (!cardHolder.trim()) {
      setFieldErrors((prev) => ({ ...prev, cardHolder: 'نام صاحب کارت را وارد کنید' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, cardHolder: '' }));
    }
  };

  const handleExpiryBlur = () => {
    setTouched((prev) => ({ ...prev, expiry: true }));
    if (!expiry.trim()) {
      setFieldErrors((prev) => ({ ...prev, expiry: 'تاریخ انقضا را وارد کنید' }));
    } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setFieldErrors((prev) => ({ ...prev, expiry: 'تاریخ انقضا را به شکل MM/YY وارد کنید' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, expiry: '' }));
    }
  };

  const handleCvvBlur = () => {
    setTouched((prev) => ({ ...prev, cvv: true }));
    if (!cvv.trim()) {
      setFieldErrors((prev) => ({ ...prev, cvv: 'کد CVV را وارد کنید' }));
    } else if (!/^\d{3,4}$/.test(cvv)) {
      setFieldErrors((prev) => ({ ...prev, cvv: 'کد CVV را وارد کنید' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, cvv: '' }));
    }
  };

  const isCardNumberValid = touched.cardNumber && cardNumber.replace(/\s/g, '').length >= 12 && !fieldErrors.cardNumber;
  const isCardHolderValid = touched.cardHolder && cardHolder.trim().length > 0 && !fieldErrors.cardHolder;
  const isExpiryValid = touched.expiry && /^\d{2}\/\d{2}$/.test(expiry) && !fieldErrors.expiry;
  const isCvvValid = touched.cvv && /^\d{3,4}$/.test(cvv) && !fieldErrors.cvv;

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/plans', { signal: controller.signal, cache: 'no-store' });
        if (!res.ok) throw new Error('failed');

        const plans = (await res.json()) as Plan[];
        const found = plans.find((entry) => entry.key === planKey);

        if (!found) {
          setLoadError('این پلن در حال حاضر قابل خرید نیست');
          return;
        }

        setPlan(found);
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
        setLoadError('دریافت اطلاعات پلن انجام نشد');
      }
    }

    void load();
    return () => controller.abort();
  }, [planKey]);

  const handlePay = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!plan) return;

    setTouched({ cardNumber: true, cardHolder: true, expiry: true, cvv: true });

    const newFieldErrors: Record<string, string> = {};
    if (cardNumber.replace(/\s/g, '').length < 12) {
      newFieldErrors.cardNumber = 'شماره کارت را کامل وارد کنید';
    }
    if (!cardHolder.trim()) {
      newFieldErrors.cardHolder = 'نام صاحب کارت را وارد کنید';
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newFieldErrors.expiry = 'تاریخ انقضا را به شکل MM/YY وارد کنید';
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      newFieldErrors.cvv = 'کد CVV را وارد کنید';
    }
    setFieldErrors(newFieldErrors);

    if (cardNumber.replace(/\s/g, '').length < 12) {
      setFormError('شماره کارت را کامل وارد کنید');
      return;
    }
    if (!cardHolder.trim()) {
      setFormError('نام صاحب کارت را وارد کنید');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setFormError('تاریخ انقضا را به شکل MM/YY وارد کنید');
      return;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setFormError('کد CVV را وارد کنید');
      return;
    }

    setFormError(null);
    setIsPaying(true);

    // 1. Ask the server to open a payment.
    const checkout = await adminRequest<{
      paymentId: string;
      reference: string;
      amount: number;
    }>('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ planKey: plan.key }),
    });

    if (!checkout.ok || !checkout.data) {
      setFormError(checkout.error ?? 'شروع پرداخت انجام نشد');
      setIsPaying(false);
      return;
    }

    // 2. The "gateway" approves it. A real gateway would post back to a
    //    callback URL with the reference; here the client confirms directly.
    const confirm = await adminRequest<{
      success: boolean;
      subscription: { expiresAt: string };
    }>('/api/checkout/confirm', {
      method: 'POST',
      body: JSON.stringify({ reference: checkout.data.reference }),
    });

    if (!confirm.ok || !confirm.data) {
      setFormError(confirm.error ?? 'تایید پرداخت انجام نشد');
      setIsPaying(false);
      return;
    }

    setExpiresAt(confirm.data.subscription.expiresAt);
    setPaid(true);
    setIsPaying(false);
    toast.success('پرداخت با موفقیت انجام شد');
  };

  if (!mounted || !hasHydrated || !isAuthenticated) return null;

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="card rounded-3xl p-8 text-center max-w-md">
          <AlertTriangle className="w-6 h-6 text-warning mx-auto mb-4" />
          <p className="font-bold text-on-surface">{loadError}</p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/education')}
            className="btn btn-primary btn-md mt-6"
          >
            بازگشت به بخش آموزش
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div
          role="status"
          aria-live="polite"
          aria-label="در حال بارگذاری"
          className="card rounded-3xl p-8 w-full max-w-md flex flex-col gap-4"
        >
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="card rounded-3xl p-8 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-full bg-success-container flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <h1 className="text-xl font-black text-on-surface mb-2">پرداخت با موفقیت انجام شد</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-1">
            اشتراک «{plan.title}» فعال شد و همه محتوای ویژه برای شما باز است.
          </p>
          {expiresAt && (
            <p className="text-xs text-on-surface-variant mb-6">
              اعتبار تا{' '}
              {new Intl.DateTimeFormat('fa-IR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).format(new Date(expiresAt))}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => router.push('/dashboard/education')}
              className="btn btn-primary btn-md"
            >
              رفتن به بخش آموزش
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/profile')}
              className="btn btn-secondary btn-md"
            >
              پروفایل من
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* The order */}
        <section className="lg:col-span-2 card rounded-3xl p-6 h-fit lg:sticky lg:top-10">
          <h2 className="text-lg font-black text-on-surface mb-1">{plan.title}</h2>
          {plan.description && (
            <p className="text-xs text-on-surface-variant mb-4">{plan.description}</p>
          )}

          <div className="text-3xl font-black text-primary mb-1">
            {formatNumber(plan.price)}
            <span className="text-sm font-normal text-on-surface-variant ms-1">تومان</span>
          </div>
          <p className="text-xs text-on-surface-variant mb-6">
            پرداخت یک‌باره برای {toPersianDigits(plan.durationDays)} روز
          </p>

          {plan.features.length > 0 && (
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-on-surface-variant">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* The gateway */}
        <section className="lg:col-span-3 card rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black text-on-surface">درگاه پرداخت</h1>
          </div>

          <div className="mb-6 p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div className="text-xs text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">این یک درگاه آزمایشی است.</strong> هیچ مبلغی
              جابه‌جا نمی‌شود، اطلاعات کارت به جایی ارسال نمی‌شود و هر شماره کارتی پذیرفته می‌شود.
              این صفحه فقط برای آزمودن کل مسیر خرید است.
            </div>
          </div>

          <form onSubmit={handlePay} className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium" htmlFor="card-number">
                  شماره کارت
                </label>
                {isCardNumberValid && (
                  <span className="inline-flex items-center gap-1 text-xs text-success font-medium" aria-hidden="true">
                    <Check className="w-3.5 h-3.5" />
                    معتبر
                  </span>
                )}
              </div>
              <div className="relative" dir="ltr">
                <input
                  id="card-number"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  value={cardNumber}
                  onChange={(event) => {
                    setCardNumber(event.target.value);
                    if (fieldErrors.cardNumber && event.target.value.replace(/\s/g, '').length >= 12) {
                      setFieldErrors((prev) => ({ ...prev, cardNumber: '' }));
                    }
                  }}
                  onBlur={handleCardNumberBlur}
                  placeholder="6037 9999 9999 9999"
                  aria-invalid={!!fieldErrors.cardNumber}
                  aria-describedby={fieldErrors.cardNumber ? 'card-number-error' : undefined}
                  className={cn(
                    "input font-mono text-left",
                    isCardNumberValid && "pe-10 border-success/60 focus:border-success",
                    fieldErrors.cardNumber && "border-error"
                  )}
                  autoComplete="off"
                />
                {isCardNumberValid && (
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>
              {fieldErrors.cardNumber && (
                <p id="card-number-error" role="alert" className="text-error text-xs mt-1">{fieldErrors.cardNumber}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium" htmlFor="card-holder">
                  نام صاحب کارت
                </label>
                {isCardHolderValid && (
                  <span className="inline-flex items-center gap-1 text-xs text-success font-medium" aria-hidden="true">
                    <Check className="w-3.5 h-3.5" />
                    معتبر
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="card-holder"
                  type="text"
                  value={cardHolder}
                  onChange={(event) => {
                    setCardHolder(event.target.value);
                    if (fieldErrors.cardHolder && event.target.value.trim().length > 0) {
                      setFieldErrors((prev) => ({ ...prev, cardHolder: '' }));
                    }
                  }}
                  onBlur={handleCardHolderBlur}
                  placeholder="نام و نام خانوادگی"
                  aria-invalid={!!fieldErrors.cardHolder}
                  aria-describedby={fieldErrors.cardHolder ? 'card-holder-error' : undefined}
                  className={cn(
                    "input",
                    isCardHolderValid && "pe-10 border-success/60 focus:border-success",
                    fieldErrors.cardHolder && "border-error"
                  )}
                  autoComplete="off"
                />
                {isCardHolderValid && (
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>
              {fieldErrors.cardHolder && (
                <p id="card-holder-error" role="alert" className="text-error text-xs mt-1">{fieldErrors.cardHolder}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium" htmlFor="card-expiry">
                    انقضا
                  </label>
                  {isExpiryValid && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-medium" aria-hidden="true">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="relative" dir="ltr">
                  <input
                    id="card-expiry"
                    type="text"
                    dir="ltr"
                    maxLength={5}
                    value={expiry}
                    onChange={(event) => {
                      setExpiry(event.target.value);
                      if (fieldErrors.expiry && /^\d{2}\/\d{2}$/.test(event.target.value)) {
                        setFieldErrors((prev) => ({ ...prev, expiry: '' }));
                      }
                    }}
                    onBlur={handleExpiryBlur}
                    placeholder="MM/YY"
                    aria-invalid={!!fieldErrors.expiry}
                    aria-describedby={fieldErrors.expiry ? 'card-expiry-error' : undefined}
                    className={cn(
                      "input font-mono text-left",
                      isExpiryValid && "pe-10 border-success/60 focus:border-success",
                      fieldErrors.expiry && "border-error"
                    )}
                    autoComplete="off"
                  />
                  {isExpiryValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {fieldErrors.expiry && (
                  <p id="card-expiry-error" role="alert" className="text-error text-xs mt-1">{fieldErrors.expiry}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium" htmlFor="card-cvv">
                    CVV
                  </label>
                  {isCvvValid && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-medium" aria-hidden="true">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <div className="relative" dir="ltr">
                  <input
                    id="card-cvv"
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    maxLength={4}
                    value={cvv}
                    onChange={(event) => {
                      setCvv(event.target.value);
                      if (fieldErrors.cvv && /^\d{3,4}$/.test(event.target.value)) {
                        setFieldErrors((prev) => ({ ...prev, cvv: '' }));
                      }
                    }}
                    onBlur={handleCvvBlur}
                    placeholder="123"
                    aria-invalid={!!fieldErrors.cvv}
                    aria-describedby={fieldErrors.cvv ? 'card-cvv-error' : undefined}
                    className={cn(
                      "input font-mono text-left",
                      isCvvValid && "pe-10 border-success/60 focus:border-success",
                      fieldErrors.cvv && "border-error"
                    )}
                    autoComplete="off"
                  />
                  {isCvvValid && (
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-success flex items-center" aria-hidden="true">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </div>
                {fieldErrors.cvv && (
                  <p id="card-cvv-error" role="alert" className="text-error text-xs mt-1">{fieldErrors.cvv}</p>
                )}
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isPaying}
              className="btn btn-cta btn-lg w-full mt-2 flex items-center justify-center gap-2"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>در حال پرداخت...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>پرداخت {formatNumber(plan.price)} تومان</span>
                </>
              )}
            </button>

            <p className="text-caption text-on-surface-variant text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              پرداخت از طریق درگاه آزمایشی سامانه انجام می‌شود
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
