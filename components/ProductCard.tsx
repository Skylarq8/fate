'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductItem } from "@/lib/product"

export default function ProductCard({
  title,
  image,
  price
}: ProductItem) {
  return (
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

      <Button className="mt-3 w-full" size="sm">
        Add to cart
      </Button>
    </div>
  )
}