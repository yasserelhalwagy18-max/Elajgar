import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آموزش و مقالات',
  description: 'مقالات و ویدیوهای آموزشی سلامت مفاصل، ارگونومی و تمرینات اصلاحی',
};

export default function EducationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
