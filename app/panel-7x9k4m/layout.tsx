import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata: Metadata = {
  title: {
    default: 'پنل مدیریت',
    template: '%s | پنل مدیریت علاجگر',
  },
  description: 'پنل مدیریت، آمار و تنظیمات سامانه هوشمند علاجگر',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyToken(token);

  if (!payload || !payload.userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { role: true, isActive: true },
  });

  if (!user || user.role !== Role.ADMIN || !user.isActive) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <AdminSidebar />
      {/* The root layout already provides the single <main> landmark, so
          this is a plain section. */}
      <div className="flex-1 min-w-0 p-4 sm:p-8 pb-16 max-w-[1400px]">{children}</div>
    </div>
  );
}
