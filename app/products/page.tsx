import { getProducts, getCategories } from "@/lib/api"
import ProductsClient from "@/components/ProductsClient"

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  return <ProductsClient initialProducts={products} initialCategories={categories} />
}
