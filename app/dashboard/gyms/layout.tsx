import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'مراکز و مربیان',
  description: 'لیست مراکز ورزشی و مربیان متخصص حرکات اصلاحی و توانبخشی',
};

export default function GymsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
