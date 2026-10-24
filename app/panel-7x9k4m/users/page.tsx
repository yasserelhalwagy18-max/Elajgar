'use client';

import * as React from 'react';
import Link from 'next/link';
import { Ban, CheckCircle2, Eye, ShieldCheck, Trash2, UserCog } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminDelete, adminPatch } from '@/lib/admin-client';
import { ADMIN_PATH } from '@/lib/admin-path';
import { useAdminResource, useDebouncedValue, usePageNumber } from '@/hooks/use-admin-resource';
import { toPersianDigits } from '@/lib/utils';

interface AdminUser {
  id: string;
  phoneNumber: string | null;
  fullName: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  currentWizardStep: number | null;
  risk: 'low' | 'medium' | 'high' | 'unknown';
  riskReason: string;
  maxPainIntensity: number;
  logCount: number;
}

const PAGE_SIZE = 20;

const RISK_TONES = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  unknown: 'neutral',
} as const;

const RISK_LABELS = {
  low: 'کم',
  medium: 'متوسط',
  high: 'بالا',
  unknown: 'نامشخص',
} as const;

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'USER' | 'ADMIN'>('all');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'true' | 'false'>('all');

  const [pendingDelete, setPendingDelete] = React.useState<AdminUser | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = React.useState<AdminUser | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  // A new filter always starts at the first page - staying on page 7 of a
  // list that now has one page shows an empty table.
  const [page, setPage] = usePageNumber(
    `${debouncedSearch}|${roleFilter}|${activeFilter}`,
  );

  const params = React.useMemo(
    () => ({
      q: debouncedSearch || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      isActive: activeFilter === 'all' ? undefined : activeFilter,
      page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedSearch, roleFilter, activeFilter, page],
  );

  const { items, total, totalPages, isLoading, error, reload } = useAdminResource<AdminUser>(
    '/api/admin/users',
    params,
  );

  const toggleRole = async (user: AdminUser) => {
    setBusyId(user.id);
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const result = await adminPatch(`/api/admin/users/${user.id}`, { role: nextRole });

    if (result.ok) {
      toast.success(
        nextRole === 'ADMIN'
          ? `${user.phoneNumber ?? 'کاربر'} به مدیر ارتقا یافت`
          : `دسترسی مدیریتی ${user.phoneNumber ?? 'کاربر'} لغو شد`,
      );
      reload();
    } else {
      toast.error(result.error ?? 'تغییر نقش انجام نشد');
    }

    setBusyId(null);
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    await toggleRole(pendingRoleChange);
  };

  const toggleActive = async (user: AdminUser) => {
    setBusyId(user.id);
    const result = await adminPatch(`/api/admin/users/${user.id}`, { isActive: !user.isActive });

    if (result.ok) {
      toast.success(user.isActive ? 'حساب کاربر غیرفعال شد' : 'حساب کاربر فعال شد');
      reload();
    } else {
      toast.error(result.error ?? 'تغییر وضعیت انجام نشد');
    }

    setBusyId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setBusyId(pendingDelete.id);
    const result = await adminDelete(`/api/admin/users/${pendingDelete.id}`);

    if (result.ok) {
      toast.success('حساب کاربر و سوابق آن حذف شد');
      reload();
    } else {
      toast.error(result.error ?? 'حذف انجام نشد');
    }

    setBusyId(null);
    setPendingDelete(null);
  };

  const columns: AdminColumn<AdminUser>[] = [
    {
      key: 'name',
      header: 'کاربر',
      render: (user) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-on-surface">
            {user.fullName?.trim() || 'بدون نام'}
          </span>
          <span className="text-xs text-on-surface-variant font-mono" dir="ltr">
            {user.phoneNumber ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'نقش',
      render: (user) => (
        <StatusPill tone={user.role === 'ADMIN' ? 'primary' : 'neutral'}>
          {user.role === 'ADMIN' ? 'مدیر' : 'کاربر'}
        </StatusPill>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (user) => (
        <StatusPill tone={user.isActive ? 'success' : 'error'}>
          {user.isActive ? 'فعال' : 'غیرفعال'}
        </StatusPill>
      ),
    },
    {
      key: 'risk',
      header: 'سطح ریسک',
      render: (user) => (
        <div className="flex flex-col gap-0.5">
          <StatusPill tone={RISK_TONES[user.risk]}>{RISK_LABELS[user.risk]}</StatusPill>
          <span className="text-[11px] text-on-surface-variant">{user.riskReason}</span>
        </div>
      ),
    },
    {
      key: 'logs',
      header: 'سوابق',
      render: (user) => (
        <span className="text-xs text-on-surface-variant">
          {toPersianDigits(user.logCount)} روز ثبت‌شده
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'تاریخ عضویت',
      render: (user) => (
        <span className="text-xs text-on-surface-variant whitespace-nowrap">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (user) => (
        <div className="flex items-center justify-center gap-1">
          <Link
            href={`${ADMIN_PATH}/users/${user.id}`}
            aria-label={`مشاهده پرونده ${user.phoneNumber ?? 'کاربر'}`}
            title="مشاهده پرونده"
            className="icon-btn h-9 w-9 bg-surface-variant"
          >
            <Eye className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => setPendingRoleChange(user)}
            disabled={busyId === user.id}
            aria-label={user.role === 'ADMIN' ? 'لغو دسترسی مدیریتی' : 'ارتقا به مدیر'}
            title={user.role === 'ADMIN' ? 'لغو دسترسی مدیریتی' : 'ارتقا به مدیر'}
            className="icon-btn h-9 w-9 bg-surface-variant disabled:opacity-40"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleActive(user)}
            disabled={busyId === user.id}
            aria-label={user.isActive ? 'غیرفعال کردن حساب' : 'فعال کردن حساب'}
            title={user.isActive ? 'غیرفعال کردن حساب' : 'فعال کردن حساب'}
            className="icon-btn h-9 w-9 bg-surface-variant disabled:opacity-40"
          >
            {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setPendingDelete(user)}
            disabled={busyId === user.id}
            aria-label="حذف کاربر"
            title="حذف کاربر"
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
        title="کاربران"
        description={`${toPersianDigits(total)} کاربر ثبت‌شده در سامانه. سطح ریسک از شدت درد و پاسخ پرسشنامه محاسبه می‌شود.`}
        actions={
          <Link href={`${ADMIN_PATH}/audit`} className="btn btn-secondary btn-md">
            <UserCog className="w-4 h-4" />
            گزارش تغییرات
          </Link>
        }
      />

      <div className="card rounded-3xl p-4 mb-6 flex flex-col gap-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجوی کاربر"
          placeholder="جستجو بر اساس نام یا شماره موبایل..."
        />

        <div className="flex flex-wrap gap-2">
          <AdminFilterChip active={roleFilter === 'all'} onClick={() => setRoleFilter('all')}>
            همه نقش‌ها
          </AdminFilterChip>
          <AdminFilterChip active={roleFilter === 'USER'} onClick={() => setRoleFilter('USER')}>
            کاربران
          </AdminFilterChip>
          <AdminFilterChip active={roleFilter === 'ADMIN'} onClick={() => setRoleFilter('ADMIN')}>
            مدیران
          </AdminFilterChip>

          <span className="w-px bg-outline-variant/40 mx-1 hidden sm:block" aria-hidden="true" />

          <AdminFilterChip active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
            همه وضعیت‌ها
          </AdminFilterChip>
          <AdminFilterChip active={activeFilter === 'true'} onClick={() => setActiveFilter('true')}>
            فعال
          </AdminFilterChip>
          <AdminFilterChip active={activeFilter === 'false'} onClick={() => setActiveFilter('false')}>
            غیرفعال
          </AdminFilterChip>
        </div>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="کاربری با این فیلتر پیدا نشد"
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={pendingRoleChange !== null}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={confirmRoleChange}
        title={pendingRoleChange?.role === 'ADMIN' ? 'لغو دسترسی مدیریتی' : 'ارتقا به مدیر'}
        tone="danger"
        confirmLabel="بله، تغییر دهد"
        message={
          pendingRoleChange?.role === 'ADMIN' ? (
            <>
              دسترسی مدیریتی <strong>{pendingRoleChange?.phoneNumber ?? 'این کاربر'}</strong> لغو
              می‌شود و او دیگر به پنل مدیریت و اطلاعات کاربران دسترسی نخواهد داشت.
            </>
          ) : (
            <>
              به <strong>{pendingRoleChange?.phoneNumber ?? 'این کاربر'}</strong> دسترسی کامل
              مدیریت داده می‌شود؛ مدیر می‌تواند همه کاربران، پلن‌ها و تنظیمات سامانه را تغییر دهد.
            </>
          )
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="حذف کاربر"
        tone="danger"
        confirmLabel="بله، حذف شود"
        message={
          <>
            با حذف کاربر <strong>{pendingDelete?.phoneNumber}</strong> تمام سوابق روزانه، نواحی درد و
            پرسشنامه او نیز حذف می‌شود. این عمل قابل بازگشت نیست.
          </>
        }
      />
    </>
  );
}
