"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Loader2 } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

export default function CheckoutSuccessPage() {
  const clearCart   = useCartStore(s => s.clearCart)
  const searchParams = useSearchParams()
  const orderId      = searchParams.get("orderId")

  const [status, setStatus] = useState<"checking" | "paid" | "failed">("checking")

  useEffect(() => {
    if (!orderId) {
      setStatus("failed")
      return
    }

    let attempts = 0
    const maxAttempts = 10

    const check = async () => {
      try {
        const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`)
        const data = await res.json()
        const order = data.data ?? data
        const orderStatus = order?.status ?? order?.paymentStatus ?? ""

        if (orderStatus === "paid") {
          clearCart()
          setStatus("paid")
          return
        }
      } catch {}

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(check, 2000)
      } else {
        // Webhook удааширсан ч был.mn success руу redirect хийсэн тул clearCart хийнэ
        clearCart()
        setStatus("paid")
      }
    }

    check()
  }, [orderId, clearCart])

  if (status === "checking") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-5">
        <Loader2 className="w-10 h-10 text-white/50 animate-spin mb-4" />
        <p className="text-white/50 text-sm">Төлбөр шалгаж байна...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-5 fade-up">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Төлбөр амжилттай!</h1>
      <p className="text-white/50 text-sm mb-8">Захиалга баталгаажлаа. Имэйлээ шалгана уу.</p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-all"
      >
        Дэлгүүр хэсэх
      </Link>
    </div>
  )
}
