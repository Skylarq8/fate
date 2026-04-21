import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { promoCodeHtml } from "@/lib/emails/promoCode"

const resend = new Resend(process.env.RESEND_API_KEY!)
const API = process.env.NEXT_PUBLIC_API_URL!

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let suffix = ""
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `FATE-${suffix}`
}

export async function POST(req: NextRequest) {
  try {
    const { email, discountValue = 10, discountType = "percentage" } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "И-мэйл хаяг буруу байна" }, { status: 400 })
    }

    // Check if this email already has an active promo coupon
    const checkRes = await fetch(
      `${API}/api/coupons?email=${encodeURIComponent(email)}&active=true`,
      { headers: { "Content-Type": "application/json" } }
    )
    if (checkRes.ok) {
      const checkData = await checkRes.json()
      const existing = checkData?.data ?? checkData
      if (Array.isArray(existing) && existing.length > 0) {
        return NextResponse.json(
          { message: "Энэ имэйлд идэвхтэй код аль хэдийн байна" },
          { status: 409 }
        )
      }
    }

    // Generate code and expiry
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Create coupon in backend
    const createRes = await fetch(`${API}/api/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discountType,
        discountValue,
        usageLimit: 1,
        applyToAll: true,
        email,
        expiresAt: expiresAt.toISOString(),
      }),
    })

    if (!createRes.ok) {
      const errData = await createRes.json().catch(() => ({}))
      console.error("Coupon create failed:", errData)
      return NextResponse.json({ message: "Код үүсгэхэд алдаа гарлаа" }, { status: 500 })
    }

    const created = await createRes.json()
    const couponId = created?.data?.id ?? created?.id

    // Send email
    const emailResult = await resend.emails.send({
      from: "FATE <noreply@fate.mn>",
      to: email,
      subject: `🎁 Таны ${discountValue}% хямдралын код — ${code}`,
      html: promoCodeHtml({ email, code, discountValue, discountType, expiresAt }),
    })

    if (emailResult.error) {
      console.error("Resend error:", emailResult.error)
      // Rollback: delete the coupon
      if (couponId) {
        await fetch(`${API}/api/coupons/${couponId}`, { method: "DELETE" }).catch(() => {})
      }
      return NextResponse.json({ message: "И-мэйл илгээхэд алдаа гарлаа" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { code } })
  } catch (err) {
    console.error("Promo send error:", err)
    return NextResponse.json({ message: "Серверийн алдаа" }, { status: 500 })
  }
}
