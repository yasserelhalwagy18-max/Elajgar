'use client';

import * as React from 'react';
import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminNumberInput,
  AdminPageHeader,
  AdminSearch,
  AdminTable,
  StatusPill,
  type AdminColumn,
} from '@/components/admin/AdminUI';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminDelete, adminPatch, adminPost } from '@/lib/admin-client';
import { useAdminResource } from '@/hooks/use-admin-resource';
import { formatNumber, toPersianDigits } from '@/lib/utils';

interface Plan {
  id: string;
  key: string;
  title: string;
  price: number;
  description: string | null;
  features: string[] | null;
  isActive: boolean;
  isFeatured: boolean;
  durationDays: number;
  sortOrder: number;
  _count: { subscriptions: number; payments: number };
}

interface PlanForm {
  key: string;
  title: string;
  price: string;
  description: string;
  features: string;
  durationDays: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

const EMPTY_FORM: PlanForm = {
  key: '',
  title: '',
  price: '0',
  description: '',
  features: '',
  durationDays: '30',
  isActive: true,
  isFeatured: false,
  sortOrder: '0',
};

export default function AdminPlansPage() {
  const [search, setSearch] = React.useState('');
  const [editing, setEditing] = React.useState<Plan | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);
  const [form, setForm] = React.useState<PlanForm>(EMPTY_FORM);
  /** Which field is at fault (null = the form as a whole), plus the message. */
  const [formError, setFormError] = React.useState<{
    field: 'title' | 'key' | null;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // The modal error carries a stable id, so the offending field can point at
  // it with aria-describedby while aria-invalid marks the field itself.
  const errorId = React.useId();

  const [pendingDelete, setPendingDelete] = React.useState<Plan | null>(null);
  const [pendingToggle, setPendingToggle] = React.useState<Plan | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const { items, isLoading, error, reload } = useAdminResource<Plan>('/api/admin/plans', {});

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (plan) =>
        plan.title.toLowerCase().includes(query) ||
        plan.key.toLowerCase().includes(query),
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsCreating(true);
  };

  const openEdit = (plan: Plan) => {
    setIsCreating(false);
    setFormError(null);
    setForm({
      key: plan.key,
      title: plan.title,
      price: String(plan.price),
      description: plan.description ?? '',
      features: (plan.features ?? []).join('، '),
      durationDays: String(plan.durationDays),
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      sortOrder: String(plan.sortOrder),
    });
    setEditing(plan);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditing(null);
    setFormError(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError({ field: 'title', message: 'عنوان پلن الزامی است' });
      return;
    }
    if (!form.key.trim()) {
      setFormError({ field: 'key', message: 'شناسه پلن الزامی است' });
      return;
    }

    setIsSaving(true);

    const payload = {
      key: form.key.trim().toLowerCase(),
      title: form.title.trim(),
      price: Number(form.price) || 0,
      description: form.description.trim() || null,
      features: form.features
        .split(/[،,]/)
        .map((entry) => entry.trim())
        .filter(Boolean),
      durationDays: Number(form.durationDays) || 30,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder) || 0,
    };

    const result = editing
      ? await adminPatch(`/api/admin/plans/${editing.id}`, payload)
      : await adminPost('/api/admin/plans', payload);

    if (result.ok) {
      toast.success(editing ? 'پلن به‌روزرسانی شد' : 'پلن جدید ساخته شد');
      closeModal();
      reload();
    } else {
      setFormError({ field: null, message: result.error ?? 'ذخیره انجام نشد' });
    }

