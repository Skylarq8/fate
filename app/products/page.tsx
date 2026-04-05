// 📁 app/products/page.tsx
"use client"

import { useEffect, useState } from "react"
import { getProducts, getCategories, Product, Category } from "@/lib/api"
import ProductCard from "@/components/ProductCard"
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react"

const SORT_OPTIONS = [
  { value: "discount",   label: "Хямдралтай эхэндээ" },
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
  const [sort,           setSort]           = useState("discount")
  const [showFilter,     setShowFilter]     = useState(false)
  const [sortOpen,       setSortOpen]       = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const parentCategories = categories.filter(c => !c.parentId)

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
      if (sort === "discount") {
        const da = a.discountEnabled && a.finalPrice ? 1 : 0
        const db = b.discountEnabled && b.finalPrice ? 1 : 0
        return db - da
      }
      return 0
    })

  const activeCategoryName = activeCategory === "all"
    ? null : categories.find(c => c.id === activeCategory)?.name

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Эрэмбэлэх"

  const FilterContent = () => (
    <div className="space-y-7">
      {/* Categories */}
      <div>
        <p className="text-xs lg:text-[15px] text-white uppercase mb-3">Category</p>
        <div className="space-y-1">
        {/* ALL */}
        <button
          onClick={() => {
            setActiveCategory("all")
            setShowFilter(false)
          }}
          className={`w-full text-left text-sm px-3.5 py-2.5 rounded-xl ${
            activeCategory === "all"
              ? "glass text-white"
              : "text-white/50 hover:text-white"
          }`}>
          Бүгд
        </button>

        {/* PARENT CATEGORIES */}
        {parentCategories.slice().reverse().map(parent => (
          <div key={parent.id}>

            {/* Parent */}
            <button
              onClick={() =>
                setOpenCategory(prev => prev === parent.id ? null : parent.id)
              }
              className="w-full text-left text-sm px-3.5 py-2.5 flex justify-between items-center text-white/80 hover:text-white"
            >
              {parent.name}
              {parent.children.length > 0 && (
                openCategory === parent.id
                  ? <ChevronUp size={14}/>
                  : <ChevronDown size={14}/>
              )}
            </button>

            {/* CHILDREN */}
            {openCategory === parent.id && parent.children.length > 0 && (
              <div className="ml-5 space-y-1">
                {parent.children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => {
                      setActiveCategory(child.id)
                      setShowFilter(false)
                    }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg ${
                      activeCategory === child.id
                        ? "text-white font-medium bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}>
                    <div className="flex flex-row items-center justify-between">
                      {child.name}
                      {activeCategory === child.id && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

          </div>
        ))}

      </div>
      </div>

      {/* Sort dropdown */}
      <div>
        <p className="text-xs lg:text-[15px] text-white uppercase mb-3">Эрэмбэлэх</p>
        <div className="relative">
          <button
            onClick={() => setSortOpen(v => !v)}
            className="w-full glass-sm text-left text-sm px-3.5 py-2.5 rounded-xl text-white flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <span>{currentSort}</span>
            {sortOpen
              ? <ChevronUp size={15} className="text-white/70 flex-shrink-0" />
              : <ChevronDown size={15} className="text-white/70 flex-shrink-0" />
            }
          </button>
          {sortOpen && (
            <div className="mt-1 glass rounded-xl overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false); setShowFilter(false) }}
                  className={`w-full text-left text-sm px-3.5 py-2.5 my-1 transition-all rounded-xl flex items-center justify-between ${
                    sort === opt.value
                      ? "text-white font-medium bg-white/10"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}>
                  {opt.label}
                  {sort === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto py-3">

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Бараанууд</h1>
          {activeCategoryName ? (
            <p className="text-white/90 text-sm mt-1">{activeCategoryName} · {filtered.length} бараа</p>
          ) : (
            <p className="text-white/90 text-sm mt-1">{filtered.length} бараа</p>
          )}
        </div>
        {/* Mobile filter button */}
        <button onClick={() => setShowFilter(true)}
          className="md:hidden glass-sm flex items-center gap-2 text-sm text-white/90 px-4 py-2.5 rounded-xl hover:text-white transition-colors">
          <SlidersHorizontal size={15} /> Filter
        </button>
      </div>

      <div className="flex gap-6">

        {/* ── Desktop left sidebar ── */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="glass rounded-2xl p-4 sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* ── Mobile right drawer ── */}
        {showFilter && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
              style={{ zIndex: 9998 }}
              onClick={() => setShowFilter(false)}
            />
            <div
              className="fixed top-0 right-0 h-full w-72 flex flex-col bg-black/50 backdrop-blur-xl md:hidden"
              style={{ zIndex: 9999 }}
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                <p className="font-display font-semibold text-white text-lg">Filter</p>
                <button onClick={() => setShowFilter(false)} className="text-white/90 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <FilterContent />
              </div>
            </div>
          </>
        )}

        {/* ── Grid ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square rounded-2xl skeleton" />
                  <div className="h-3.5 rounded skeleton w-3/4" />
                  <div className="h-3.5 rounded skeleton w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/40 space-y-3">
              <p className="text-5xl">✦</p>
              <p className="font-display text-lg">Бараа олдсонгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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