'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, formatNumber, normalizeDigits } from '@/lib/utils';
import { adminRequest } from '@/lib/admin-client';

interface Plan {
  key: string;
  title: string;
  price: number;
  description: string | null;
  features: string[];
  durationDays: number;
}

/**
 * Normalise a card number as the user types.
 *
 * `normalizeDigits` rewrites Persian (۱۲۳) and Arabic (١٢٣) digits into Latin
 * ones - a Persian-keyboard user typing "۶۰۳۷" must end up in the same
 * state as one typing "6037" - then drops everything that is not a digit,
 * caps at 16 (the length an Iranian bank card has) and groups the value in
 * fours the way the placeholder shows it.
 */
const formatCardNumber = (raw: string): string => {
  const digits = normalizeDigits(raw).replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

/** MM/YY with the same digit normalisation: ۱۲۳۴ becomes 12/34. */
const formatExpiry = (raw: string): string => {
  const digits = normalizeDigits(raw).replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

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
  /** Bumped by «تلاش مجدد» to re-run the plan fetch. */
  const [reloadToken, setReloadToken] = React.useState(0);

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
  }, [planKey, reloadToken]);

  const handlePay = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!plan) return;

    // The stored values are already normalised by the `onChange` handlers;
    // this re-normalises defensively in case the state was filled another way.
    const digits = normalizeDigits(cardNumber).replace(/\D/g, '');
    if (digits.length !== 16) {
      setFormError('شماره کارت را ۱۶ رقمی وارد کنید');
      return;
    }
    if (!cardHolder.trim()) {
      setFormError('نام صاحب کارت را وارد کنید');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(normalizeDigits(expiry))) {
      setFormError('تاریخ انقضا را به شکل MM/YY وارد کنید');
      return;
    }
    if (!/^\d{3,4}$/.test(normalizeDigits(cvv))) {
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

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="card rounded-3xl p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-10 h-10 text-warning mx-auto mb-4" />
          <p className="font-bold text-on-surface">{loadError}</p>
          {/* Recovery hatches: a retry for the transient case, and a way
              back to the plans for the permanent one («پلن قابل خرید
              نیست») - the payment flow must not dead-end on one button. */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-center mt-6">
            <button
              type="button"
              onClick={() => {
                setLoadError(null);
                setReloadToken((token) => token + 1);
              }}
              className="btn btn-primary btn-md"
            >
              تلاش مجدد
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/education')}
              className="btn btn-secondary btn-md"
            >
              مشاهده پلن‌ها
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <p className="font-bold text-on-surface-variant">در حال بارگذاری...</p>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
        <div className="card rounded-3xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-success-container flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-xl font-black text-on-surface mb-2">پرداخت با موفقیت انجام شد</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-1">
            اشتراک «{plan.title}» فعال شد و همه محتوای ویژه برای شما باز است.
          </p>
          {expiresAt && (
            <p className="text-xs text-on-surface-variant mb-6">
              اعتبار تا{' '}
              {new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
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
            <span className="text-sm font-normal text-on-surface-variant me-1">تومان</span>
          </div>
          <p className="text-xs text-on-surface-variant mb-6">
            پرداخت یک‌باره برای {plan.durationDays} روز
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
              جابه‌جا نمی‌شود، اطلاعات کارت به جایی ارسال نمی‌شود و هر شماره کارت ۱۶ رقمی پذیرفته می‌شود.
              این صفحه فقط برای آزمودن کل مسیر خرید است.
            </div>
          </div>

          <form onSubmit={handlePay} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="card-number">
                شماره کارت
              </label>
              <input
                id="card-number"
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={19}
                value={cardNumber}
                onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                placeholder="6037 9999 9999 9999"
                className="input font-mono"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="card-holder">
                نام صاحب کارت
              </label>
              <input
                id="card-holder"
                type="text"
                value={cardHolder}
                onChange={(event) => setCardHolder(event.target.value)}
                placeholder="نام و نام خانوادگی"
                className="input"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="card-expiry">
                  انقضا
                </label>
                <input
                  id="card-expiry"
                  type="text"
                  dir="ltr"
                  maxLength={5}
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  placeholder="MM/YY"
                  className="input font-mono"
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="card-cvv">
                  CVV
                </label>
                <input
                  id="card-cvv"
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={4}
                  value={cvv}
                  onChange={(event) => setCvv(normalizeDigits(event.target.value).replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
                  className="input font-mono"
                  autoComplete="off"
                />
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2">
                {formError}
              </p>
            )}

            <button type="submit" disabled={isPaying} className="btn btn-primary btn-lg w-full mt-2">
              <Lock className="w-5 h-5" />
              {isPaying ? 'در حال پرداخت...' : `پرداخت ${formatNumber(plan.price)} تومان`}
            </button>

            <p className="text-[11px] text-on-surface-variant text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              پرداخت از طریق درگاه آزمایشی سامانه انجام می‌شود
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
