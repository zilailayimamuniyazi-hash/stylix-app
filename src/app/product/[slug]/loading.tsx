function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-ivory/[0.06] ${className ?? ""}`}
      aria-hidden
    />
  );
}

export default function ProductLoading() {
  return (
    <div className="bg-ink-deep pt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: image + 3D viewer placeholders */}
          <div>
            <div className="relative aspect-[3/4] border border-gold/20 bg-ink-soft">
              <Skeleton className="absolute inset-0 bg-ivory/[0.04]" />
            </div>

            <div className="mt-10">
              <Skeleton className="h-3 w-24" />
              <div className="mt-4 max-w-md border border-gold/20 bg-ink-soft/40 aspect-square">
                <Skeleton className="h-full w-full rounded-none bg-ivory/[0.04]" />
              </div>
            </div>
          </div>

          {/* Right: product detail placeholders */}
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>

            <Skeleton className="mt-4 h-12 w-4/5 max-w-lg" />
            <Skeleton className="mt-3 h-6 w-3/5 max-w-md" />
            <Skeleton className="mt-8 h-8 w-32" />

            <div className="mt-8 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
            </div>

            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            <div className="mt-10 border-t border-gold/20 pt-8 space-y-3">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Skeleton className="h-7 w-20 border border-gold/20" />
              <Skeleton className="h-7 w-24 border border-gold/20" />
              <Skeleton className="h-7 w-16 border border-gold/20" />
            </div>

            <div className="mt-12 space-y-4">
              <Skeleton className="h-12 w-full border border-gold/20" />
              <div className="flex flex-wrap gap-4 pt-2">
                <Skeleton className="h-10 w-44 border border-gold/20" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
