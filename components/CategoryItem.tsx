"use client"

import { ChevronRight } from "lucide-react"

export interface CategoryWithCount {
  id: string
  name: string
  slug: string
  parentId: string | null
  children: CategoryWithCount[]
  /** Total products in this category (direct + recursive from children) */
  productCount: number
}

type Props = {
  category: CategoryWithCount
  level?: number
  activeCategory: string
  setActiveCategory: (id: string, slug: string) => void
  openCategories: string[]
  toggleCategory: (id: string) => void
  setShowFilter: (v: boolean) => void
}

export default function CategoryItem({
  category,
  level = 0,
  activeCategory,
  setActiveCategory,
  openCategories,
  toggleCategory,
  setShowFilter,
}: Props) {
  const isOpen = openCategories.includes(category.id)
  const hasChildren = category.children && category.children.length > 0
  const isActive = activeCategory === category.slug

  return (
    <div className="select-none">
      <div
        style={{ paddingLeft: `${level * 5 + 10}px` }}
        className={`
          group w-full text-sm py-1.5 pr-1.5 rounded-xl
          flex items-center justify-between gap-2
          transition-all duration-200
          ${isActive
            ? "bg-rose-500/15 text-rose-400 font-medium"
            : "text-white/55 hover:text-white hover:bg-white/5"
          }
        `}
      >
        {/* Left: indicator dot + name — дарахад select */}
        <button
          onClick={() => { setActiveCategory(category.slug, category.slug); setShowFilter(false) }}
          className="flex items-center gap-2 py-0.5 min-w-0 flex-1 text-left"
        >
          <span className={`
            shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200
            ${isActive ? "bg-rose-500 scale-100l-1" : "bg-white/0 group-hover:bg-white/20 scale-75"}
          `} />
          <span className="truncate leading-snug">{category.name}</span>
        </button>

        <span className="flex items-center gap-1 shrink-0">
          {category.productCount > 0 && (
            <span className={`
              text-[11px] px-1.5 py-0.5 rounded-md font-medium tabular-nums
              transition-colors duration-200
              ${isActive
                ? "bg-rose-500/20 text-rose-400"
                : "bg-white/8 text-white/50 group-hover:bg-white/10 group-hover:text-white/50"
              }
            `}>
              {category.productCount}
            </span>
          )}

          {/* Chevron — дарахад dropdown toggle */}
          {hasChildren && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
            >
              <ChevronRight
                size={17}
                className={`
                  transition-transform duration-200 text-white/50
                  ${isOpen ? "rotate-90 text-white/70" : ""}
                `}
              />
            </button>
          )}
        </span>
      </div>

      {/* Children — animated expand */}
      {hasChildren && (
        <div
          className={`
            overflow-hidden transition-all duration-200
            ${isOpen ? "opacity-100" : "opacity-0 h-0 pointer-events-none"}
          `}
        >
          <div className={`
            border-l border-white/20 ml-6 pl-0 mt-0.5 space-y-0.5
            transition-all duration-200
            ${isOpen ? "translate-y-0" : "-translate-y-1"}
          `}>
            {category.children.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                level={level + 1}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                openCategories={openCategories}
                toggleCategory={toggleCategory}
                setShowFilter={setShowFilter}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}