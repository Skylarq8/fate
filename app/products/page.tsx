"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import { getProducts, getCategories, Product, Category } from "@/lib/api"
import ProductCard from "@/components/ProductCard"
import CategoryItem, { CategoryWithCount } from "@/components/CategoryItem"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from "lucide-react"

const SORT_OPTIONS = [
  { value: "discount",   label: "Хямдралтай эхэндээ" },
  { value: "newest",     label: "Шинээс хуучин" },
  { value: "oldest",     label: "Хуучнаас шинэ" },
  { value: "price_asc",  label: "Хямдаас үнэтэй" },
  { value: "price_desc", label: "Үнэтэйгээс хямд" },
]

/**
 * Recursively calculate total product count for a category,
 * including all nested children. Matches admin dashboard logic.
 */
function computeProductCount(cat: Category): number {
  const direct = cat._count?.products ?? 0
  const childSum = (cat.children ?? []).reduce(
    (acc, child) => acc + computeProductCount(child),
    0
  )
  return direct + childSum
}

/**
 * Map raw API Category to CategoryWithCount (adds productCount recursively).
 */
function enrichCategory(cat: Category): CategoryWithCount {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    parentId: cat.parentId ?? null,
    productCount: computeProductCount(cat),
    children: (cat.children ?? []).map(enrichCategory),
  }
}

