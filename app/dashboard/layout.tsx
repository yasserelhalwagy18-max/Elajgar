import type { Metadata } from 'next';
import { DashboardShell } from './dashboard-shell';

export const metadata: Metadata = {
  title: 'داشبورد سلامت',
  description: 'مدیریت و ارزیابی روزانه وضعیت درد، تمرینات اصلاحی و تغذیه در علاجگر',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
