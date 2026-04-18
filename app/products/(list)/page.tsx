import { getProducts, getCategories, Product, Category } from "@/lib/api"
import ProductsClient from "@/components/ProductsClient"

export const revalidate = 60

const PAGE_SIZE = 24

// Тухайн category болон бүх descendant-уудын slug-уудыг цуглуулна
function collectSlugs(cat: Category): string[] {
  return [cat.slug, ...(cat.children ?? []).flatMap(collectSlugs)]
}

function findCategory(cats: Category[], slug: string): Category | null {
  for (const c of cats) {
    if (c.slug === slug) return c
    const found = findCategory(c.children ?? [], slug)
    if (found) return found
  }
  return null
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; sort?: string }>
}) {
  const sp = await searchParams
  const activeCategory = sp.category || "all"
  const sort = sp.sort || "discount"

  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  // Filter — parent дарахад children-ийн бараануудыг ч харуулна
  const filtered = (() => {
    if (activeCategory === "all") return allProducts
    const cat = findCategory(categories, activeCategory)
    const slugs = new Set(cat ? collectSlugs(cat) : [activeCategory])
    return allProducts.filter(p =>
      p.categories.some(c => slugs.has(c.category.slug))
    )
  })()

  // Sort
  const sorted = [...filtered].sort((a: Product, b: Product) => {
    const pa = a.discountEnabled && a.finalPrice ? a.finalPrice : a.price
    const pb = b.discountEnabled && b.finalPrice ? b.finalPrice : b.price
    if (sort === "newest")     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sort === "oldest")     return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    if (sort === "price_asc")  return pa - pb
    if (sort === "price_desc") return pb - pa
    const da = a.discountEnabled && a.finalPrice ? 1 : 0
    const db = b.discountEnabled && b.finalPrice ? 1 : 0
    return db - da
  })

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(sp.page) || 1), totalPages)
  const products = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <ProductsClient
      products={products}
      categories={categories}
      total={total}
      page={page}
      totalPages={totalPages}
      activeCategory={activeCategory}
      sort={sort}
    />
  )
}
