'use client';

import * as React from 'react';
import Image from 'next/image';
import { BookOpen, Droplet, Apple, Activity, HeartPulse, X } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';

const articles = [
  { id: 1, title: 'فواید آب درمانی برای مفاصل', category: 'آب درمانی', icon: Droplet, color: 'text-primary', bg: 'bg-primary/10', image: 'water_therapy', readTime: '۴ دقیقه' },
  { id: 2, title: 'تغذیه مناسب برای کاهش التهاب', category: 'تغذیه', icon: Apple, color: 'text-error', bg: 'bg-error/10', image: 'healthy_food', readTime: '۶ دقیقه' },
  { id: 3, title: 'اصول صحیح نشستن پشت میز', category: 'اصلاح وضعیت', icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10', image: 'posture_sitting', readTime: '۵ دقیقه' },
  { id: 4, title: 'چگونه از زانو درد پیشگیری کنیم؟', category: 'سلامت مفاصل', icon: HeartPulse, color: 'text-tertiary', bg: 'bg-tertiary/10', image: 'knee_health', readTime: '۸ دقیقه' },
  { id: 5, title: 'سبک زندگی سالم و تاثیر آن بر درد', category: 'سبک زندگی', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', image: 'healthy_lifestyle', readTime: '۳ دقیقه' }
];

export function EducationalContent({ activeTag = 'همه' }: { activeTag?: string }) {
  const [activeArticle, setActiveArticle] = React.useState<typeof articles[0] | null>(null);

  const filteredArticles = activeTag === 'همه'
    ? articles
    : articles.filter(article => article.category === activeTag);


  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl font-bold text-on-surface">محتوای آموزشی</h2>
        <Link href="/dashboard/education" className="text-sm font-bold text-primary cursor-pointer hover:underline">مشاهده همه</Link>
      </div>

      <div className="flex flex-col gap-4">
        {filteredArticles.map((article) => {
          const Icon = article.icon;
          return (
            <motion.div
              key={article.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-4 rounded-[2rem] border border-white/60 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-white/50 transition-colors"
              onClick={() => setActiveArticle(article)}
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                <Image
                  src={`https://picsum.photos/seed/${article.image}/200/200`}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between h-full">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`p-1 ${article.bg} rounded-md`}>
                        <Icon className={`w-3 h-3 ${article.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase">{article.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface leading-tight mb-2">{article.title}</h3>
                </div>
                <div className="flex items-center text-[10px] text-on-surface-variant font-medium">
                  <span>زمان مطالعه: {article.readTime}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Article Modal Overlay */}
      <AnimatePresence>
        {activeArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={() => setActiveArticle(null)}
                ></motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-10 w-full max-w-lg bg-surface rounded-[2rem] overflow-hidden shadow-2xl border border-white/20 max-h-[90vh] flex flex-col"
                >
                    <div className="relative w-full aspect-video bg-surface-variant">
                        <button
                            onClick={() => setActiveArticle(null)}
                            className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center text-on-surface hover:bg-white/60 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <Image
                            src={`https://picsum.photos/seed/${activeArticle.image}/800/400`}
                            alt={activeArticle.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="p-6 bg-white overflow-y-auto">
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`p-1.5 ${activeArticle.bg} rounded-md`}>
                                {React.createElement(activeArticle.icon, { className: `w-4 h-4 ${activeArticle.color}` })}
                            </div>
                            <span className="text-xs font-bold text-on-surface-variant uppercase">{activeArticle.category}</span>
                            <span className="text-xs text-on-surface-variant mr-auto">{activeArticle.readTime} مطالعه</span>
                        </div>
                        <h3 className="text-xl font-bold text-on-surface mb-4 leading-tight">{activeArticle.title}</h3>
                        <div className="text-sm text-on-surface-variant leading-relaxed space-y-4">
                            <p>لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد.</p>
                            <p>تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.</p>
                            <p>لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </section>

  );
}
