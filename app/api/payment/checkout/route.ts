// 📁 app/api/payment/checkout/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { finalTotal, email } = await req.json()

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
        items: [
          {
            price_data: {
              unit_amount: finalTotal,
              product_data: { name: "Захиалга" },
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