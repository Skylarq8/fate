export default function ProductDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 py-10 animate-pulse">
      {/* Image */}
      <div className="aspect-square rounded-3xl bg-white/10" />
      {/* Content */}
      <div className="space-y-6">
        <div className="h-10 w-3/4 bg-white/10 rounded-lg" />
        <div className="h-6 w-40 bg-white/10 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-5/6 bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-16 bg-white/10 rounded-lg" />
          <div className="h-9 w-16 bg-white/10 rounded-lg" />
          <div className="h-9 w-16 bg-white/10 rounded-lg" />
        </div>
        <div className="h-12 w-full bg-white/10 rounded-xl" />
      </div>
    </div>
  )
}
