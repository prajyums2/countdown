export function MilestoneSkeleton() {
  return (
    <div className="rounded-2xl bg-white/60 border border-rose-50 p-5 space-y-3">
      <div className="shimmer w-3/4 h-4 rounded-full" />
      <div className="shimmer w-full h-3 rounded-full" />
      <div className="shimmer w-2/3 h-3 rounded-full" />
    </div>
  );
}

export function TrackSkeleton() {
  return (
    <div className="shimmer w-full h-48 rounded-2xl" />
  );
}

export function SnapWidgetSkeleton() {
  return (
    <div className="shimmer w-full h-16 rounded-2xl" />
  );
}
