import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مدیریت پلن‌ها',
  description: 'مدیریت پلن‌های اشتراک، ویژگی‌ها و قیمت‌گذاری',
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