    setIsSaving(false);
  };

  const toggleActive = async (plan: Plan) => {
    setBusyId(plan.id);
    const result = await adminPatch(`/api/admin/plans/${plan.id}`, { isActive: !plan.isActive });

    if (result.ok) {
      toast.success(plan.isActive ? 'پلن غیرفعال شد' : 'پلن فعال شد');
      reload();
    } else {
      toast.error(result.error ?? 'تغییر وضعیت انجام نشد');
    }

    setBusyId(null);
  };

  const confirmToggle = () => {
    if (pendingToggle) toggleActive(pendingToggle);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setBusyId(pendingDelete.id);
    const result = await adminDelete(`/api/admin/plans/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('پلن حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setBusyId(null);
    setPendingDelete(null);
  };

  const columns: AdminColumn<Plan>[] = [
    {
      key: 'title',
      header: 'پلن',
      render: (plan) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-on-surface">
            {plan.title}
            {plan.isFeatured && (
              <span className="text-xs text-primary font-black me-2">پیشنهاد ویژه</span>
            )}
          </span>
          <span className="text-xs text-on-surface-variant font-mono" dir="ltr">
            {plan.key}
          </span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'قیمت ماهانه',
      render: (plan) => (
        <span className="font-bold text-primary whitespace-nowrap">
          {formatNumber(plan.price)} تومان
        </span>
      ),
    },
    {
      key: 'duration',
      header: 'مدت',
      render: (plan) => (
        <span className="text-xs text-on-surface-variant">
          {toPersianDigits(plan.durationDays)} روز
        </span>
      ),
    },
    {
      key: 'buyers',
      header: 'خریداران',
      render: (plan) => (
        <span className="text-xs text-on-surface-variant">
          {toPersianDigits(plan._count.payments)} پرداخت
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (plan) => (
        <StatusPill tone={plan.isActive ? 'success' : 'neutral'}>
          {plan.isActive ? 'قابل خرید' : 'غیرفعال'}
        </StatusPill>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (plan) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => openEdit(plan)}
            aria-label={`ویرایش ${plan.title}`}
            title="ویرایش"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingToggle(plan)}
            disabled={busyId === plan.id}
            aria-label={plan.isActive ? `غیرفعال کردن ${plan.title}` : `فعال کردن ${plan.title}`}
            title={plan.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
            className="icon-btn h-9 w-9 bg-surface-variant disabled:opacity-40"
          >
            <CreditCard className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(plan)}
            disabled={busyId === plan.id}
            aria-label={`حذف ${plan.title}`}
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
        title="پلن‌های اشتراک"
        description="پلن‌هایی که کاربران می‌توانند خریداری کنند. فقط پلن‌های «قابل خرید» در صفحه پیشنهاد به کاربران نشان داده می‌شوند."
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" />
            پلن جدید
          </button>
        }
      />

      <div className="card rounded-3xl p-4 mb-6">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی پلن"
          placeholder="جستجو در عنوان یا شناسه پلن..."
        />
      </div>

      <AdminTable
        columns={columns}
        items={filtered}
        rowKey={(plan) => plan.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="پلنی تعریف نشده است"
      />

      <Modal
        open={isCreating || editing !== null}
        onClose={closeModal}
        title={editing ? `ویرایش ${editing.title}` : 'پلن جدید'}
        size="lg"
      >
        <form onSubmit={save} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="plan-title">
                عنوان
              </label>
              <input
                id="plan-title"
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
              <label className="block text-sm font-medium mb-1" htmlFor="plan-key">
                شناسه (انگلیسی)
              </label>
              <input
                id="plan-key"
                type="text"
                value={form.key}
                onChange={(event) => {
                  setForm({ ...form, key: event.target.value });
                  setFormError(null);
                }}
                placeholder="pro"
                className="input"
                dir="ltr"
                disabled={editing !== null}
                aria-invalid={formError?.field === 'key' || undefined}
                aria-describedby={formError?.field === 'key' ? errorId : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="plan-price">
                قیمت ماهانه (تومان)
              </label>
              <AdminNumberInput
                id="plan-price"
                inputMode="numeric"
                value={form.price}
                onChange={(value) => setForm({ ...form, price: value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="plan-duration">
                مدت اشتراک (روز)
              </label>
              <AdminNumberInput
                id="plan-duration"
                inputMode="numeric"
                value={form.durationDays}
                onChange={(value) => setForm({ ...form, durationDays: value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="plan-order">
                ترتیب نمایش
              </label>
              <AdminNumberInput
                id="plan-order"
                inputMode="numeric"
                value={form.sortOrder}
                onChange={(value) => setForm({ ...form, sortOrder: value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="plan-description">
              توضیح
            </label>
            <input
              id="plan-description"
              type="text"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="plan-features">
              امکانات (با کاما جدا کنید)
            </label>
            <textarea
              id="plan-features"
              value={form.features}
              onChange={(event) => setForm({ ...form, features: event.target.value })}
              rows={3}
              placeholder="همه ویدیوها، برنامه تمرینی اختصاصی، گزارش پیشرفت"
              className="input"
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold">قابل خرید</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-bold">پیشنهاد ویژه</span>
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
              <CreditCard className="w-4 h-4" />
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          </div>
        </form>
      </Modal>

      {/* The activate/deactivate toggle changes what users can buy, so it
          asks first - same pattern as the delete dialog. */}
      <ConfirmDialog
        open={pendingToggle !== null}
        onClose={() => setPendingToggle(null)}
        onConfirm={confirmToggle}
        title={
          pendingToggle?.isActive ? 'غیرفعال کردن پلن' : 'فعال کردن پلن'
        }
        tone={pendingToggle?.isActive ? 'danger' : 'default'}
        confirmLabel={pendingToggle?.isActive ? 'بله، غیرفعال شود' : 'بله، فعال شود'}
        message={
          pendingToggle?.isActive ? (
            <>
              پلن <strong>{pendingToggle.title}</strong> از فروش خارج می‌شود و دیگر در صفحه
              پیشنهاد به کاربران نشان داده نمی‌شود. اشتراک‌های فعال فعلی باقی می‌مانند.
            </>
          ) : (
            <>
              پلن <strong>{pendingToggle?.title}</strong> دوباره قابل خرید می‌شود و در صفحه
              پیشنهاد به کاربران نمایش داده می‌شود.
            </>
          )
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف پلن"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            پلن <strong>{pendingDelete?.title}</strong> حذف می‌شود. اگر این پلن خریده شده باشد، حذف
            انجام نمی‌شود و باید آن را غیرفعال کنید.
          </>
        }
      />
    </>
  );
}
