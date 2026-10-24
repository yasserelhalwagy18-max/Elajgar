import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'خرید اشتراک',
  description: 'خرید و ارتقای اشتراک علاجگر جهت دسترسی کامل به برنامه‌های تمرینی و مشاوره‌ای',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
