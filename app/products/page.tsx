// 📁 app/products/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getProducts, getCategories, Product, Category } from "@/lib/api"
import ProductCard from "@/components/ProductCard"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"

const SORT_OPTIONS = [
  { value: "newest",     label: "Шинээс хуучин" },
  { value: "oldest",     label: "Хуучнаас шинэ" },
  { value: "price_asc",  label: "Хямдаас үнэтэй" },
  { value: "price_desc", label: "Үнэтэйгээс хямд" },
  { value: "discount",   label: "Хямдралтай эхэндээ" },
]

export default function ProductsPage() {
  const [products,       setProducts]       = useState<Product[]>([])
  const [categories,     setCategories]     = useState<Category[]>([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [sort,           setSort]           = useState("newest")
  const [showFilter,     setShowFilter]     = useState(false)
  const [sortOpen,       setSortOpen]       = useState(false)

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
      if (sort === "newest")   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === "oldest")   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sort === "price_asc")  return pa - pb
      if (sort === "price_desc") return pb - pa
      if (sort === "discount") {
        const da = a.discountEnabled && a.finalPrice ? 1 : 0
        const db = b.discountEnabled && b.finalPrice ? 1 : 0
        return db - da
      }
      return 0
    })

  // Идэвхтэй category-ийн нэр
  const activeCategoryName = activeCategory === "all"
    ? null
    : categories.find(c => c.id === activeCategory)?.name

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Эрэмбэлэх"

  return (
    <div className="max-w-6xl mx-auto py-3">

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Бараанууд</h1>
          {/* Category сонгосон үед харуулна */}
          {activeCategoryName ? (
            <p className="text-white/70 text-sm mt-1">
              {activeCategoryName} · {filtered.length} бараа
            </p>
          ) : (
            <p className="text-white/70 text-sm mt-1">{filtered.length} бараа</p>
          )}
        </div>
        <button onClick={() => setShowFilter(true)}
          className="glass-sm flex items-center gap-2 text-sm text-white/90 px-0 py-2.5 rounded-xl hover:text-white transition-colors">
          <SlidersHorizontal size={15} /> Шүүлт
        </button>
      </div>

      {/* ── Right sidebar filter ── */}
      {showFilter && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            style={{ zIndex: 9998 }}
            onClick={() => setShowFilter(false)}
          />
          <div
            className="fixed top-0 right-0 h-full w-72 flex flex-col bg-black/50 backdrop-blur-xl"
            style={{ zIndex: 9999 }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <p className="font-display font-semibold text-white text-lg">Шүүлт</p>
              <button onClick={() => setShowFilter(false)} className="text-white/90 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

              {/* Categories */}
              <div>
                <p className="text-xs tracking-[0.25em] text-white/40 uppercase mb-3">Category</p>
                <div className="space-y-1">
                  {[{ id: "all", name: "Бүгд" }, ...categories.map(c => ({ id: c.id, name: c.name }))].map(cat => (
                    <button key={cat.id}
                      onClick={() => {setActiveCategory(cat.id); setShowFilter(false)}}
                      className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                        activeCategory === cat.id
                          ? "glass text-white font-medium"
                          : "text-white/50 hover:text-white/80 hover:bg-white/5"
                      }`}>
                      {cat.name}
                      {activeCategory === cat.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort — dropdown */}
              <div>
                <p className="text-xs tracking-[0.25em] text-white/40 uppercase mb-3">Эрэмбэлэх</p>
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="w-full glass-sm text-left text-sm px-3.5 py-2.5 rounded-xl text-white flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span>{currentSort}</span>
                    {sortOpen
                      ? <ChevronUp size={15} className="text-white/40 flex-shrink-0" />
                      : <ChevronDown size={15} className="text-white/40 flex-shrink-0" />
                    }
                  </button>
                  {sortOpen && (
                    <div className="mt-1 glass rounded-xl overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button key={opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false); setShowFilter(false) }}
                          className={`w-full text-left text-sm px-3.5 py-2.5 transition-all rounded-xl flex items-center justify-between ${
                            sort === opt.value
                              ? "text-white font-medium bg-white/5"
                              : "text-white/50 hover:text-white hover:bg-white/5"
                          }`}>
                          {opt.label}
                          {sort === opt.value && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}