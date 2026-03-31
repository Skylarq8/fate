// 📁 lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

// ── Simple in-memory cache ────────────────────────────────────────────────────
const cache = new Map<string, { data: any; ts: number }>()
const CACHE_TTL = 60_000

async function cachedFetch(url: string) {
  const hit = cache.get(url)
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data
  const res  = await fetch(url)
  const data = await res.json()
  cache.set(url, { data, ts: Date.now() })
  return data
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
export async function getProducts(): Promise<Product[]> {
  const data = await cachedFetch(`${BASE_URL}/api/products`)
  return (data.data ?? []).filter((p: Product) => p.status === "active")
}

export async function getProduct(id: string): Promise<Product | null> {
  const data = await cachedFetch(`${BASE_URL}/api/products/${id}`)
  return data.data ?? null
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