// 📁 components/ui/ProductCarousel.tsx
"use client"

import { useEffect, useState, useRef } from "react"

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0, rootMargin: "0px 0px 120px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import { Product } from "@/lib/api"
import ProductCard from "./ProductCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Props {
  title: string
  // filter?: "featured" | "newest" | "all"
  products: Product[]
}

export default function ProductCarousel({ title, products }: Props) {
  const [loading,    setLoading]    = useState(true)
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("mobile");
  const swiperRef   = useRef<any>(null)
  const titleReveal = useReveal()
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width >= 1024) setScreenSize("desktop")
      else if (width >= 768) setScreenSize("tablet")
      else setScreenSize("mobile")
    }
    if (products.length > 0) {
      setLoading(false)
      setTimeout(() => setButtonVisible(true), 100)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="mt-3 md:mt-7 lg:mt-9">
      {/* Title row */}
      <div ref={titleReveal.ref} className={`flex mb-4 sm:mb-6 justify-between items-center transition-all duration-800 ease-out ${titleReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
        <h1 className="text-white/90 text-[23px] sm:text-3xl font-head font-bold">
          {title}
        </h1>

        {/* Mobile arrows */}
        {screenSize !== "desktop" && (
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
        {screenSize === "desktop" && (
          <Link href="/products" className="font-body text-white/70 text-[14px] border-b border-current hover:text-white transition-colors">
            Бүгдийг харах
          </Link>
        )}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: screenSize === "mobile" ? 2 : screenSize === "tablet" ? 3 : 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-3">
              <div className="aspect-square rounded-xl skeleton" />
              <div className="h-3.5 rounded skeleton w-3/4" />
              <div className="h-3.5 rounded skeleton w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Mobile → Swiper */}
      {!loading && screenSize !== "desktop" && (
        <Swiper
          modules={[FreeMode]}
          ref={swiperRef}
          slidesPerView={
            screenSize === "mobile" ? 2 :
            screenSize === "tablet" ? 3 :
            4
          }
          slidesPerGroup={screenSize === "mobile" ? 2 : 3}
          freeMode={true}
          spaceBetween={7}
          speed={650}
          // breakpoints={{
          //   300: { slidesPerView: 2 },
          //   640: { slidesPerView: 3 },
          // }}
        >
          {products.map(product => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Desktop → Grid */}
      {!loading && screenSize === "desktop" && (
        <div className="grid grid-cols-4 gap-4">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile "Бүгдийг харах" */}
      {!loading && screenSize !== "desktop" && (
        <div className="my-4">
        <div className={`w-full bg-white/10 flex justify-center items-center py-1.5 border border-white/20 rounded-xl transition-all duration-800 ease-out ${buttonVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
          <Link href="/products" className="flex items-center gap-1 px-6 py-1 text-sm font-medium text-white/90">
            Бүгдийг харах
            <ChevronRight size={16} className="mt-0.5 text-white/90" />
          </Link>
        </div>
        </div>
      )}
    </div>
  )
}