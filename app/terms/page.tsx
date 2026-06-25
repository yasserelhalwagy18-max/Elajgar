'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length <= 1) {
      router.push('/');
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-on-surface">شرایط و قوانین خدمات</h1>
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
            aria-label="بازگشت"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="glass-panel p-8 rounded-3xl">
          <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4 text-primary">۱. تعریف خدمات</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۲. مسئولیت‌ها و تعهدات</h2>
            <p className="text-on-surface-variant mb-6 leading-relaxed">
              کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.
            </p>

            <h2 className="text-2xl font-bold mb-4 text-primary">۳. حریم خصوصی</h2>
            <p className="text-on-surface-variant leading-relaxed">
              لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد. کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
