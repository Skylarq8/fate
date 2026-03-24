// 📁 app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log("WEBHOOK:", JSON.stringify(body))

  if (body.type === "checkout.completed") {
    const orderData = JSON.parse(body.data.client_reference_id)

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    })
  }

  return NextResponse.json({ received: true })
}