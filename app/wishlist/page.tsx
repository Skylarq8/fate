// 📁 app/wishlist/page.tsx
"use client"

import { useWishlist } from "@/context/WishlistContext"
import ProductCard from "@/components/ProductCard"
import { HeartOff } from "lucide-react"

export default function WishlistPage() {
  const { wishlist } = useWishlist()
  const isEmpty = wishlist.length === 0

  return (
    <div className="max-w-7xl mx-auto mt-3">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">Таалагдсан бараа</h1>
        {!isEmpty && <p className="text-white/50 mt-2">Нийт {wishlist.length} бараа</p>}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[70vh]">
          <HeartOff className="w-12 h-12 text-white/90 mb-4" />
          <p className="text-lg font-medium text-white/90">Хоосон байна</p>
          <p className="text-sm text-white/40 mt-1">Таалагдсан бараа хараахан алга</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {wishlist.map((item, i) => (
            <ProductCard key={i} product={item} />
          ))}
        </div>
      )}
    </div>
  )
}