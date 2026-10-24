import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مدیریت مراکز ورزشی',
  description: 'مدیریت اطلاعات باشگاه‌ها و مراکز همکار در علاجگر',
};

export default function GymsAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
