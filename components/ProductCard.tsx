'use client'

import Image from "next/image"
import { ProductItem } from "@/lib/product"
import { Heart, ShoppingBasket } from "lucide-react"
import { useWishlist } from "@/context/WishlistContext";
import { useState } from "react";
import { useToast } from "@/context/ToastContext"
import WishlistToast from "@/components/ui/wishlist-toast"

export default function ProductCard({
  id,
  title,
  image,
  price,
  category,
  createdAt
}: ProductItem) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast()
  const liked = isInWishlist(id);

  const handleWishlist = () => {
    if (liked) {
      showToast("💔 Хүслийн жагсаалтаас хасагдлаа")
    } else {
      showToast("❤️ Хүслийн жагсаалтад нэмэгдлээ")
    }
    toggleWishlist({ id, title, image, price, category, createdAt })
  }
  return (
    <>
      <div className="group rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-3 transition hover:shadow-lg hover:bg-white/20">
      
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm">{price}</p>
        </div>
        <div className="flex flex-row items-center gap-x-1 mt-2">
          {/* Wishlist Button */}
          <button className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm hover:bg-white/20 transition flex items-center justify-center h-7" onClick={handleWishlist}>
            <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-white/90"}/>
          </button>

          {/* Add to Cart Button */}
          <button className="flex-1 py-2 gap-x-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm hover:bg-white/20 text-white/90 font-body text-[13px] transition h-7 flex items-center justify-center">
            <ShoppingBasket size={14} className="text-white/90"/>
            Сагслах
          </button>
        </div>
      </div>
    </>
  )
}