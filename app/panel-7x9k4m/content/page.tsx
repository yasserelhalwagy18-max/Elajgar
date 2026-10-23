'use client';

import * as React from 'react';
import { BookOpen, Dumbbell, Pencil, Plus, Trash2, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminNumberInput,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
  AdminTable,
  StatusPill,
  type AdminColumn,
} from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminDelete, adminPatch, adminPost } from '@/lib/admin-client';
import { useAdminResource, useDebouncedValue, usePageNumber } from '@/hooks/use-admin-resource';
import { CONTENT_ICON_KEYS, resolveContentIcon } from '@/lib/content-icons';
import { toPersianDigits } from '@/lib/utils';

const PAGE_SIZE = 15;

type Tab = 'articles' | 'exercises' | 'videos';

const TABS: Array<{ key: Tab; label: string; icon: React.ReactNode }> = [
  { key: 'articles', label: 'مطالب آموزشی', icon: <BookOpen className="w-4 h-4" /> },
  { key: 'exercises', label: 'تمرینات', icon: <Dumbbell className="w-4 h-4" /> },
  { key: 'videos', label: 'ویدیوها', icon: <Video className="w-4 h-4" /> },
];

interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  content: string[];
  icon: string;
  readTime: string | null;
  isPublished: boolean;
  sortOrder: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  durationMinutes: number;
  sets: number;
  reps: number;
  emoji: string;
  accent: string;
  targetTags: string[] | null;
  isPublished: boolean;
  sortOrder: number;
}

interface VideoContent {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  isPremium: boolean;
  isPublished: boolean;
  durationInMinutes: number;
  level: string;
  associatedPainTags: string[] | null;
}

const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'مبتدی' },
  { value: 'INTERMEDIATE', label: 'متوسط' },
  { value: 'ADVANCED', label: 'پیشرفته' },
];

const EXERCISE_CATEGORIES = ['کششی', 'اصلاحی', 'تقویتی', 'آب درمانی'];
const EXERCISE_LEVELS = ['مبتدی', 'متوسط', 'پیشرفته', 'همه'];

