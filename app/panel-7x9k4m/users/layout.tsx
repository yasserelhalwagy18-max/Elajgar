import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مدیریت کاربران',
  description: 'مدیریت حساب‌ها، نقش‌ها و اطلاعات کاربران سامانه',
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
