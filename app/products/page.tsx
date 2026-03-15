// 📁 app/products/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getProducts, getCategories, Product, Category } from "@/lib/api"
import ProductCard from "@/components/ProductCard"
import { SlidersHorizontal, X } from "lucide-react"

const SORT_OPTIONS = [
  { value: "newest",     label: "Шинээс хуучин" },
  { value: "oldest",     label: "Хуучнаас шинэ" },
  { value: "price_asc",  label: "Хямдаас үнэтэй" },
  { value: "price_desc", label: "Үнэтэйгээс хямд" },
]

export default function ProductsPage() {
  const [products,       setProducts]       = useState<Product[]>([])
  const [categories,     setCategories]     = useState<Category[]>([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [sort,           setSort]           = useState("newest")
  const [showFilter,     setShowFilter]     = useState(false)

  useEffect(() => { getCategories().then(setCategories) }, [])
  useEffect(() => {
    setLoading(true)
    getProducts().then(d => { setProducts(d); setLoading(false) })
  }, [])

  const filtered = products
    .filter(p => activeCategory === "all"
      ? true : p.categories.some(c => c.category.id === activeCategory))
    .sort((a, b) => {
      const pa = a.discountEnabled && a.finalPrice ? a.finalPrice : a.price
      const pb = b.discountEnabled && b.finalPrice ? b.finalPrice : b.price
      if (sort === "newest")     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === "oldest")     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === "price_asc")  return pa - pb
      if (sort === "price_desc") return pb - pa
      return 0
    })

  const FilterContent = () => (
    <div className="space-y-7">
      <div>
        <p className="text-xs tracking-[0.25em] text-white/90 uppercase mb-3">Category</p>
        <div className="space-y-1">
          {[{ id: "all", name: "Бүгд" }, ...categories.map(c => ({ id: c.id, name: c.name }))].map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowFilter(false) }}
              className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl transition-all ${
                activeCategory === cat.id
                  ? "glass text-white font-medium"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs tracking-[0.25em] text-white/90 uppercase mb-3">Эрэмбэлэх</p>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => { setSort(opt.value); setShowFilter(false) }}
              className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl transition-all ${
                sort === opt.value
                  ? "glass text-white font-medium"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto py-3">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs tracking-[0.25em] text-white/35 uppercase mb-1">Collection</p>
          <h1 className="font-display text-3xl font-bold text-white">Бараанууд</h1>
          <p className="text-white/40 text-sm mt-1">{filtered.length} бараа</p>
        </div>
        <button onClick={() => setShowFilter(true)}
          className="md:hidden glass-sm flex items-center gap-2 text-sm text-white/70 px-4 py-2.5 rounded-xl hover:text-white transition-colors">
          <SlidersHorizontal size={15} /> Шүүлт
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-48 flex-shrink-0">
          <div className="glass rounded-2xl p-4 sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* Mobile filter — z-[9999] navbar-аас дээш */}
        {showFilter && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
              style={{ zIndex: 9998 }}
              onClick={() => setShowFilter(false)}
            />
            <div
              className="fixed inset-x-0 bottom-0 glass rounded-t-3xl p-6 md:hidden"
              style={{ zIndex: 9999 }}
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
              <div className="flex items-center justify-between mb-6">
                <p className="font-display font-semibold text-white">Шүүлт</p>
                <button onClick={() => setShowFilter(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <FilterContent />
            </div>
          </>
        )}

        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square rounded-2xl skeleton" />
                  <div className="h-3.5 rounded skeleton w-3/4" />
                  <div className="h-3.5 rounded skeleton w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/30 space-y-3">
              <p className="text-5xl">✦</p>
              <p className="font-display text-lg">Бараа олдсонгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}