export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-3 w-20 bg-sand rounded-sm" />
        <div className="h-10 w-72 bg-sand rounded-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-md border border-line bg-paper p-5 h-28" />
          ))}
        </div>
        <div className="rounded-md border border-line bg-paper p-5 h-64" />
      </div>
    </div>
  );
}
