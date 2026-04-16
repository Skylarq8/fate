export default function HomeLoading() {
  return (
    <div className="space-y-10 pb-10">

      {/* ── HeroSlider skeleton ── */}
      <div className="w-full relative mb-5">
        <div className="h-70 sm:h-80 lg:h-120 rounded-2xl skeleton" />
        {/* pagination dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="w-5 h-1.5 rounded-full bg-white/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </div>

      {/* ── ProductSlider skeleton × 3 ── */}
      {Array.from({ length: 3 }).map((_, si) => (
        <div key={si} className="space-y-4">

          {/* title row */}
          <div className="flex items-center justify-between px-1">
            <div className="h-6 w-44 rounded-lg skeleton" />
            <div className="h-4 w-20 rounded-lg skeleton" />
          </div>

          {/* cards */}
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 space-y-2.5">
                <div className="aspect-square rounded-2xl skeleton" />
                <div className="px-1 space-y-2">
                  <div className="h-3.5 rounded-md skeleton w-4/5" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 rounded-md skeleton w-1/3" />
                    <div className="h-3 rounded-md skeleton w-1/4 opacity-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
