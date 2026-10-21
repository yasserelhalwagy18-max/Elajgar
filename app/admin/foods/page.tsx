'use client';

import * as React from 'react';
import { Pencil, Plus, Trash2, Utensils } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
  AdminTable,
  type AdminColumn,
} from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminDelete, adminPatch, adminPost } from '@/lib/admin-client';
import { useAdminResource, useDebouncedValue, usePageNumber } from '@/hooks/use-admin-resource';
import { toPersianDigits } from '@/lib/utils';

const PAGE_SIZE = 25;

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}

interface FoodForm {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
}

const EMPTY_FORM: FoodForm = { name: '', calories: '0', protein: '0', carbs: '0', fat: '0' };

export default function AdminFoodsPage() {
  const [search, setSearch] = React.useState('');

  const [editing, setEditing] = React.useState<Food | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState<FoodForm>(EMPTY_FORM);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const [pendingDelete, setPendingDelete] = React.useState<Food | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  const [page, setPage] = usePageNumber(debouncedSearch);

  const params = React.useMemo(
    () => ({ q: debouncedSearch || undefined, page, pageSize: PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const { items, total, totalPages, isLoading, error, reload } = useAdminResource<Food>(
    '/api/admin/foods',
    params,
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsCreating(true);
  };

  const openEdit = (food: Food) => {
    setIsCreating(false);
    setFormError(null);
    setForm({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fat: String(food.fat),
    });
    setEditing(food);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError('نام غذا الزامی است');
      return;
    }

    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };

    const result = editing
      ? await adminPatch(`/api/admin/foods/${editing.id}`, payload)
      : await adminPost('/api/admin/foods', payload);

    if (result.ok) {
      toast.success(editing ? 'غذا به‌روزرسانی شد' : 'غذای جدید ثبت شد');
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
    const result = await adminDelete(`/api/admin/foods/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('غذا حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setBusyId(null);
    setPendingDelete(null);
  };

  const columns: AdminColumn<Food>[] = [
    {
      key: 'name',
      header: 'نام',
      render: (food) => <span className="font-bold text-on-surface">{food.name}</span>,
    },
    {
      key: 'calories',
      header: 'کالری',
      render: (food) => (
        <span className="font-mono font-bold">{toPersianDigits(food.calories)}</span>
      ),
    },
    {
      key: 'protein',
      header: 'پروتئین (گرم)',
      render: (food) => <span className="font-mono">{toPersianDigits(food.protein)}</span>,
    },
    {
      key: 'carbs',
      header: 'کربوهیدرات (گرم)',
      render: (food) => <span className="font-mono">{toPersianDigits(food.carbs)}</span>,
    },
    {
      key: 'fat',
      header: 'چربی (گرم)',
      render: (food) => <span className="font-mono">{toPersianDigits(food.fat)}</span>,
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (food) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(food)}
            aria-label={`ویرایش ${food.name}`}
            title="ویرایش"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(food)}
            disabled={busyId === food.id}
            aria-label={`حذف ${food.name}`}
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
        title="بانک غذا"
        description={`${toPersianDigits(total)} ماده غذایی در پایگاه داده. کاربران از همین جدول جستجو می‌کنند.`}
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" />
            افزودن غذا
          </button>
        }
      />

      <div className="card rounded-3xl p-4 mb-6">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی غذا"
          placeholder="جستجو در نام غذا..."
        />
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(food) => food.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="غذایی با این جستجو پیدا نشد"
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
        title={editing ? `ویرایش ${editing.name}` : 'افزودن غذا'}
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="food-name">
              نام غذا
            </label>
            <input
              id="food-name"
              type="text"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="مثال: نان بربری (یک کف دست)"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(
              [
                ['calories', 'کالری'],
                ['protein', 'پروتئین'],
                ['carbs', 'کربوهیدرات'],
                ['fat', 'چربی'],
              ] as const
            ).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1" htmlFor={`food-${field}`}>
                  {label}
                </label>
                <input
                  id={`food-${field}`}
                  type="number"
                  step="0.1"
                  min="0"
                  value={form[field]}
                  onChange={(event) => setForm({ ...form, [field]: event.target.value })}
                  className="input"
                />
              </div>
            ))}
          </div>

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
              <Utensils className="w-4 h-4" />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف غذا"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            <strong>{pendingDelete?.name}</strong> از بانک غذا حذف می‌شود. سوابق ثبت‌شده کاربران باقی
            می‌مانند، اما دیگر به این ردیف متصل نیستند.
          </>
        }
      />
    </>
  );
}
