import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="bg-primary-container p-4 rounded-full">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <p className="text-on-surface-variant text-lg font-medium animate-pulse">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
