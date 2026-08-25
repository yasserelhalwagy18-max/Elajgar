import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Role } from '@prisma/client';

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
    select: { role: true },
  });

  if (!user || user.role !== Role.ADMIN) {
    redirect('/login');
  }

  return <>{children}</>;
}
