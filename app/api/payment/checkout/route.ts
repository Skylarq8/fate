// 📁 app/api/payment/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { finalTotal, email, customerName, orderId } = await req.json()
  const shortOrderId = orderId.slice(-8).toUpperCase()

  const res = await fetch(
    `https://byl.mn/api/v1/projects/${process.env.BYL_PROJECT_ID}/checkouts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BYL_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        customer_email: email,
        success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
        cancel_url:  `${process.env.NEXT_PUBLIC_URL}/checkout`,
        client_reference_id: orderId,
        items: [
          {
            price_data: {
              unit_amount: finalTotal,
              product_data: { 
                name: `FATE - Захиалга #${shortOrderId}, ${customerName}`,
              },
            },
            quantity: 1,
          },
        ],
      }),
    }
  )

  const data = await res.json()
  if (!res.ok) return NextResponse.json({ error: data }, { status: res.status })
  return NextResponse.json({ url: data.data.url })
}