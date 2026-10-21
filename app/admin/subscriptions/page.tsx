'use client';

import * as React from 'react';
import { CreditCard, RotateCcw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AdminFilterChip,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
  AdminTable,
  StatCard,
  StatusPill,
  type AdminColumn,
} from '@/components/admin/AdminUI';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminPatch } from '@/lib/admin-client';
import { useAdminResource, usePageNumber } from '@/hooks/use-admin-resource';
import { formatNumber, toPersianDigits } from '@/lib/utils';

const PAGE_SIZE = 20;

type Tab = 'subscriptions' | 'payments';

interface Subscription {
  id: string;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  startedAt: string;
  expiresAt: string;
  plan: { id: string; key: string; title: string; price: number };
  user: { id: string; fullName: string | null; phoneNumber: string | null };
  payment: { id: string; amount: number; status: string; reference: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  provider: string;
  reference: string;
  createdAt: string;
  paidAt: string | null;
  plan: { id: string; key: string; title: string };
  user: { id: string; fullName: string | null; phoneNumber: string | null };
  subscription: { id: string; status: string; expiresAt: string } | null;
}

interface Totals {
  paidPayments: number;
  activeSubscriptions: number;
  refundedPayments: number;
  revenue: number;
}

const SUBSCRIPTION_TONES = {
  ACTIVE: 'success',
  CANCELED: 'neutral',
  EXPIRED: 'warning',
} as const;

const SUBSCRIPTION_LABELS = {
  ACTIVE: 'فعال',
  CANCELED: 'لغو شده',
  EXPIRED: 'منقضی شده',
} as const;

const PAYMENT_TONES = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'error',
  REFUNDED: 'neutral',
} as const;

const PAYMENT_LABELS = {
  PENDING: 'در انتظار',
  PAID: 'پرداخت شده',
  FAILED: 'ناموفق',
  REFUNDED: 'بازگشت وجه',
} as const;

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

/**
 * The subscriptions and the payments behind them.
 *
 * This is the admin's view of the revenue side of the app: who bought what,
 * how much was paid, and whether it was refunded.
 */