export default function AdminContentPage() {
  const [tab, setTab] = React.useState<Tab>('articles');
  const [search, setSearch] = React.useState('');

  const debouncedSearch = useDebouncedValue(search);

  // Switching tabs or changing the search always starts at the first page.
  const [page, setPage] = usePageNumber(`${tab}|${debouncedSearch}`);

  return (
    <>
      <AdminPageHeader
        title="مدیریت محتوا"
        description="مطالب آموزشی، تمرینات و ویدیوهایی که کاربران در بخش آموزش می‌بینند."
      />

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setTab(entry.key)}
            aria-pressed={tab === entry.key}
            className="chip flex items-center gap-2"
          >
            {entry.icon}
            {entry.label}
          </button>
        ))}
      </div>

      {tab === 'articles' && (
        <ArticlesTab
          search={search}
          setSearch={setSearch}
          query={debouncedSearch}
          page={page}
          setPage={setPage}
        />
      )}
      {tab === 'exercises' && (
        <ExercisesTab
          search={search}
          setSearch={setSearch}
          query={debouncedSearch}
          page={page}
          setPage={setPage}
        />
      )}
      {tab === 'videos' && (
        <VideosTab
          search={search}
          setSearch={setSearch}
          query={debouncedSearch}
          page={page}
          setPage={setPage}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                    */
/* -------------------------------------------------------------------------- */

function ArticlesTab({
  search,
  setSearch,
  query,
  page,
  setPage,
}: {
  search: string;
  setSearch: (value: string) => void;
  query: string;
  page: number;
  setPage: (page: number) => void;
}) {
  const params = React.useMemo(
    () => ({ q: query || undefined, page, pageSize: PAGE_SIZE }),
    [query, page],
  );

  const { items, total, totalPages, isLoading, error, reload } = useAdminResource<Article>(
    '/api/admin/articles',
    params,
  );

  const [editing, setEditing] = React.useState<Article | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    slug: '',
    category: '',
    summary: '',
    content: '',
    icon: 'book',
    readTime: '۴ دقیقه',
    isPublished: true,
    // The numeric field holds a string, like every other admin form: the
    // input hands back the digit-normalised text and save parses it.
    sortOrder: '0',
  });
  /** Which field is at fault (null = the form as a whole), plus the message. */
  const [formError, setFormError] = React.useState<{
    field: 'title' | 'slug' | 'category' | null;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Article | null>(null);

  // The modal error carries a stable id, so the offending field can point at
  // it with aria-describedby while aria-invalid marks the field itself.
  const errorId = React.useId();

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      slug: '',
      category: '',
      summary: '',
      content: '',
      icon: 'book',
      readTime: '۴ دقیقه',
      isPublished: true,
      sortOrder: String(total),
    });
    setFormError(null);
    setIsCreating(true);
  };

  const openEdit = (article: Article) => {
    setIsCreating(false);
    setFormError(null);
    setForm({
      title: article.title,
      slug: article.slug,
      category: article.category,
      summary: article.summary ?? '',
      content: (article.content ?? []).join('\n\n'),
      icon: article.icon,
      readTime: article.readTime ?? '',
      isPublished: article.isPublished,
      sortOrder: String(article.sortOrder),
    });
    setEditing(article);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError({ field: 'title', message: 'عنوان مطلب الزامی است' });
      return;
    }
    if (!form.category.trim()) {
      setFormError({ field: 'category', message: 'دسته‌بندی الزامی است' });
      return;
    }
    if (!form.slug.trim()) {
      setFormError({ field: 'slug', message: 'نامک (slug) الزامی است' });
      return;
    }

    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase(),
      category: form.category.trim(),
      summary: form.summary.trim() || null,
      content: form.content,
      icon: form.icon,
      readTime: form.readTime.trim() || null,
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const result = editing
      ? await adminPatch(`/api/admin/articles/${editing.id}`, payload)
      : await adminPost('/api/admin/articles', payload);

    if (result.ok) {
      toast.success(editing ? 'مطلب به‌روزرسانی شد' : 'مطلب جدید ثبت شد');
      closeModal();
      reload();
    } else {
      setFormError({ field: null, message: result.error ?? 'ذخیره انجام نشد' });
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await adminDelete(`/api/admin/articles/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('مطلب حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setPendingDelete(null);
  };

  const columns: AdminColumn<Article>[] = [
    {
      key: 'title',
      header: 'عنوان',
      render: (article) => {
        const { icon: Icon, color } = resolveContentIcon(article.icon);
        return (
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-surface-variant flex items-center justify-center shrink-0">
              <Icon className={`w-4 h-4 ${color}`} />
            </span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-bold text-on-surface truncate">{article.title}</span>
              <span className="text-xs text-on-surface-variant font-mono truncate" dir="ltr">
                {article.slug}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'دسته‌بندی',
      render: (article) => <StatusPill tone="neutral">{article.category}</StatusPill>,
    },
    {
      key: 'published',
      header: 'وضعیت',
      render: (article) => (
        <StatusPill tone={article.isPublished ? 'success' : 'warning'}>
          {article.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
        </StatusPill>
      ),
    },
    {
      key: 'readTime',
      header: 'زمان مطالعه',
      render: (article) => (
        <span className="text-xs text-on-surface-variant">{article.readTime ?? '—'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (article) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(article)}
            aria-label={`ویرایش ${article.title}`}
            title="ویرایش"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(article)}
            aria-label={`حذف ${article.title}`}
            title="حذف"
            className="icon-btn h-9 w-9 bg-error/10 text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="card rounded-3xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی مطلب"
          placeholder="جستجو در عنوان یا نامک..."
        />
        <button type="button" onClick={openCreate} className="btn btn-primary btn-md shrink-0">
          <Plus className="w-4 h-4" />
          مطلب جدید
        </button>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(article) => article.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="مطلبی با این جستجو پیدا نشد"
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <Modal
        open={isCreating || editing !== null}
        onClose={closeModal}
        title={editing ? 'ویرایش مطلب' : 'مطلب جدید'}
        size="lg"
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="article-title">
                عنوان
              </label>
              <input
                id="article-title"
                type="text"
                value={form.title}
                onChange={(event) => {
                  setForm({ ...form, title: event.target.value });
                  setFormError(null);
                }}
                className="input"
                aria-invalid={formError?.field === 'title' || undefined}
                aria-describedby={formError?.field === 'title' ? errorId : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="article-slug">
                نامک (انگلیسی)
              </label>
              <input
                id="article-slug"
                type="text"
                value={form.slug}
                onChange={(event) => {
                  setForm({ ...form, slug: event.target.value });
                  setFormError(null);
                }}
                placeholder="water-therapy-for-joints"
                className="input"
                dir="ltr"
                aria-invalid={formError?.field === 'slug' || undefined}
                aria-describedby={formError?.field === 'slug' ? errorId : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="article-category">
                دسته‌بندی
              </label>
              <input
                id="article-category"
                type="text"
                value={form.category}
                onChange={(event) => {
                  setForm({ ...form, category: event.target.value });
                  setFormError(null);
                }}
                placeholder="آب درمانی"
                className="input"
                aria-invalid={formError?.field === 'category' || undefined}
                aria-describedby={formError?.field === 'category' ? errorId : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="article-readtime">
                زمان مطالعه
              </label>
              <input
                id="article-readtime"
                type="text"
                value={form.readTime}
                onChange={(event) => setForm({ ...form, readTime: event.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="article-icon">
                آیکون
              </label>
              <select
                id="article-icon"
                value={form.icon}
                onChange={(event) => setForm({ ...form, icon: event.target.value })}
                className="select"
              >
                {CONTENT_ICON_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="article-summary">
              خلاصه
            </label>
            <input
              id="article-summary"
              type="text"
              value={form.summary}
              onChange={(event) => setForm({ ...form, summary: event.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="article-content">
              متن مطلب (هر پاراگراف را با یک خط خالی جدا کنید)
            </label>
            <textarea
              id="article-content"
              value={form.content}
              onChange={(event) => setForm({ ...form, content: event.target.value })}
              rows={10}
              className="input leading-loose"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="article-order">
                ترتیب نمایش
              </label>
              <AdminNumberInput
                id="article-order"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(value) => setForm({ ...form, sortOrder: value })}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer sm:mt-7">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => setForm({ ...form, isPublished: event.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold">منتشر شده</span>
            </label>
          </div>

          {formError && (
            <p
              id={errorId}
              role="alert"
              className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2"
            >
              {formError.message}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary btn-md">
              انصراف
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary btn-md">
              <BookOpen className="w-4 h-4" />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف مطلب"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            مطلب <strong>{pendingDelete?.title}</strong> برای همیشه حذف می‌شود.
          </>
        }
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Exercises                                                                   */
/* -------------------------------------------------------------------------- */

function ExercisesTab({
  search,
  setSearch,
  query,
  page,
  setPage,
}: {
  search: string;
  setSearch: (value: string) => void;
  query: string;
  page: number;
  setPage: (page: number) => void;
}) {
  const params = React.useMemo(
    () => ({ q: query || undefined, page, pageSize: PAGE_SIZE }),
    [query, page],
  );

  const { items, total, totalPages, isLoading, error, reload } = useAdminResource<Exercise>(
    '/api/admin/exercises',
    params,
  );

  const [editing, setEditing] = React.useState<Exercise | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    category: 'کششی',
    level: 'مبتدی',
    // The numeric fields hold strings, like every other admin form: the input
    // hands back the digit-normalised text and save parses it.
    durationMinutes: '5',
    sets: '3',
    reps: '10',
    emoji: '🧘',
    targetTags: '',
    isPublished: true,
    sortOrder: '0',
  });
  /** Which field is at fault (null = the form as a whole), plus the message. */
  const [formError, setFormError] = React.useState<{
    field: 'title' | null;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<Exercise | null>(null);

  // The modal error carries a stable id, so the offending field can point at
  // it with aria-describedby while aria-invalid marks the field itself.
  const errorId = React.useId();

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      category: 'کششی',
      level: 'مبتدی',
      durationMinutes: '5',
      sets: '3',
      reps: '10',
      emoji: '🧘',
      targetTags: '',
      isPublished: true,
      sortOrder: String(total),
    });
    setFormError(null);
    setIsCreating(true);
  };

  const openEdit = (exercise: Exercise) => {
    setIsCreating(false);
    setFormError(null);
    setForm({
      title: exercise.title,
      description: exercise.description ?? '',
      category: exercise.category,
      level: exercise.level,
      durationMinutes: String(exercise.durationMinutes),
      sets: String(exercise.sets),
      reps: String(exercise.reps),
      emoji: exercise.emoji,
      targetTags: (exercise.targetTags ?? []).join('، '),
      isPublished: exercise.isPublished,
      sortOrder: String(exercise.sortOrder),
    });
    setEditing(exercise);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError({ field: 'title', message: 'عنوان تمرین الزامی است' });
      return;
    }

    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      level: form.level,
      durationMinutes: Number(form.durationMinutes) || 0,
      sets: Number(form.sets) || 0,
      reps: Number(form.reps) || 0,
      emoji: form.emoji,
      targetTags: form.targetTags
        .split(/[،,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const result = editing
      ? await adminPatch(`/api/admin/exercises/${editing.id}`, payload)
      : await adminPost('/api/admin/exercises', payload);

    if (result.ok) {
      toast.success(editing ? 'تمرین به‌روزرسانی شد' : 'تمرین جدید ثبت شد');
      closeModal();
      reload();
    } else {
      setFormError({ field: null, message: result.error ?? 'ذخیره انجام نشد' });
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await adminDelete(`/api/admin/exercises/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('تمرین حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setPendingDelete(null);
  };

  const columns: AdminColumn<Exercise>[] = [
    {
      key: 'title',
      header: 'تمرین',
      render: (exercise) => (
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-surface-variant flex items-center justify-center text-lg shrink-0">
            {exercise.emoji}
          </span>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-bold text-on-surface truncate">{exercise.title}</span>
            <span className="text-xs text-on-surface-variant truncate">
              {exercise.description ?? '—'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'دسته',
      render: (exercise) => <StatusPill tone="neutral">{exercise.category}</StatusPill>,
    },
    {
      key: 'level',
      header: 'سطح',
      render: (exercise) => <span className="text-xs">{exercise.level}</span>,
    },
    {
      key: 'duration',
      header: 'مدت',
      render: (exercise) => (
        <span className="text-xs font-mono">{toPersianDigits(exercise.durationMinutes)} دقیقه</span>
      ),
    },
    {
      key: 'published',
      header: 'وضعیت',
      render: (exercise) => (
        <StatusPill tone={exercise.isPublished ? 'success' : 'warning'}>
          {exercise.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (exercise) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(exercise)}
            aria-label={`ویرایش ${exercise.title}`}
            title="ویرایش"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(exercise)}
            aria-label={`حذف ${exercise.title}`}
            title="حذف"
            className="icon-btn h-9 w-9 bg-error/10 text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="card rounded-3xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی تمرین"
          placeholder="جستجو در عنوان یا توضیح..."
        />
        <button type="button" onClick={openCreate} className="btn btn-primary btn-md shrink-0">
          <Plus className="w-4 h-4" />
          تمرین جدید
        </button>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(exercise) => exercise.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="تمرینی با این جستجو پیدا نشد"
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <Modal
        open={isCreating || editing !== null}
        onClose={closeModal}
        title={editing ? 'ویرایش تمرین' : 'تمرین جدید'}
        size="lg"
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="exercise-title">
                عنوان
              </label>
              <input
                id="exercise-title"
                type="text"
                value={form.title}
                onChange={(event) => {
                  setForm({ ...form, title: event.target.value });
                  setFormError(null);
                }}
                className="input"
                aria-invalid={formError?.field === 'title' || undefined}
                aria-describedby={formError?.field === 'title' ? errorId : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="exercise-emoji">
                نماد
              </label>
              <input
                id="exercise-emoji"
                type="text"
                value={form.emoji}
                onChange={(event) => setForm({ ...form, emoji: event.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="exercise-description">
              توضیح
            </label>
            <textarea
              id="exercise-description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={2}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="exercise-category">
                دسته
              </label>
              <select
                id="exercise-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="select"
              >
                {EXERCISE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="exercise-level">
                سطح
              </label>
              <select
                id="exercise-level"
                value={form.level}
                onChange={(event) => setForm({ ...form, level: event.target.value })}
                className="select"
              >
                {EXERCISE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="exercise-duration">
                مدت (دقیقه)
              </label>
              <AdminNumberInput
                id="exercise-duration"
                inputMode="numeric"
                value={form.durationMinutes}
                onChange={(value) => setForm({ ...form, durationMinutes: value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="exercise-sets">
                  ست
                </label>
                <AdminNumberInput
                  id="exercise-sets"
                  inputMode="numeric"
                  value={form.sets}
                  onChange={(value) => setForm({ ...form, sets: value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="exercise-reps">
                  تکرار
                </label>
                <AdminNumberInput
                  id="exercise-reps"
                  inputMode="numeric"
                  value={form.reps}
                  onChange={(value) => setForm({ ...form, reps: value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="exercise-tags">
              نواحی هدف (با کاما جدا کنید)
            </label>
            <input
              id="exercise-tags"
              type="text"
              value={form.targetTags}
              onChange={(event) => setForm({ ...form, targetTags: event.target.value })}
              placeholder="کمر، گردن"
              className="input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="exercise-order">
                ترتیب نمایش
              </label>
              <AdminNumberInput
                id="exercise-order"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(value) => setForm({ ...form, sortOrder: value })}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer sm:mt-7">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => setForm({ ...form, isPublished: event.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold">منتشر شده</span>
            </label>
          </div>

          {formError && (
            <p
              id={errorId}
              role="alert"
              className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2"
            >
              {formError.message}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary btn-md">
              انصراف
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary btn-md">
              <Dumbbell className="w-4 h-4" />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف تمرین"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            تمرین <strong>{pendingDelete?.title}</strong> حذف می‌شود.
          </>
        }
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Videos                                                                      */
/* -------------------------------------------------------------------------- */

function VideosTab({
  search,
  setSearch,
  query,
  page,
  setPage,
}: {
  search: string;
  setSearch: (value: string) => void;
  query: string;
  page: number;
  setPage: (page: number) => void;
}) {
  const params = React.useMemo(
    () => ({ q: query || undefined, page, pageSize: PAGE_SIZE }),
    [query, page],
  );

  const { items, total, totalPages, isLoading, error, reload } = useAdminResource<VideoContent>(
    '/api/admin/videos',
    params,
  );

  const [editing, setEditing] = React.useState<VideoContent | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState({
    title: '',
    url: '',
    thumbnailUrl: '',
    level: 'BEGINNER',
    // A string like every other admin form: the input hands back the
    // digit-normalised text and save parses it.
    durationInMinutes: '5',
    isPremium: false,
    isPublished: true,
    associatedPainTags: '',
  });
  /** Which field is at fault (null = the form as a whole), plus the message. */
  const [formError, setFormError] = React.useState<{
    field: 'title' | 'url' | null;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<VideoContent | null>(null);

  // The modal error carries a stable id, so the offending field can point at
  // it with aria-describedby while aria-invalid marks the field itself.
  const errorId = React.useId();

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      url: '',
      thumbnailUrl: '',
      level: 'BEGINNER',
      durationInMinutes: '5',
      isPremium: false,
      isPublished: true,
      associatedPainTags: '',
    });
    setFormError(null);
    setIsCreating(true);
  };

  const openEdit = (video: VideoContent) => {
    setIsCreating(false);
    setFormError(null);
    setForm({
      title: video.title,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl ?? '',
      level: video.level,
      durationInMinutes: String(video.durationInMinutes),
      isPremium: video.isPremium,
      isPublished: video.isPublished,
      associatedPainTags: (video.associatedPainTags ?? []).join('، '),
    });
    setEditing(video);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError({ field: 'title', message: 'عنوان ویدیو الزامی است' });
      return;
    }
    if (!form.url.trim()) {
      setFormError({ field: 'url', message: 'آدرس ویدیو الزامی است' });
      return;
    }

    setIsSaving(true);

    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      thumbnailUrl: form.thumbnailUrl.trim() || null,
      level: form.level,
      durationInMinutes: Number(form.durationInMinutes) || 1,
      isPremium: form.isPremium,
      isPublished: form.isPublished,
      associatedPainTags: form.associatedPainTags
        .split(/[،,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    };

    const result = editing
      ? await adminPatch(`/api/admin/videos/${editing.id}`, payload)
      : await adminPost('/api/admin/videos', payload);

    if (result.ok) {
      toast.success(editing ? 'ویدیو به‌روزرسانی شد' : 'ویدیو جدید ثبت شد');
      closeModal();
      reload();
    } else {
      setFormError({ field: null, message: result.error ?? 'ذخیره انجام نشد' });
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const result = await adminDelete(`/api/admin/videos/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('ویدیو حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setPendingDelete(null);
  };

  const columns: AdminColumn<VideoContent>[] = [
    {
      key: 'title',
      header: 'عنوان',
      render: (video) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-bold text-on-surface truncate">{video.title}</span>
          <span className="text-xs text-on-surface-variant font-mono truncate" dir="ltr">
            {video.url}
          </span>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'سطح',
      render: (video) => (
        <StatusPill tone="neutral">
          {DIFFICULTY_LEVELS.find((level) => level.value === video.level)?.label ?? video.level}
        </StatusPill>
      ),
    },
    {
      key: 'duration',
      header: 'مدت',
      render: (video) => (
        <span className="text-xs font-mono">{toPersianDigits(video.durationInMinutes)} دقیقه</span>
      ),
    },
    {
      key: 'premium',
      header: 'ویژه',
      render: (video) =>
        video.isPremium ? (
          <StatusPill tone="primary">ویژه</StatusPill>
        ) : (
          <span className="text-xs text-on-surface-variant">—</span>
        ),
    },
    {
      key: 'published',
      header: 'وضعیت',
      render: (video) => (
        <StatusPill tone={video.isPublished ? 'success' : 'warning'}>
          {video.isPublished ? 'منتشر شده' : 'پیش‌نویس'}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (video) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(video)}
            aria-label={`ویرایش ${video.title}`}
            title="ویرایش"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(video)}
            aria-label={`حذف ${video.title}`}
            title="حذف"
            className="icon-btn h-9 w-9 bg-error/10 text-error"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="card rounded-3xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی ویدیو"
          placeholder="جستجو در عنوان یا آدرس..."
        />
        <button type="button" onClick={openCreate} className="btn btn-primary btn-md shrink-0">
          <Plus className="w-4 h-4" />
          ویدیو جدید
        </button>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(video) => video.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="ویدیویی با این جستجو پیدا نشد"
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <Modal
        open={isCreating || editing !== null}
        onClose={closeModal}
        title={editing ? 'ویرایش ویدیو' : 'ویدیو جدید'}
        size="lg"
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="video-title">
              عنوان
            </label>
            <input
              id="video-title"
              type="text"
              value={form.title}
              onChange={(event) => {
                setForm({ ...form, title: event.target.value });
                setFormError(null);
              }}
              className="input"
              aria-invalid={formError?.field === 'title' || undefined}
              aria-describedby={formError?.field === 'title' ? errorId : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="video-url">
              آدرس ویدیو
            </label>
            <input
              id="video-url"
              type="text"
              value={form.url}
              onChange={(event) => {
                setForm({ ...form, url: event.target.value });
                setFormError(null);
              }}
              placeholder="https://..."
              className="input"
              dir="ltr"
              aria-invalid={formError?.field === 'url' || undefined}
              aria-describedby={formError?.field === 'url' ? errorId : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="video-thumb">
              آدرس تصویر بندانگشتی
            </label>
            <input
              id="video-thumb"
              type="text"
              value={form.thumbnailUrl}
              onChange={(event) => setForm({ ...form, thumbnailUrl: event.target.value })}
              className="input"
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="video-level">
                سطح
              </label>
              <select
                id="video-level"
                value={form.level}
                onChange={(event) => setForm({ ...form, level: event.target.value })}
                className="select"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="video-duration">
                مدت (دقیقه)
              </label>
              <AdminNumberInput
                id="video-duration"
                inputMode="numeric"
                value={form.durationInMinutes}
                onChange={(value) => setForm({ ...form, durationInMinutes: value })}
              />
            </div>
            <div className="flex items-end gap-4 pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(event) => setForm({ ...form, isPremium: event.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <span className="text-sm font-bold">ویژه</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) => setForm({ ...form, isPublished: event.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <span className="text-sm font-bold">منتشر شده</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="video-tags">
              نواحی مرتبط (با کاما جدا کنید)
            </label>
            <input
              id="video-tags"
              type="text"
              value={form.associatedPainTags}
              onChange={(event) => setForm({ ...form, associatedPainTags: event.target.value })}
              className="input"
            />
          </div>

          {formError && (
            <p
              id={errorId}
              role="alert"
              className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2"
            >
              {formError.message}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn btn-secondary btn-md">
              انصراف
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary btn-md">
              <Video className="w-4 h-4" />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف ویدیو"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            ویدیو <strong>{pendingDelete?.title}</strong> حذف می‌شود.
          </>
        }
      />
    </>
  );
}
