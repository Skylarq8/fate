import { getProducts, getCategories, Product } from "@/lib/api"
import ProductsClient from "@/components/ProductsClient"

export const revalidate = 0

const PAGE_SIZE = 24

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

  // Filter
  const filtered =
    activeCategory === "all"
      ? allProducts
      : allProducts.filter(p =>
          p.categories.some(c => c.category.slug === activeCategory)
        )

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
