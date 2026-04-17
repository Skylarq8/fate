import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { orderConfirmationHtml } from "@/lib/emails/orderConfirmation"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const to = searchParams.get("to") ?? ""

  if (!to) {
    return NextResponse.json({ error: "?to=email хэрэгтэй" }, { status: 400 })
  }

  const result = await resend.emails.send({
    from: "FATE <onboarding@resend.dev>",
    to,
    subject: "Test — Захиалга баталгаажлаа #TEST123",
    html: orderConfirmationHtml({
      customerName: "Тест Хэрэглэгч",
      orderId: "test-order-id-123",
      totalAmount: 125000,
      items: [
        { title: "Fate Hoodie", quantity: 1, unitPrice: 89000, size: "M", color: "Black" },
        { title: "Fate Cap", quantity: 2, unitPrice: 18000 },
      ],
      shippingAddress: "Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо, 10-р байр, 42-р тоот",
    }),
  })

  console.log("Resend result:", JSON.stringify(result, null, 2))

  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: result.data?.id })
}
