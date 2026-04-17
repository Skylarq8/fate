// 📁 app/checkout/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, User, Phone, Mail, MapPin, X, Home, Building2, Briefcase, ShoppingCart, Wallet2 } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useToast } from "@/context/ToastContext"
import { fmt } from "@/lib/api"
import { CITIES, getDistricts, getKhoroos } from "@/lib/data/location"

type AddressType = "apartment" | "house" | "office"

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
  // apartment
  const [building, setBuilding] = useState("")
  const [door, setDoor]         = useState("")
  // house
  const [houseNum, setHouseNum] = useState("")
  const [streetNum, setStreetNum] = useState("")
  // office
  const [officeBuilding, setOfficeBuilding] = useState("")
  const [officeFloor, setOfficeFloor]       = useState("")
  const [officeDoor, setOfficeDoor]         = useState("")
  const [officeName, setOfficeName]         = useState("")
  // common
  const [extra, setExtra]       = useState("")
  const [errors, setErrors]     = useState<Record<string, string>>({})

  const districts = getDistricts(city)
  const khoroos   = getKhoroos(district)

  const handleSave = () => {
    const e: Record<string, string> = {}
    if (!district) e.district = "Дүүрэг сонгоно уу"
    if (!khoroo)   e.khoroo   = "Хороо сонгоно уу"
 
    if (type === "apartment") {
      if (!building.trim()) e.building = "Байрны нэр, дугаар оруулна уу"
      if (!door.trim())     e.door     = "Тоот оруулна уу"
    } else if (type === "house") {
      if (!houseNum.trim())  e.houseNum  = "Байшингийн дугаар оруулна уу"
      if (!streetNum.trim()) e.streetNum = "Гудамжны дугаар оруулна уу"
    } else if (type === "office") {
      if (!officeBuilding.trim()) e.officeBuilding = "Барилгын нэр оруулна уу"
      if (!officeFloor.trim())    e.officeFloor    = "Давхар оруулна уу"
      if (!officeDoor.trim())     e.officeDoor     = "Тоот оруулна уу"
      if (!officeName.trim())     e.officeName     = "Оффисын нэр оруулна уу"
    }
 
    setErrors(e)
    if (Object.keys(e).length > 0) return
 
    let parts: string[] = [city, district, khoroo]
    if (type === "apartment") {
      parts = [...parts, `${building}-р байр`, `${door}-р тоот`]
    } else if (type === "house") {
      parts = [...parts, `${streetNum}-р гудамж`, `${houseNum}-р байшин`]
    } else if (type === "office") {
      parts = [...parts, officeBuilding, `${officeFloor}-р давхар`, `${officeDoor}-р тоот`, officeName]
    }
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
    <div className="flex justify-center items-start mt-30">
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
                className={`flex-1 flex items-center justify-center gap-x-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  type === t.key
                    ? "bg-rose-500/20 text-white border-rose-500/60"
                    : "text-white/50 border-white/15 hover:border-white/30"
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
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
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

          {/* Орон сууц */}
          {type === "apartment" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Байр <span className="text-rose-500">*</span></label>
                <input
                  value={building}
                  onChange={e => { setBuilding(e.target.value); setErrors(p => ({ ...p, building: "" })) }}
                  placeholder="Байрны нэр, дугаар"
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
          )}

          {/* Байшин */}
          {type === "house" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Байшин дугаар <span className="text-rose-500">*</span></label>
                <input
                  value={houseNum}
                  onChange={e => { setHouseNum(e.target.value); setErrors(p => ({ ...p, houseNum: "" })) }}
                  placeholder="Байшингийн дугаар"
                  className={inputClass("houseNum")}
                />
                {errors.houseNum && <p className="text-xs text-red-400">{errors.houseNum}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Гудамж дугаар <span className="text-rose-500">*</span></label>
                <input
                  value={streetNum}
                  onChange={e => { setStreetNum(e.target.value); setErrors(p => ({ ...p, streetNum: "" })) }}
                  placeholder="Гудамжны дугаар"
                  className={inputClass("streetNum")}
                />
                {errors.streetNum && <p className="text-xs text-red-400">{errors.streetNum}</p>}
              </div>
            </div>
          )}

          {/* Оффис */}
          {type === "office" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Барилга <span className="text-rose-500">*</span></label>
                <input
                  value={officeBuilding}
                  onChange={e => { setOfficeBuilding(e.target.value); setErrors(p => ({ ...p, officeBuilding: "" })) }}
                  placeholder="Барилгын нэр"
                  className={inputClass("officeBuilding")}
                />
                {errors.officeBuilding && <p className="text-xs text-red-400">{errors.officeBuilding}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Давхар <span className="text-rose-500">*</span></label>
                <input
                  value={officeFloor}
                  onChange={e => { setOfficeFloor(e.target.value); setErrors(p => ({ ...p, officeFloor: "" })) }}
                  placeholder="Давхар"
                  className={inputClass("officeFloor")}
                />
                {errors.officeFloor && <p className="text-xs text-red-400">{errors.officeFloor}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Тоот <span className="text-rose-500">*</span></label>
                <input
                  value={officeDoor}
                  onChange={e => { setOfficeDoor(e.target.value); setErrors(p => ({ ...p, officeDoor: "" })) }}
                  placeholder="Тоот дугаар"
                  className={inputClass("officeDoor")}
                />
                {errors.officeDoor && <p className="text-xs text-red-400">{errors.officeDoor}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/60 uppercase tracking-wide">Оффисын нэр <span className="text-rose-500">*</span></label>
                <input
                  value={officeName}
                  onChange={e => { setOfficeName(e.target.value); setErrors(p => ({ ...p, officeName: "" })) }}
                  placeholder="Оффисын нэр"
                  className={inputClass("officeName")}
                />
                {errors.officeName && <p className="text-xs text-red-400">{errors.officeName}</p>}
              </div>
            </div>
          )}

          {/* Нэмэлт мэдээлэл — бүх type-д */}
          <div className="space-y-1.5 pb-4">
            <label className="text-xs text-white/60 uppercase tracking-wide">Нэмэлт мэдээлэл</label>
            <input
              value={extra}
              onChange={e => setExtra(e.target.value)}
              placeholder="Орц, давхар, орцны код гэх мэт"
              className={inputClass("")}
            />
          </div>

        </div>

        {/* Save — sticky bottom */}
        <div className="p-4 border-t border-white/10 flex-shrink-0 mb-15 md:mb-0">
          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-rose-500 text-white transition-all hover:bg-rose-600 active:scale-98"
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
  const { items, totalPrice, coupon } = useCartStore()
  const { showToast } = useToast()

  const couponData = typeof window !== "undefined"
    ? JSON.parse(sessionStorage.getItem("coupon") || "null")
    : null

  const [loading,          setLoading]          = useState(false)
  const [addressSheetOpen, setAddressSheetOpen] = useState(false)
  const [customerName,     setCustomerName]     = useState("")
  const [phone,            setPhone]            = useState("")
  const [email,            setEmail]            = useState("")
  const [shippingAddress,  setShippingAddress]  = useState("")
  const [errors,           setErrors]           = useState<Record<string, string>>({})

  const baseTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const productDiscount = items.reduce((sum, item) => {
    if (item.discountEnabled && item.finalPrice)
      return sum + (item.price - item.finalPrice) * item.quantity
    return sum
  }, 0)
  const subtotal = baseTotal - productDiscount
  const shipping = subtotal >= 100000 ? 0 : 5000

  const couponDiscount = (() => {
    if (!couponData && !coupon) return 0
    const c = couponData || coupon
    if (c.type === "percentage" && c.discountPercent)
      return Math.round(subtotal * (c.discountPercent / 100))
    if (c.type === "amount" && c.discountAmount)
      return Math.min(c.discountAmount, subtotal)
    return 0
  })()

  const finalTotal = subtotal + shipping - couponDiscount

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
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          shippingAddress,
          totalAmount:    finalTotal,
          shippingAmount: shipping,
          couponDiscount,
          couponCode:     couponData?.code,
          items: items.map(i => ({
            productId: i.productId,
            quantity:  i.quantity,
            size:      i.size,
            color:     i.color,
            variants:  i.variants.map(v => ({ [v.label]: v.value })),
            unitPrice: i.price,
          })),
        }),
      })

      if (!res.ok) throw new Error("Order failed")
      const order   = await res.json()
      const orderId = order.data.id

      const bylRes = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, finalTotal, email, customerName }),
      })

      const bylData = await bylRes.json()
      if (!bylData.url) throw new Error("Checkout creation failed")

      window.location.href = bylData.url

    } catch (err) {
      console.error("Order submission error:", err)
      showToast("⚠️ Захиалга амжилтгүй боллоо. Дахин оролдоно уу.")
    } finally {
      setLoading(false)
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
      <Link href="/products" className="inline-flex items-center gap-2 font-semibold px-7 py-2.5 rounded-full bg-rose-500 text-white/90 text-sm">
        🛒 Дэлгүүр хэсэх
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

      <div className="max-w-6xl mx-auto pt-3 pb-24 md:pb-8 fade-up">

        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors mb-6">
          <ChevronLeft size={15} /> Сагс руу буцах
        </Link>

        <div className="grid md:grid-cols-5 gap-5 gap-x-10">

          {/* Left — form */}
          <div className="md:col-span-3">
            <div className="glass rounded-2xl space-y-5">
              <h2 className="font-display text-xl font-bold text-white">Захиалагчийн мэдээлэл</h2>

              {[
                { icon: <User size={16} />,  label: "Нэр",           val: customerName, set: setCustomerName, key: "customerName", ph: "Нэрээ оруулна уу" },
                { icon: <Phone size={16} />, label: "Утасны дугаар", val: phone,        set: setPhone,        key: "phone",        ph: "Утасны дугаараа оруулна уу" },
                { icon: <Mail size={16} />,  label: "И-мэйл",        val: email,        set: setEmail,        key: "email",        ph: "И-мэйл хаягаа оруулна уу" },
              ].map(f => (
                <div key={f.key} className="space-y-2">
                  <label className="text-xs text-white/90 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="text-white/90">{f.icon}</span>{f.label}
                  </label>
                  <input
                    value={f.val}
                    onChange={e => { f.set(e.target.value); setErrors(p => ({ ...p, [f.key]: "" })) }}
                    placeholder={f.ph}
                    className={`w-full glass-sm text-base rounded-xl px-4 py-3 text-white placeholder-white/40 hover:border-rose-500/50 outline-none bg-transparent border transition-colors ${
                      errors[f.key] ? "border-red-500/50" : "border-white/25 focus:border-rose-500/50"
                    }`}
                  />
                  {errors[f.key] && <p className="text-xs text-red-400">{errors[f.key]}</p>}
                </div>
              ))}

              {/* Хүргэлтийн хаяг */}
              <div className="space-y-2">
                <label className="text-xs text-white/90 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin size={16} className="text-white/90" /> Хүргэлтийн хаяг
                </label>
                {shippingAddress ? (
                  <div className="glass-sm rounded-xl px-4 py-3 border border-white/25 flex items-start justify-between gap-3">
                    <p className="text-white text-sm leading-relaxed flex-1">{shippingAddress}</p>
                    <button onClick={() => setAddressSheetOpen(true)} className="text-xs text-white/40 hover:text-white underline flex-shrink-0 transition-colors">
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
                onClick={handleSubmitOrder}
                disabled={loading}
                className="w-full py-4 bg-rose-500 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Wallet2 size={16} /> Төлбөр төлөх</>
                }
              </button>
            </div>
          </div>

          {/* Right — order summary */}
          <div className="md:col-span-2">
            <div className="glass rounded-2xl py-2 space-y-4 sticky top-24">
              <h3 className="font-display font-bold text-white text-xl pb-2">Захиалгын дэлгэрэнгүй</h3>
              <div className="space-y-3 pb-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="w-36 h-36 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-white/5" />
                      }
                    </div>
                    <div className="flex flex-col">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xl font-medium line-clamp-1">{item.title}</p>
                        <div className="flex gap-1.5 mt-0.5 items-center">
                          {item.size  && <span className="text-white/50 text-[14px]">{item.size}</span>}
                          {item.color && <span className="text-white/50 text-[14px] uppercase">{item.color}</span>}
                          {item.variants && item.variants.map((v, idx) => (
                            <span key={idx} className="text-white/50 text-[14px] uppercase">{v.value}</span>
                          ))}
                          <span className="text-white/50 text-[14px]">· {item.quantity}ш</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-white text-lg font-semibold flex-shrink-0">{fmt(item.discountEnabled && item.finalPrice ? item.finalPrice : item.price)}</span>
                        {item.discountEnabled && item.finalPrice && (
                          <p className="text-rose-500 line-through text-[14px] mt-0.5">{fmt(item.price)}</p>
                        )}
                      </div>
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
                {couponDiscount > 0 && (couponData || coupon) && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-white/80">
                      ({(couponData || coupon)?.code}){(couponData || coupon)?.type === "percentage" ? ` -${(couponData || coupon)?.discountPercent}%` : ""}
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
              <div className="flex justify-between font-bold border-rose-500/50">
                <span className="text-white text-[18px]">Эцсийн нийт дүн</span>
                <span className="text-white text-lg">{fmt(finalTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
