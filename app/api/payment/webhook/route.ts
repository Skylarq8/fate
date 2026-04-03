import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("WEBHOOK RECEIVED:", JSON.stringify(body, null, 2))

    // ✅ Бусад event ignore
    if (body.type !== "checkout.completed") {
      console.log("Webhook ignored, type:", body.type)
      return NextResponse.json({ ignored: true })
    }

    const orderId = body.data?.object?.client_reference_id

    if (!orderId) {
      console.error("❌ Webhook missing orderId")
      return NextResponse.json({ ok: false })
    }

    // ✅ Backend API дуудах (order статус paid болгох)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/pay`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }), // optional, backend-д хэрэгтэй байж магад
      }
    )

    if (!res.ok) {
      console.error("❌ Order update failed:", await res.text())
      return NextResponse.json({ ok: false })
    }

    console.log("✅ Order marked as PAID:", orderId)
    return NextResponse.json({ received: true })

  } catch (err) {
    console.error("❌ Webhook processing error:", err)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}