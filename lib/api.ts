// 📁 lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// Uses Next.js Data Cache — persists across cold starts and all Lambda instances
async function cachedFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    next: { revalidate: 60 },
  } as RequestInit & { next: { revalidate: number } })
  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ProductImage {
  id: string; url: string; isPrimary: boolean; order: number; variantColor?: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  _count?: { products: number }
  children: Category[]
}

export interface VariantOption {
  id: string
  label: string
  values: string[]
  order: number
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
  variants?: VariantOption[]
}

// ── Products ──────────────────────────────────────────────────────────────────
export async function getProducts(options?: {
  category?: string
  sort?: string
  filter?: string
}): Promise<Product[]> {
  const params = new URLSearchParams()
  if (options?.category && options.category !== "all") params.set("category", options.category)
  if (options?.sort) params.set("sort", options.sort)
  if (options?.filter) params.set("filter", options.filter)
  const query = params.toString()
  const url = query ? `${BASE_URL}/api/products?${query}` : `${BASE_URL}/api/products`
  const data = await cachedFetch(url)
  return (data.data ?? []).filter((p: Product) => p.status === "active")
}

export async function getProduct(id: string): Promise<Product | null> {
  const data = await cachedFetch(`${BASE_URL}/api/products/${id}`)
  return data.data ?? null
}

export async function getTrendingProducts(limit = 50): Promise<Product[]> {
  const data = await cachedFetch(`${BASE_URL}/api/products/trending?limit=${limit}`)
  return (data.data ?? []).filter((p: Product) => p.status === "active")
}

export async function getProductsByGender(slug: string): Promise<Product[]> {
  const data = await cachedFetch(`${BASE_URL}/api/products/by-gender?slug=${encodeURIComponent(slug)}`)
  const list: Product[] = Array.isArray(data?.data?.products) ? data.data.products : []
  return list.filter((p) => p.status === "active")
}

// ── Categories (tree) ─────────────────────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const data = await cachedFetch(`${BASE_URL}/api/categories`)
  return data.data ?? []
}

// Tree-г flat болгох helper
export function flattenCategories(cats: Category[]): Category[] {
  const result: Category[] = []
  const flatten = (list: Category[]) => {
    list.forEach(c => { result.push(c); flatten(c.children ?? []) })
  }
  flatten(cats)
  return result
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmt = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮"

export const primaryImage = (product: Product) =>
  product.images.find(i => i.isPrimary) ?? product.images[0]