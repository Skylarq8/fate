// 📁 components/ui/ProductCarousel.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import { getProducts, Product } from "@/lib/api"
import ProductCard from "./ProductCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Props {
  title: string
  filter?: "featured" | "newest" | "all"
}

export default function ProductCarousel({ title, filter = "all" }: Props) {
  const [products,   setProducts]   = useState<Product[]>([])
  const [loading,    setLoading]    = useState(true)
  const [isDesktop,  setIsDesktop]  = useState(false)
  const swiperRef = useRef<any>(null)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    getProducts().then(data => {
      let result = data
      if (filter === "featured") result = data.filter(p => p.discountEnabled)
      if (filter === "newest")   result = [...data].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setProducts(result)
      setLoading(false)
    })
  }, [filter])

  return (
    <div className="mt-3 md:mt-7 lg:mt-9">
      {/* Title row */}
      <div className="flex mb-4 sm:mb-6 justify-between items-center">
        <h1 className="text-white/90 text-[23px] sm:text-3xl font-head font-bold">
          {title}
        </h1>

        {/* Mobile arrows */}
        {!isDesktop && (
          <div className="flex space-x-2.5">
            <button
              onClick={() => swiperRef.current?.swiper.slidePrev()}
              className="bg-white/10 p-1.5 rounded-full border border-white/20 flex items-center justify-center"
            >
              <ChevronLeft className="size-6 text-white/90" />
            </button>
            <button
              onClick={() => swiperRef.current?.swiper.slideNext()}
              className="bg-white/10 p-1.5 rounded-full border border-white/20 flex items-center justify-center"
            >
              <ChevronRight className="size-6 text-white/90" />
            </button>
          </div>
        )}

        {/* Desktop link */}
        {isDesktop && (
          <Link href="/products" className="font-body text-gray-300 text-[14px] border-b border-current hover:text-white transition-colors">
            Бүгдийг харах
          </Link>
        )}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: isDesktop ? 4 : 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-3">
              <div className="aspect-square rounded-xl skeleton" />
              <div className="h-3.5 rounded skeleton w-3/4" />
              <div className="h-3.5 rounded skeleton w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Mobile → Swiper */}
      {!loading && !isDesktop && (
        <Swiper
          modules={[FreeMode]}
          ref={swiperRef}
          slidesPerView="auto"
          freeMode={true}
          spaceBetween={7}
          breakpoints={{
            300: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
          }}
        >
          {products.map(product => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Desktop → Grid */}
      {!loading && isDesktop && (
        <div className="grid grid-cols-4 gap-4">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile "Бүгдийг харах" */}
      {!loading && !isDesktop && (
        <div className="my-4 w-full bg-white/10 flex justify-center items-center py-1.5 border border-white/20 rounded-xl">
          <Link href="/products" className="flex items-center gap-1 px-6 py-1 text-sm font-medium text-white/90">
            Бүгдийг харах
            <ChevronRight size={16} className="mt-0.5 text-white/90" />
          </Link>
        </div>
      )}
    </div>
  )
}