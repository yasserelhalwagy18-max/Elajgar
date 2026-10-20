'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { articles } from '@/lib/education-content';
import { Modal } from '@/components/ui/Modal';

export function EducationalContent({ activeTag = 'همه' }: { activeTag?: string }) {
  const [activeArticle, setActiveArticle] = React.useState<typeof articles[0] | null>(null);

  const filteredArticles = activeTag === 'همه'
    ? articles
    : articles.filter(article => article.category === activeTag);

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl font-bold text-on-surface">محتوای آموزشی</h2>
        {/* This section already renders every article, so the old "see all"
            link pointed at the page the user was already on. */}
        <span className="text-sm font-medium text-on-surface-variant">
          {filteredArticles.length.toLocaleString('fa-IR')} مطلب
        </span>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="card p-8 rounded-3xl text-center text-on-surface-variant">
          در این دسته هنوز مطلبی منتشر نشده است.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredArticles.map((article) => {
            const Icon = article.icon;
            return (
              <motion.button
                type="button"
                key={article.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="card card-hover p-4 rounded-3xl flex items-center gap-4 text-start cursor-pointer"
                onClick={() => setActiveArticle(article)}
              >
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner bg-surface-variant flex items-center justify-center">
                  {/* A designed tile instead of a random stock photo: the
                      placeholder service is an external dependency and
                      unrelated photos read as unreliable medical content. */}
                  <Icon className={`w-8 h-8 ${article.color}`} />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`p-1 ${article.bg} rounded-md`}>
                        <Icon className={`w-3 h-3 ${article.color}`} />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{article.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface leading-tight mb-2">{article.title}</h3>
                  </div>
                  <div className="flex items-center text-xs text-on-surface-variant font-medium">
                    <span>زمان مطالعه: {article.readTime}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Article Modal */}
      <Modal
        open={!!activeArticle}
        onClose={() => setActiveArticle(null)}
        title={activeArticle?.title}
        size="md"
      >
        {activeArticle && (
          <>
            <div className="relative w-full aspect-video bg-surface-variant rounded-2xl overflow-hidden mb-5 flex items-center justify-center">
              {React.createElement(activeArticle.icon, {
                className: `w-20 h-20 ${activeArticle.color}`,
              })}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 ${activeArticle.bg} rounded-md`}>
                {React.createElement(activeArticle.icon, { className: `w-4 h-4 ${activeArticle.color}` })}
              </div>
              <span className="text-xs font-bold text-on-surface-variant">{activeArticle.category}</span>
              <span className="text-xs text-on-surface-variant mr-auto">{activeArticle.readTime} مطالعه</span>
            </div>

            <div className="text-sm text-on-surface-variant leading-relaxed space-y-4">
              {activeArticle.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
