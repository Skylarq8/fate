"use client"

import { useState, useEffect, useRef } from "react"
import { X, Mail, Clock, Sparkles, ChevronRight } from "lucide-react"
import { useToast } from "@/context/ToastContext"

const STORAGE_KEY = "fate_promo_dismissed"
const USED_EMAILS_KEY = "fate_promo_emails"

function fallbackCopy(text: string) {
  const el = document.createElement("textarea")
  el.value = text
  el.style.position = "fixed"
  el.style.opacity = "0"
  document.body.appendChild(el)
  el.select()
  document.execCommand("copy")
  document.body.removeChild(el)
}

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
  const { showToast }           = useToast()
  const [visible, setVisible]   = useState(false)
  const [rendered, setRendered] = useState(false)
  const [email, setEmail]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [code, setCode]         = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const t = setTimeout(() => setRendered(true), 1000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!rendered) return
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [rendered])

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
      showToast("🎉 Амжилттай! Купон код үүсгэгдлээ")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!code) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => fallbackCopy(code))
    } else {
      fallbackCopy(code)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast("✓ Купон код амжилттай хуулагдлаа")
  }

  if (!rendered) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Centered card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`w-full max-w-185 pointer-events-auto transition-all duration-300 ease-out ${
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-6"
          }`}
        >
          <div className="relative bg-[#0d0d0d] border border-white/8 rounded-2xl overflow-hidden shadow-2xl shadow-black flex flex-col md:flex-row">

            {/* ── Left panel — brand visual ── */}
            <div className="relative md:w-[52%] shrink-0 overflow-hidden">
              {/* Base gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-[#1a0608] via-[#0d0d0d] to-black" />
              {/* Rose glow orbs */}
              <div className="absolute -top-8 -left-8 w-60 h-60 bg-rose-600/25 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-rose-500/15 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-rose-500/8 rounded-full blur-xl" />
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

              {/* Mobile layout — compact horizontal */}
              <div className="relative md:hidden flex items-center gap-5 px-6 py-7">
                <div className="flex items-start gap-0.5 shrink-0">
                  <span className="text-[52px] font-black text-white leading-none tracking-tighter">10</span>
                  <span className="text-[22px] font-black text-rose-500 mt-2">%</span>
                </div>
                <div className="w-px self-stretch bg-white/8" />
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-500/70 mb-1">Exclusive Offer</p>
                  <p className="text-white font-bold text-[15px] leading-snug">Анхны захиалгадаа<br/>хямдрал аваарай</p>
                </div>
              </div>

              {/* Desktop layout — centered vertical */}
              <div className="relative hidden md:flex h-full flex-col items-center justify-center text-center px-8 py-12">
                <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-rose-500/70 mb-3">Exclusive Offer</p>
                <div className="flex items-start justify-center gap-1 mb-3">
                  <span className="text-[100px] font-black text-white leading-none tracking-tighter">10</span>
                  <span className="text-[42px] font-black text-rose-500 mt-5">%</span>
                </div>
                <p className="text-white/30 text-xs tracking-widest uppercase">Хямдрал</p>
                <div className="mt-6 w-12 h-px bg-rose-500/40" />
                <p className="mt-4 text-[11px] text-white/20 tracking-wide leading-relaxed">FATE — Mongolia</p>
              </div>

              {/* Right fade — desktop */}
              <div className="hidden md:block absolute inset-y-0 right-0 w-12 bg-linear-to-r from-transparent to-[#0d0d0d]" />
              {/* Bottom fade — mobile */}
              <div className="md:hidden absolute inset-x-0 bottom-0 h-6 bg-linear-to-b from-transparent to-[#0d0d0d]" />
            </div>

            {/* ── Right panel — content ── */}
            <div className="flex-1 flex flex-col justify-center relative">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/8 flex items-center justify-center text-white/25 hover:text-white/70 transition-all z-10"
                aria-label="Хаах"
              >
                <X size={14} />
              </button>

              {!code ? (
                /* ── Form state ── */
                <div className="px-7 py-8">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1 mb-5">
                    <Sparkles size={10} className="text-rose-500" />
                    <span className="text-[10px] font-bold text-rose-500 tracking-widest uppercase">Онцгой санал</span>
                  </div>

                  <h2 className="text-2xl font-black text-white leading-tight mb-1">
                    Анхны захиалгадаа<br/>хямдрал аваарай
                  </h2>
                  <p className="text-white/40 text-sm mb-7 leading-relaxed">
                    Имэйлээ үлдээгээрэй — код тэр даруй ирнэ.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                      <input
                        ref={inputRef}
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(null) }}
                        placeholder="imeil@example.com"
                        className={`w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors
                          ${error ? "border-red-500/50" : "border-white/8 focus:border-rose-500/40 focus:bg-white/6"}`}
                      />
                    </div>

                    {error && <p className="text-[12px] text-red-400 px-1">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-500/90 active:scale-[0.98] text-white text-sm font-bold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <>Код авах <ChevronRight size={14} /></>
                      }
                    </button>
                  </form>

                  <div className="flex items-center gap-1.5 mt-4">
                    <Clock size={10} className="text-white/20 shrink-0" />
                    <p className="text-[11px] text-white/20">24 цагийн хүчинтэй · 1 удаа ашиглах</p>
                  </div>
                </div>
              ) : (
                /* ── Success state ── */
                <div className="px-7 py-8 space-y-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
                      <Sparkles size={10} className="text-green-400" />
                      <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase">Амжилттай!</span>
                    </div>
                    <h2 className="text-2xl font-black text-white leading-tight mb-1">Код бэлэн боллоо!</h2>
                    <p className="text-white/40 text-sm">Имэйл хаяг руу тань илгээлээ</p>
                  </div>

                  {/* Code box — click to copy */}
                  <button
                    onClick={handleCopy}
                    className={`w-full rounded-xl py-5 px-4 border border-dashed transition-all active:scale-[0.98] cursor-copy
                      ${copied
                        ? "bg-green-500/6 border-green-500/30"
                        : "bg-rose-500/6 border-rose-500/25 hover:bg-rose-500/10 hover:border-rose-500/45"
                      }`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.25em] mb-2"
                      style={{ color: copied ? "rgb(134 239 172 / 0.5)" : "rgba(255,255,255,0.2)" }}>
                      {copied ? "Хуулагдлаа!" : "Дарж хуулах"}
                    </p>
                    <p className="text-[30px] font-black tracking-[0.2em] font-mono transition-colors"
                      style={{ color: copied ? "#4ade80" : "#f43f5e" }}>
                      {code}
                    </p>
                    <p className="text-[11px] text-white/20 mt-2">10% хямдрал · 1 удаа ашиглах</p>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-orange-400/50 shrink-0" />
                    <p className="text-[11px] text-orange-300/50">24 цагийн дотор ашиглана уу</p>
                  </div>

                  <button
                    onClick={dismiss}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/8 text-white/40 hover:text-white/70 text-sm font-medium transition-all"
                  >
                    Хаах
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

// ── Footer Promo Bar ─────────────────────────────────────────────────────
export function FooterPromoBar() {
  const { showToast }             = useToast()
  const [email, setEmail]         = useState("")
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [code, setCode]           = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [copied, setCopied]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const c = await sendPromoCode(email.trim())
      setCode(c)
      showToast("🎉 Амжилттай! Купон код үүсгэгдлээ")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!code) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => fallbackCopy(code))
    } else {
      fallbackCopy(code)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 100000)
    showToast("✓ Купон код амжилттай хуулагдлаа")
  }

  if (dismissed) return null

  return (
    <div className="py-10">
      {/* Glass card */}
      <div className="relative bg-white/4 backdrop-blur-sm border border-rose-500/20 rounded-2xl overflow-hidden shadow-xl shadow-rose-950/30 flex flex-col md:flex-row ring-1 ring-inset ring-white/5">

        {/* ── Left panel — brand visual ── */}
        <div className="relative md:w-[38%] shrink-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-linear-to-br from-rose-950/80 via-rose-900/20 to-black/60" />
          {/* Glow orbs */}
          <div className="absolute -top-8 -left-8 w-56 h-56 bg-rose-500/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-rose-600/30 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

          {/* Mobile — compact horizontal */}
          <div className="relative md:hidden flex items-center gap-5 px-6 py-5">
            <div className="flex items-start gap-0.5 shrink-0">
              <span className="text-[52px] font-black text-white leading-none tracking-tighter">10</span>
              <span className="text-[22px] font-black text-rose-500 mt-2">%</span>
            </div>
            <div className="w-px self-stretch bg-white/8" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-500/70 mb-1">Exclusive Offer</p>
              <p className="text-white font-bold text-[15px] leading-snug">Анхны захиалгадаа<br/>хямдрал аваарай</p>
            </div>
          </div>

          {/* Desktop — centered vertical */}
          <div className="relative hidden md:flex h-full flex-col items-center justify-center text-center px-8 py-10">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-rose-500/70 mb-3">Exclusive Offer</p>
            <div className="flex items-start justify-center gap-1 mb-3">
              <span className="text-[80px] font-black text-white leading-none tracking-tighter">10</span>
              <span className="text-[34px] font-black text-rose-500 mt-4">%</span>
            </div>
            <p className="text-white/30 text-xs tracking-widest uppercase">Хямдрал</p>
            <div className="mt-5 w-10 h-px bg-rose-500/40" />
            <p className="mt-3 text-[11px] text-white/20 tracking-wide leading-relaxed">FATE — Mongolia</p>
          </div>

          {/* Right fade — desktop */}
          <div className="hidden md:block absolute inset-y-0 right-0 w-10 bg-linear-to-r from-transparent to-[#0d0d0d]" />
          {/* Bottom fade — mobile */}
          <div className="md:hidden absolute inset-x-0 bottom-0 h-5 bg-linear-to-b from-transparent to-[#0d0d0d]" />
        </div>

        {/* ── Right panel — content ── */}
        <div className="flex-1 flex flex-col justify-center relative">

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full hover:bg-white/8 flex items-center justify-center text-white/20 hover:text-white/60 transition-all z-10"
            aria-label="Хаах"
          >
            <X size={13} />
          </button>

          {!code ? (
            /* ── Form state ── */
            <div className="px-7 py-7 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full px-3 py-1 mb-3">
                  <Sparkles size={10} className="text-rose-500" />
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Онцгой санал</span>
                </div>
                <p className="text-white font-bold text-xl leading-tight">Анхны захиалгадаа хямдрал аваарай</p>
                <p className="text-white/40 text-sm mt-1">Имэйлээ үлдээгээрэй — код тэр даруй ирнэ</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(null) }}
                      placeholder="mail@example.com"
                      className={`w-full bg-white/5 border rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-white/20 outline-none transition-colors
                        ${error ? "border-red-500/40" : "border-white/8 focus:border-rose-500/35 focus:bg-white/6"}`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-500/90 active:scale-[0.97] text-white text-sm font-bold transition-all disabled:opacity-35 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5 shadow-lg shadow-rose-500/20"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><ChevronRight size={14} /> Авах</>
                    }
                  </button>
                </div>
                {error
                  ? <p className="text-[11px] text-red-400 px-1">{error}</p>
                  : <p className="text-[11px] text-white/20 px-1 flex items-center gap-1"><Clock size={10} /> 24 цагийн хүчинтэй · 1 удаа ашиглах</p>
                }
              </form>
            </div>
          ) : (
            /* ── Success state ── */
            <div className="px-7 py-7 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-3">
                  <Sparkles size={10} className="text-green-400" />
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Амжилттай!</span>
                </div>
                <p className="text-white font-bold text-xl leading-tight">Код бэлэн боллоо!</p>
                <p className="text-white/40 text-sm mt-1">Имэйл хаяг руу тань илгээлээ</p>
              </div>

              {/* Code — click to copy */}
              <button
                onClick={handleCopy}
                className={`w-full rounded-xl py-4 px-5 border border-dashed transition-all active:scale-[0.98] cursor-copy text-left
                  ${copied
                    ? "bg-green-500/6 border-green-500/30"
                    : "bg-rose-500/6 border-rose-500/25 hover:bg-rose-500/10 hover:border-rose-500/45"
                  }`}
              >
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5"
                  style={{ color: copied ? "rgb(134 239 172 / 0.5)" : "rgba(255,255,255,0.2)" }}>
                  {copied ? "Хуулагдлаа!" : "Дарж хуулах"}
                </p>
                <p className="text-[26px] font-black tracking-[0.2em] font-mono transition-colors"
                  style={{ color: copied ? "#4ade80" : "#f43f5e" }}>
                  {code}
                </p>
                <p className="text-[11px] text-white/20 mt-1.5">10% хямдрал · 1 удаа ашиглах</p>
              </button>

              <div className="flex items-center gap-1.5">
                <Clock size={10} className="text-orange-400/50 shrink-0" />
                <p className="text-[11px] text-orange-300/50">24 цагийн дотор ашиглана уу</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
