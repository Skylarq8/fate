// 📁 app/checkout/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, User, Phone, Mail, MapPin, ShoppingBag, CheckCircle } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { fmt } from "@/lib/api"

type Step = "info" | "payment" | "success"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart, coupon } = useCartStore()

  const [step, setStep] = useState<Step>("info")

  // cart-аас дамжсан coupon
  const couponData = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("coupon") || "null")
    : null
  const couponDiscount = coupon?.discountAmount ?? 0
  const [loading, setLoading] = useState(false)

  // form
  const [customerName,    setCustomerName]    = useState("")
  const [phone,           setPhone]           = useState("")
  const [email,           setEmail]           = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [errors,          setErrors]          = useState<Record<string, string>>({})

  // from cart (passed via query or recalculated)
  const shipping       = totalPrice() >= 100000 ? 0 : 5000
  const baseTotal      = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.quantity, 0)
  const productDiscount = items.reduce((s, i) => i.originalPrice ? s + (i.originalPrice - i.price) * i.quantity : s, 0)
  const subtotal       = baseTotal - productDiscount
  const finalTotal     = subtotal + shipping - couponDiscount
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!customerName.trim())    e.customerName    = "Нэр оруулна уу"
    if (!phone.trim())           e.phone           = "Утасны дугаар оруулна уу"
    if (!email.trim())           e.email           = "И-мэйл оруулна уу"
    if (!shippingAddress.trim()) e.shippingAddress = "Хүргэлтийн хаяг оруулна уу"
    setErrors(e)
    return Object.keys(e).length === 0
  }

 const handleSubmitOrder = async () => {
  setLoading(true)
  try {
    const bylRes = await fetch("/api/payment/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        finalTotal,
        email,
      }),
    })

    const bylData = await bylRes.json()
    
    // Order мэдээллийг sessionStorage-д хадгална
    sessionStorage.setItem("pendingOrder", JSON.stringify({
      customerName,
      phone,
      email,
      shippingAddress,
      couponCode: couponData?.code,
      totalAmount: finalTotal,
      items: items.map(i => ({
        productId: i.productId,
        quantity:  i.quantity,
        size:      i.size,
        color:     i.color,
        unitPrice: i.price,
      })),
    }))
    window.location.href = bylData.url
  } catch (err) {
    console.log("ERROR:", err)
  } finally {
    setLoading(false)
  }
}

  // ── Empty cart ──────────────────────────────────────────────────────────
  if (items.length === 0 && step !== "success") return (
    <div className="max-w-lg min-h-[80vh] flex flex-col justify-center items-center mx-auto px-5 text-center space-y-5">
      <ShoppingBag size={48} className="text-white/20" />
      <p className="font-display text-xl text-white/50">Сагс хоосон байна</p>
      <Link href="/products" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1">
        <ChevronLeft size={14} /> Дэлгүүр рүү буцах
      </Link>
    </div>
  )

  // ── Success ──────────────────────────────────────────────────────────────
  if (step === "success") return (
    <div className="max-w-lg min-h-[80vh] flex flex-col justify-center items-center mx-auto px-5 text-center space-y-6 fade-up">
      <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto">
        <CheckCircle size={40} className="text-green-400" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-white">Захиалга амжилттай!</h2>
        <p className="text-white/50 text-sm">Таны захиалга хүлээн авагдлаа. Удахгүй холбоо барина.</p>
      </div>
      <Link href="/products"
        className="inline-flex items-center gap-2 font-semibold px-7 py-2.5 rounded-full bg-white/80 text-black/80 text-sm hover:bg-white transition-colors">
        Дэлгүүр үргэлжлүүлэх
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto pt-3 pb-8 fade-up">

      {/* ── Back ── */}
      <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6">
        <ChevronLeft size={15} /> Сагс руу буцах
      </Link>

      {/* ── Steps ── */}
      <div className="flex items-center gap-3 mb-5">
        {(["info", "payment"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              step === s ? "text-white" : step === "payment" && s === "info" ? "text-white/40" : "text-white/30"
            }`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                step === s
                  ? "border-rose-500 bg-rose-400/20 text-rose-400"
                  : step === "payment" && s === "info"
                    ? "border-white/20 bg-white/10 text-white/40"
                    : "border-white/10 text-white/20"
              }`}>
                {step === "payment" && s === "info" ? "✓" : i + 1}
              </span>
              {s === "info" ? "Мэдээлэл" : "Төлбөр"}
            </div>
            {i === 0 && <ChevronRight size={14} className="text-white/20" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-5">

        {/* ── Left: form ── */}
        <div className="md:col-span-2">

          {/* ── Step 1: Info ── */}
          {step === "info" && (
            <div className="glass rounded-2xl space-y-5 fade-up">
              <h2 className="font-display text-xl font-bold text-white">Захиалагчийн мэдээлэл</h2>
              {[
                { icon: <User size={16} />,   label: "Нэр",              val: customerName,    set: setCustomerName,    key: "customerName",    ph: "Нэрээ оруулна уу!" },
                { icon: <Phone size={16} />,  label: "Утасны дугаар",    val: phone,           set: setPhone,           key: "phone",           ph: "Утасны дугаараа оруулна уу!" },
                { icon: <Mail size={16} />,   label: "И-мэйл",           val: email,           set: setEmail,           key: "email",           ph: "И-мэйл хаягаа оруулна уу!" },
                { icon: <MapPin size={16} />, label: "Хүргэлтийн хаяг", val: shippingAddress, set: setShippingAddress, key: "shippingAddress", ph: "Хүргэлтийн хаягаа дэлгэрэнгүй оруулна уу!" },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-xs text-white/90 uppercase flex items-center gap-1.5">
                    <span className="text-white/90">{f.icon}</span>{f.label}
                  </label>
                  <input
                    value={f.val}
                    onChange={e => { f.set(e.target.value); setErrors(p => ({ ...p, [f.key]: "" })) }}
                    placeholder={f.ph}
                    className={`w-full glass-sm rounded-xl px-4 py-3 text-sm text-white placeholder-white/50 outline-none bg-transparent border transition-colors ${
                      errors[f.key] ? "border-red-500/50" : "border-white/25 focus:border-rose-500/50"
                    }`}
                  />
                  {errors[f.key] && <p className="text-xs text-red-400">{errors[f.key]}</p>}
                </div>
              ))}

              <button
                onClick={() => { if (validate()) setStep("payment") }}
                className="w-full py-3.5 bg-rose-500 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98">
                Үргэлжлүүлэх <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === "payment" && (
            <div className="space-y-4 fade-up">
              {/* customer summary */}
              <div className="glass rounded-2xl py-5 -mt-5 space-y-3">
                <div className="flex items-center pb-3 justify-between">
                  <h2 className="font-display text-xl font-bold text-white">Захиалагчийн мэдээлэл</h2>
                  <button onClick={() => setStep("info")} className="text-[14px] text-white/50 underline hover:text-white transition-colors">
                    Засах
                  </button>
                </div>
                {[
                  { icon: <User size={13} />,   val: customerName    },
                  { icon: <Phone size={13} />,  val: phone           },
                  { icon: <Mail size={13} />,   val: email           },
                  { icon: <MapPin size={13} />, val: shippingAddress },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-[16px] text-white/90">
                    <span className="text-white/90 flex-shrink-0 text-[20px]">{r.icon}</span>
                    {r.val}
                  </div>
                ))}
              </div>

              {/* payment placeholder */}
              {/* <div className="glass rounded-2xl py-5 -mt-5 space-y-4">
                <h2 className="font-display text-lg font-bold text-white">Төлбөрийн хэрэгсэл</h2>
                <div className="grid grid-cols-2 gap-3">
                  {["QPay", "SocialPay", "Khan Bank", "Golomt"].map(method => (
                    <button key={method} onClick={() => setPaymentMethod(method)}
                      className={`
                        glass-sm rounded-xl py-3 text-sm transition-all border
                        ${paymentMethod === method
                            ? "text-white bg-rose-500/20 border-rose-500/50"
                            : "text-white/60 border-white/10 hover:text-white hover:bg-white/5"
                        }
                        `}>
                      {method}
                    </button>
                  ))}
                </div>
              </div> */}

              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-60 bg-rose-500">
                {loading
                  ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  : <><CheckCircle size={17} /> Захиалга баталгаажуулах</>
                }
              </button>
            </div>
          )}
        </div>

        {/* ── Right: order summary ── */}
        <div>
          <div className="glass rounded-2xl py-5 -mt-5 space-y-4 sticky top-24">
            <h3 className="font-display font-bold text-white text-xl">Захиалгын дэлгэрэнгүй</h3>

            {/* items */}
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                    {item.image
                      ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-white/5" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[16px] font-medium line-clamp-1">{item.title}</p>
                    <div className="flex gap-1 mt-0.5 items-center">
                      {item.size  && <span className="text-white/50 text-[14px]">{item.size}</span>}
                      {item.color && <span className="text-white/50 text-[14px] capitalize">· {item.color}</span>}
                      <span className="text-white/50 text-[14px]">· {item.quantity}ш</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white text-[16px] font-semibold flex-shrink-0">{fmt(item.price * item.quantity)}</span>
                    {item.originalPrice && (
                      <p className="text-white/50 line-through text-[13px] mt-0.5">{fmt(item.originalPrice)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* totals */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              {productDiscount > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/50">Барааны хямдрал</span>
                  <span className="text-green-400">-{fmt(productDiscount)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/50">
                    Купон хямдрал
                    {couponData?.discountPercent && (
                      <span className="ml-1 text-violet-400">{couponData.discountPercent}%</span>
                    )}
                  </span>
                  <span className="text-green-400">-{fmt(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[14px]">
                <span className="text-white/50">Хүргэлт</span>
                <span className={shipping === 0 ? "text-green-400" : "text-white/70"}>
                  {shipping === 0 ? "Үнэгүй" : fmt(shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-3 border-t border-white/10">
                <span className="text-white text-[16px]">Нийт дүн</span>
                <span className="text-white text-[16px]">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}