// 📁 app/checkout/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, User, Phone, Mail, MapPin, ShoppingBag, CheckCircle, X, Home, Building2, Briefcase } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { fmt } from "@/lib/api"

type Step = "info" | "payment" | "success"
type AddressType = "apartment" | "house" | "office"

// ── Монгол хаягийн өгөгдөл ───────────────────────────────────────────────
const DISTRICTS: Record<string, string[]> = {
  "Улаанбаатар": ["Баянгол", "Баянзүрх", "Сүхбаатар", "Хан-Уул", "Чингэлтэй", "Сонгинохайрхан", "Налайх", "Багануур", "Багахангай"],
  "Дархан-Уул": ["Дархан", "Орхон", "Хонгор", "Шарын гол"],
  "Орхон": ["Баян-Өндөр", "Жаргалант"],
}

const KHOROOS: Record<string, string[]> = {
  "Баянгол": Array.from({ length: 20 }, (_, i) => `${i + 1}-р хороо`),
  "Баянзүрх": Array.from({ length: 24 }, (_, i) => `${i + 1}-р хороо`),
  "Сүхбаатар": Array.from({ length: 12 }, (_, i) => `${i + 1}-р хороо`),
  "Хан-Уул": Array.from({ length: 16 }, (_, i) => `${i + 1}-р хороо`),
  "Чингэлтэй": Array.from({ length: 18 }, (_, i) => `${i + 1}-р хороо`),
  "Сонгинохайрхан": Array.from({ length: 32 }, (_, i) => `${i + 1}-р хороо`),
  "Налайх": Array.from({ length: 6 }, (_, i) => `${i + 1}-р хороо`),
  "Багануур": Array.from({ length: 5 }, (_, i) => `${i + 1}-р хороо`),
  "Багахангай": Array.from({ length: 2 }, (_, i) => `${i + 1}-р хороо`),
  "Дархан": Array.from({ length: 10 }, (_, i) => `${i + 1}-р хороо`),
  "Орхон": Array.from({ length: 8 }, (_, i) => `${i + 1}-р хороо`),
  "Хонгор": Array.from({ length: 5 }, (_, i) => `${i + 1}-р хороо`),
  "Шарын гол": Array.from({ length: 4 }, (_, i) => `${i + 1}-р хороо`),
  "Баян-Өндөр": Array.from({ length: 8 }, (_, i) => `${i + 1}-р хороо`),
  "Жаргалант": Array.from({ length: 4 }, (_, i) => `${i + 1}-р хороо`),
}

