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

  const handleClick = () => {
    if (hasChildren) {
      toggleCategory(category.id)
    } else {
      setActiveCategory(category.slug, category.slug)
      setShowFilter(false)
    }
  }

  return (
    <div className="select-none">
      <button
        onClick={handleClick}
        style={{ paddingLeft: `${level * 5 + 10}px` }}
        className={`
          group w-full text-left text-sm py-2 pr-3 rounded-xl
          flex items-center justify-between gap-2
          transition-all duration-200
          ${isActive
            ? "bg-rose-500/15 text-rose-400 font-medium"
            : "text-white/55 hover:text-white hover:bg-white/5"
          }
        `}
      >
        {/* Left: indicator dot + name */}
        <span className="flex items-center gap-2 min-w-0">
          {/* Active indicator */}
          <span className={`
            flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200
            ${isActive ? "bg-rose-500 scale-100" : "bg-white/0 group-hover:bg-white/20 scale-75"}
          `} />

          <span className="truncate leading-snug">{category.name}</span>
        </span>

        {/* Right: count badge OR chevron */}
        <span className="flex items-center gap-1.5 flex-shrink-0">
          {/* Count badge: always on leaf, hidden on expanded parent */}
          {category.productCount > 0 && (!hasChildren || !isOpen) && (
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

          {/* Chevron for expandable categories */}
          {hasChildren && (
            <ChevronRight
              size={13}
              className={`
                transition-transform duration-200 text-white/30
                ${isOpen ? "rotate-90 text-white/60" : ""}
              `}
            />
          )}
        </span>
      </button>

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