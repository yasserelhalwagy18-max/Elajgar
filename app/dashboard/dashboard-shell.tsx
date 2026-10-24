'use client';

import { BottomNav } from '@/components/bottom-nav';
import { SaveIndicator } from '@/components/SaveIndicator';
import { useProfileSync } from '@/hooks/use-profile-sync';

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  // Keep the server copy of the profile in sync with the local store.
  useProfileSync();

  return (
    <div className="min-h-screen">
      {children}
      {/* Floating, so every dashboard page gets it without a shared header. */}
      <SaveIndicator />
      <BottomNav />
    </div>
  );
}
