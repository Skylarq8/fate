// 📁 app/cart/page.tsx
"use client"

import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { fmt } from "@/lib/api"

export default function CartPage() {
  const { items, removeItem, increaseQty, decreaseQty, totalPrice, clearCart } = useCartStore()

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-5 py-28 text-center space-y-6 fade-up">
      <div className="w-24 h-24 glass rounded-3xl flex items-center justify-center mx-auto">
        <ShoppingBag size={34} className="text-white/30" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">Сагс хоосон байна</h2>
      <p className="text-white/40 text-sm">Бараа нэмэхийн тулд дэлгүүр хэсье</p>
      <Link href="/products"
        className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-full text-white text-sm"
        style={{
          background: "linear-gradient(135deg, rgba(167,139,250,0.7), rgba(96,165,250,0.7))",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(167,139,250,0.35)",
        }}>
        Дэлгүүр хэсэх
      </Link>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto pt-3 fade-up">

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Миний сагс</h1>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">

        {/* ── Items ── */}
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id}>
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
                  <p className="text-white font-bold text-[20px]">{fmt(item.price)}</p>
                  {item.originalPrice && (
                    <p className="text-white/35 line-through text-[16px] mt-0.5">{fmt(item.originalPrice)}</p>
                  )}
                </div>
              </div>

              
            </div>
            {/* controls */}
            <div className="flex items-center justify-between glass rounded-2xl">
              <p className="text-[16px] text-white/90 font-semibold">Тоо хэмжээ</p>
              <div className="flex justify-end gap-x-2">
                <button onClick={() => removeItem(item.id)}
                  className="px-3 py-2 text-white/90 transition-all rounded-xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md hover:border-red-500 hover:text-red-500 hover:bg-red-400/30">
                  <Trash2 size={13} />
                </button>
                <div className="flex items-center rounded-xl overflow-hidden border border-white/10 bg-white/10 backdrop-blur-md">
                    <button onClick={() => decreaseQty(item.id)}
                    className="px-3 py-2 text-white/90 hover:text-white transition-all">
                    <Minus size={13} />
                    </button>
                    <span className="px-3 py-2 text-sm font-semibold text-white min-w-[40px] text-center border-x border-white/10">
                    {item.quantity}
                    </span>
                    <button onClick={() => increaseQty(item.id)}
                    className="px-3 py-2 text-white/90 hover:text-white transition-all">
                    <Plus size={13} />
                    </button>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>

        {/* ── Summary ── */}
        <div>
          <div className="glass rounded-2xl space-y-5 sticky top-24">

            <div className="space-y-2.5">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-white/45 truncate max-w-[55%]">{item.title} × {item.quantity}</span>
                  <span className="text-white/70 font-medium">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between">
              <span className="font-semibold text-white">Нийт</span>
              <span className="font-bold text-white text-lg">{fmt(totalPrice())}</span>
            </div>

            <button
              className="w-full py-2.5 rounded-xl font-semibold bg-white/90 text-black/90 text-sm transition-all hover:scale-[1.02] active:scale-98">
              Төлбөр төлөх
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}