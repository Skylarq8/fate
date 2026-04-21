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
        className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-md transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Centered card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
        <div
          className={`w-full max-w-[420px] pointer-events-auto transition-all duration-300 ease-out ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          }`}
        >
          <div className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black">

            {/* Top rose line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />

            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/40 hover:text-white transition-all"
              aria-label="Хаах"
            >
              <X size={15} />
            </button>

            {!code ? (
              /* ── Form state ── */
              <div className="p-7">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                    <Gift size={24} className="text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">🎁 10% хямдрал аваарай</h3>
                  <p className="text-white/40 text-sm mt-1.5 leading-relaxed">
                    Анхны захиалгадаа зориулсан онцгой код авахын тулд<br/>имэйл хаягаа оруулна уу
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(null) }}
                      placeholder="imeil@example.com"
                      className={`w-full bg-white/5 border rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors
                        ${error ? "border-red-500/50" : "border-white/10 focus:border-rose-500/40"}`}
                    />
                  </div>

                  {error && (
                    <p className="text-[12px] text-red-400 px-1">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <>Код авах <ChevronRight size={15} /></>
                    }
                  </button>
                </form>

                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <Clock size={11} className="text-white/20 shrink-0" />
                  <p className="text-[11px] text-white/20">24 цагийн хүчинтэй</p>
                </div>
              </div>
            ) : (
              /* ── Success state ── */
              <div className="p-7 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <Sparkles size={24} className="text-rose-400" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">🎉 Код бэлэн боллоо!</h3>
                  <p className="text-white/40 text-sm mt-1">Имэйл хаяг руу тань илгээлээ</p>
                </div>

                {/* Code box */}
                <div className="bg-rose-500/8 border border-dashed border-rose-500/35 rounded-2xl py-5 px-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2">Таны код</p>
                  <p className="text-3xl font-black tracking-[0.25em] text-rose-400 font-mono">{code}</p>
                  <p className="text-[12px] text-white/30 mt-2">10% хямдрал · 1 удаа ашиглах</p>
                </div>

                <div className="flex items-center justify-center gap-1.5">
                  <Clock size={12} className="text-orange-400/60 shrink-0" />
                  <p className="text-[12px] text-orange-300/60">24 цагийн дотор ашиглана уу</p>
                </div>

                <button
                  onClick={dismiss}
                  className="w-full py-3 rounded-2xl bg-white/6 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
                >
                  Хаах
                </button>
              </div>
            )}
          </div>
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
    <div className="pt-10 pb-2">

      {/* Title above container */}
      <div className="max-w-lg mx-auto mb-3 px-1">
        <h2 className="text-white lg:text-center font-bold text-xl mt-0.5 tracking-tight">Урамшуулал аваарай</h2>
      </div>

      {/* Glass container */}
      <div className="relative max-w-lg mx-auto rounded-2xl overflow-hidden
        bg-white/4 backdrop-blur-xl border border-white/10
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.3)]">

        {/* top glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-rose-500/50 to-transparent" />

        {/* X */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full hover:bg-white/8 flex items-center justify-center text-white/25 hover:text-white/70 transition-all"
          aria-label="Хаах"
        >
          <X size={12} />
        </button>

        {!code ? (
          <div className="p-5 pr-5 space-y-4">

            {/* Top row: icon + texts */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/25 flex items-center justify-center shrink-0">
                <Gift size={17} className="text-rose-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-[15px] leading-tight">10% хямдрал аваарай</p>
                <p className="text-white/50 text-[12px] mt-0.5">Анхны захиалгадаа зориулсан онцгой код</p>
                <p className="text-white/50 text-[11px] mt-1.5 flex items-center gap-1">⏳ 24 цагийн хүчинтэй</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    placeholder="mail@example.com"
                    className={`w-full bg-white/5 border rounded-xl pl-10 pr-3 py-2.5 text-base text-white placeholder-white/18 outline-none transition-colors
                      ${error ? "border-red-500/40" : "border-white/8 focus:border-rose-500/35"}`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.97] text-white text-[12px] font-semibold transition-all disabled:opacity-35 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                >
                  {loading
                    ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : "Код авах"
                  }
                </button>
              </div>
              {error && <p className="text-[11px] text-red-400">{error}</p>}
            </form>

          </div>
        ) : (
          /* ── Success ── */
          <div className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/15 flex items-center justify-center shrink-0">
              <Sparkles size={17} className="text-rose-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">🎉 Имэйл рүү тань илгээлээ</p>
              <p className="text-rose-400 font-mono font-black tracking-[0.15em] text-lg leading-tight mt-0.5">{code}</p>
              <p className="text-white/25 text-[11px] mt-0.5">⏳ 24 цагийн дотор ашиглана уу</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
