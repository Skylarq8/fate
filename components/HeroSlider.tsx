"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

const slides = [
  {
    src: "https://i.pinimg.com/1200x/52/9e/7e/529e7ec19ab5c800ff2abb36956b3452.jpg",
    tag: "Шинэ цуглуулга",
    title: "2025 Хавар / Зун",
    subtitle: "Хамгийн сүүлийн загваруудыг нээж мэдээрэй",
    href: "/products",
  },
  {
    src: "https://i.pinimg.com/736x/7e/ed/49/7eed4934474097f2a74ed1f9a8008c43.jpg",
    tag: "Онцлох брэнд",
    title: "Дизайнер брэндүүд",
    subtitle: "Дэлхийн тэргүүлэх брэндүүдийн шилдэг бүтээлүүд",
    href: "/products",
  },
  {
    src: "https://i.pinimg.com/1200x/99/3a/a7/993aa7bce2e4ec5744390ae63a1cfaa6.jpg",
    tag: "Тусгай хямдрал",
    title: "10% хүртэл хэмнэлт",
    subtitle: "Хязгаарлагдмал цаг хугацаатай урамшуулалт санал",
    href: "/products",
  },
];

const AUTOPLAY_DELAY = 4000;

export default function HeroSlider() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const syncState = (s: SwiperType) => {
    setActiveIndex(s.realIndex);
    setIsBeginning(s.isBeginning);
    setIsEnd(s.isEnd);
  };

  const resetProgress = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const pct = Math.min((elapsed / AUTOPLAY_DELAY) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    resetProgress();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex]);

  return (
    <section
      ref={containerRef}
      className={`w-full mb-5 transition-all duration-700 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="relative group">
        {/* ── Swiper ── */}
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
          pagination={{ clickable: true, el: ".hero-pagination" }}
          loop
          speed={700}
          onSwiper={(s) => { swiperRef.current = s; syncState(s); }}
          onSlideChange={(s) => { syncState(s); resetProgress(); }}
          className="h-64 sm:h-80 lg:h-125 heroSwiper rounded-2xl overflow-hidden"
        >
          {slides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full w-full">
                <Image
                  alt={slide.title}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  src={slide.src}
                />

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                {/* Left gradient */}
                <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent" />

                {/* Text content */}
                <div className="absolute bottom-0 left-0 p-5 sm:p-8 lg:p-12 max-w-xl">
                  <span className="inline-block mb-2 sm:mb-3 px-2.5 py-0.5 rounded-full
                    bg-white/15 backdrop-blur-sm border border-white/20
                    text-white/90 text-[10px] sm:text-xs font-medium tracking-wider uppercase">
                    {slide.tag}
                  </span>

                  <h2 className="text-white font-head font-bold
                    text-xl sm:text-3xl lg:text-5xl leading-tight mb-1.5 sm:mb-2">
                    {slide.title}
                  </h2>

                  <p className="text-white/60 text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 leading-relaxed">
                    {slide.subtitle}
                  </p>

                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2
                      px-4 sm:px-6 py-2 sm:py-2.5 rounded-full
                      bg-white text-black text-xs sm:text-sm font-semibold
                      hover:bg-white/90 active:scale-95
                      transition-all duration-200 group/btn"
                  >
                    Дэлгэрэнгүй
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ── Custom Nav Buttons ── */}
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10
            p-2 sm:p-2.5 rounded-full border backdrop-blur-sm
            transition-all duration-200
            opacity-0 group-hover:opacity-100
            ${isBeginning
              ? "border-white/10 text-white/20 cursor-not-allowed bg-black/10"
              : "border-white/20 bg-black/30 text-white/80 hover:bg-black/50 hover:text-white"
            }`}
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10
            p-2 sm:p-2.5 rounded-full border backdrop-blur-sm
            transition-all duration-200
            opacity-0 group-hover:opacity-100
            ${isEnd
              ? "border-white/10 text-white/20 cursor-not-allowed bg-black/10"
              : "border-white/20 bg-black/30 text-white/80 hover:bg-black/50 hover:text-white"
            }`}
        >
          <ChevronRight size={18} />
        </button>

        {/* ── Bottom bar: pagination + progress ── */}
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 right-4 sm:right-6 lg:right-8 z-10
          flex flex-col items-end gap-2">

          {/* Slide counter */}
          <span className="text-white/50 text-[10px] sm:text-xs font-mono tracking-widest">
            {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>

          {/* Progress bar */}
          <div className="w-16 sm:w-24 h-0.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Pagination dots ── */}
        <div className="hero-pagination absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-1.5" />
      </div>
    </section>
  );
}
