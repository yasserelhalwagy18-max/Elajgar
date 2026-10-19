'use client';

import { BottomNav } from '@/components/bottom-nav';
import { useProfileSync } from '@/hooks/use-profile-sync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep the server copy of the profile in sync with the local store.
  useProfileSync();

  return (
    <div className="min-h-screen pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
