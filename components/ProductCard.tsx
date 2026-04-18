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
import { useState, useRef, useEffect } from "react"
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
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: "0px 0px 120px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const liked = isInWishlist(product.id as any)
  const img   = primaryImage(product)
  const price = product.discountEnabled && product.finalPrice
    ? product.finalPrice
    : product.price

  const discountPct = product.discountEnabled && product.finalPrice
    ? Math.round((1 - product.finalPrice / product.price) * 100)
    : null

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
        productId:  product.id,
        title:      product.title,
        price,
        finalPrice: product.discountEnabled && product.finalPrice ? product.price : undefined,
        image:      img?.url ?? "",
        size:       "",
        color:      "",
        variants:   [],
        quantity:   1,
      })
      showToast("🛒 Сагсанд нэмэгдлээ")
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        className={`transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <Link
          href={`/products/${product.id}`}
          onClick={() => setSelectedProduct(product)}
          className="group block"
        >
          <div className="rounded-2xl border border-white/15 overflow-hidden
            transition-all duration-300
            hover:border-white/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">

            {/* ── Image ── */}
            <div className="relative aspect-square overflow-hidden">
              {img ? (
                <Image
                  src={img.url}
                  alt={product.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.15))" }}
                />
              )}

              {/* Discount badge */}
              {discountPct && (
                <span className="absolute top-2 left-2 z-10
                  text-white text-[10px] lg:text-xs font-bold
                  px-2 py-1 rounded-full bg-red-500 shadow-md">
                  -{discountPct}%
                </span>
              )}

              {/* ── Heart icon — баруун дээд булан (mobile: always, desktop: hover) ── */}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleWishlist() }}
                className={`absolute top-2 right-2 z-20
                  p-2 rounded-full backdrop-blur-sm border transition-all duration-200 active:scale-90
                  lg:opacity-0 lg:group-hover:opacity-100
                  ${liked
                    ? "bg-rose-500/25 border-rose-500/50 text-rose-500"
                    : "bg-black/30 border-white/20 text-white/70 hover:text-white/90 hover:bg-black/50"
                  }`}
              >
                <Heart size={14} className={liked ? "fill-rose-400" : ""} />
              </button>

              {/* ── Desktop: hover overlay — Сагслах ── */}
              <div
                className="absolute inset-0 z-10
                  bg-black/40 backdrop-blur-[2px]
                  flex-col items-center justify-center
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-300
                  hidden lg:flex"
              >
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); handleAddToCart() }}
                  className="flex items-center gap-2
                    px-6 py-2.5 rounded-full
                    bg-white text-black text-sm font-semibold
                    hover:bg-white/90 active:scale-95
                    transition-all duration-200 shadow-lg"
                >
                  <ShoppingBasket size={16} />
                  Сагслах
                </button>
              </div>
            </div>

            {/* ── Info ── */}
            <div className="px-3 pb-3 pt-2.5 lg:px-4 lg:pb-4 lg:pt-3 bg-white/10 backdrop-blur-md">

              {/* Title */}
              <h2 className="text-white/90 font-semibold line-clamp-1
                text-[14px] sm:text-[15px] lg:text-[17px] mb-1 lg:mb-2">
                {product.title}
              </h2>

              {/* Price row */}
              <div className="flex items-baseline gap-1.5 mb-2.5 lg:mb-0">
                <span className="text-white font-bold text-[15px] sm:text-base lg:text-lg">
                  {fmt(price)}
                </span>
                {product.discountEnabled && product.finalPrice && (
                  <span className="text-rose-500 text-xs lg:text-sm line-through">
                    {fmt(product.price)}
                  </span>
                )}
              </div>

              {/* ── Mobile/Tablet: Сагслах товч ── */}
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); handleAddToCart() }}
                className="lg:hidden w-full flex items-center justify-center gap-1.5
                  py-2 rounded-xl
                  bg-white/15 border border-white/20 text-white/90
                  text-[13px] font-medium active:scale-95
                  transition-all duration-200"
              >
                <ShoppingBasket size={14} />
                Сагслах
              </button>
            </div>
          </div>
        </Link>
      </div>

      {showSheet && (
        <AddToCartSheet
          product={product}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  )
}