export default function ProductsPage() {
  const [products,       setProducts]       = useState<Product[]>([])
  const [categories,     setCategories]     = useState<CategoryWithCount[]>([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [sort,           setSort]           = useState("discount")
  const [showFilter,     setShowFilter]     = useState(false)
  const [sortOpen,       setSortOpen]       = useState(false)
  const [openCategories, setOpenCategories] = useState<string[]>([])
  // Search state for the category panel
  const [categorySearch, setCategorySearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  const parentCategories = useMemo(
    () => categories.filter(c => !c.parentId),
    [categories]
  )

  // Fetch categories and enrich with recursive product counts
  useEffect(() => {
    getCategories().then(raw => {
      setCategories(raw.map(enrichCategory))
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts().then(d => { setProducts(d); setLoading(false) })
  }, [])

  const toggleCategory = (id: string) => {
    setOpenCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  /**
   * Filter categories by search query (name match, case-insensitive).
   * When searching, flatten parents that have matching children too.
   */
  const filteredParentCategories = useMemo(() => {
    if (!categorySearch.trim()) return parentCategories.slice().reverse()
    const q = categorySearch.toLowerCase()
    return parentCategories
      .slice()
      .reverse()
      .filter(cat =>
        cat.name.toLowerCase().includes(q) ||
        cat.children.some(child => child.name.toLowerCase().includes(q))
      )
  }, [parentCategories, categorySearch])

  const filtered = useMemo(() => products
    .filter(p =>
      activeCategory === "all"
        ? true
        : p.categories.some(c => c.category.id === activeCategory)
    )
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
    }), [products, activeCategory, sort])

  const activeCategoryName = activeCategory === "all"
    ? null
    : categories.find(c => c.id === activeCategory)?.name

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Эрэмбэлэх"

  // Total product count for "All" badge
  const totalCount = useMemo(
    () => parentCategories.reduce((acc, c) => acc + c.productCount, 0),
    [parentCategories]
  )

  const FilterContent = () => (
    <div className="space-y-6">

      {/* ── Categories ── */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-white/90 uppercase mb-3 px-1">
          Category
        </p>

        {/* Scrollable category list — max height prevents overwhelming scroll */}
        <div className="h-auto overflow-y-auto overscroll-contain
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10
          space-y-0.5 pr-0.5">

          {/* ALL button */}
          {!categorySearch && (
            <button
              onClick={() => { setActiveCategory("all"); setShowFilter(false) }}
              className={`
                group w-full text-left text-sm px-3 py-2 rounded-xl
                flex items-center justify-between gap-2
                transition-all duration-200
                ${activeCategory === "all"
                  ? "bg-rose-500/15 text-rose-400 font-medium"
                  : "text-white/55 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className={`
                  flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all
                  ${activeCategory === "all" ? "bg-rose-500" : "bg-white/0 group-hover:bg-white/20"}
                `} />
                Бүгд
              </span>
              {totalCount > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md tabular-nums font-medium
                  ${activeCategory === "all"
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-white/8 text-white/35 group-hover:text-white/50"
                  }`}>
                  {totalCount}
                </span>
              )}
            </button>
          )}

          {/* Parent categories */}
          {filteredParentCategories.map(parent => (
            <CategoryItem
              key={parent.id}
              category={parent}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              openCategories={openCategories}
              toggleCategory={toggleCategory}
              setShowFilter={setShowFilter}
            />
          ))}

          {/* Empty search state */}
          {categorySearch && filteredParentCategories.length === 0 && (
            <p className="text-center text-white/25 text-xs py-4">Олдсонгүй</p>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/8" />

      {/* ── Sort ── */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-white/90 uppercase mb-3 px-1">
          Эрэмбэлэх
        </p>
        <div className="relative">
          <button
            onClick={() => setSortOpen(v => !v)}
            className="w-full text-left text-sm px-3 py-2.5 rounded-xl text-white
              flex items-center justify-between gap-2
              bg-black/5 border border-white/10 hover:border-white/20 hover:bg-white/8
              transition-all duration-150"
          >
            <span className="text-white/80">{currentSort}</span>
            {sortOpen
              ? <ChevronUp size={13} className="text-white/40 flex-shrink-0" />
              : <ChevronDown size={13} className="text-white/40 flex-shrink-0" />
            }
          </button>

          {sortOpen && (
            <div className="mt-1.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setSortOpen(false); setShowFilter(false) }}
                  className={`
                    w-full text-left text-sm px-3.5 py-2.5 rounded-xl transition-all
                    flex items-center justify-between gap-2
                    ${sort === opt.value
                      ? "text-rose-400 bg-rose-500/10 font-medium"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {opt.label}
                  {sort === opt.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
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
    <div className="max-w-7xl mx-auto py-3">

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Бараанууд</h1>
          {activeCategoryName ? (
            <p className="text-white/60 text-sm mt-1">
              <span className="text-rose-400">{activeCategoryName}</span>
              <span className="text-white/30 mx-1.5">·</span>
              {filtered.length} бараа
            </p>
          ) : (
            <p className="text-white/50 text-sm mt-1">{filtered.length} бараа</p>
          )}
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setShowFilter(true)}
          className="md:hidden flex items-center gap-2 text-sm text-white/80 px-4 py-2 rounded-xl
            bg-white/8 border border-white/10 hover:text-white hover:bg-white/12 transition-all"
        >
          <SlidersHorizontal size={14} />
          Filter
          {activeCategory !== "all" && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
        </button>
      </div>

      <div className="flex gap-6">

        {/* ── Desktop left sidebar ── */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="glass rounded-2xl p-4 sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* ── Mobile right drawer ── */}
        {showFilter && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
              style={{ zIndex: 9998 }}
              onClick={() => setShowFilter(false)}
            />
            <div
              className="fixed top-0 right-0 h-full w-72 flex flex-col
                bg-[#0a0a0a]/90 backdrop-blur-xl border-l border-white/10 md:hidden"
              style={{ zIndex: 9999 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
                <p className="font-semibold text-white text-base tracking-tight">Filter</p>
                <button
                  onClick={() => setShowFilter(false)}
                  className="text-white/50 hover:text-white transition-colors p-1 -mr-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="flex-1 overflow-y-auto px-2.5 py-5 mb-5">
                <FilterContent />
              </div>

              {/* Drawer footer — shows result count */}
              {/* <div className="px-5 py-4 border-t border-white/8">
                <button
                  onClick={() => setShowFilter(false)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium
                    py-2.5 rounded-xl transition-colors"
                >
                  {filtered.length} бараа харах
                </button>
              </div> */}
            </div>
          </>
        )}

        {/* ── Product Grid ── */}
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
            <div className="flex flex-col items-center justify-center py-24 text-white/30 space-y-3">
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