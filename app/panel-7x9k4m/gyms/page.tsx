'use client';

import * as React from 'react';
import { Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminFilterChip,
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
import { useUnsavedChangesWarning } from '@/hooks/use-unsaved-changes';
import { toPersianDigits } from '@/lib/utils';

const PAGE_SIZE = 20;

const CATEGORIES = [
  { value: 'YOGA', label: 'یوگا' },
  { value: 'POOL', label: 'استخر' },
  { value: 'CROSSFIT', label: 'کراس‌فیت' },
  { value: 'MARTIAL_ARTS', label: 'هنرهای رزمی' },
  { value: 'GENERAL', label: 'عمومی' },
] as const;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category.value, category.label]),
);

interface Gym {
  id: string;
  name: string;
  location: string;
  category: string;
  rating: number;
  isPremium: boolean;
  discountPercentage: number;
  amenities: string[] | null;
  imageUrl: string | null;
}

interface GymForm {
  name: string;
  location: string;
  category: string;
  rating: string;
  discountPercentage: string;
  isPremium: boolean;
  amenities: string;
  imageUrl: string;
}

const EMPTY_FORM: GymForm = {
  name: '',
  location: '',
  category: 'GENERAL',
  rating: '0',
  discountPercentage: '0',
  isPremium: false,
  amenities: '',
  imageUrl: '',
};

