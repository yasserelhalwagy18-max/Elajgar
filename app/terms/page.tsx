'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    // `history.length` counts the whole tab, so a page that was opened
    // directly - in a new tab, from a bookmark, from a link - still has an
    // entry before it: the blank page the browser started on. Going back
    // there shows nothing at all, so the home page is the better answer.
    if (window.history.length <= 1 || !document.referrer) {
      router.push('/');
      return;
    }
    router.back();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-on-surface">شرایط و قوانین خدمات</h1>
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ms-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
            aria-label="بازگشت"
          >
            <ArrowRight className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="card p-8 rounded-3xl">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <p className="text-on-surface-variant leading-relaxed mb-8">
              استفاده از سامانهٔ «علاج‌گر» به‌معنای پذیرش شرایط زیر است. این شرایط را
              با دقت بخوانید؛ اگر با بخشی از آن‌ها موافق نیستید، از سامانه استفاده
              نکنید.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۱. تعریف خدمات</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              «علاج‌گر» یک برنامهٔ خودمراقبتی و آموزشی است. کاربر در آن محل و شدت درد
              خود را ثبت می‌کند، پرسشنامه‌ای را پر می‌کند، غذا و آب و خواب و فعالیت
              روزانه‌اش را ثبت می‌کند و در پایان، شاخص سلامت، نمودارهای روند، توصیه‌های
              مراقبتی عمومی و برنامه‌های تمرینی عمومی را می‌بیند. برخی بخش‌ها، مانند
              ویدیوهای تخصصی، نیازمند اشتراک فعال هستند.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۲. این سامانه جایگزین پزشک نیست</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              هیچ‌چیز در این برنامه تشخیص پزشکی نیست. شاخص سلامت، تحلیل درد و توصیه‌های
              مراقبتی، همگی بر پایهٔ پاسخ‌هایی هستند که خودتان در برنامه ثبت کرده‌اید و
              جای معاینه، آزمایش یا نظر پزشک را نمی‌گیرند. اگر درد شدید یا ناگهانی
              دارید، دردتان بیش از دو هفته طول کشیده است، یا هر علامت نگران‌کننده‌ای
              دارید، به پزشک مراجعه کنید و تصمیم درمانی خود را از پزشک بگیرید.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۳. حساب کاربری و مسئولیت شما</h2>
            <ul className="text-on-surface-variant leading-relaxed mb-6 list-disc list-inside space-y-2">
              <li>
                با شمارهٔ موبایلی که به آن دسترسی دارید وارد شوید؛ کد تایید برای شما
                پیامک می‌شود.
              </li>
              <li>
                اگر رمز عبور می‌سازید، آن را در جایی امن نگه دارید. مسئولیت هر فعالیتی
                که با حساب شما انجام شود، بر عهدهٔ شماست.
              </li>
              <li>
                اطلاعاتی را که ثبت می‌کنید باید مربوط به خودتان باشد. ثبت اطلاعات نادرست
                باعث می‌شود شاخص سلامت و توصیه‌ها نادرست باشند.
              </li>
              <li>
                با پذیرش شرایط استفاده، اجازه می‌دهید اطلاعات سلامت شما برای محاسبهٔ
                شاخص و نمودارها و پیشنهاد محتوا استفاده شود - جزئیات در{' '}
                <Link href="/privacy" className="text-primary font-bold underline">
                  سیاست حریم خصوصی
                </Link>{' '}
                آمده است.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-primary">۴. محتوای آموزشی و توصیه‌ها</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              مطالب آموزشی، ویدیوها و تمرین‌های پیشنهادی، محتوای عمومی هستند و برای
              همه نوشته شده‌اند. اگر تمرینی با وضعیت جسمی شما سازگار نیست یا درد را
              بیشتر می‌کند، آن را انجام ندهید و با پزشک خود مشورت کنید. ما مسئول
              پیامدِ تمرینی هستیم که پزشک آن را برای شما تجویز نکرده است.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۵. اشتراک و پرداخت</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              پلن‌های اشتراک در بخش آموزش نمایش داده می‌شوند و قیمت، مدت اعتبار و
              امکانات هر پلن پیش از پرداخت به‌طور کامل نوشته شده است. مبلغ یک‌باره
              پرداخت می‌شود و اشتراک تا پایان مدت اعتبار فعال می‌ماند. در حال حاضر
              درگاه پرداخت این سامانه آزمایشی است و هیچ مبلغی جابه‌جا نمی‌شود.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۶. دسترسی و قطعی سرویس</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              ما تلاش می‌کنیم برنامه همیشه در دسترس باشد، اما ممکن است به‌دلیل
              نگهداری یا مشکل فنی، بخشی از خدمات موقتاً در دسترس نباشد. تلاش برای
              دسترسی غیرمجاز به سامانه یا نقض امنیتی، به قطع دسترسی حساب می‌انجامد.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۷. محدودیت مسئولیت</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              مسئولیت هر تصمیمی که بر پایهٔ اطلاعات این برنامه می‌گیرید، بر عهدهٔ خودتان
              است. سامانه در حد توان خود برای درستی محاسبات و به‌روز بودن محتوا تلاش
              می‌کند، اما مسئولیتی در قبال نتیجهٔ درمانی یا تشخیصی که از محتوای آن
              برداشت شود ندارد.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۸. تغییر شرایط</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              ممکن است این شرایط را به‌روز کنیم. نسخهٔ تازه در همین صفحه منتشر
              می‌شود و ادامهٔ استفاده از سامانه به‌معنای پذیرش آن است.
            </p>

            <p className="text-sm text-on-surface-variant border-t border-outline-variant pt-6">
              دربارهٔ اینکه چه اطلاعاتی از شما نگهداری می‌شود،{' '}
              <Link href="/privacy" className="text-primary font-bold underline">
                سیاست حریم خصوصی
              </Link>{' '}
              را بخوانید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
