import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حریم خصوصی',
  description: 'سیاست‌ها و قوانین حفاظت از اطلاعات و داده‌های سلامت کاربران در علاجگر',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
