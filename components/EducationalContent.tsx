'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { seedArticles } from '@/lib/education-content';
import { resolveContentIcon } from '@/lib/content-icons';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';

/** An article as the API returns it. */
interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  content: string[];
  icon: string;
  readTime: string | null;
}

/**
 * The educational articles.
 *
 * The list comes from the database so an admin can publish and edit articles
 * from the panel. The bundled seed is only a fallback for when the request
 * fails - it holds the same content the seed wrote, so the section never
 * renders empty.
 */
export function EducationalContent({ activeTag = 'همه' }: { activeTag?: string }) {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
  const [activeArticle, setActiveArticle] = React.useState<Article | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/content/articles', {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('failed');

        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
        setStatus('ready');
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
        setArticles(seedArticles as unknown as Article[]);
        setStatus('error');
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const filteredArticles = activeTag === 'همه'
    ? articles
    : articles.filter(article => article.category === activeTag);

  return (
    <section className="mb-10">
      <div className="flex justify-between items-end mb-4 px-1">
        <h2 className="text-xl font-bold text-on-surface">محتوای آموزشی</h2>
        <span className="text-sm font-medium text-on-surface-variant">
          {filteredArticles.length.toLocaleString('fa-IR')} مطلب
        </span>
      </div>

      {status === 'error' && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-warning/10 border border-warning/20 text-xs text-on-surface-variant">
          <AlertCircle className="w-4 h-4 text-warning shrink-0" />
          نمایش آخرین نسخه ذخیره‌شده محتوا - ارتباط با سرور برقرار نشد.
        </div>
      )}

      {status === 'loading' && articles.length === 0 ? (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="در حال بارگذاری مطالب آموزشی">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 rounded-3xl flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-28 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="card p-8 rounded-3xl text-center text-on-surface-variant">
          در این دسته هنوز مطلبی منتشر نشده است.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredArticles.map((article) => {
            const { icon: Icon, color, bg } = resolveContentIcon(article.icon);
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
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>

                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`p-1 ${bg} rounded-md`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{article.category}</span>
                    </div>
                    <h3 className="font-bold text-sm text-on-surface leading-tight mb-2">{article.title}</h3>
                  </div>
                  <div className="flex items-center text-xs text-on-surface-variant font-medium">
                    <span>زمان مطالعه: {article.readTime ?? '—'}</span>
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
              {React.createElement(resolveContentIcon(activeArticle.icon).icon, {
                className: `w-20 h-20 ${resolveContentIcon(activeArticle.icon).color}`,
              })}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 ${resolveContentIcon(activeArticle.icon).bg} rounded-md`}>
                {React.createElement(resolveContentIcon(activeArticle.icon).icon, {
                  className: `w-4 h-4 ${resolveContentIcon(activeArticle.icon).color}`,
                })}
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
