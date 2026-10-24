import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مدیریت اشتراک‌ها',
  description: 'مشاهده، تمدید و مدیریت وضعیت اشتراک‌های کاربران',
};

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
