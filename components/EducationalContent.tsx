'use client';

import * as React from 'react';
import Image from 'next/image';
import { BookOpen, Droplet, Apple, Activity, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';

const articles = [
  { id: 1, title: 'فواید آب درمانی برای مفاصل', category: 'آب درمانی', icon: Droplet, color: 'text-primary', bg: 'bg-primary/10', image: 'water_therapy', readTime: '۴ دقیقه' },
  { id: 2, title: 'تغذیه مناسب برای کاهش التهاب', category: 'تغذیه', icon: Apple, color: 'text-error', bg: 'bg-error/10', image: 'healthy_food', readTime: '۶ دقیقه' },
  { id: 3, title: 'اصول صحیح نشستن پشت میز', category: 'اصلاح وضعیت', icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10', image: 'posture_sitting', readTime: '۵ دقیقه' },
  { id: 4, title: 'چگونه از زانو درد پیشگیری کنیم؟', category: 'سلامت مفاصل', icon: HeartPulse, color: 'text-tertiary', bg: 'bg-tertiary/10', image: 'knee_health', readTime: '۸ دقیقه' },
  { id: 5, title: 'سبک زندگی سالم و تاثیر آن بر درد', category: 'سبک زندگی', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', image: 'healthy_lifestyle', readTime: '۳ دقیقه' }
];

export function EducationalContent() {
  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl font-bold text-on-surface">محتوای آموزشی</h2>
        <span className="text-sm font-bold text-primary cursor-pointer hover:underline">مشاهده همه</span>
      </div>

      <div className="flex flex-col gap-4">
        {articles.map((article) => {
          const Icon = article.icon;
          return (
            <motion.div
              key={article.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="glass-card p-4 rounded-[2rem] border border-white/60 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-white/50 transition-colors"
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
    </section>
  );
}
