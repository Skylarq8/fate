"use client"

import { useEffect, useState, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import { Product } from "@/lib/api"
import ProductCard from "./ProductCard"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

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

interface Props {
  title: string
  products: Product[]
}

export default function ProductSlider({ title, products }: Props) {
  if (products.length === 0) return null
  const swiperRef   = useRef<SwiperType | null>(null)
  const titleReveal = useReveal()
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd,       setIsEnd]       = useState(false)

  const storageKey = `slider-pos:${title}`

  const syncState = (s: SwiperType) => {
    setIsBeginning(s.isBeginning)
    setIsEnd(s.isEnd)
  }

  const savePosition = (s: SwiperType) => {
    syncState(s)
    sessionStorage.setItem(storageKey, String(s.activeIndex))
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey)
    if (!saved) return
    const index = parseInt(saved)
    if (index > 0) {
      swiperRef.current?.slideTo(index, 0, false)
    }
  }, [])

  return (
    <div className="mt-3 md:mt-7 lg:mt-9">

      {/* ── Title row ── */}
      <div
        ref={titleReveal.ref}
        className={`flex items-center justify-between mb-4 sm:mb-6
          transition-all duration-700 ease-out
          ${titleReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      >
        <h1 className="text-white/90 text-[23px] sm:text-3xl font-head font-bold">
          {title}
        </h1>

        <div className="flex items-center gap-3">
          {/* Nav товч — mobile/tablet л харагдана */}
          <div className="flex gap-1.5 lg:hidden">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              disabled={isBeginning}
              className={`p-1.5 rounded-full border transition-all duration-200
                ${isBeginning
                  ? "border-white/8 text-white/15 cursor-not-allowed"
                  : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              disabled={isEnd}
              className={`p-1.5 rounded-full border transition-all duration-200
                ${isEnd
                  ? "border-white/8 text-white/15 cursor-not-allowed"
                  : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <Link
            href="/products"
            className="hidden lg:flex items-center gap-1 text-[13px] text-white/40 hover:text-white/80 transition-colors"
          >
            Бүгдийг харах
            <ChevronRight size={13} className="mt-px" />
          </Link>
        </div>
      </div>

      {/* ── Mobile/Tablet: Swiper ── */}
      <div className="lg:hidden">
        <Swiper
          modules={[FreeMode]}
          freeMode
          spaceBetween={7}
          speed={600}
          slidesPerGroup={2}
          onSwiper={(s) => { swiperRef.current = s; syncState(s) }}
          onSlideChange={syncState}
          onReachBeginning={syncState}
          onReachEnd={syncState}
          onTouchEnd={savePosition}
          onTransitionEnd={savePosition}
          breakpoints={{
            0:   { slidesPerView: 2 },
            768: { slidesPerView: 3 },
          }}
        >
          {products.map(product => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ── Desktop: static 4-column grid ── */}
      <div className="hidden lg:grid grid-cols-4 gap-1.75">
        {products.slice(0, 4).map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* ── Mobile — бүгдийг харах ── */}
      <div className="mt-4 lg:hidden">
        <Link
          href="/products"
          className="flex items-center justify-center gap-1 w-full py-2.5 rounded-xl
            border border-white/20 bg-white/10 text-sm text-white/80
            hover:bg-white/15 hover:text-white transition-all"
        >
          Бүгдийг харах
          <ChevronRight size={14} className="mt-px" />
        </Link>
      </div>

    </div>
  )
}
