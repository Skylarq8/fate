"use client"

const brands = [
  { name: "Essentials", sub: "FEAR OF GOD" },
  { name: "Maison Margiela", sub: "PARIS" },
  { name: "Stüssy", sub: "" },
  { name: "Chrome Hearts", sub: "" },
  { name: "Supreme", sub: "" },
  { name: "Off-White", sub: "C/O VIRGIL ABLOH" },
]

function BrandList() {
  return (
    <div className="flex shrink-0 items-center">
      {brands.map((brand, i) => (
        <span key={i} className="flex items-center">
          <span className="flex flex-col items-center mx-10">
            <span className="text-white/90 text-sm font-heading font-semibold tracking-widest uppercase">
              {brand.name}
            </span>
            {brand.sub && (
              <span className="text-white/40 text-[9px] tracking-[0.2em] uppercase mt-0.5">
                {brand.sub}
              </span>
            )}
          </span>
          <span className="text-white/50 text-xl select-none">✦</span>
        </span>
      ))}
    </div>
  )
}

export default function BrandMarquee() {
  return (
    <div className="overflow-hidden py-5 my-10 lg:my-14 -mx-5 sm:-mx-10 lg:-mx-34">
      <div className="flex w-max animate-marquee will-change-transform">
        <BrandList />
        <BrandList aria-hidden />
      </div>
    </div>
  )
}


// "use client"

// import Image from "next/image"

// const brands = [
//   { name: "Essentials", sub: "FEAR OF GOD", logo: "/brands/Essentials.jpg" },
//   { name: "Maison Margiela", sub: "PARIS", logo: "/brands/Maison-Margiela.jpg" },
//   { name: "Stüssy", sub: "", logo: "/brands/Stüssy.jpg" },
//   { name: "Chrome Hearts", sub: "", logo: "/brands/Chrome-Hearts.jpg" },
//   { name: "Bape", sub: "", logo: "/brands/Bape.jpg" },
//   { name: "Corteiz", sub: "C/O VIRGIL ABLOH", logo: "/brands/Corteiz.jpg" },
// ]

// function BrandList() {
//   return (
//     <div className="flex shrink-0 items-center">
//       {brands.map((brand, i) => (
//         <span key={i} className="flex items-center">
//           <span className="flex flex-col items-center mx-10">
//             <Image
//               src={brand.logo}
//               alt={brand.name}
//               width={80}
//               height={40}
//               className="object-contain opacity-70 hover:opacity-100 transition-opacity"
//             />
//           </span>
//           <span className="text-white/20 text-xl select-none">✦</span>
//         </span>
//       ))}
//     </div>
//   )
// }

// export default function BrandMarquee() {
//   return (
//     <div className="overflow-hidden py-5 border-y border-white/8 my-10 lg:my-14 -mx-5 sm:-mx-10 lg:-mx-34">
//       <div className="flex w-max animate-marquee will-change-transform">
//         <BrandList />
//         <BrandList aria-hidden />
//       </div>
//     </div>
//   )
// }
