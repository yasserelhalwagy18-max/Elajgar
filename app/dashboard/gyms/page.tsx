'use client';

import * as React from 'react';
import Image from 'next/image';
import { Search, MapPin, Star, Tag, CheckCircle2, Ticket, X, Percent } from 'lucide-react';
import { cn, normalizeText, toPersianDigits } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useRouter } from 'next/navigation';

interface Gym {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  isPremium: boolean;
  discountPercentage: number;
  amenities?: string[] | null;
  imageUrl?: string | null;
  isPlaceholder: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  YOGA: 'یوگا',
  POOL: 'استخر',
  CROSSFIT: 'کراس‌فیت',
  MARTIAL_ARTS: 'هنرهای رزمی',
  GENERAL: 'عمومی',
};

/**
 * The photo of a gym.
 *
 * An admin can set a photo for a gym from the admin panel, and that photo
 * is what is shown here. When there is none, a placeholder is used - but
 * that placeholder comes from an external service, which may be blocked on
 * the visitor's network, so the picture falls back to a plain gradient
 * rather than leaving a broken image behind.
 */
function GymImage({ gym }: { gym: Gym }) {
  const [failed, setFailed] = React.useState(false);
  const source = gym.imageUrl || `https://picsum.photos/seed/${gym.id}/600/400`;

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-surface-container"
      />
    );
  }

  return (
    <Image
      src={source}
      alt={gym.name}
      fill
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function GymsPage() {
    const router = useRouter();
    const { isAuthenticated, hasHydrated } = useAuthGuard();
    const mounted = useMounted();

    const [gyms, setGyms] = React.useState<Gym[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const [activeFilter, setActiveFilter] = React.useState('همه');
    const [isSearching, setIsSearching] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');

    // The gyms come from the API - the page used to render a hardcoded list
    // *and* a separate fetched list, so the same screen showed two different
    // sets of gyms.
    React.useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                const res = await fetch('/api/gyms', { signal: controller.signal });
                if (!res.ok) throw new Error('خطا در دریافت اطلاعات باشگاه‌ها');
                const data = await res.json();
                setGyms(Array.isArray(data) ? data : []);
                setLoadError(null);
            } catch (err: any) {
                if (err?.name === 'AbortError') return;
                setLoadError(err.message || 'مشکلی پیش آمد');
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }

        load();
        return () => controller.abort();
    }, []);

    // The filter rail lists the categories that actually exist. It used to be
    // a hardcoded list of four, which left two of the five categories
    // unreachable.
    const filters = React.useMemo(() => {
        const categories = Array.from(new Set(gyms.map((gym) => gym.category)));
        return ['همه', ...categories.map((category) => CATEGORY_LABELS[category] ?? category)];
    }, [gyms]);

    const filteredGyms = React.useMemo(() => {
        const query = normalizeText(searchQuery);

        return gyms.filter((gym) => {
            const matchesFilter =
                activeFilter === 'همه' || CATEGORY_LABELS[gym.category] === activeFilter;
            if (!matchesFilter) return false;
            if (query === '') return true;

            // Match the name, the location, the description and the amenities -
            // and normalize Arabic/Persian letter variants so the search works.
            return (
                normalizeText(gym.name).includes(query) ||
                normalizeText(gym.location).includes(query) ||
                normalizeText((gym.amenities ?? []).join(' ')).includes(query) ||
                normalizeText(CATEGORY_LABELS[gym.category] ?? '').includes(query)
            );
        });
    }, [gyms, activeFilter, searchQuery]);

    if (!mounted || !hasHydrated || !isAuthenticated) return null;

    return (
        <div className="p-6 pb-28 max-w-2xl mx-auto">
            <header className="card sticky top-0 z-40 px-6 py-5 rounded-3xl mb-8 mt-2 transition-[box-shadow]">
                {isSearching ? (
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSearching(false);
                                setSearchQuery('');
                            }}
                            aria-label="پاک کردن جستجو"
                            className="icon-btn shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <input
                            type="search"
                            autoFocus
                            aria-label="جستجو در نام یا مکان باشگاه"
                            placeholder="جستجو در نام یا مکان باشگاه..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input"
                        />
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-primary tracking-tight">شبکه سلامت</h1>
                            <p className="text-sm text-on-surface-variant mt-1">باشگاه‌های شریک و تخفیف‌ها</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSearching(true)}
                            aria-label="جستجو"
                            className="icon-btn bg-surface-variant text-primary"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </header>

            {/* Filters */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 mb-2 mt-4 rail-fade">
                {filters.map(filter => (
                    <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        aria-pressed={activeFilter === filter}
                        className="chip"
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex flex-col gap-6 mt-4">
                {isLoading ? (
                    <div className="flex flex-col gap-6" aria-busy="true" aria-label="در حال بارگذاری">
                        {[1, 2].map(i => (
                            <div key={i} className="card h-72 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : loadError ? (
                    <div className="card p-8 rounded-3xl text-center text-error">{loadError}</div>
                ) : filteredGyms.length === 0 ? (
                    <div className="card p-8 rounded-3xl text-center text-on-surface-variant">
                        باشگاهی با این فیلتر پیدا نشد.
                    </div>
                ) : (
                    filteredGyms.map(gym => (
                        <GymCard key={gym.id} gym={gym} />
                    ))
                )}
            </div>
        </div>
    );
}

function GymCard({ gym }: { gym: Gym }) {
    const [isClaimed, setIsClaimed] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);

    const detailsId = `gym-details-${gym.id}`;
    const amenities = gym.amenities ?? [];
    const description = amenities.join(' • ');
    const categoryLabel = CATEGORY_LABELS[gym.category] ?? gym.category;
    const discountCode = `ELAJ-${gym.id.slice(-6).toUpperCase()}`;
    const discountLabel = gym.discountPercentage > 0 ? `${toPersianDigits(gym.discountPercentage)}٪ تخفیف ویژه` : 'عضویت ویژه';

    return (
        <article className="card rounded-3xl overflow-hidden relative group">
            <div className={cn(
                "absolute top-4 right-4 z-10 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm",
                gym.isPremium ? "bg-surface-container/90 backdrop-blur-md text-primary" : "bg-primary text-white"
            )}>
                {gym.discountPercentage > 0 ? <Percent className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                {discountLabel}
            </div>

            <div className="relative h-48 w-full">
              <GymImage gym={gym} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
                {/* A dark scrim instead of a white tint: the badge sits on top of
                    a gym photo, and a white tint over a light photo left the
                    white label below 4.5:1. `bg-black/60` keeps the text at
                    5.7:1 or better no matter what the photo looks like. */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-white/20">
                    <MapPin className="w-3 h-3" />
                    {gym.location}
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-3 gap-3">
                    <h2 className="text-xl font-bold text-on-surface">{gym.name}</h2>
                    <div className="flex items-center gap-1 bg-surface/50 px-2.5 py-1 rounded-lg shrink-0">
                        <span className="font-bold text-sm">{toPersianDigits(gym.rating)}</span>
                        <Star className="w-4 h-4 text-warning fill-warning" />
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-md">
                        {categoryLabel}
                    </span>
                    {gym.isPremium && (
                        <span className="text-xs font-bold bg-primary/10 text-primary-dark px-2.5 py-1 rounded-md">
                            ویژه
                        </span>
                    )}
                </div>

                {description && (
                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-4 leading-relaxed">
                        {description}
                    </p>
                )}

                {isExpanded && (
                    <div id={detailsId} className="mb-4 p-4 bg-surface rounded-2xl border border-outline-variant/30">
                        {isClaimed ? (
                            <div className="flex flex-col items-center text-center gap-2">
                                <CheckCircle2 className="w-8 h-8 text-success mb-1" />
                                <p className="text-sm font-medium text-on-surface-variant">کد تخفیف شما با موفقیت صادر شد!</p>
                                <div className="bg-surface-container px-6 py-3 rounded-xl border border-dashed border-primary text-primary font-mono font-bold text-lg mt-2 w-full select-all">
                                    {discountCode}
                                </div>
                                <p className="text-xs text-on-surface-variant mt-1">هنگام مراجعه به باشگاه این کد را ارائه دهید.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center gap-3">
                                <Ticket className="w-8 h-8 text-primary opacity-80" />
                                <p className="text-sm text-on-surface-variant">
                                    شما می‌توانید از تخفیف اختصاصی علاج‌گر برای این مجموعه استفاده کنید.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsClaimed(true)}
                                    className="btn btn-primary btn-md w-full mt-2"
                                >
                                    دریافت کد تخفیف
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    className={cn(
                        "btn w-full",
                        isExpanded ? "btn-secondary btn-md" : "btn-primary btn-md"
                    )}
                >
                    {isExpanded ? 'بستن' : 'مشاهده جزئیات و دریافت تخفیف'}
                </button>
            </div>
        </article>
    );
}
