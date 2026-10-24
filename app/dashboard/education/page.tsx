'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Verified, Check, Play, CreditCard, GraduationCap } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn, formatNumber, toPersianDigits } from '@/lib/utils';
import { CorrectionalCalendar } from '@/components/CorrectionalCalendar';
import { ExerciseGallery } from '@/components/ExerciseGallery';
import { SmartAnalysis } from '@/components/SmartAnalysis';
import { EducationalContent } from '@/components/EducationalContent';
import { useStore } from '@/lib/store';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Modal } from '@/components/ui/Modal';
import { IconBadge } from '@/components/ui/IconBadge';
import { Skeleton } from '@/components/ui/Skeleton';

interface Plan {
  key: string;
  title: string;
  price: number;
  description: string | null;
  features: string[];
  isFeatured: boolean;
  durationDays: number;
}

interface PremiumVideo {
  id: string;
  title: string;
  /** `null` for a locked premium video - the server never sends its URL. */
  url: string | null;
  thumbnailUrl: string | null;
  durationInMinutes: number;
  isPremium: boolean;
}

interface SubscriptionState {
  isActive: boolean;
  subscription: { plan: { key: string; title: string }; expiresAt: string } | null;
}

export default function EducationPage() {
    const router = useRouter();
    const { isAuthenticated, hasHydrated } = useAuthGuard();
    const mounted = useMounted();
    const { setAuthenticated } = useStore();
    const shouldReduceMotion = useReducedMotion();

    const [activeTag, setActiveTag] = React.useState('همه');
    const [showPremiumModal, setShowPremiumModal] = React.useState(false);
    const [plans, setPlans] = React.useState<Plan[]>([]);
    const [premiumVideos, setPremiumVideos] = React.useState<PremiumVideo[]>([]);
    const [subscription, setSubscription] = React.useState<SubscriptionState | null>(null);

    // The tags come from the articles that are actually published, so a
    // category that is not used does not show up as an empty filter.
    const [tags, setTags] = React.useState<string[]>(['همه']);

  // The plans, the premium videos and the user's own subscription.
  React.useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();

    async function load() {
      try {
        const [plansRes, videosRes, subscriptionRes] = await Promise.all([
          fetch('/api/plans', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/content/videos', { signal: controller.signal, cache: 'no-store' }),
          fetch('/api/subscription', { signal: controller.signal, cache: 'no-store' }),
        ]);

        if (plansRes.ok) {
          const data = (await plansRes.json()) as Plan[];
          setPlans(Array.isArray(data) ? data : []);
        }

        if (videosRes.ok) {
          const data = (await videosRes.json()) as PremiumVideo[];
          setPremiumVideos(Array.isArray(data) ? data : []);
        }

        if (subscriptionRes.ok) {
          setSubscription((await subscriptionRes.json()) as SubscriptionState);
        }
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
      }
    }

    void load();
    return () => controller.abort();
  }, [isAuthenticated]);

  // The category rail, derived from the published articles.
  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch('/api/content/articles', {
          signal: controller.signal,
          cache: 'no-store',
        });
        if (!res.ok) return;

        const articles = (await res.json()) as Array<{ category: string }>;
        const categories = Array.from(new Set(articles.map((article) => article.category)));
        setTags(['همه', ...categories]);
      } catch (error) {
        if ((error as Error)?.name === 'AbortError') return;
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  if (!mounted) return null;
  if (!hasHydrated || !isAuthenticated) return null;

  const hasPremiumAccess = subscription?.isActive ?? false;

  // Only the premium videos belong behind the paywall.
  const lockedVideos = premiumVideos.filter((video) => video.isPremium);

  return (
        <div className="p-6 pb-28">
            <header className="mb-6 sticky top-0 pt-4 z-40 bg-surface/85 backdrop-blur-md">
                <h1 className="text-2xl font-bold text-on-surface mb-4 flex items-center gap-2.5">
                    <IconBadge variant="education" icon={GraduationCap} size={24} />
                    آموزش و تحلیل هوشمند
                </h1>

                {/* Horizontal scroll tags - the chip component keeps the active
                    state identical to every other filter rail in the app. */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 rail-fade" role="tablist" aria-label="دسته‌بندی مطالب">
                    {tags.map((tag) => {
                        const isSelected = activeTag === tag;
                        return (
                            <button
                                key={tag}
                                type="button"
                                role="tab"
                                aria-selected={isSelected}
                                onClick={() => setActiveTag(tag)}
                                className={cn('chip relative overflow-hidden transition-colors', isSelected && 'text-white')}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="education-active-tag"
                                        className="absolute inset-0 bg-primary -z-0"
                                        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', bounce: 0.15, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10">{tag}</span>
                            </button>
                        );
                    })}
                </div>
            </header>

            <SmartAnalysis />
            <CorrectionalCalendar />
            <ExerciseGallery />
            <EducationalContent activeTag={activeTag} />

            {/* Premium content */}
            <section className="relative mt-8">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Verified className="w-6 h-6 text-primary" />
                        پکیج تخصصی توانبخشی
                    </h2>
                    {hasPremiumAccess && (
                        <span className="text-xs font-bold text-success bg-success-container px-3 py-1 rounded-full">
                            اشتراک فعال شما
                        </span>
                    )}
                </div>

                <div className="card rounded-3xl p-4 relative overflow-hidden min-h-[350px]">

                    {/* The real premium videos, blurred until the user subscribes. */}
                    <div
                        className={cn('space-y-4', !hasPremiumAccess && 'opacity-50 blur-[4px]')}
                        aria-hidden={!hasPremiumAccess}
                    >
                        {lockedVideos.length > 0 ? (
                            lockedVideos.map((video) => (
                                <div key={video.id} className="flex gap-4 p-2 bg-surface-variant/30 rounded-2xl items-center">
                                    <div className="w-24 h-16 bg-surface-variant rounded-xl border border-white/20 flex items-center justify-center shrink-0">
                                        <Play className="w-6 h-6 text-on-surface-variant" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-on-surface truncate">
                                            {video.title}
                                        </p>
                                        <p className="text-xs text-on-surface-variant mt-1">
                                            {toPersianDigits(video.durationInMinutes)} دقیقه
                                            {video.isPremium && ' • ویژه'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="space-y-4" aria-busy="true" aria-label="در حال بارگذاری ویدیوها">
                              {[1, 2, 3].map(i => (
                                 <div key={i} className="flex gap-4 p-2 bg-surface-variant/30 rounded-2xl items-center">
                                     <Skeleton className="w-24 h-16 rounded-xl shrink-0" />
                                     <div className="flex-1 space-y-2">
                                          <Skeleton className="h-4 rounded-md w-3/4" />
                                          <Skeleton className="h-3 rounded-md w-1/2" />
                                     </div>
                                 </div>
                              ))}
                            </div>
                        )}
                    </div>

                    {/* Paywall overlay */}
                    {!hasPremiumAccess && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-t from-surface via-surface/80 to-surface/20 z-10 backdrop-blur-[2px]">
                            <div className="card rounded-3xl p-8 text-center border-t-2 border-secondary-container w-full max-w-sm">
                                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                                    <Lock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-on-surface mb-2">دسترسی به پکیج کامل</h3>
                                <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                                    ویدیوهای تخصصی، برنامه تمرینی اختصاصی و گزارش پیشرفت.
                                </p>
                                <button type="button" onClick={() => setShowPremiumModal(true)} className="btn btn-cta w-full py-4 font-bold">
                                    ارتقا به ویژه و بازگشایی
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* The plan picker */}
            <Modal
                open={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                title="پلن‌های اشتراک ویژه"
                size="xl"
            >
                {plans.length === 0 ? (
                    <div className="py-10 text-center text-on-surface-variant font-bold">
                        در حال حاضر پلن فعالی برای خرید وجود ندارد.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.key}
                                className={cn(
                                    'card rounded-2xl p-6 relative overflow-hidden flex flex-col',
                                    plan.isFeatured
                                        ? 'border-2 border-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                        : 'border border-outline-variant',
                                )}
                            >
                                {plan.isFeatured && (
                                    <div className="absolute top-3 right-[-30px] bg-warning text-on-warning text-xs font-bold py-1 px-10 rotate-45 z-10">
                                        پیشنهاد ویژه
                                    </div>
                                )}

                                <h3 className="text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
                                    {plan.title}
                                    {plan.isFeatured && <Verified className="w-4 h-4 text-primary" />}
                                </h3>
                                <p className="text-sm text-on-surface-variant mb-4">
                                    {plan.description ?? 'دسترسی کامل به محتوای ویژه'}
                                </p>

                                <div className="text-xl font-bold text-primary mb-6 mt-auto">
                                    {formatNumber(plan.price)}
                                    <span className="text-sm font-normal text-on-surface-variant mr-1">تومان / ماه</span>
                                </div>

                                {plan.features.length > 0 && (
                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2 text-xs text-on-surface-variant">
                                                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPremiumModal(false);
                                        router.push(`/checkout/${plan.key}`);
                                    }}
                                    className={cn('btn w-full', plan.isFeatured ? 'btn-cta' : 'btn-secondary')}
                                >
                                    <CreditCard className="w-4 h-4" />
                                    خرید
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
}
