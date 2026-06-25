export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-outline-variant/30 rounded-lg animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-outline-variant/20 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card h-36 p-6 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 w-20 bg-outline-variant/30 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-outline-variant/20 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-24 bg-outline-variant/40 rounded-lg animate-pulse"></div>
              <div className="h-3 w-32 bg-outline-variant/20 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
