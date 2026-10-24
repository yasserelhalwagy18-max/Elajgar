import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'پروفایل کاربری',
  description: 'مدیریت اطلاعات فردی، سوابق سلامت و اشتراک کاربری در علاجگر',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
