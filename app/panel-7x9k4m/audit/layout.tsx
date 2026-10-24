import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'گزارش رویدادها',
  description: 'گزارش وقایع و لاگ‌های امنیتی و عملیاتی سیستم',
};

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return children;
}
