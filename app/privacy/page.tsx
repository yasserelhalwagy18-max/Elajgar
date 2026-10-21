'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function PrivacyPage() {
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
          <h1 className="text-xl font-bold text-on-surface">حریم خصوصی</h1>
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
              در این صفحه توضیح می‌دهیم چه اطلاعاتی دربارهٔ سلامت شما
              جمع‌آوری می‌شود، چرا آن را نگه می‌داریم و چه کسی می‌تواند آن را
              ببیند. اطلاعات سلامت، دادهٔ حساسی است و ما آن را جدی می‌گیریم.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۱. چه اطلاعاتی جمع‌آوری می‌کنیم</h2>
            <ul className="text-on-surface-variant leading-relaxed mb-6 list-disc list-inside space-y-2">
              <li>
                <strong className="text-on-surface">اطلاعات حساب:</strong> شمارهٔ موبایل (که با
                آن وارد می‌شوید و برای ارسال کد تایید استفاده می‌شود)، و در صورت تمایل
                رمز عبور. رمز عبور هرگز به‌صورت متن ساده ذخیره نمی‌شود؛ فقط یک نسخهٔ
                رمزنگاری‌شده از آن نگهداری می‌شود.
              </li>
              <li>
                <strong className="text-on-surface">اطلاعات فردی:</strong> نام و نام خانوادگی،
                سن، جنسیت، قد، وزن، سطح فعالیت و شغل - همه اختیاری، و فقط برای محاسبهٔ
                شاخص سلامت و اهداف تغذیه‌ای به کار می‌روند.
              </li>
              <li>
                <strong className="text-on-surface">اطلاعات سلامت:</strong> نواحی درد و شدت و
                نوع هر ناحیه، پاسخ‌های پرسشنامهٔ درد (مدت زمان درد، تشدید با فعالیت،
                تسکین با استراحت، سابقهٔ آسیب و جراحی، کیفیت خواب، سطح استرس، ساعات
                نشستن و روزهای ورزش)، بیماری‌های زمینه‌ای و داروهایی که مصرف می‌کنید.
              </li>
              <li>
                <strong className="text-on-surface">گزارش‌های روزانه:</strong> میزان آب، ساعت و
                کیفیت خواب، دقیقه‌های فعالیت، وزن و شدت درد هر روز، و غذاهایی که ثبت
                می‌کنید به‌همراه کالری و درشت‌مغذی‌های آن‌ها.
              </li>
              <li>
                <strong className="text-on-surface">اطلاعات اشتراک:</strong> اگر اشتراکی تهیه
                کنید، وضعیت و مدت اعتبار آن و سوابق پرداخت شما.
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 text-primary">۲. چرا این اطلاعات را جمع‌آوری می‌کنیم</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              اطلاعات شما فقط برای محاسبهٔ همان چیزی به کار می‌رود که در برنامه می‌بینید:
              شاخص سلامت، اهداف کالری و آب، نقشهٔ درد، نمودارهای روند و برنامهٔ
              تمرینی. بدون این داده‌ها برنامه نمی‌تواند برای شما چیزی محاسبه کند. ما
              از این اطلاعات برای تبلیغات شخصی‌سازی‌شده یا فروش آن‌ها به شخص ثالث استفاده
              نمی‌کنیم.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۳. اطلاعات چگونه نگهداری می‌شوند</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              اطلاعات روی سرورهای ما در پایگاه‌دادهٔ اختصاصی نگهداری می‌شود و دسترسی به
              آن محدود به مدیران سامانه است. نشست شما با یک کوکی امنیتیِ ناشناس
              (<span dir="ltr" className="font-mono">httpOnly</span>) نگهداری می‌شود که در
              مرورگر شما قابل خواندن با جاوااسکریپت نیست. اطلاعات سلامت شما در اختیار
              هیچ شخص ثالثی قرار نمی‌گیرد.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۴. چه کسی اطلاعات شما را می‌بیند</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              شما به تمام اطلاعات خودتان دسترسی دارید. مدیران سامانه می‌توانند آمارهای
              تجمیعی (برای نمونه، پراکندگی نواحی درد در میان کاربران) و در صورت نیاز به
              پشتیبانی، پروندهٔ شما را ببینند. هیچ‌کدام از این اطلاعات برای تبلیغات یا
              بازاریابی به بیرون از سامانه داده نمی‌شود.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۵. اطلاعات روی دستگاه شما</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              بخشی از اطلاعات شما (مثل روزهایی که تازه ثبت کرده‌اید و هنوز همگام نشده‌اند)
              در حافظهٔ موقت مرورگر شما نگهداری می‌شود تا اگر اینترنت قطع شد کار شما از
              دست نرود. با پاک کردن داده‌های سایت در مرورگر، این بخش پاک می‌شود و فقط
              چیزی که پیش‌تر روی سرور ذخیره شده باقی می‌ماند.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۶. حق شما</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              شما می‌توانید هر زمان اطلاعات پروفایل خود را از صفحهٔ «پروفایل و تنظیمات»
              ببینید و ویرایش کنید، رمز عبور خود را تغییر دهید یا حذف کنید، و از حساب
              خارج شوید. برای حذف کامل حساب و داده‌های سلامت، از{' '}
              <Link href="/dashboard/profile" className="text-primary font-bold underline">
                صفحهٔ پروفایل
              </Link>{' '}
              بخش «پشتیبانی» را باز کنید و درخواست خود را بفرستید.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۷. کودکان</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              این سامانه برای کاربران بالای ۱۳ سال طراحی شده است. ما آگاهانه اطلاعات
              شخصی از کودکان کمتر از ۱۳ سال جمع‌آوری نمی‌کنیم.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۸. تغییر این سیاست</h2>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              اگر این سیاست تغییر کند، نسخهٔ تازه در همین صفحه منتشر می‌شود. ادامهٔ
              استفاده از سامانه پس از انتشار نسخهٔ تازه، به‌معنای پذیرش آن است.
            </p>

            <p className="text-sm text-on-surface-variant border-t border-outline-variant pt-6">
              توضیح دربارهٔ خدمات و مسئولیت‌ها را در{' '}
              <Link href="/terms" className="text-primary font-bold underline">
                شرایط و قوانین خدمات
              </Link>{' '}
              بخوانید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