// ── Address Bottom Sheet ─────────────────────────────────────────────────
function AddressSheet({ open, onClose, onSave }: {
  open: boolean
  onClose: () => void
  onSave: (address: string) => void
}) {
  const [type, setType]         = useState<AddressType>("apartment")
  const [city, setCity]         = useState("Улаанбаатар")
  const [district, setDistrict] = useState("")
  const [khoroo, setKhoroo]     = useState("")
  const [building, setBuilding] = useState("")
  const [door, setDoor]         = useState("")
  const [extra, setExtra]       = useState("")
  const [errors, setErrors]     = useState<Record<string, string>>({})

  const districts = DISTRICTS[city] ?? []
  const khoroos   = KHOROOS[district] ?? []

  const handleSave = () => {
    const e: Record<string, string> = {}
    if (!district) e.district = "Дүүрэг сонгоно уу"
    if (!khoroo)   e.khoroo   = "Хороо сонгоно уу"
    if (!building.trim()) e.building = "Байрны дугаар оруулна уу"
    if (!door.trim())     e.door     = "Тоот оруулна уу"
    setErrors(e)
    if (Object.keys(e).length > 0) return

    const parts = [city, district, khoroo, `${building}-р байр`, `${door}-р тоот`]
    if (extra.trim()) parts.push(extra.trim())
    onSave(parts.join(", "))
    onClose()
  }

  const inputClass = (key: string) =>
    `w-full glass-sm text-base rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none bg-transparent border transition-colors ${
      errors[key] ? "border-red-500/50" : "border-white/20 focus:border-rose-500/50"
    }`

  const selectClass = (key: string) =>
    `w-full glass-sm text-base rounded-xl px-4 py-3 text-white outline-none bg-black/60 border transition-colors appearance-none ${
      errors[key] ? "border-red-500/50" : "border-white/20 focus:border-rose-500/50"
    }`

  const types = [
    { key: "apartment", label: "Орон сууц", icon: <Home size={15} /> },
    { key: "house",     label: "Байшин", icon: <Building2 size={15} /> },
    { key: "office",    label: "Оффис",     icon: <Briefcase size={15} /> },
  ]

  // Scroll lock
  if (typeof document !== "undefined") {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
  }

  if (!open) return null

  return (
    <div className="flex justify-center items-start">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sheet — mobile: bottom, desktop: center */}
      <div className="fixed z-50
        bottom-0 left-0 right-0 rounded-t-3xl
        md:inset-0 md:flex md:items-center md:justify-center md:bottom-auto md:left-auto md:right-auto md:top-auto md:rounded-none md:bg-transparent md:border-0 md:p-0
        pointer-events-none
      ">
      <div className="
        pointer-events-auto
        w-full rounded-t-3xl
        md:rounded-2xl md:w-[480px]
        bg-[#0f0f0f] border border-white/10
        flex flex-col
        max-h-[90vh] md:max-h-[85vh]
      ">
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3 pb-0">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Хаяг оруулах</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Type selector */}
        <div className="flex gap-x-2">
          {types.map(t => (
            <button
              key={t.key}
              onClick={() => setType(t.key as AddressType)}
              className={`flex-1 flex items-center justify-center gap-x-0.5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                type === t.key
                  ? "bg-rose-500/50 text-white/90 border-rose-500"
                  : "text-white/60 border-white/15 hover:border-white/30"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 uppercase tracking-wide">Хот / Аймаг <span className="text-rose-500">*</span></label>
          <div className="relative">
            <select
              value={city}
              onChange={e => { setCity(e.target.value); setDistrict(""); setKhoroo("") }}
              className={selectClass("")}
            >
              {Object.keys(DISTRICTS).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 uppercase tracking-wide">Дүүрэг / Сум <span className="text-rose-500">*</span></label>
          <div className="relative">
            <select
              value={district}
              onChange={e => { setDistrict(e.target.value); setKhoroo("") }}
              className={selectClass("district")}
            >
              <option value="">Сонгох...</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white/40 pointer-events-none" />
          </div>
          {errors.district && <p className="text-xs text-red-400">{errors.district}</p>}
        </div>

        {/* Khoroo */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 uppercase tracking-wide">Хороо / Баг <span className="text-rose-500">*</span></label>
          <div className="relative">
            <select
              value={khoroo}
              onChange={e => setKhoroo(e.target.value)}
              className={selectClass("khoroo")}
              disabled={!district}
            >
              <option value="">Сонгох...</option>
              {khoroos.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-white/40 pointer-events-none" />
          </div>
          {errors.khoroo && <p className="text-xs text-red-400">{errors.khoroo}</p>}
        </div>

        {/* Building + Door */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-white/60 uppercase tracking-wide">Байр <span className="text-rose-500">*</span></label>
            <input
              value={building}
              onChange={e => { setBuilding(e.target.value); setErrors(p => ({ ...p, building: "" })) }}
              placeholder="Байрны дугаар"
              className={inputClass("building")}
            />
            {errors.building && <p className="text-xs text-red-400">{errors.building}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/60 uppercase tracking-wide">Тоот <span className="text-rose-500">*</span></label>
            <input
              value={door}
              onChange={e => { setDoor(e.target.value); setErrors(p => ({ ...p, door: "" })) }}
              placeholder="Хаалганы тоот"
              className={inputClass("door")}
            />
            {errors.door && <p className="text-xs text-red-400">{errors.door}</p>}
          </div>
        </div>

        {/* Extra */}
        <div className="space-y-1.5">
          <label className="text-xs text-white/60 uppercase tracking-wide">Нэмэлт мэдээлэл</label>
          <input
            value={extra}
            onChange={e => setExtra(e.target.value)}
            placeholder="Нэмэлт мэдээлэл оруулна уу"
            className={inputClass("")}
          />
          <p className="text-xs text-white/70">Орц, давхар, орцны код гэх мэт</p>
        </div>
        </div>

        {/* Save — sticky bottom */}
        <div className="p-4 mb-15 lg:mb-0 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-rose-500 text-white/90 transition-all hover:bg-white/90 active:scale-98"
          >
            Хадгалах
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPrice, clearCart, coupon } = useCartStore()
  const [step, setStep] = useState<Step>("info")

  const couponData = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("coupon") || "null")
    : null
  const couponDiscount = coupon?.discountAmount ?? 0
  const [loading, setLoading] = useState(false)
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)

  const [customerName,    setCustomerName]    = useState("")
  const [phone,           setPhone]           = useState("")
  const [email,           setEmail]           = useState("")
  const [shippingAddress, setShippingAddress] = useState("")
  const [errors,          setErrors]          = useState<Record<string, string>>({})

  const shipping        = totalPrice() >= 100000 ? 0 : 5000
  const baseTotal       = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.quantity, 0)
  const productDiscount = items.reduce((s, i) => i.originalPrice ? s + (i.originalPrice - i.price) * i.quantity : s, 0)
  const subtotal        = baseTotal - productDiscount
  const finalTotal      = subtotal + shipping - couponDiscount

  const validate = () => {
    const e: Record<string, string> = {}
    if (!customerName.trim() || customerName.trim().length < 2)
      e.customerName = "Нэр 2-оос дээш тэмдэгт байх ёстой"
    if (!phone.trim() || !/^\d{8}$/.test(phone.trim()))
      e.phone = "Утасны дугаар 8 оронтой тоо байх ёстой"
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = "И-мэйл хаяг буруу байна"
    if (!shippingAddress.trim())
      e.shippingAddress = "Хүргэлтийн хаяг оруулна уу"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      const bylRes = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalTotal, email }),
      })
      const bylData = await bylRes.json()

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

  if (items.length === 0) return (
    <div className="max-w-lg min-h-[80vh] flex flex-col justify-center items-center mx-auto px-5 text-center space-y-5">
      <ShoppingBag size={48} className="text-white/20" />
      <p className="font-display text-xl text-white/50">Сагс хоосон байна</p>
      <Link href="/products" className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-1">
        <ChevronLeft size={14} /> Дэлгүүр рүү буцах
      </Link>
    </div>
  )

  return (
    <>
      <AddressSheet
        open={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
        onSave={(addr) => {
          setShippingAddress(addr)
          setErrors(p => ({ ...p, shippingAddress: "" }))
        }}
      />

      <div className="max-w-5xl mx-auto pt-3 pb-8 fade-up">

        {/* Back */}
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6">
          <ChevronLeft size={15} /> Сагс руу буцах
        </Link>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-5">
          {(["info", "payment"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                step === s ? "text-white" : step === "payment" && s === "info" ? "text-white/40" : "text-white/30"
              }`}>
                <span className={`w-7 h-7 flex items-center justify-center text-xs font-bold border transition-all ${
                  step === s
                    ? "border-rose-500 bg-rose-400/20 text-rose-400"
                    : step === "payment" && s === "info"
                      ? "border-white/20 bg-white/10 text-white/40"
                      : "border-white/10 text-white/20"
                }`} style={{ borderRadius: "9999px" }}>
                  {step === "payment" && s === "info" ? "✓" : i + 1}
                </span>
                {s === "info" ? "Мэдээлэл" : "Төлбөр"}
              </div>
              {i === 0 && <ChevronRight size={14} className="text-white/20" />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-5 gap-x-10">

          {/* Left */}
          <div className="md:col-span-2">

            {/* Step 1: Info */}
            {step === "info" && (
              <div className="glass rounded-2xl space-y-5 fade-up">
                <h2 className="font-display text-xl font-bold text-white">Захиалагчийн мэдээлэл</h2>

                {/* Name, Phone, Email */}
                {[
                  { icon: <User size={16} />,  label: "Нэр",           val: customerName, set: setCustomerName, key: "customerName", ph: "Нэрээ оруулна уу!" },
                  { icon: <Phone size={16} />, label: "Утасны дугаар", val: phone,        set: setPhone,        key: "phone",        ph: "Утасны дугаараа оруулна уу!" },
                  { icon: <Mail size={16} />,  label: "И-мэйл",        val: email,        set: setEmail,        key: "email",        ph: "И-мэйл хаягаа оруулна уу!" },
                ].map(f => (
                  <div key={f.key} className="space-y-2">
                    <label className="text-xs text-white/90 uppercase flex items-center gap-1.5">
                      <span className="text-white/90">{f.icon}</span>{f.label}
                    </label>
                    <input
                      value={f.val}
                      onChange={e => { f.set(e.target.value); setErrors(p => ({ ...p, [f.key]: "" })) }}
                      placeholder={f.ph}
                      className={`w-full glass-sm text-base rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none bg-transparent border transition-colors ${
                        errors[f.key] ? "border-red-500/50" : "border-white/25 focus:border-rose-500/50"
                      }`}
                    />
                    {errors[f.key] && <p className="text-xs text-red-400">{errors[f.key]}</p>}
                  </div>
                ))}

                {/* Shipping Address */}
                <div className="space-y-2">
                  <label className="text-xs text-white/90 uppercase flex items-center gap-1.5">
                    <MapPin size={16} className="text-white/90" /> Хүргэлтийн хаяг
                  </label>

                  {shippingAddress ? (
                    <div className="glass-sm rounded-xl px-4 py-3 border border-white/25 flex items-start justify-between gap-3">
                      <p className="text-white text-sm leading-relaxed flex-1">{shippingAddress}</p>
                      <button
                        onClick={() => setAddressSheetOpen(true)}
                        className="text-xs text-white/40 hover:text-white underline flex-shrink-0 transition-colors"
                      >
                        Засах
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddressSheetOpen(true)}
                      className={`w-full glass-sm rounded-xl px-4 py-3 text-left text-white/40 border transition-colors hover:border-rose-500/50 hover:text-white/60 ${
                        errors.shippingAddress ? "border-red-500/50" : "border-white/25"
                      }`}
                    >
                      + Хүргэлтийн хаяг оруулах
                    </button>
                  )}
                  {errors.shippingAddress && <p className="text-xs text-red-400">{errors.shippingAddress}</p>}
                </div>

                <button
                  onClick={() => { if (validate()) setStep("payment") }}
                  className="w-full py-3.5 bg-rose-500 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98">
                  Үргэлжлүүлэх <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <div className="space-y-4 fade-up">
                <div className="glass rounded-2xl py-5 -mt-5 space-y-5">
                  <div className="flex items-center pb-3 justify-between">
                    <h2 className="font-display text-xl font-bold text-white">Захиалагчийн мэдээлэл</h2>
                    <button onClick={() => setStep("info")} className="text-[14px] text-white/50 underline hover:text-white transition-colors">
                      Засах
                    </button>
                  </div>
                  {[
                    { icon: <User size={16} />,   val: customerName    },
                    { icon: <Phone size={16} />,  val: phone           },
                    { icon: <Mail size={16} />,   val: email           },
                    { icon: <MapPin size={16} />, val: shippingAddress },
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[15px] text-white/90">
                      <span className="flex-shrink-0 text-white mt-0.5">{r.icon}</span>
                      <span className="break-words">{r.val}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-60 bg-rose-500">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white" style={{ borderRadius: "9999px", animation: "spin 0.8s linear infinite" }} />
                    : <><CheckCircle size={17} /> Захиалга баталгаажуулах</>
                  }
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div>
            <div className="flex justify-between font-bold py-5 border-t border-b border-rose-500/50">
              <span className="text-white text-[18px]">Эцсийн нийт дүн</span>
              <span className="text-white text-lg">{fmt(finalTotal)}</span>
            </div>
            <div className="glass rounded-2xl py-2 space-y-4 sticky top-24">
              <h3 className="font-display font-bold text-white text-xl pb-2">Захиалгын дэлгэрэнгүй</h3>
              <div className="space-y-3 pb-2">
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
                        <p className="text-rose-500 line-through text-[13px] mt-0.5">{fmt(item.originalPrice)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-rose-500/50 py-3 space-y-2 border-b">
                {productDiscount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-white/80">Барааны хямдрал</span>
                    <span className="text-green-400">-{fmt(productDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-white/80">Купон хямдрал
                      {couponData?.discountPercent && (
                        <span className="ml-1 text-violet-400">{couponData.discountPercent}%</span>
                      )}
                    </span>
                    <span className="text-green-400">-{fmt(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[14px]">
                  <span className="text-white/80">Хүргэлт</span>
                  <span className={shipping === 0 ? "text-green-400" : "text-white/70"}>
                    {shipping === 0 ? "Үнэгүй" : fmt(shipping)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}