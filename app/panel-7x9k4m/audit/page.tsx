'use client';

import * as React from 'react';
import { ScrollText } from 'lucide-react';
import {
  AdminFilterChip,
  AdminPageHeader,
  AdminPagination,
  AdminTable,
  StatusPill,
  type AdminColumn,
} from '@/components/admin/AdminUI';
import { useAdminResource, usePageNumber } from '@/hooks/use-admin-resource';
import { toPersianDigits } from '@/lib/utils';

const PAGE_SIZE = 25;

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
  actor: { id: string; phoneNumber: string | null; fullName: string | null } | null;
}

const ACTION_LABELS: Record<string, string> = {
  create: 'ایجاد',
  update: 'ویرایش',
  delete: 'حذف',
};

const ACTION_TONES = {
  create: 'success',
  update: 'primary',
  delete: 'error',
} as const;

const ENTITY_LABELS: Record<string, string> = {
  user: 'کاربر',
  gym: 'باشگاه',
  food: 'غذا',
  article: 'مطلب',
  exercise: 'تمرین',
  video: 'ویدیو',
  plan: 'پلن',
  setting: 'تنظیم',
};

const ENTITIES = ['user', 'gym', 'food', 'article', 'exercise', 'video', 'plan', 'setting'];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminAuditPage() {
  const [entity, setEntity] = React.useState('all');
  const [action, setAction] = React.useState('all');

  const [page, setPage] = usePageNumber(`${entity}|${action}`);

  const params = React.useMemo(
    () => ({
      entity: entity === 'all' ? undefined : entity,
      action: action === 'all' ? undefined : action,
      page,
      pageSize: PAGE_SIZE,
    }),
    [entity, action, page],
  );

  const { items, total, totalPages, isLoading, error } = useAdminResource<AuditEntry>(
    '/api/admin/audit',
    params,
  );

  const columns: AdminColumn<AuditEntry>[] = [
    {
      key: 'createdAt',
      header: 'زمان',
      render: (entry) => (
        <span className="text-xs text-on-surface-variant whitespace-nowrap">
          {formatDate(entry.createdAt)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'مدیر',
      render: (entry) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-on-surface">
            {entry.actor?.fullName?.trim() || '—'}
          </span>
          <span className="text-xs text-on-surface-variant font-mono" dir="ltr">
            {entry.actor?.phoneNumber ?? 'حساب حذف‌شده'}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'عملیات',
      render: (entry) => (
        <StatusPill tone={ACTION_TONES[entry.action as keyof typeof ACTION_TONES] ?? 'neutral'}>
          {ACTION_LABELS[entry.action] ?? entry.action}
        </StatusPill>
      ),
    },
    {
      key: 'entity',
      header: 'بخش',
      render: (entry) => (
        <span className="text-xs font-bold">{ENTITY_LABELS[entry.entity] ?? entry.entity}</span>
      ),
    },
    {
      key: 'entityId',
      header: 'شناسه رکورد',
      render: (entry) => (
        <span className="text-xs font-mono text-on-surface-variant truncate block max-w-[180px]">
          {entry.entityId ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="گزارش تغییرات"
        description={`${toPersianDigits(total)} تغییر ثبت‌شده توسط مدیران.`}
        actions={
          <span className="flex items-center gap-2 text-xs text-on-surface-variant">
            <ScrollText className="w-4 h-4" />
            هر تغییر با نام مدیر و زمان آن ثبت می‌شود
          </span>
        }
      />

      <div className="card rounded-3xl p-4 mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <AdminFilterChip active={entity === 'all'} onClick={() => setEntity('all')}>
            همه بخش‌ها
          </AdminFilterChip>
          {ENTITIES.map((entry) => (
            <AdminFilterChip key={entry} active={entity === entry} onClick={() => setEntity(entry)}>
              {ENTITY_LABELS[entry] ?? entry}
            </AdminFilterChip>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <AdminFilterChip active={action === 'all'} onClick={() => setAction('all')}>
            همه عملیات
          </AdminFilterChip>
          {Object.entries(ACTION_LABELS).map(([key, label]) => (
            <AdminFilterChip key={key} active={action === key} onClick={() => setAction(key)}>
              {label}
            </AdminFilterChip>
          ))}
        </div>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(entry) => entry.id}
        isLoading={isLoading}
        error={error}
        emptyMessage="تغییری با این فیلتر ثبت نشده است"
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </>
  );
}
