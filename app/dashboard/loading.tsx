import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="در حال بارگذاری داشبورد"
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"
    >
      {/* Top greeting and date rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-12 rounded-2xl shrink-0" />
          ))}
        </div>
      </div>

      {/* Health Score Hero Card */}
      <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
        <Skeleton className="w-36 h-36 rounded-full shrink-0" />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-36 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-24 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Hydration Chart Card */}
        <div className="card p-6 flex flex-col justify-between h-[250px]">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="h-[150px] w-full rounded-2xl" />
        </div>

        {/* Progress Report Card */}
        <div className="card p-6 flex flex-col justify-between h-[250px]">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[150px] w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
