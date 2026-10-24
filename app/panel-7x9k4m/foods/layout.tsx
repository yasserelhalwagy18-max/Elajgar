import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'بانک غذاها',
  description: 'مدیریت پایگاه داده مواد غذایی و ارزش غذایی اقلام',
};

export default function FoodsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
