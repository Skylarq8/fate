// 📁 app/cart/page.tsx
"use client"

import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart, Tag, X, ChevronRight, Truck, CreditCard } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import type { CartItem, CouponState } from "@/store/cartStore"
import { fmt } from "@/lib/api"
import type { Product } from "@/lib/api"
import { useState, useMemo } from "react"
import Accordin from "@/components/Accordin"
import { useProductStore } from "@/store/productStore"

type AppliedCoupon = {
  code: string
  discountType: "percentage" | "fixed"
  discountValue: number
  applyToAll: boolean
  products: string[]
}

function cartItemToProduct(item: CartItem): Product {
  return {
    id: item.productId,
    title: item.title,
    description: "",
    price: item.price,
    finalPrice: item.finalPrice ?? null,
    discountEnabled: item.discountEnabled ?? false,
    discountEndsAt: null,
    sizes: item.size ? [item.size] : [],
    colors: item.color ? [item.color] : [],
    status: "active",
    createdAt: "",
    images: item.image ? [{ id: "0", url: item.image, isPrimary: true, order: 0 }] : [],
    categories: [],
    variants: item.variants?.map((v, i) => ({ id: String(i), label: v.label, values: [v.value], order: i })),
  }
}

export default function CartPage() {
  const { items, removeItem, increaseQty, decreaseQty, totalPrice, clearCart, setCoupon } = useCartStore()
  const setSelectedProduct = useProductStore(s => s.setSelectedProduct)
  const shipping = totalPrice() >= 100000 ? 0 : 5000

  const [couponCode, setCouponCode] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const baseTotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity
  }, 0)

  const productDiscount = items.reduce((sum, item) => {
    if (item.discountEnabled && item.finalPrice) {
      return sum + (item.price - item.finalPrice) * item.quantity
    }
    return sum
  }, 0)

  const subtotal = baseTotal - productDiscount

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0

    let discount = 0

    if (appliedCoupon.applyToAll) {
      if (appliedCoupon.discountType === "percentage") {
        discount = subtotal * (appliedCoupon.discountValue / 100)
      } else {
        discount = appliedCoupon.discountValue
      }
    } else {
      const matchingItems = items.filter(item =>
        appliedCoupon.products.includes(item.productId)
      )

      const matchingItemsTotal = matchingItems.reduce(
        (sum, item) => sum + (item.discountEnabled && item.finalPrice ? item.finalPrice : item.price) * item.quantity,
        0
      )

      if (appliedCoupon.discountType === "percentage") {
        discount = matchingItemsTotal * (appliedCoupon.discountValue / 100)
      } else {
        discount = Math.min(appliedCoupon.discountValue, matchingItemsTotal)
      }
    }

    return Math.min(discount, subtotal)
  }, [subtotal, appliedCoupon, items])

  const finalTotal = Math.max(subtotal + shipping - discountAmount, 0)
  const displaySubtotal = subtotal

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError(null)
    setAppliedCoupon(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), cartTotal: subtotal,  productIds: items.map(i => i.productId) }),
      })
      const data = await res.json()

      if (!res.ok || !data.data) {
        setCouponError(data.message || "Купон хүчингүй байна.")
        return
      }

      const c = data.data
      if (!c) {
        setCouponError("Купон олдсонгүй.")
        return
      }

      const coupon = c

      const discountType = coupon.discountType === "percentage" ? "percentage" : "fixed"
      const type: "percent" | "amount" = coupon.discountType === "percentage" ? "percent" : "amount"
      const discountValue = coupon.discountValue

      setAppliedCoupon({
        code: coupon.code,
        discountType,
        discountValue,
        applyToAll: coupon.applyToAll,
        products: coupon.products || [],
      })

      const couponState: CouponState = {
        code: coupon.code,
        type: coupon.discountType === "percentage" ? "percentage" : "amount",
        discountPercent: coupon.discountType === "percentage" ? coupon.discountValue : undefined,
        discountAmount: coupon.discountType === "fixed" ? coupon.discountValue : undefined,
      }

      setCoupon(couponState)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("coupon", JSON.stringify(couponState))
      }
    } catch {
      setCouponError("Сүлжээний алдаа гарлаа.")
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCoupon(null)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("coupon")
    }
    setCouponCode("")
    setCouponError(null)
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
      <div className="flex items-end justify-between mb-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Миний сагс</h1>
        </div>
        <Trash2 size={18} className="text-white hover:text-red-400" onClick={() => clearCart()}/>
      </div>
      <div className="grid md:grid-cols-3 gap-8 gap-x-10">
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id}>
              <Link href={`/products/${item.productId}`} onClick={() => setSelectedProduct(cartItemToProduct(item))}>
                <div className="glass rounded-2xl py-4 flex gap-4 glass-hover">
                  <div className="w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-white/5">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(96,165,250,0.2))" }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-xl line-clamp-1">{item.title}</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {item.size && <span className="text-[14px] glass-sm pr-2 py-0.5 rounded-full text-white">{item.size}</span>}
                      {item.color && <span className="text-[14px] glass-sm px-0 py-0.5 rounded-full text-white uppercase">{item.color}</span>}
                      {item.variants && item.variants.map((v, idx) => (
                        <span key={idx} className="text-[14px] glass-sm pl-2 py-0.5 rounded-full text-white uppercase">
                          {v.value}
                        </span>
                      ))}
                    </div>
                    <div className="flex mt-2 flex-col justify-center pr-1">
                      <p className="text-white font-bold text-lg">
                        {fmt(item.discountEnabled && item.finalPrice ? item.finalPrice : item.price)}
                      </p>
                      {item.discountEnabled && item.finalPrice && (
                        <p className="text-rose-500 line-through text-[14px] mt-0.5">{fmt(item.price)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
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
                  <span className="text-white/90 font-medium">
                    {fmt((item.discountEnabled && item.finalPrice ? item.finalPrice : item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-rose-500/50 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Нийт үнэ</span>
                <span className="text-white/90">{fmt(baseTotal)}</span>
              </div>

              {productDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Барааны хямдрал</span>
                  <span className="text-green-400">-{fmt(productDiscount)}</span>
                </div>
              )}

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">Купон хямдрал ({appliedCoupon?.code})</span>
                  <span className="text-green-400">-{fmt(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-white/80">
                  Хүргэлт (100,000₮-с дээш үнэгүй)
                </span>
                {shipping === 0 ? (
                  <span className="text-green-400">Үнэгүй</span>
                ) : (
                  <span className="text-white/90">{fmt(shipping)}</span>
                )}
              </div>

              <div className="flex justify-between font-bold">
                <span className="text-white">Эцсийн нийт дүн</span>
                <span className="text-white text-lg">{fmt(finalTotal)}</span>
              </div>
            </div>

            <div className="border-t border-rose-500/50 pt-4 space-y-2">
              <p className="text-xs text-white/90 uppercase">Купон</p>
              {appliedCoupon ? (
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  <span className="flex-1">{appliedCoupon.code} ({appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : fmt(appliedCoupon.discountValue)})</span>
                  <button onClick={handleRemoveCoupon}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null) }}
                      onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                      placeholder="Хөнгөлөлтийн код оруулах"
                      className="flex-1 text-base glass-sm rounded-xl px-3 py-2.5 text-white placeholder-white/50 outline-none focus:border-rose-500/50 bg-transparent border border-rose-500/20"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium bg-rose-500 text-white transition-all disabled:opacity-60">
                      {couponLoading ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <Tag size={15} />
                      )}
                    </button>
                  </div>

                  {couponError && (
                    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      <span className="flex-1">{couponError}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <Link href={'/checkout'}>
              <button
                className="w-full py-3.5 rounded-2xl font-semibold bg-rose-500 text-sm transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-1.5">
                Захиалах <ChevronRight size={16} />
              </button>
            </Link>

            <div className="flex flex-col gap-3 pt-3">
              <div className="flex-1 flex gap-3 items-start p-3 rounded-xl border border-white/8 bg-white/4">
                <Truck size={20} className="text-white/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/90 text-[13px] font-semibold">Хүргэлтийн нөхцөл</p>
                  <p className="text-white/40 text-[13px] mt-0.5">Бид таны захиалгыг 5-10 хоногийн дотор хүргэнэ.</p>
                </div>
              </div>
              <div className="flex-1 flex gap-3 items-start p-3 rounded-xl border border-white/8 bg-white/4">
                <CreditCard size={20} className="text-white/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/90 text-[13px] font-semibold">Төлбөрийн нөхцөл</p>
                  <p className="text-white/40 text-[13px] mt-0.5">Энэхүү дэлгүүр нь туршилтын хувилбар тул төлбөр буцаагдахгүй.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}