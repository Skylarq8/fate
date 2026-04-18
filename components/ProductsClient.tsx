"use client"

import { useState, useMemo, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Product, Category } from "@/lib/api"
import ProductCard from "@/components/ProductCard"
import CategoryItem, { CategoryWithCount } from "@/components/CategoryItem"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"

const SORT_OPTIONS = [
  { value: "discount",   label: "Хямдралтай эхэндээ" },
  { value: "newest",     label: "Шинээс хуучин" },
  { value: "oldest",     label: "Хуучнаас шинэ" },
  { value: "price_asc",  label: "Хямдаас үнэтэй" },
  { value: "price_desc", label: "Үнэтэйгээс хямд" },
]

function computeProductCount(cat: Category): number {
  const direct = cat._count?.products ?? 0
  const childSum = (cat.children ?? []).reduce(
    (acc, child) => acc + computeProductCount(child),
    0
  )
  return direct + childSum
}

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

interface Props {
  products: Product[]
  categories: Category[]
  total: number
  page: number
  totalPages: number
  activeCategory: string
  sort: string
}

export default function ProductsClient({
  products,
  categories,
  total,
  page,
  totalPages,
  activeCategory,
  sort,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showFilter,     setShowFilter]     = useState(false)
  const [sortOpen,       setSortOpen]       = useState(false)
  const [openCategories, setOpenCategories] = useState<string[]>([])

  const enrichedCategories = useMemo(
    () => categories.map(enrichCategory),
    [categories]
  )

  const parentCategories = useMemo(
    () => enrichedCategories.filter(c => !c.parentId),
    [enrichedCategories]
  )

  const flatCategories = useMemo(() => {
    const flatten = (cats: CategoryWithCount[]): CategoryWithCount[] =>
      cats.flatMap(c => [c, ...flatten(c.children)])
    return flatten(enrichedCategories)
  }, [enrichedCategories])

  useEffect(() => {
    document.body.style.overflow = showFilter ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [showFilter])

  const toggleCategory = (id: string) => {
    setOpenCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const filteredParentCategories = useMemo(
    () => parentCategories.slice().reverse(),
    [parentCategories]
  )

  const totalCount = useMemo(
    () => parentCategories.reduce((acc, c) => acc + c.productCount, 0),
    [parentCategories]
  )

  const buildUrl = (updates: { category?: string; sort?: string; page?: number }) => {
    const sp = new URLSearchParams()
    const cat = updates.category ?? activeCategory
    const s   = updates.sort     ?? sort
    const p   = updates.page     ?? 1
    if (cat !== "all")    sp.set("category", cat)
    if (s   !== "discount") sp.set("sort", s)
    if (p   > 1)          sp.set("page", String(p))
    const q = sp.toString()
    return q ? `/products?${q}` : "/products"
  }

  const navigate = (updates: { category?: string; sort?: string; page?: number }) => {
    startTransition(() => router.push(buildUrl(updates)))
  }

  const handleSetCategory = (_id: string, slug: string) => {
    navigate({ category: slug })
    setShowFilter(false)
  }

  const activeCategoryName = activeCategory === "all"
    ? null
    : flatCategories.find(c => c.slug === activeCategory)?.name

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Эрэмбэлэх"

  // Page numbers with ellipsis gaps
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const around = new Set(
      [1, page - 1, page, page + 1, totalPages].filter(n => n >= 1 && n <= totalPages)
    )
    return [...around].sort((a, b) => a - b)
  }, [page, totalPages])

  const FilterContent = () => (
    <div className="space-y-6">
      {/* ── Categories ── */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-white/90 uppercase mb-3 px-1">
          Category
        </p>

        <div className="h-auto overflow-y-auto overscroll-contain
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10
          space-y-0.5 pr-0.5">

          <button
              onClick={() => { navigate({ category: "all" }); setShowFilter(false) }}
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
              <span className="flex items-center gap-2 py-1">
                <span className={`
                  shrink-0 w-1.5 h-1.5 rounded-full transition-all
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

          {filteredParentCategories.map(parent => (
            <CategoryItem
              key={parent.id}
              category={parent}
              activeCategory={activeCategory}
              setActiveCategory={handleSetCategory}
              openCategories={openCategories}
              toggleCategory={toggleCategory}
              setShowFilter={setShowFilter}
            />
          ))}
        </div>
      </div>

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
                  onClick={() => { navigate({ sort: opt.value }); setSortOpen(false); setShowFilter(false) }}
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
    <div className={`max-w-7xl mx-auto py-3 transition-opacity duration-150 ${isPending ? "opacity-50" : "opacity-100"}`}>

      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Бараанууд</h1>
          {activeCategoryName ? (
            <p className="text-white/60 text-sm mt-1">
              <span className="text-rose-500">{activeCategoryName}</span>
              <span className="text-white/30 mx-1.5">·</span>
              {total} бараа
            </p>
          ) : (
            <p className="text-white/50 text-sm mt-1">{total} бараа</p>
          )}
        </div>

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

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="glass rounded-2xl p-4 sticky top-24">
            <FilterContent />
          </div>
        </aside>

        {/* ── Mobile drawer ── */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300
            ${showFilter ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          style={{ zIndex: 9998 }}
          onClick={() => setShowFilter(false)}
        />
        <div
          className={`fixed top-0 right-0 h-full w-72 flex flex-col
            bg-[#0a0a0a]/90 backdrop-blur-xl border-l border-white/10 md:hidden
            transition-transform duration-300 ease-in-out
            ${showFilter ? "translate-x-0" : "translate-x-full"}`}
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between px-5 py-2 border-b border-white/10">
            <p className="font-semibold text-white text-base tracking-tight">Filter</p>
            <button
              onClick={() => setShowFilter(false)}
              className="text-white/50 hover:text-white transition-colors p-1 -mr-1"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-5 mb-5">
            <FilterContent />
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/30 space-y-3">
              <p className="text-5xl">✦</p>
              <p className="font-display text-lg">Бараа олдсонгүй</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 lg:gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <button
                onClick={() => navigate({ page: page - 1 })}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/8
                  disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              {pageNumbers.map((n, i) => {
                const prev = pageNumbers[i - 1]
                const showEllipsis = prev !== undefined && n - prev > 1
                return (
                  <span key={n} className="flex items-center gap-1.5">
                    {showEllipsis && (
                      <span className="text-white/20 text-sm px-1">…</span>
                    )}
                    <button
                      onClick={() => navigate({ page: n })}
                      className={`min-w-[36px] h-9 px-2 rounded-xl text-sm font-medium transition-all
                        ${n === page
                          ? "bg-rose-500 text-white"
                          : "border border-white/10 text-white/50 hover:text-white hover:bg-white/8"
                        }`}
                    >
                      {n}
                    </button>
                  </span>
                )
              })}

              <button
                onClick={() => navigate({ page: page + 1 })}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/8
                  disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
