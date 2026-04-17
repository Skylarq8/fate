// 📁 components/ui/ProductCard.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBasket } from "lucide-react"
import { Product, fmt, primaryImage } from "@/lib/api"
import { useWishlist } from "@/context/WishlistContext"
import { useToast } from "@/context/ToastContext"
import { useCartStore } from "@/store/cartStore"
import { useProductStore } from "@/store/productStore"
import { useState } from "react"
import AddToCartSheet from "./AddToCartSheet"

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const setSelectedProduct = useProductStore(s => s.setSelectedProduct)
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { showToast }                    = useToast()
  const addItem                          = useCartStore(s => s.addItem)
  const [showSheet, setShowSheet] = useState(false)

  const liked = isInWishlist(product.id as any)
  const img   = primaryImage(product)
  const price = product.discountEnabled && product.finalPrice
    ? product.finalPrice
    : product.price

  const handleWishlist = () => {
    if (liked) {
      showToast("💔 Хүслийн жагсаалтаас хасагдлаа")
    } else {
      showToast("❤️ Хүслийн жагсаалтад нэмэгдлээ")
    }
    toggleWishlist(product)
  }

  const handleAddToCart = () => { 
    if (product.sizes.length > 0 || product.colors.length > 0) {
      setShowSheet(true)
    } else {
      addItem({
        productId:     product.id,
        title:         product.title,
        price,
        finalPrice: product.discountEnabled && product.finalPrice ? product.price : undefined,
        image:         img?.url ?? "",
        size:          "",
        color:         "",
        variants: [],
        quantity:      1,
      })
      showToast("🛒 Сагсанд нэмэгдлээ")
    }
  }

  return (
    <>
      <Link href={`/products/${product.id}`} onClick={() => setSelectedProduct(product)} className="group block">
      {/* bg-white/10 backdrop-blur-md */}
        <div className="rounded-2xl border border-white/20 transition hover:shadow-lg hover:bg-white/20">
          {/* image */}
          <div className="relative aspect-square overflow-hidden rounded-t-2xl">
            {img ? (
              <Image
                src={img.url}
                alt={product.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-white/5 rounded-xl"
                style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.15))" }} />
            )}

            {/* discount badge */}
            {product.discountEnabled && product.finalPrice && (
              <span className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full bg-red-500">
                -{Math.round((1 - product.finalPrice / product.price) * 100)}%
              </span>
            )}
          </div>
          {/* bg-white/10 backdrop-blur-md rounded-b-2xl */}
          <div className="px-3 pb-3 pt-1.5 bg-white/10 backdrop-blur-md rounded-b-2xl">
            <div className="space-y-1">
              <h1 className="text-[16px] font-medium text-white/90 line-clamp-1">{product.title}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-white/80 font-semibold">{fmt(price)}</p>
                {product.discountEnabled && product.finalPrice && (
                  <p className="text-xs text-rose-500 line-through">{fmt(product.price)}</p>
                )}
              </div>
            </div>

            <div className="flex flex-row items-center gap-x-1.5 mt-2" onClick={e => { e.preventDefault(); e.stopPropagation() }}>
              <button onClick={handleWishlist}
                className="p-2 rounded-sm glass-sm backdrop-blur-md hover:bg-rose-500 transition-all border border-white/20 text-white/90"
                style={liked ? { border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.15)" } : {}}>
                <Heart size={15} className={liked ? "fill-rose-500 text-rose-500" : "text-white/90"}/>
              </button>
              <button onClick={handleAddToCart}
                className="flex-1 py-2 gap-x-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm hover:bg-rose-500 text-white/90 font-body text-[13px] transition h-8 flex items-center justify-center">
                <ShoppingBasket size={15} className="text-white/90" />
                Сагслах
              </button>
            </div>
          </div>
        </div>
      </Link>
        {showSheet && (
          <AddToCartSheet
            product={product}
            onClose={() => setShowSheet(false)}
          />
      )}
    </>
  )
}