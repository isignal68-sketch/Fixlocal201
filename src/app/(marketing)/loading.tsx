export default function MarketingLoading() {
  return (
    <div className="container py-16">
      <div className="skeleton mb-4 h-10 w-2/3 max-w-lg" />
      <div className="skeleton mb-10 h-5 w-1/2 max-w-sm" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
