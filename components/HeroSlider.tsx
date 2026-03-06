"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

export default function HeroSlider() {
  return (
    <section className="w-full mb-5">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop
        className="h-70 sm:h-80 lg:h-120 heroSwiper rounded-2xl">
        <SwiperSlide>
          <div className="h-full bg-white/50 flex items-center justify-center">
            <Image alt="image" fill className="object-cover" src="https://i.pinimg.com/1200x/52/9e/7e/529e7ec19ab5c800ff2abb36956b3452.jpg"/>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="h-full bg-white/50 flex items-center justify-center">
            <Image alt="image" fill className="object-cover" src="https://i.pinimg.com/736x/7e/ed/49/7eed4934474097f2a74ed1f9a8008c43.jpg"/>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="h-full bg-white/50 flex items-center justify-center">
            <Image alt="image" fill className="object-cover" src="https://i.pinimg.com/1200x/99/3a/a7/993aa7bce2e4ec5744390ae63a1cfaa6.jpg"/>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
}