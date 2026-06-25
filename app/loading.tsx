export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-sm z-50">
      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}
