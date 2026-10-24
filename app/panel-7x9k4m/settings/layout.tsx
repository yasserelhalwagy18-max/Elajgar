import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تنظیمات سیستم',
  description: 'مدیریت تنظیمات عمومی، پرداخت و هشدارهای سامانه',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
