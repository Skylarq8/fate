// 📁 components/ui/AddToCartSheet.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { X, Minus, Plus, ShoppingCart, Check } from "lucide-react"
import { Product, fmt, primaryImage } from "@/lib/api"
import { useCartStore } from "@/store/cartStore"
import { useToast } from "@/context/ToastContext"

interface Props {
  product: Product
  onClose: () => void
}

type SelectedVariants = Record<string, string>;

export default function AddToCartSheet({ product, onClose }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const { showToast } = useToast()

  const [selectedVariants, setSelectedVariants] = useState<SelectedVariants>({});
  const [size,        setSize]        = useState(product.sizes[0]  ?? "")
  const [color,       setColor]       = useState(product.colors[0] ?? "")
  const [qty,         setQty]         = useState(1)
  const [added,       setAdded]       = useState(false)
  const [show,        setShow]        = useState(false)
  const [mounted,     setMounted]     = useState(false)
  const [isDesktop,   setIsDesktop]   = useState(false)
  const [animProgress, setAnimProgress] = useState(0)

  const img =
    product.images.find(i => i.variantColor === color) ||
    product.images.find(i => i.isPrimary) ||
    product.images[0]
  const price = product.discountEnabled && product.finalPrice
    ? product.finalPrice : product.price

  // Count-up animation
  useEffect(() => {
    if (!price) return
    setAnimProgress(0)
    const duration = 900
    const startTime = performance.now()
    let frame: number
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setAnimProgress(ease)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [price])

  const displayPrice         = Math.round(price * animProgress)
  const displayOriginalPrice = Math.round(product.price * animProgress)
  const discountPct          = product.discountEnabled && product.finalPrice
    ? Math.round((1 - product.finalPrice / product.price) * 100) : 0
  const displayDiscount      = Math.round(discountPct * animProgress)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (mounted) requestAnimationFrame(() => setShow(true))
  }, [mounted])

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  useEffect(() => {
      if (!product) return;
  
      const defaultVariants: SelectedVariants = {};
      product.variants?.forEach(v => {
        if (v.values.length > 0) defaultVariants[v.label] = v.values[0];
      });
      setSelectedVariants(defaultVariants);
    }, [product]);

  const handleClose = () => {
    setShow(false)
    setTimeout(onClose, 300)
  }

  const handleAdd = () => {
    const imgToAdd =
      product.images.find(i => i.variantColor === color) ||
      product.images.find(i => i.isPrimary) ||
      product.images[0]

    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      discountEnabled: product.discountEnabled || false,
      finalPrice: product.discountEnabled && product.finalPrice ? product.finalPrice : undefined,
      image: imgToAdd?.url ?? "",
      size,
      color,
      variants: Object.entries(selectedVariants).map(([label, value]) => ({ label, value })),
      quantity: qty,
    })

    setAdded(true)
    showToast("🛒 Сагсанд нэмэгдлээ")
    setTimeout(handleClose, 900)
  }

  if (!mounted) return null

  const content = (
    <div className="px-5 pt-4 pb-8 space-y-5">
      {/* Product info */}
      <div className="flex gap-4 items-start">
        <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-white/5">
          {img ? (
            <Image src={img.url} alt={product.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full"
              style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))" }} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold text-[18px] lg:text-[20px] line-clamp-2 leading-snug">{product.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-white font-bold text-xl lg:text-2xl tabular-nums">{fmt(displayPrice)}</span>
            {product.discountEnabled && product.finalPrice && (
              <>
                <span className="text-rose-500 line-through text-sm lg:text-[15px] tabular-nums">{fmt(displayOriginalPrice)}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white bg-red-500 tabular-nums">
                  -{displayDiscount}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sizes */}
      {product.sizes.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs lg:text-[13px] tracking-[0.2em] text-white/90 uppercase">Хэмжээ</p>
          <div className="flex gap-2 flex-wrap">
            {product.sizes.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`px-4 py-2 rounded-xl text-sm lg:text-[15px] font-medium transition-all ${
                  size === s ? "bg-rose-500 text-white/90" : "glass-sm text-white/60 underline hover:text-white"
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
          <p className="text-xs lg:text-[13px] tracking-[0.2em] text-white/90 uppercase">Өнгө</p>
          <div className="flex gap-2 flex-wrap">
            {product.colors.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`px-4 py-2 rounded-xl text-sm lg:text-[15px] font-medium capitalize transition-all ${
                  color === c ? "bg-rose-500 text-white/90" : "glass-sm text-white/60 underline hover:text-white"
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
                <p className="text-xs lg:text-[13px] tracking-[0.2em] text-white/90 uppercase">
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
                      className={`px-4 py-2 rounded-xl text-sm lg:text-[15px] font-medium transition-all ${
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
      <div className="flex items-center justify-between glass rounded-2xl py-3">
        <p className="text-xs lg:text-[13px] tracking-[0.2em] text-white/90 uppercase font-medium">Тоо ширхэг</p>
        <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/10">
          <button onClick={() => setQty(q => Math.max(1, q - 1))}
            className="px-2.5 py-1.5 text-white/60 hover:text-white transition-colors">
            <Minus size={14} />
          </button>
          <span className="px-2.5 py-1.5 text-sm lg:text-[15px] font-bold text-white min-w-[2.5rem] text-center border-x border-white/10">
            {qty}
          </span>
          <button onClick={() => setQty(q => q + 1)}
            className="px-2.5 py-1.5 text-white/60 hover:text-white transition-colors">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Add button */}
      <button onClick={handleAdd}
        className="w-full py-4 bg-rose-500 rounded-2xl font-semibold text-sm lg:text-[15px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98">
        {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        {added ? "Нэмэгдлээ!" : "Сагсанд нэмэх"}
      </button>
    </div>
  )

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        style={{ zIndex: 9998, opacity: show ? 1 : 0 }}
        onClick={handleClose}
      />

      {isDesktop ? (
        /* ── Desktop: center modal ── */
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, pointerEvents: "none" }}
        >
          <div
            className="glass rounded-3xl w-full bg-black/90 max-w-md transition-all duration-300"
            style={{
              pointerEvents: "all",
              opacity:    show ? 1 : 0,
              transform:  show ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
            }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <p className="font-display font-semibold text-white text-[20px] lg:text-[22px]">Сагсанд нэмэх</p>
              <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
                <X size={18}  className="lg:size-5"/>
              </button>
            </div>
            {content}
          </div>
        </div>
      ) : (
        /* ── Mobile: bottom sheet ── */
        <div
          className="fixed inset-x-0 bottom-0 glass bg-black/90 rounded-t-3xl transition-transform duration-300 ease-out"
          style={{
            zIndex:    9999,
            transform: show ? "translateY(0)" : "translateY(100%)",
          }}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/90 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          {content}
        </div>
      )}
    </>,
    document.body
  )
}