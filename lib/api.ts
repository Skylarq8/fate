// 📁 lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// ── Simple in-memory cache ────────────────────────────────────────────────────
const cache = new Map<string, { data: any; ts: number }>()
const CACHE_TTL = 600_000 // 60 секунд

async function cachedFetch(url: string) {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data
  const res  = await fetch(url)
  const data = await res.json()
  cache.set(url, { data, ts: Date.now() })
  return data
}

export interface ProductImage {
  id: string
  url: string
  isPrimary: boolean
  order: number
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Product {
  id: string
  title: string
  description: string
  price: number
  finalPrice: number | null
  discountEnabled: boolean
  discountEndsAt: string | null
  sizes: string[]
  colors: string[]
  status: "active" | "inactive"
  createdAt: string
  images: ProductImage[]
  categories: { category: Category }[]
}

// ── Products ──────────────────────────────────────────────────────────────────
export async function getProducts(params?: {
  categoryId?: string
  sort?: string
}): Promise<Product[]> {
  const query = new URLSearchParams()
  if (params?.categoryId) query.set("categoryId", params.categoryId)
  if (params?.sort)       query.set("sort", params.sort)
  const data = await cachedFetch(`${BASE_URL}/api/products?${query}`)
  return (data.data ?? []).filter((p: Product) => p.status === "active")
}

export async function getProduct(id: string): Promise<Product | null> {
  const data = await cachedFetch(`${BASE_URL}/api/products/${id}`)
  return data.data ?? null
}

// ── Categories ────────────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const data = await cachedFetch(`${BASE_URL}/api/categories`)
  return data.data ?? []
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmt = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮"

export const primaryImage = (product: Product) =>
  product.images.find(i => i.isPrimary) ?? product.images[0]