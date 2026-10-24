import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ثبت و تحلیل تغذیه',
  description: 'ثبت روزانه کالری، درشت‌مغذی‌ها و آب مصرفی متناسب با برنامه سلامتی در علاجگر',
};

export default function NutritionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
