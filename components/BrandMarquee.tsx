"use client"

import Image from "next/image"
import { useRef, useEffect, useState } from "react"

const brands = [
  { name: "Essentials", sub: "FEAR OF GOD", logo: "/brands/Essentials.png" },
  { name: "Maison Margiela", sub: "PARIS", logo: "/brands/Maison.png" },
  { name: "Stüssy", sub: "", logo: "/brands/Stussy.png" },
  { name: "Chrome Hearts", sub: "", logo: "/brands/Chrome.png" },
  { name: "Corteiz", sub: "C/O VIRGIL ABLOH", logo: "/brands/Corteiz.png" },
]

function BrandList({ innerRef }: { innerRef?: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="flex shrink-0 items-center">
      {brands.map((brand, i) => (
        <span key={i} className="flex items-center mx-7 lg:mx-10">
          <Image
            src={brand.logo}
            alt={brand.name}
            width={100}
            height={60}
            priority
            className="object-contain"
          />
        </span>
      ))}
    </div>
  )
}

export default function BrandMarquee() {
  const firstRef  = useRef<HTMLDivElement>(null)
  const trackRef  = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const measure = () => {
      if (!firstRef.current || !trackRef.current) return
      const w = firstRef.current.offsetWidth
      if (w === 0) return
      trackRef.current.style.setProperty("--marquee-dist", `-${w}px`)
      setReady(true)
    }

    // Measure after images load
    measure()
    window.addEventListener("load", measure)
    const timer = setTimeout(measure, 500)
    return () => {
      window.removeEventListener("load", measure)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="overflow-hidden py-5 my-6 lg:my-8 -mx-5 sm:-mx-10 lg:-mx-34">
      <div
        ref={trackRef}
        className={`flex w-max will-change-transform ${ready ? "animate-marquee-px" : ""}`}
      >
        <BrandList innerRef={firstRef} />
        <BrandList aria-hidden />
        <BrandList aria-hidden />
      </div>
    </div>
  )
}
