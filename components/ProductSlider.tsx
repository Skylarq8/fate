"use client";

import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { products } from "@/lib/product";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FreeMode } from "swiper/modules";

interface ProductSliderProps {
  title: string;
}

export default function ProductCarousel({ title }: ProductSliderProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="mt-3 md:mt-7 lg:mt-9">
      
      {/* TITLE */}
      <div className="flex mb-3 sm:mb-4 justify-between items-center">
        <h1 className="text-white/90 text-[25px] sm:text-3xl font-head font-bold">
          {title}
        </h1>

        {/* Mobile arrows */}
        {!isDesktop && (
          <div className="flex space-x-2.5">
            <button
              onClick={() => swiperRef.current?.swiper.slidePrev()}
              className="bg-white/10 p-1.5 rounded-full border border-white/20 flex items-center"
            >
              <ChevronLeft className="size-6 text-white/90" />
            </button>

            <button
              onClick={() => swiperRef.current?.swiper.slideNext()}
              className="bg-white/10 p-1.5 rounded-full border border-white/20 flex items-center"
            >
              <ChevronRight className="size-6 text-white/90" />
            </button>
          </div>
        )}

        {/* Desktop "Бүгдийг харах" */}
        {isDesktop && (
          <h1 className="font-body text-gray-300 text-[14px] border-b border-current">
            Бүгдийг харах
          </h1>
        )}
      </div>

      {/* MOBILE → SWIPER */}
      {!isDesktop && (
        <Swiper
        modules={[FreeMode]}
          ref={swiperRef}
          slidesPerView="auto"
          freeMode={true}
          slidesPerGroup={2}
          spaceBetween={7}
          breakpoints={{
            300: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard {...product} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* DESKTOP → GRID */}
      {isDesktop && (
        <div className="grid grid-cols-4 gap-4">
          {products.slice(0,4).map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
      <div className="mt-4 w-full bg-white/10 flex justify-center items-center py-1.5 border border-white/20 rounded-2xl lg:hidden">
        <button className="flex items-center gap-1 px-6 py-1.5 text-sm font-medium text-white/90">
          Бүгдийг харах
          <ChevronRight size={16} className="mt-1 text-white/90"/>
        </button>
      </div>
    </div>
  );
}