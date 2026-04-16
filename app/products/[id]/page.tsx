// 📁 app/product/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, ChevronLeft, Minus, Plus, Heart } from "lucide-react"
import { getProduct, getProducts, Product, fmt } from "@/lib/api"
import { useCartStore } from "@/store/cartStore"
import { useWishlist } from "@/context/WishlistContext"
import { useToast } from "@/context/ToastContext"
import ProductCard from "@/components/ProductCard"
import Accordin from "@/components/Accordin"
import Footer from "@/components/Footer"
import { useRouter } from "next/navigation"
import { useProductStore } from "@/store/productStore"


type SelectedVariants = Record<string, string>;

export default function ProductDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const productFromStore = useProductStore(s => s.selectedProduct)
  const [product, setProduct] = useState<Product | null>(productFromStore)
  const [loading, setLoading] = useState(!productFromStore)
  const addItem   = useCartStore(s => s.addItem)
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { showToast } = useToast()
  const router = useRouter()

  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>({});
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [mainImage, setMainImage] = useState<string>("")
  const [related,   setRelated]   = useState<Product[]>([])
  const [activeImg, setActiveImg] = useState(0)
  const [size,      setSize]      = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [qty,       setQty]       = useState(1)
  const [touchStartX, setTouchStartX] = useState(0);
  const [added,     setAdded]     = useState(false)
  const [animProgress, setAnimProgress] = useState(0)
  const [remainingTime, setRemainingTime] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    totalMs: number
  } | null>(null)

  useEffect(() => {
    if (!product) return;
    const img = product.images[activeImg];
    if (img?.variantColor) setSelectedColor(img.variantColor);
  }, [activeImg, product]);

  useEffect(() => {
    if (!product) return
    setMainImage(sorted[activeImg]?.url || "")
  }, [activeImg, product])

  useEffect(() => {
    if (!product) return;

    const defaultVariants: SelectedVariants = {};
    product.variants?.forEach(v => {
      if (v.values.length > 0) defaultVariants[v.label] = v.values[0];
    });
    setSelectedVariants(defaultVariants);
  }, [product]);

  useEffect(() => {
    if (!id) return

    // store байгаа эсэхийг шалгана
    if (productFromStore && productFromStore.id === id) {
      setProduct(productFromStore)
      setLoading(false)
      return
    }

    // үгүй бол fetch
    setLoading(true)

    getProduct(id).then(p => {
      setProduct(p)
      setLoading(false)
    })
  }, [id, productFromStore])

  useEffect(() => {
    if (!product) return

    setActiveImg(0)

    if (product.sizes.length > 0) {
      setSize(product.sizes[0])
    }

    if (product.colors.length > 0) {
      setSelectedColor(product.colors[0])
    }
  }, [product])

  useEffect(() => {
    if (!product) return

    const slug = product.categories?.[0]?.category?.slug
    if (!slug) return

    const fetchRelated = async () => {
      try {
        const res = getProducts({ category: slug })
        const data: Product[] = await res

        setRelated(
          data
            .filter(p => p.id !== product.id)
            .slice(0, 4)
        )
      } catch (err) {
        console.error("Failed to load related products", err)
      }
    }

    fetchRelated()
  }, [product])


  useEffect(() => {
    if (!product?.discountEndsAt) return

    const interval = setInterval(() => {
      const end = new Date(product.discountEndsAt!).getTime()
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft("Хямдрал дууссан")
        clearInterval(interval)
        return
      }

     setRemainingTime({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      totalMs: diff,
    })
  }, 1000)

  return () => clearInterval(interval)
}, [product])

  const liked = product ? isInWishlist(product.id as any) : false
  const img   = product ? (product.images.find(i => i.isPrimary) ?? product.images[0]) : null
  const price = product
    ? (product.discountEnabled && product.finalPrice ? product.finalPrice : product.price)
    : 0

  // Count-up animation: 0→1 progress drives all price displays
  useEffect(() => {
    if (!price) return
    setAnimProgress(0)
    const duration = 900
    const startTime = performance.now()
    let frame: number
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setAnimProgress(ease)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [price])

  const displayPrice         = Math.round(price * animProgress)
  const displayOriginalPrice = product ? Math.round(product.price * animProgress) : 0
  const discountPct          = product?.discountEnabled && product?.finalPrice
    ? Math.round((1 - product.finalPrice / product.price) * 100) : 0
  const displayDiscount      = Math.round(discountPct * animProgress)

  const handleAddToCart = () => {
    if (!product) return
    
    const img =
      product.images.find(i => i.variantColor === selectedColor) ||
      product.images.find(i => i.isPrimary) ||
      product.images[0]

    addItem({
      productId: product.id,
      title: product.title,
      price,
      image: img?.url ?? "",
      size,
      color: selectedColor,
      variants: Object.entries(selectedVariants).map(([label, value]) => ({ label, value })),
      quantity: qty
    })

    setAdded(true)
    showToast("🛒 Сагсанд нэмэгдлээ")
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = () => {
    if (!product) return
    const img = product.images.find(i => i.isPrimary) ?? product.images[0]
    if (liked) {
      showToast("💔 Хүслийн жагсаалтаас хасагдлаа")
    } else {
      showToast("❤️ Хүслийн жагсаалтад нэмэгдлээ")
    }
    toggleWishlist({
      id:        product.id as any,
      title:     product.title,
      image:     img?.url ?? "",
      price:     String(price),
      category:  product.categories[0]?.category.name ?? "",
      createdAt: product.createdAt,
    } as any)
  }

  const sorted = product ? [...product.images].sort((a, b) => a.order - b.order) : []

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 py-10 animate-pulse">
      {/* Image */}
      <div className="aspect-square rounded-3xl bg-white/10" />
      {/* Content */}
      <div className="space-y-6">
        <div className="h-15 w-3/4 bg-white/10 rounded-lg" />
        <div className="h-6 w-40 bg-white/10 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-5/6 bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-16 bg-white/10 rounded-lg" />
          <div className="h-9 w-16 bg-white/10 rounded-lg" />
          <div className="h-9 w-16 bg-white/10 rounded-lg" />
        </div>
        <div className="h-12 w-full bg-white/10 rounded-xl" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-6xl mx-auto px-5 py-24 text-center space-y-4">
      <p className="text-5xl">✦</p>
      <p className="font-display text-xl text-white/60">Бараа олдсонгүй</p>
      <Link href="/products" className="text-sm text-white/40 hover:text-white transition-colors">← Буцах</Link>
    </div>
  )

  return (
    <>
    <div className="max-w-6xl mx-auto py-3 space-y-5">

      <button onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-white hover:text-white transition-colors">
        <ChevronLeft size={15} /> Буцах
      </button>

      {/* ── Detail ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-3xl overflow-hidden glass" 
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const deltaX = e.changedTouches[0].clientX - touchStartX;
            if (deltaX > 50 && activeImg > 0) setActiveImg(activeImg - 1);
            if (deltaX < -50 && activeImg < sorted.length - 1) setActiveImg(activeImg + 1);
          }}>
            {sorted[activeImg] ? (
              <Image
                src={mainImage || product.images[0]?.url}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full"
                style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(96,165,250,0.15))" }} />
            )}
            {/* {product.discountEnabled && product.finalPrice && (
              <span className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: "linear-gradient(135deg, #a78bfa, #60a5fa)" }}>
                -{Math.round((1 - product.finalPrice / product.price) * 100)}%
              </span>
            )} */}
          </div>

          {sorted.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1 px-1 scrollbar-hide">
              {sorted.map((img, i) => (
                <button key={img.id} 
                  onClick={() => {
                    setActiveImg(i)
                    setMainImage(img.url)
                    if (img.variantColor) {
                      setSelectedColor(img.variantColor)
                    }
                  }}
                  className={`relative flex-shrink-0 w-15 h-15 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === i ? "border-rose-500/90 scale-105" : "border-white/10 opacity-50 hover:opacity-100"
                  }`}>
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5 md:pt-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-white tabular-nums">{fmt(displayPrice)}</span>
            {product.discountEnabled && product.finalPrice && (
              <>
                <span className="text-rose-500 line-through text-xl tabular-nums">{fmt(displayOriginalPrice)}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white bg-red-500 tabular-nums">
                  -{displayDiscount}%
                </span>
              </>
            )}
          </div>

          {product.discountEnabled && product.discountEndsAt && remainingTime && (
            <div className={`text-sm font-semibold px-3 py-1.5 rounded-lg inline-block
              ${remainingTime.totalMs < 1000 * 60 * 60 * 24
                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                : "bg-yellow-400/20 text-yellow-300 border border-yellow-400/40"
              }`}>
              ⏳ Хямдрал дуусахад:{" "}
              {remainingTime.days}х {remainingTime.hours}ц {remainingTime.minutes}м {remainingTime.seconds}с
            </div>
          )}

          <div className="space-y-2.5">
            <p className="text-xs lg:text-[14px] tracking-[0.2em] text-white/90 uppercase">Барааны дэлгэрэнгүй</p>
            <p className="text-white leading-relaxed text-[15px] lg:text-[17px] whitespace-pre-line">
              {product.description}
            </p>
          </div>
          {/* Categories */}
          {/* <div className="flex gap-2 flex-wrap">
            {product.categories.map(({ category }) => (
              <span key={category.id} className="text-xs lg:text-[14px] glass-sm px-3 py-1 rounded-full text-white/60 font-medium">
                {category.name}
              </span>
            ))}
          </div> */}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="space-y-2.5">
              <p className="text-xs lg:text-[14px] tracking-[0.2em] text-white/90 uppercase">Хэмжээ</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm lg:text-[15px] font-medium transition-all ${
                      size === s ? "text-white/90 bg-rose-500" : "glass-sm text-white/60 underline hover:text-white"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

        {/* Colors */}
        {product.colors.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs lg:text-[14px] tracking-[0.2em] text-white/90 uppercase">Өнгө</p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map(c => (
                <button key={c} onClick={() => {
                    setSelectedColor(c)
                    const idx = product.images.findIndex(i => i.variantColor === c)
                    if (idx !== -1) {
                      setActiveImg(idx)
                      setMainImage(product.images[idx].url)
                    }
                }}
                className={`px-4 py-2 rounded-xl text-sm lg:text-[15px] font-medium uppercase transition-all ${
                  selectedColor === c ? "text-white/90 bg-rose-500" : "glass-sm text-white/60 underline hover:text-white"
                }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* ── Custom Variants ── */}
        {product.variants?.length ? (
          <div className="space-y-4">
            {product.variants.map(variant => (
              <div key={variant.id} className="space-y-2.5">
                <p className="text-xs tracking-[0.2em] text-white/90 uppercase">
                  {variant.label}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {variant.values.map(val => (
                    <button
                      key={val}
                      onClick={() =>
                        setSelectedVariants(prev => ({
                          ...prev,
                          [variant.label]: val
                        }))
                      }
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedVariants[variant.label] === val
                          ? "bg-rose-500 text-white"
                          : "glass-sm text-white/60 underline hover:text-white"
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {/* Quantity */}
        <div className="flex items-center justify-between glass rounded-2xl">
        <p className="text-xs lg:text-[14px] tracking-[0.25em] text-white/90 uppercase font-medium">
            Тоо ширхэг
        </p>
            <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md">
                <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-2.5 py-1.5 text-white/60 hover:text-white transition-all">
                <Minus size={16} />
                </button>
                <span className="px-2.5 py-1.5 text-sm lg:text-[15px] font-semibold text-white min-w-[40px] text-center border-x border-white/10">
                {qty}
                </span>
                <button
                onClick={() => setQty(q => q + 1)}
                className="px-2.5 py-1.5 text-white/60 hover:text-white transition-all">
                <Plus size={16} />
                </button>
            </div>
        </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-98 bg-rose-500 text-white/90">
              <ShoppingCart size={18} />
              {added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"}
            </button>

            <button onClick={handleWishlist}
              className="p-4 rounded-2xl glass-sm hover:bg-white/10 transition-all"
              style={liked ? { border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.15)" } : {}}>
              <Heart size={20} className={liked ? "fill-red-500 text-red-500" : "text-white/60"} />
            </button>
          </div>
        </div>
      </div>
      

      {/* ── Related ── */}
      {related.length > 0 && (
        <section>
          {/* <p className="text-xs tracking-[0.25em] text-white/90 uppercase mb-2">Related</p> */}
          <h2 className="font-display text-2xl font-bold text-white mb-7">Төстэй бараанууд</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
    <p className="font-body font-medium text-center text-sm lg:text-xl mt-10 lg:mt-15 text-white/90">Хүмүүсийн нийтлэг асуудаг асуултууд</p>
    <h1 className="font-heading font-semibold text-center text-2xl lg:text-3xl mt-3 text-white/90">FAQ</h1>
    <div className="flex justify-center mt-3">
        <Accordin/>
    </div>
    <Footer/>
    </>
  )
}