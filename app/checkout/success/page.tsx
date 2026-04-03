// 📁 app/checkout/success/page.tsx
"use client"

import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {

  return (
    <div className="max-w-lg min-h-[80vh] flex flex-col justify-center items-center mx-auto px-5 text-center space-y-6 fade-up">
      <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto">
        <CheckCircle size={50} className="text-green-400" />
      </div>
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold text-white">Захиалга амжилттай!</h2>
        <p className="text-white/50 text-sm">Таны захиалга хүлээн авагдлаа.</p>
      </div>
      <Link href="/products"
        className="inline-flex items-center gap-2 font-semibold px-7 py-2.5 rounded-full bg-rose-500 text-white/90 text-sm">
        Дэлгүүр үргэлжлүүлэх
      </Link>
    </div>
  )
}