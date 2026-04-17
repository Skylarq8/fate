import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { orderConfirmationHtml } from "@/lib/emails/orderConfirmation"

const getResend = () => new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("WEBHOOK RECEIVED:", JSON.stringify(body, null, 2))

    if (body.type !== "checkout.completed") {
      return NextResponse.json({ ignored: true })
    }

    const obj     = body.data?.object ?? {}
    const orderId = obj.client_reference_id
    // byl.mn checkout үүсгэхдээ customer_email дамжуулсан тул payload-д байна
    const emailFromPayload      = obj.customer_email ?? obj.customerEmail ?? ""
    const customerNameFromPayload = obj.customer_name ?? obj.customerName ?? ""

    if (!orderId) {
      console.error("❌ Webhook missing orderId")
      return NextResponse.json({ ok: false })
    }

    // Order статус paid болгох
    const patchRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      }
    )

    if (!patchRes.ok) {
      console.error("❌ Order update failed:", await patchRes.text())
      return NextResponse.json({ ok: false })
    }

    console.log("✅ Order marked as PAID:", orderId)

    // Order дэлгэрэнгүй мэдээлэл авах
    const orderRes  = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
      { headers: { "Content-Type": "application/json" } }
    )
    const orderData = orderRes.ok ? await orderRes.json() : {}
    const order     = orderData.data ?? orderData

    console.log("ORDER DATA:", JSON.stringify(order, null, 2))

    // email: payload → backend (email / customerEmail хоёуланг шалгана)
    const toEmail   = emailFromPayload || order?.email || order?.customerEmail || ""
    const toName    = customerNameFromPayload || order?.customerName || "Хэрэглэгч"
    const toTotal   = Number(order?.totalAmount ?? order?.total ?? 0)
    const toAddress = order?.shippingAddress ?? order?.address ?? ""

    // Backend-аас ирэх items-ийн field нэрийг normalize хийх
    const rawItems: any[] = order?.items ?? []
    const toItems = rawItems.map((item: any) => ({
      title:     item.product?.title ?? item.title ?? item.productTitle ?? "Бараа",
      quantity:  item.quantity ?? 1,
      unitPrice: Number(item.unitPrice ?? item.price ?? 0),
      size:      item.size  || undefined,
      color:     item.color || undefined,
    }))

    // Хүргэлт, coupon — backend-аас авна, эс бөгөөс 0
    const shipping       = Number(order?.shippingAmount ?? order?.shipping ?? order?.shippingFee ?? 0)
    const couponDiscount = Number(order?.couponDiscount ?? order?.discountAmount ?? order?.coupon?.discount ?? 0)

    if (!toEmail) {
      console.error("❌ No email found — payload:", emailFromPayload, "order:", order?.email)
      return NextResponse.json({ received: true })
    }

    const emailResult = await getResend().emails.send({
      from:    "FATE <onboarding@resend.dev>",
      to:      toEmail,
      subject: `Захиалга баталгаажлаа #${orderId.slice(-8).toUpperCase()}`,
      html:    orderConfirmationHtml({
        customerName:    toName,
        orderId,
        totalAmount:     toTotal,
        items:           toItems,
        shippingAddress: toAddress,
        shipping,
        couponDiscount,
      }),
    })

    if (emailResult.error) {
      console.error("❌ Resend error:", JSON.stringify(emailResult.error))
    } else {
      console.log("✅ Email sent to:", toEmail, "id:", emailResult.data?.id)
    }

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error("❌ Webhook error:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
