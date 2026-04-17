interface OrderItem {
  title: string
  quantity: number
  unitPrice: number
  size?: string
  color?: string
}

interface OrderEmailProps {
  customerName: string
  orderId: string
  totalAmount: number
  items: OrderItem[]
  shippingAddress: string
  shipping?: number
  couponDiscount?: number
}

function fmt(amount: number) {
  return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
}

export function orderConfirmationHtml({
  customerName,
  orderId,
  totalAmount,
  items,
  shippingAddress,
  shipping = 0,
  couponDiscount = 0,
}: OrderEmailProps): string {
  const shortId = orderId.slice(-8).toUpperCase()

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:14px;">
          ${item.title}
          ${item.size ? `<span style="color:#999;font-size:12px;"> · ${item.size}</span>` : ""}
          ${item.color ? `<span style="color:#999;font-size:12px;"> · ${item.color}</span>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#999;font-size:14px;text-align:center;">${item.quantity}ш</td>
        <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#e5e5e5;font-size:14px;text-align:right;">${fmt(item.unitPrice * item.quantity)}</td>
      </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="mn">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#black;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#be123c,#9f1239);padding:36px 32px;text-align:center;">
              <p style="margin:0 0 10px;color:#white;font-size:28px;font-weight:900;letter-spacing:8px;text-transform:uppercase;">FATE</p>
              <h1 style="margin:0;color:#white;font-size:22px;font-weight:700;">Захиалга баталгаажлаа</h1>
              <p style="margin:10px 0 0;color:#white;font-size:13px;opacity:0.9;">#${shortId}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;background:#111111;">

              <p style="margin:0 0 24px;color:#ccc;font-size:15px;">Сайн байна уу, <strong style="color:#fff;">${customerName}</strong>!</p>
              <p style="margin:0 0 28px;color:#999;font-size:14px;line-height:1.6;">Таны захиалга амжилттай хүлээн авлаа. Бид аль болох хурдан хүргэх болно.</p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <th style="padding:0 0 10px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:left;font-weight:500;">Бараа</th>
                  <th style="padding:0 0 10px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:center;font-weight:500;">Тоо</th>
                  <th style="padding:0 0 10px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;text-align:right;font-weight:500;">Үнэ</th>
                </tr>
                ${itemRows}
              </table>

              <!-- Total breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:16px;background:#1a1a1a;border-radius:10px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#999;font-size:14px;padding-bottom:8px;">Хүргэлт</td>
                        <td style="font-size:14px;text-align:right;padding-bottom:8px;color:${shipping === 0 ? "#4ade80" : "#e5e5e5"};">${shipping === 0 ? "Үнэгүй" : fmt(shipping)}</td>
                      </tr>
                      ${couponDiscount > 0 ? `
                      <tr>
                        <td style="color:#999;font-size:14px;padding-bottom:8px;">Купон хөнгөлөлт</td>
                        <td style="color:#4ade80;font-size:14px;text-align:right;padding-bottom:8px;">-${fmt(couponDiscount)}</td>
                      </tr>` : ""}
                      <tr>
                        <td style="color:#999;font-size:14px;border-top:1px solid #2a2a2a;padding-top:8px;">Эцсийн нийт дүн</td>
                        <td style="color:#f43f5e;font-size:18px;font-weight:700;text-align:right;border-top:1px solid #2a2a2a;padding-top:8px;">${fmt(totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Address -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:16px;background:#1a1a1a;border-radius:10px;">
                    <p style="margin:0 0 6px;color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Хүргэлтийн хаяг</p>
                    <p style="margin:0;color:#e5e5e5;font-size:14px;line-height:1.5;">${shippingAddress}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#555;font-size:13px;line-height:1.6;text-align:center;">
                Асуух зүйл байвал манай Instagram <strong style="color:#888;">@fate.mn</strong>-д холбогдоно уу.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1f1f1f;text-align:center;">
              <p style="margin:0;color:#444;font-size:12px;">© 2025 FATE · Монгол</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
