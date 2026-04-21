"use client"

import { useState, useEffect, useRef } from "react"
import { X, Mail, Gift, Clock, Sparkles, ChevronRight } from "lucide-react"

const STORAGE_KEY = "fate_promo_dismissed"
const USED_EMAILS_KEY = "fate_promo_emails"

function getUsedEmails(): string[] {
  try { return JSON.parse(localStorage.getItem(USED_EMAILS_KEY) ?? "[]") } catch { return [] }
}
function markEmailUsed(email: string) {
  const list = getUsedEmails()
  if (!list.includes(email.toLowerCase())) {
    localStorage.setItem(USED_EMAILS_KEY, JSON.stringify([...list, email.toLowerCase()]))
  }
}

// ── Shared submit logic ──────────────────────────────────────────────────
async function sendPromoCode(email: string) {
  if (getUsedEmails().includes(email.toLowerCase())) {
    throw new Error("Энэ имэйлд код аль хэдийн илгээгдсэн байна")
  }
  const res = await fetch("/api/promo/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, discountValue: 10, discountType: "percentage" }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message ?? data.error ?? "Алдаа гарлаа")
  markEmailUsed(email)
  return (data.data?.code ?? data.code) as string
}

// ── Popup ────────────────────────────────────────────────────────────────
export function PromoPopup() {
  const [visible, setVisible]       = useState(false)
  const [rendered, setRendered]     = useState(false)
  const [email, setEmail]           = useState("")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [code, setCode]             = useState<string | null>(null)
  const inputRef                    = useRef<HTMLInputElement>(null)

  // Show after 5 s if not dismissed before
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return

    const t = setTimeout(() => {
      setRendered(true)
    }, 5000)

    return () => clearTimeout(t)
  }, [])

  // Trigger CSS transition after rendered mounts in DOM
  useEffect(() => {
    if (!rendered) return
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [rendered])

  // Focus input when popup opens
  useEffect(() => {
    if (visible && !code) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [visible, code])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => setRendered(false), 350)
    localStorage.setItem(STORAGE_KEY, "1")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const c = await sendPromoCode(email.trim())
      setCode(c)
      localStorage.setItem(STORAGE_KEY, "1")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!rendered) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Card */}
      <div
        className={`fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-8 sm:right-8 sm:w-[380px] z-50
          transition-all duration-350 ease-out
          ${visible
            ? "opacity-100 translate-y-0 sm:translate-y-0 scale-100"
            : "opacity-0 translate-y-6 sm:translate-y-6 scale-95 pointer-events-none"
          }`}
      >
        <div className="relative bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">

          {/* Top gradient accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" />

          {/* Close */}
          <button
            onClick={dismiss}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/50 hover:text-white transition-all"
            aria-label="Хаах"
          >
            <X size={14} />
          </button>

          {!code ? (
            /* ── Form state ── */
            <div className="p-6 space-y-4">
              {/* Icon + title */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0 mt-0.5">
                  <Gift size={18} className="text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">10% хямдрал аваарай</h3>
                  <p className="text-white/45 text-[13px] mt-0.5">Анхны захиалгадаа зориулсан</p>
                </div>
              </div>

              <p className="text-white/55 text-[13px] leading-relaxed">
                Онцгой код авахын тулд имэйл хаягаа оруулна уу.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    placeholder="imeil@example.com"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors
                      ${error ? "border-red-500/50" : "border-white/10 focus:border-rose-500/50"}`}
                  />
                </div>

                {error && (
                  <p className="text-[12px] text-red-400 px-1">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>Код авах <ChevronRight size={15} /></>
                  }
                </button>
              </form>

              {/* Footer note */}
              <div className="flex items-center gap-1.5 pt-1">
                <Clock size={12} className="text-white/25 shrink-0" />
                <p className="text-[11px] text-white/25">24 цагийн хүчинтэй · Spam явуулахгүй</p>
              </div>
            </div>
          ) : (
            /* ── Success state ── */
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center mx-auto">
                <Sparkles size={22} className="text-rose-400" />
              </div>

              <div>
                <h3 className="font-bold text-white text-base">🎉 Таны код бэлэн боллоо!</h3>
                <p className="text-white/45 text-[13px] mt-1">Имэйл рүү тань илгээлээ</p>
              </div>

              {/* Code box */}
              <div className="bg-rose-500/10 border border-dashed border-rose-500/40 rounded-2xl py-4 px-3">
                <p className="text-[11px] text-white/35 uppercase tracking-widest mb-1">Таны код</p>
                <p className="text-2xl font-black tracking-[0.2em] text-rose-400 font-mono">{code}</p>
                <p className="text-[12px] text-white/35 mt-1.5">10% хямдрал</p>
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <Clock size={12} className="text-orange-400/70 shrink-0" />
                <p className="text-[12px] text-orange-300/70">24 цагийн дотор ашиглана уу!</p>
              </div>

              <button
                onClick={dismiss}
                className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 hover:text-white text-sm font-medium transition-all"
              >
                Хаах
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Footer Promo Bar ─────────────────────────────────────────────────────
export function FooterPromoBar() {
  const [email, setEmail]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [code, setCode]         = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const c = await sendPromoCode(email.trim())
      setCode(c)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (dismissed) return null

  return (
    <div className="relative border-t border-white/8 bg-gradient-to-b from-rose-950/10 to-transparent">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

      <div className="max-w-lg mx-auto px-5 py-6">
        {!code ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-rose-400 shrink-0" />
                <span className="text-white/80 text-sm font-medium">10% хямдрал авах уу?</span>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="text-white/20 hover:text-white/50 transition-colors"
                aria-label="Хаах"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null) }}
                  placeholder="Имэйл хаяг"
                  className={`w-full bg-white/5 border rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-white/25 outline-none transition-colors
                    ${error ? "border-red-500/50" : "border-white/10 focus:border-rose-500/40"}`}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                {loading
                  ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : "Код авах"
                }
              </button>
            </form>

            {error && <p className="text-[12px] text-red-400">{error}</p>}

            <p className="text-[11px] text-white/20">⏳ 24 цагийн хүчинтэй · Spam явуулахгүй</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-rose-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">🎉 Таны код: <span className="text-rose-400 font-mono tracking-wider">{code}</span></p>
                <p className="text-white/35 text-[12px]">⏳ 24 цагийн дотор ашиглана уу</p>
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-white/20 hover:text-white/50 transition-colors shrink-0"
              aria-label="Хаах"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