export default function AdminSubscriptionsPage() {
  const [tab, setTab] = React.useState<Tab>('subscriptions');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [pendingRefund, setPendingRefund] = React.useState<Payment | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  // A new tab, search or filter always starts at the first page.
  const [page, setPage] = usePageNumber(`${tab}|${search}|${status}`);

  const endpoint = tab === 'subscriptions' ? '/api/admin/subscriptions' : '/api/admin/payments';

  const params = React.useMemo(
    () => ({ q: search || undefined, status: status === 'all' ? undefined : status, page, pageSize: PAGE_SIZE }),
    [search, status, page],
  );

  const { items, total, totalPages, isLoading, error, data, reload } = useAdminResource<
    Subscription | Payment
  >(endpoint, params);

  const totals = (data?.totals as Totals | undefined) ?? undefined;

  const confirmRefund = async () => {
    if (!pendingRefund) return;

    setBusyId(pendingRefund.id);
    const result = await adminPatch(`/api/admin/payments/${pendingRefund.id}`, {
      status: 'REFUNDED',
    });

    if (result.ok) {
      toast.success('بازگشت وجه انجام شد و اشتراک لغو شد');
      reload();
    } else {
      toast.error(result.error ?? 'بازگشت وجه انجام نشد');
    }

    setBusyId(null);
    setPendingRefund(null);
  };

  const subscriptionColumns: AdminColumn<Subscription>[] = [
    {
      key: 'user',
      header: 'کاربر',
      render: (item) => {
        const subscription = item as Subscription;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-on-surface">
              {subscription.user.fullName?.trim() || 'بدون نام'}
            </span>
            <span className="text-xs text-on-surface-variant font-mono" dir="ltr">
              {subscription.user.phoneNumber ?? '—'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'plan',
      header: 'پلن',
      render: (item) => {
        const subscription = item as Subscription;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-on-surface">{subscription.plan.title}</span>
            <span className="text-xs text-on-surface-variant">
              {formatNumber(subscription.plan.price)} تومان
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (item) => {
        const subscription = item as Subscription;
        return (
          <StatusPill tone={SUBSCRIPTION_TONES[subscription.status] ?? 'neutral'}>
            {SUBSCRIPTION_LABELS[subscription.status] ?? subscription.status}
          </StatusPill>
        );
      },
    },
    {
      key: 'period',
      header: 'مدت',
      render: (item) => {
        const subscription = item as Subscription;
        return (
          <span className="text-xs text-on-surface-variant whitespace-nowrap">
            {formatDate(subscription.startedAt)} تا {formatDate(subscription.expiresAt)}
          </span>
        );
      },
    },
    {
      key: 'payment',
      header: 'پرداخت',
      render: (item) => {
        const subscription = item as Subscription;
        return subscription.payment ? (
          <span className="text-xs font-mono text-on-surface-variant" dir="ltr">
            {subscription.payment.reference}
          </span>
        ) : (
          <span className="text-xs text-on-surface-variant">—</span>
        );
      },
    },
  ];

  const paymentColumns: AdminColumn<Payment>[] = [
    {
      key: 'reference',
      header: 'شناسه پرداخت',
      render: (payment) => (
        <span className="text-xs font-mono" dir="ltr">
          {payment.reference}
        </span>
      ),
    },
    {
      key: 'user',
      header: 'کاربر',
      render: (payment) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-on-surface">
            {payment.user.fullName?.trim() || 'بدون نام'}
          </span>
          <span className="text-xs text-on-surface-variant font-mono" dir="ltr">
            {payment.user.phoneNumber ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'پلن',
      render: (payment) => <span className="text-xs font-bold">{payment.plan.title}</span>,
    },
    {
      key: 'amount',
      header: 'مبلغ',
      render: (payment) => (
        <span className="font-bold text-primary whitespace-nowrap">
          {formatNumber(payment.amount)} تومان
        </span>
      ),
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (payment) => (
        <StatusPill tone={PAYMENT_TONES[payment.status] ?? 'neutral'}>
          {PAYMENT_LABELS[payment.status] ?? payment.status}
        </StatusPill>
      ),
    },
    {
      key: 'createdAt',
      header: 'تاریخ',
      render: (payment) => (
        <span className="text-xs text-on-surface-variant whitespace-nowrap">
          {formatDate(payment.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'text-center',
      render: (payment) => (
        <button
          type="button"
          onClick={() => setPendingRefund(payment)}
          disabled={payment.status !== 'PAID' || busyId === payment.id}
          aria-label={`بازگشت وجه ${payment.reference}`}
          title={payment.status === 'PAID' ? 'بازگشت وجه' : 'فقط پرداخت‌های موفق قابل بازگشت هستند'}
          className="icon-btn h-9 w-9 bg-surface-variant disabled:opacity-30"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const columns =
    tab === 'subscriptions' ? (subscriptionColumns as AdminColumn<Subscription | Payment>[]) : (paymentColumns as AdminColumn<Subscription | Payment>[]);

  return (
    <>
      <AdminPageHeader
        title="اشتراک‌ها و پرداخت‌ها"
        description="هر اشتراکی که خریداری شده، به همراه پرداخت پشت آن."
        actions={
          <span className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Users className="w-4 h-4" />
            {toPersianDigits(total)} مورد
          </span>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="درآمد کل"
          value={`${formatNumber(totals?.revenue ?? 0)} تومان`}
          hint="مجموع پرداخت‌های موفق"
          icon={<CreditCard className="w-5 h-5 text-primary" />}
        />
        <StatCard
          label="اشتراک فعال"
          value={toPersianDigits(totals?.activeSubscriptions ?? 0)}
          hint="کاربرانی که هم‌اکنون دسترسی دارند"
          icon={<Users className="w-5 h-5 text-success" />}
        />
        <StatCard
          label="پرداخت موفق"
          value={toPersianDigits(totals?.paidPayments ?? 0)}
          hint="تراکنش‌های تأییدشده"
          icon={<CreditCard className="w-5 h-5 text-secondary" />}
        />
        <StatCard
          label="بازگشت وجه"
          value={toPersianDigits(totals?.refundedPayments ?? 0)}
          hint="تراکنش‌های بازگشت داده‌شده"
          icon={<RotateCcw className="w-5 h-5 text-tertiary" />}
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        <AdminFilterChip active={tab === 'subscriptions'} onClick={() => setTab('subscriptions')}>
          اشتراک‌ها
        </AdminFilterChip>
        <AdminFilterChip active={tab === 'payments'} onClick={() => setTab('payments')}>
          پرداخت‌ها
        </AdminFilterChip>
      </div>

      <div className="card rounded-3xl p-4 mb-6 flex flex-col gap-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          label="جستجو"
          placeholder="جستجو بر اساس نام، شماره موبایل یا شناسه پرداخت..."
        />

        <div className="flex flex-wrap gap-2">
          <AdminFilterChip active={status === 'all'} onClick={() => setStatus('all')}>
            همه
          </AdminFilterChip>
          {(tab === 'subscriptions'
            ? Object.entries(SUBSCRIPTION_LABELS)
            : Object.entries(PAYMENT_LABELS)
          ).map(([key, label]) => (
            <AdminFilterChip key={key} active={status === key} onClick={() => setStatus(key)}>
              {label}
            </AdminFilterChip>
          ))}
        </div>
      </div>

      <AdminTable
        columns={columns}
        items={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        error={error}
        emptyMessage={
          tab === 'subscriptions'
            ? 'هنوز اشتراکی خریداری نشده است'
            : 'هنوز پرداختی ثبت نشده است'
        }
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={pendingRefund !== null}
        onClose={() => setPendingRefund(null)}
        onConfirm={confirmRefund}
        title="بازگشت وجه"
        tone="danger"
        confirmLabel="بله، بازگشت وجه انجام شود"
        message={
          <>
            مبلغ <strong>{formatNumber(pendingRefund?.amount ?? 0)} تومان</strong> بازگردانده می‌شود و
            اشتراک کاربر لغو می‌شود.
          </>
        }
      />
    </>
  );
}
