interface PromoCodeEmailProps {
  email: string
  code: string
  discountValue: number
  discountType: "percentage" | "amount"
  expiresAt: Date
}

function fmt(amount: number) {
  return new Intl.NumberFormat("mn-MN").format(amount) + "₮"
}

export function promoCodeHtml({ code, discountValue, discountType, expiresAt }: PromoCodeEmailProps) {
  const discountLabel =
    discountType === "percentage" ? `${discountValue}%` : fmt(discountValue)

  const expiry = new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ulaanbaatar",
  }).format(expiresAt)

  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Таны хямдралын код</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:20px;border:1px solid #222222;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0f0f0f;padding:44px 40px 36px;text-align:center;border-bottom:2px solid #1f1010;">
              <!-- FATE wordmark -->
              <h1 style="margin:0 0 14px;font-size:52px;font-weight:900;letter-spacing:14px;color:#ef4444;text-transform:uppercase;line-height:1;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">FATE</h1>
              <!-- divider -->
              <table width="40" cellpadding="0" cellspacing="0" style="margin:0 auto 16px;"><tr><td style="background:#ef4444;height:2px;border-radius:2px;font-size:0;">&nbsp;</td></tr></table>
              <p style="margin:0;font-size:15px;font-weight:600;color:#ffffff;letter-spacing:0.3px;">Таны онцгой хямдрал бэлэн боллоо</p>
              <p style="margin:6px 0 0;font-size:13px;color:#888888;">Анхны захиалгадаа зориулсан</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">

              <p style="margin:0 0 28px;font-size:14px;color:#aaaaaa;line-height:1.7;text-align:center;">
                Доорх кодыг захиалга хийхдээ ашиглан<br/>
                <strong style="color:#ffffff;">${discountLabel} хямдрал</strong>-аа аваарай.
              </p>

              <!-- Code box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:#000000;border:2px dashed #cc2222;border-radius:16px;padding:28px 20px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#666666;">Таны код</p>
                    <p style="margin:0;font-size:34px;font-weight:900;letter-spacing:8px;color:#ef4444;font-family:'Courier New',Courier,monospace;">${code}</p>
                    <p style="margin:10px 0 0;font-size:13px;color:#777777;">${discountLabel} хямдрал &nbsp;·&nbsp; 1 удаа ашиглах</p>
                  </td>
                </tr>
              </table>

              <!-- Expiry row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#1a0f0f;border-radius:12px;border:1px solid #2a1515;">
                <tr>
                  <td style="padding:14px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#777777;">⏳ Дуусах хугацаа</td>
                        <td style="font-size:13px;color:#f97316;font-weight:600;text-align:right;">${expiry}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="https://fate.mn/products"
                       style="display:inline-block;background:#ef4444;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:15px 48px;border-radius:12px;letter-spacing:0.5px;">
                      Дэлгүүр хэсэх →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:11px;color:#555555;text-align:center;line-height:1.7;">
                Код нэг удаа ашиглах боломжтой бөгөөд ${expiry} хүртэл хүчинтэй.<br/>
                Та энэ имэйлийг захиалаагүй бол үл тоомсорлоно уу.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 40px;text-align:center;border-top:1px solid #1a1a1a;">
              <p style="margin:0;font-size:11px;color:#444444;letter-spacing:1px;">© 2026 FATE STORE · fatestore8@gmail.com</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
