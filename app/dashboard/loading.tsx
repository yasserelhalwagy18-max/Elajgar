export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-surface-variant rounded-lg animate-pulse"></div>
          <div className="h-4 w-32 bg-surface-variant rounded-lg animate-pulse"></div>
        </div>
        <div className="w-12 h-12 bg-surface-variant rounded-full animate-pulse"></div>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface p-6 rounded-3xl border border-border/50 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="h-6 w-24 bg-surface-variant rounded animate-pulse"></div>
              <div className="w-10 h-10 bg-surface-variant rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-surface-variant rounded animate-pulse"></div>
              <div className="h-4 w-2/3 bg-surface-variant rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-full bg-surface-variant rounded-xl mt-4 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
