// 📁 app/checkout/success/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCartStore()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const createOrder = async () => {
        console.log("CREATE ORDER STARTED")
      try {
        const raw = sessionStorage.getItem("pendingOrder")
        console.log("PENDING ORDER:", raw)
        if (!raw) { setStatus("error"); return }

        const orderData = JSON.parse(raw)

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })

        if (res.ok) {
          sessionStorage.removeItem("pendingOrder")
          clearCart() // ← энд хоослоно
          setStatus("success")
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      }
    }

    createOrder()
  }, [])

  if (status === "loading") return (
    <div className="flex gap-2 justify-center items-center h-full">
      <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-3 h-3 bg-black rounded-full animate-bounce" />
    </div>
  )

  if (status === "error") return (
    <div className="max-w-lg min-h-[80vh] flex flex-col items-center justify-center mx-auto text-center space-y-4">
      <p className="text-white/50">Алдаа гарлаа. Холбоо барина уу.</p>
    </div>
  )

  return (
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
}