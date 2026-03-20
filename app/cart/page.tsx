// 📁 app/cart/page.tsx
"use client"

import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart, Tag, X } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { fmt } from "@/lib/api"
import { useState } from "react"

export default function CartPage() {
  const { items, removeItem, increaseQty, decreaseQty, totalPrice, clearCart, setCoupon } = useCartStore()
  const shipping = totalPrice() >= 100000 ? 0 : 5000
  const [couponCode,    setCouponCode]    = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponResult,  setCouponResult]  = useState<{
    valid: boolean
    message: string
    discountAmount?: number
    discountPercent?: number
    type?: "percent" | "amount"
  } | null>(null)
 
  const baseTotal = items.reduce((sum, item) => {
    return sum + (item.originalPrice || item.price) * item.quantity
  }, 0)

  const productDiscount = items.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)

  const subtotal = baseTotal - productDiscount
  const couponDiscount = (() => {
    if (!couponResult?.valid) return 0
    if (couponResult.discountPercent) {
      return Math.round(subtotal * (couponResult.discountPercent / 100))
    }
    if (couponResult.discountAmount) {
      return Math.min(couponResult.discountAmount!, subtotal)
    }
    return 0
  })()

const finalTotal = subtotal - couponDiscount + shipping
 
  const handleCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: couponCode.trim(), productIds: items.map(i => i.productId) }),
      })
      const data = await res.json()
      if (!res.ok || !data.data) {
        setCouponResult({ valid: false, message: data.message || "Купон хүчингүй байна." })
      } else {
        const c = data.data
        setCouponResult({
          valid:    true,
          message:  "Купон амжилттай хэрэглэгдлээ!",
          discountPercent: c.discountPercent,
          discountAmount: c.discountAmount,
          type:     c.discountType,
        })
        setCoupon({
          code: c.code,
          discountPercent: c.discountPercent,
          discountAmount: c.discountAmount,
          type: c.discountType,
        })
      }
    } catch {
      setCouponResult({ valid: false, message: "Сүлжээний алдаа гарлаа." })
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) return (
    <div className="max-w-lg min-h-[80vh] flex justify-center items-center flex-col mx-auto px-5 py-28 text-center space-y-6 fade-up">
      <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto">
        <ShoppingCart className="w-12 h-12 text-white/90" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-white/90">Сагс хоосон байна</h2>
        <p className="text-white/40 text-sm">Бараа нэмэхийн тулд дэлгүүр хэсье</p>
      </div>
      <Link href="/products"
        className="inline-flex items-center gap-2 font-semibold px-7 py-2.5 rounded-full bg-rose-500 text-white/90 text-sm">
        🛒 Дэлгүүр хэсэх
      </Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto pt-3 fade-up">

      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Миний сагс</h1>
        </div>
        {/* <p className="text-[14px] text-red-400 underline" onClick={() => clearCart()}>Бүгдийг устгах</p> */}
        <Trash2 size={18} className="text-white hover:text-red-400" onClick={() => clearCart()}/>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {/* ── Items ── */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id}>
            <Link href={`/products/${item.productId}`}>
              <div className="glass rounded-2xl py-4 flex gap-4 glass-hover">
                {/* image */}
                <div className="w-30 h-30 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                  {item.image
                    ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))" }} />
                  }
                </div>

                {/* info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-xl line-clamp-1">{item.title}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {item.size  && <span className="text-[16px] glass-sm px-0 py-0.5 rounded-full text-white">{item.size}</span>}
                    {item.color && <span className="text-[16px] glass-sm px-2 py-0.5 rounded-full text-white uppercase">{item.color}</span>}
                  </div>
                  <div className="flex mt-2 flex-col justify-center pr-1">
                    <p className="text-white font-bold text-lg">{fmt(item.price)}</p>
                    {item.originalPrice && (
                      <p className="text-white/50 line-through text-[14px] mt-0.5">{fmt(item.originalPrice)}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            {/* controls */}
            <div className="flex items-center justify-between glass rounded-2xl">
              <p className="text-[16px] text-white/90 font-semibold">Тоо хэмжээ</p>
              <div className="flex justify-end gap-x-2">
                <button onClick={() => removeItem(item.id)}
                  className="px-2.5 py-1 text-white/90 transition-all rounded-xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md hover:border-red-500 hover:text-red-500 hover:bg-red-400/30">
                  <Trash2 size={13} />
                </button>
                <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md">
                    <button onClick={() => decreaseQty(item.id)}
                    className="px-2.5 py-1 text-white/90 hover:text-white transition-all">
                    <Minus size={13} />
                    </button>
                    <span className="px-2.5 py-1 text-sm font-semibold text-white min-w-[40px] text-center border-x border-white/10">
                    {item.quantity}
                    </span>
                    <button onClick={() => increaseQty(item.id)}
                    className="px-2.5 py-1 text-white/90 hover:text-white transition-all">
                    <Plus size={13} />
                    </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>
        <div>
          <div className="glass rounded-2xl py-5 space-y-5 sticky top-24">
            <div className="space-y-2.5">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-white/90 truncate max-w-[55%]">{item.title} × {item.quantity}</span>
                  <span className="text-white/90 font-medium">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
 
            <div className="space-y-2 border-t border-rose-500/50 pt-4">

          {/* 1. Нийт үнэ */}
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Нийт үнэ</span>
            <span className="text-white/90">{fmt(baseTotal)}</span>
          </div>

          {/* 2. Барааны хямдрал */}
          {productDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Барааны хямдрал</span>
              <span className="text-green-400">-{fmt(productDiscount)}</span>
            </div>
          )}

          {/* 5. Coupon */}
          {couponResult?.valid && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Coupon хямдрал</span>
              <span className="text-green-400">
                -{fmt(couponDiscount)}
              </span>
            </div>
          )}

          {/* 4. Хүргэлт */}
          <div className="flex justify-between text-sm">
            <span className="text-white/80">
              Хүргэлт (100,000₮-с дээш үнэгүй)
            </span>
            {shipping === 0 ? (
              <span className="text-green-400">Үнэгүй</span>
              ) : (
                <span className="text-white/90">{shipping}₮</span>
              )
            }
          </div>

          {/* 6. Final */}
          <div className="flex justify-between font-bold">
            <span className="text-white">Эцсийн нийт дүн</span>
            <span className="text-white  text-lg">{fmt(finalTotal)}</span>
          </div>
        </div>
          {/* ── Coupon ── */}
            <div className="border-t border-rose-500/50 pt-4 space-y-2">
              <p className="text-xs text-white/90 uppercase">Купон</p>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null) }}
                  onKeyDown={e => e.key === "Enter" && handleCoupon()}
                  placeholder="Хөнгөлөлтийн код оруулах"
                  className="flex-1 glass-sm rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/50 outline-none focus:border-rose-500/50 bg-transparent border border-rose-500/20"
                />
                <button
                  onClick={handleCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-rose-500 text-white transition-all disabled:opacity-60">
                  {couponLoading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <Tag size={15} />
                  )}
                </button>
              </div>
 
              {/* result */}
              {couponResult && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                  couponResult.valid
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                  <span className="flex-1">{couponResult.message}</span>
                  {couponResult.valid && (
                    <button onClick={() => { setCouponResult(null); setCouponCode("") }}>
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
            <Link href={'/checkout'}>
              <button
                className="w-full py-3.5 rounded-2xl font-semibold bg-rose-500 text-sm transition-all hover:scale-[1.02] active:scale-98">
                Захиалах
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}