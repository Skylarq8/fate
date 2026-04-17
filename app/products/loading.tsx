export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto py-3">

      {/* ── Header skeleton ── */}
      <div className="flex items-end justify-between mb-6">
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-xl skeleton" />
          <div className="h-4 w-20 rounded skeleton" />
        </div>
      </div>

      <div className="flex gap-6">

        {/* ── Sidebar skeleton ── */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="h-3 w-20 rounded skeleton" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 rounded-xl skeleton" />
            ))}
            <div className="h-px bg-white/8 my-2" />
            <div className="h-3 w-20 rounded skeleton" />
            <div className="h-10 rounded-xl skeleton" />
          </div>
        </aside>

        {/* ── Product grid skeleton ── */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/20">
                {/* image */}
                <div className="aspect-square rounded-t-2xl skeleton" />
                {/* info */}
                <div className="px-3 pb-3 pt-1.5 bg-white/10 backdrop-blur-md rounded-b-2xl space-y-2">
                  <div className="h-4 rounded skeleton w-3/4" />
                  <div className="h-3.5 rounded skeleton w-1/3" />
                  <div className="flex gap-1.5 mt-2">
                    <div className="h-8 w-8 rounded-sm skeleton shrink-0" />
                    <div className="h-8 rounded-sm skeleton flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
