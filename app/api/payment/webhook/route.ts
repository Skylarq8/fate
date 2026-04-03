// 📁 app/api/payment/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("WEBHOOK:", body)

    if (body.type !== "checkout.completed") {
      return NextResponse.json({ ignored: true })
    }

    const orderId = body.data?.client_reference_id

    if (!orderId) {
      console.error("❌ orderId байхгүй")
      return NextResponse.json({ ok: false })
    }

    // 👉 backend API дуудах (order update хийх)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/pay`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!res.ok) {
      console.error("❌ Order update failed")
      return NextResponse.json({ ok: false })
    }

    console.log("✅ Order update success:", orderId)

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error("❌ Webhook error:", err)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}