export default function AdminGymsPage() {
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');

  const [editing, setEditing] = React.useState<Gym | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState<GymForm>(EMPTY_FORM);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const [pendingDelete, setPendingDelete] = React.useState<Gym | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const [page, setPage] = usePageNumber(`${debouncedSearch}|${category}`);

  const params = React.useMemo(
    () => ({
      q: debouncedSearch || undefined,
      category: category === 'all' ? undefined : category,
      page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedSearch, category, page],
  );

  const { items, total, totalPages, isLoading, error, reload } = useAdminResource<Gym>(
    '/api/admin/gyms',
    params,
  );

  // shortcut: warns even when the form was opened but not touched, compare against the initial values if that annoys users
  useUnsavedChangesWarning(isCreating || editing !== null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsCreating(true);
  };

  const openEdit = (gym: Gym) => {
    setIsCreating(false);
    setFormError(null);
    setForm({
      name: gym.name,
      location: gym.location,
      category: gym.category,
      rating: String(gym.rating),
      discountPercentage: String(gym.discountPercentage),
      isPremium: gym.isPremium,
      amenities: (gym.amenities ?? []).join('، '),
      imageUrl: gym.imageUrl ?? '',
    });
    setEditing(gym);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError('نام باشگاه الزامی است');
      return;
    }
    if (!form.location.trim()) {
      setFormError('موقعیت باشگاه الزامی است');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      category: form.category,
      rating: Number(form.rating) || 0,
      discountPercentage: Number(form.discountPercentage) || 0,
      isPremium: form.isPremium,
      imageUrl: form.imageUrl.trim() || null,
      amenities: form.amenities
        .split(/[،,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
    };

    const result = editing
      ? await adminPatch(`/api/admin/gyms/${editing.id}`, payload)
      : await adminPost('/api/admin/gyms', payload);

    if (result.ok) {
      toast.success(editing ? 'باشگاه به‌روزرسانی شد' : 'باشگاه جدید ثبت شد');
      closeModal();
      reload();
    } else {
      setFormError(result.error ?? 'ذخیره انجام نشد');
    }

    setIsSaving(false);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setBusyId(pendingDelete.id);
    const result = await adminDelete(`/api/admin/gyms/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('باشگاه حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setBusyId(null);
    setPendingDelete(null);
  };

  const columns: AdminColumn<Gym>[] = [
    {
      key: 'name',
      header: 'نام',
      render: (gym) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-on-surface">{gym.name}</span>
          <span className="text-xs text-on-surface-variant">{gym.location}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'دسته‌بندی',
      render: (gym) => (
        <StatusPill tone="neutral">{CATEGORY_LABELS[gym.category] ?? gym.category}</StatusPill>
      ),
    },
    {
      key: 'rating',
      header: 'امتیاز',
      render: (gym) => (
        <span className="tabular-nums font-bold">{toPersianDigits(gym.rating)}</span>
      ),
    },
    {
      key: 'discount',
      header: 'تخفیف',
      render: (gym) => (
        <span className="font-bold text-primary">
          {gym.discountPercentage > 0 ? `${toPersianDigits(gym.discountPercentage)}٪` : '—'}
        </span>
      ),
    },
    {
      key: 'premium',
      header: 'ویژه',
      render: (gym) =>
        gym.isPremium ? <StatusPill tone="primary">ویژه</StatusPill> : <span className="text-xs text-on-surface-variant">—</span>,
    },
    {
      key: 'amenities',
      header: 'امکانات',
      render: (gym) => (
        <span className="text-xs text-on-surface-variant line-clamp-1 max-w-[220px]">
          {(gym.amenities ?? []).join('، ') || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (gym) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(gym)}
            aria-label={`ویرایش ${gym.name}`}
            title="ویرایش"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(gym)}
            disabled={busyId === gym.id}
            aria-label={`حذف ${gym.name}`}
            title="حذف"
            className="icon-btn h-9 w-9 bg-error/10 text-error disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="باشگاه‌های شریک"
        description={`${toPersianDigits(total)} باشگاه در شبکه سلامت ثبت شده است.`}
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" />
            افزودن باشگاه
          </button>
        }
      />

      <div className="card rounded-3xl p-4 mb-6 flex flex-col gap-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی باشگاه"
          placeholder="جستجو بر اساس نام یا موقعیت..."
        />

        <div className="flex flex-wrap gap-2">
          <AdminFilterChip active={category === 'all'} onClick={() => setCategory('all')}>
            همه
          </AdminFilterChip>
          {CATEGORIES.map((entry) => (
            <AdminFilterChip
              key={entry.value}
              active={category === entry.value}
              onClick={() => setCategory(entry.value)}
            >
              {entry.label}
            </AdminFilterChip>
          ))}
        </div>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(gym) => gym.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="باشگاهی با این فیلتر پیدا نشد"
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
        title={editing ? `ویرایش ${editing.name}` : 'افزودن باشگاه'}
        size="lg"
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gym-name">
                نام باشگاه
              </label>
              <input
                id="gym-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gym-location">
                موقعیت
              </label>
              <input
                id="gym-location"
                type="text"
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gym-category">
                دسته‌بندی
              </label>
              <select
                id="gym-category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className="select"
              >
                {CATEGORIES.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gym-rating">
                امتیاز (۰ تا ۵)
              </label>
              <input
                id="gym-rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={(event) => setForm({ ...form, rating: event.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="gym-discount">
                درصد تخفیف
              </label>
              <input
                id="gym-discount"
                type="number"
                min="0"
                max="100"
                value={form.discountPercentage}
                onChange={(event) => setForm({ ...form, discountPercentage: event.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="gym-amenities">
              امکانات (با کاما جدا کنید)
            </label>
            <input
              id="gym-amenities"
              type="text"
              value={form.amenities}
              onChange={(event) => setForm({ ...form, amenities: event.target.value })}
              placeholder="استخر، سونا، کلاس یوگا"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="gym-image">
              آدرس تصویر
            </label>
            <input
              id="gym-image"
              type="text"
              value={form.imageUrl}
              onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
              className="input"
              dir="ltr"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPremium}
              onChange={(event) => setForm({ ...form, isPremium: event.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-sm font-bold">باشگاه ویژه</span>
          </label>

          {formError && (
            <p role="alert" className="text-error text-sm font-bold bg-error/10 rounded-xl px-3 py-2">
              {formError}
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
        title="حذف باشگاه"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            باشگاه <strong>{pendingDelete?.name}</strong> از شبکه سلامت حذف می‌شود.
          </>
        }
      />
    </>
  );
}
